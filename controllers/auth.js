/* eslint-disable indent */
const User = require('../model/user')
const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')
const client = require('../middleware/redis')

exports.register = async (req, res, next) => {
  const username = req.body.username
  const name = req.body.name
  const email = req.body.email
  const password = req.body.password

  try {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      const err = new Error('Validation Failed')
      err.statusCode = 422
      err.data = errors.array()
      throw err
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await User.create({
      username: username,
      name: name,
      email: email,
      password: hashedPassword
    })
    res.status(201).json(user)
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.login = async (req, res, next) => {
  // Secrets for the access and the refresh tokens
  const secret1 = 'secret1'
  const secret2 = 'secret2'

  // Get the user data from the request body
  const username = req.body.username
  const password = req.body.password

  try {
    // Check if the user exists in db
    const user = await User.findOne({ where: { username: username } })
    if (!user) {
      const err = new Error('User not found!')
      err.statusCode = 401
      throw err
    }

    // Check if the password is valid
    const isEqual = await bcrypt.compare(password, user.password)
    if (!isEqual) {
      const err = new Error('Wrong Password')
      err.statusCode = 401
      throw err
    }

    // Generate uuids for access and refresh token
    const accessTokenId = uuidv4()
    const refreshTokenId = uuidv4()

    // Generate access token
    const accessToken = jwt.sign({
      userId: user.id,
      sessionId: accessTokenId
    },
      secret1,
      { expiresIn: '1h' })

    // Generate refresh token
    const refreshToken = jwt.sign({
      userId: user.id,
      sessionId: refreshTokenId
    },
      secret2,
      { expiresIn: '7d' })

    // Add access and refresh token to the cookie
    res.cookie('accessToken', accessToken, {
      expires: new Date(Date.now() + 60 * 60 * 1000) // 1 hr
    })
    res.cookie('refreshToken', refreshToken, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    })

    // Add user data to the cache
    client.hmset('userId:' + user.id, {
      username: user.username,
      email: user.email,
      name: user.name
    })

    // Add uuids of access and refresh token to the cache
    client.saddAsync('accessToken:sessions:' + user.id, accessTokenId)
    client.saddAsync('refreshToken:sessions:' + user.id, refreshTokenId)

    res.status(200).json({
      accessToken,
      refreshToken
    })
  } catch (err) {
    next(err)
  }
}

exports.test = (req, res, next) => {
  res.status(200).json({
    status: 'success'
  })
}

exports.logout = (req, res, next) => {
  try {
    client.sremAsync('accessToken:sessions:' + req.userId, req.accessTokenId)
    client.sremAsync('refreshToken:sessions:' + req.userId, req.refreshTokenId)

    res.status(200).json({
      status: 'Logged Out Successfully'
    })
  } catch (err) {
    return next(err)
  }
}

exports.logoutAllDevices = (req, res, next) => {
  client.del(
    'userId:' + req.userId,
    'accessToken:sessions:' + req.userId,
    'refreshToken:sessions:' + req.userId
  )

  res.status(200).json({
    status: 'Logged out successfully from all the devices'
  })
}

exports.logoutOtherDevices = async (req, res, next) => {
  const cursor = '0'

  const accessTokenValues = await client.sscanAsync('accessToken:sessions:' + req.userId, cursor, 'MATCH', '*')
  const refreshTokenValues = await client.sscanAsync('refreshToken:sessions:' + req.userId, cursor, 'MATCH', '*')

  client.sremAsync('accessToken:sessions:' + req.userId, accessTokenValues[1])
  client.saddAsync('accessToken:sessions:' + req.userId, req.accessTokenId)

  client.sremAsync('refreshToken:sessions:' + req.userId, refreshTokenValues[1])
  client.saddAsync('refreshToken:sessions:' + req.userId, req.refreshTokenId)

  res.status(200).json({
    status: 'Logged out successfully from all other devices'
  })
}
