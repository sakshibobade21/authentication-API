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
  const secret1 = 'secret1'
  const secret2 = 'secret2'

  const username = req.body.username
  const password = req.body.password

  try {
    const user = await User.findOne({ where: { username: username } })
    if (!user) {
      const err = new Error('User not found!')
      err.statusCode = 401
      throw err
    }

    const isEqual = await bcrypt.compare(password, user.password)
    if (!isEqual) {
      const err = new Error('Wrong Password')
      err.statusCode = 401
      throw err
    }

    const sessionId = uuidv4()

    const accessToken = jwt.sign({
      email: user.email,
      userId: user.id,
      type: 'access',
      sessionId: sessionId
    },
      secret1,
      { expiresIn: '1h' })

    const refreshToken = jwt.sign({
      email: user.email,
      userId: user.id,
      type: 'refresh',
      sessionId: sessionId
    },
      secret2,
      { expiresIn: '7d' })

    res.cookie('accessToken', accessToken, {
      expires: new Date(Date.now() + 60 * 60 * 1000) // 1 hr
    })
    res.cookie('refreshToken', refreshToken, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    })

    client.hmset('userId:' + user.id, {
      username: user.username,
      email: user.email,
      name: user.name
    })

    client.saddAsync('sessions:' + user.id, sessionId)

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
  res.clearCookie('accessToken')
  res.clearCookie('refreshToken')

  client.srem('sessions:' + req.userId, req.sessionId)
  res.status(200).json({
    status: 'Logged Out Successfully'
  })
}

exports.logoutAllDevices = (req, res, next) => {
  res.clearCookie('accessToken')
  res.clearCookie('refreshToken')

  client.del('userId:' + req.userId, 'sessions:' + req.userId)
  res.status(200).json({
    status: 'Logged out successfully from all the devices'
  })
}
