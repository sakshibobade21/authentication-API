const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization')
  if (!authHeader) {
    const err = new Error('Not Authenticated')
    err.statusCode = 403
    throw err
  }

  const token = authHeader.split(' ')[1]
  let decodedToken
  try {
    decodedToken = jwt.verify(token, 'secret')
  } catch (err) {
    err.statusCode = 500
    throw err
  }

  console.log(decodedToken)
  if (!decodedToken) {
    const err = new Error('Not Authenticated')
    err.statusCode = 403
    throw err
  }

  next()
}
