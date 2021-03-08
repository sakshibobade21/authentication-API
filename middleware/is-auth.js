const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  // const authHeader = req.get('Authorization')

  let accessToken = req.cookies.accessToken
  const refreshToken = req.cookies.refreshToken

  if (!accessToken) {
    const err = new Error('Not Authenticated')
    err.statusCode = 403
    throw err
  }

  try {
    try {
      const decodedAccessToken = jwt.verify(accessToken, 'secret1')
      req.userId = decodedAccessToken.userId
    } catch (err) {
      if (!refreshToken) {
        const err = new Error('Not Authenticated')
        err.statusCode = 403
        throw err
      }
      const decodedRefreshToken = jwt.verify(refreshToken, 'secret2')
      req.userId = decodedRefreshToken.userId
      accessToken = jwt.sign({
        email: decodedRefreshToken.email,
        userId: decodedRefreshToken.userId
      },
        'secret1',
        { expiresIn: '1m' })

      res.cookie('accessToken', accessToken, {
        expires: new Date(Date.now() + 60000)
      })
    }
  } catch (err) {
    const error = new Error('Not Authenticated')
    error.statusCode = 403
    throw error
  }
  next()
}
