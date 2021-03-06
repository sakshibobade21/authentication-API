const User = require('../model/user')
const { validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

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
    console.log(isEqual)
    if (!isEqual) {
      const err = new Error('Wrong Password')
      err.statusCode = 401
      throw err
    }

    const token = jwt.sign({
      email: user.email,
      userId: user.id
    },
      'secret',
      { expiresIn: '1h' })
    res.status(200).json({
      token: token
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
