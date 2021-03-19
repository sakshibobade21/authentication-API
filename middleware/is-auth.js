/* eslint-disable indent */
const jwt = require('jsonwebtoken')
const client = require('../middleware/redis')

module.exports = async (req, res, next) => {
  let accessToken = req.cookies.accessToken
  const refreshToken = req.cookies.refreshToken

  try {
    if (!accessToken) {
      const err = new Error('Not Authenticated')
      err.statusCode = 403
      throw err
    }
    try {
      const decodedAccessToken = jwt.verify(accessToken, 'secret1')
      req.userId = decodedAccessToken.userId
      req.sessionId = decodedAccessToken.sessionId
    } catch (err) {
      if (!refreshToken) {
        const err = new Error('Not Authenticated')
        err.statusCode = 403
        throw err
      }
      const decodedRefreshToken = jwt.verify(refreshToken, 'secret2')
      req.userId = decodedRefreshToken.userId
      req.sessionId = decodedRefreshToken.sessionId
      accessToken = jwt.sign({
        email: decodedRefreshToken.email,
        userId: decodedRefreshToken.userId,
        type: 'access',
        sessionId: decodedRefreshToken.sessionId
      },
        'secret1',
        { expiresIn: '1m' })

      res.cookie('accessToken', accessToken, {
        expires: new Date(Date.now() + 60000)
      })
    }
    const isMember = await client.sismemberAsync('sessions:' + req.userId, req.sessionId)
    if (!isMember) {
      const err = new Error('Not Authenticated')
      err.statusCode = 403
      throw err
    }
  } catch (err) {
    // const error = new Error('Not Authenticated')
    // error.statusCode = 403
    return next(err)
  }
  next()
}
