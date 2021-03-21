/* eslint-disable indent */
const jwt = require('jsonwebtoken')
const client = require('../middleware/redis')
const { v4: uuidv4 } = require('uuid')

module.exports = async (req, res, next) => {
  // Get the access and refresh token from cookies
  let accessToken = req.cookies.accessToken
  const refreshToken = req.cookies.refreshToken

  // Check if access token is present
  if (!accessToken) {
    const err = new Error('Not Authenticated')
    err.statusCode = 403
    next(err)
    return err
  }
  try {
    try {
      // Verify the access token
      const decodedAccessToken = jwt.verify(accessToken, 'secret1')

      // Get the user id from the payload of access token
      req.userId = decodedAccessToken.userId

      // Check if the access token uuid is present in cache if not then unauthenticate the user
      const isAccessTokenExist = await client.sismemberAsync('accessToken:sessions:' + req.userId, decodedAccessToken.sessionId)

      if (!isAccessTokenExist) {
        const err = new Error('Not Authenticated')
        err.statusCode = 401
        next(err)
        return err
      }

      // Get the sessionId from the payload of access token
      req.accessTokenId = decodedAccessToken.sessionId

      // Get the sessionId from the payload of refresh token
      const refreshTokenPayload = jwt.decode(refreshToken, { verify_signature: false })
      req.refreshTokenId = refreshTokenPayload.sessionId
    } catch (err) {
      // Generate the new access token only if it is expired and not if it is invalid
      if (err.message !== 'jwt expired') {
        throw err
      }

      // Check if refresh token is present
      if (!refreshToken) {
        const err = new Error('Not Authenticated')
        err.statusCode = 403
        throw err
      }

      // Verify the refresh token
      const decodedRefreshToken = jwt.verify(refreshToken, 'secret2')

      // Get the user id from the payload of refresh token
      req.userId = decodedRefreshToken.userId

      // Check if the refresh token uuid is present in cache. If not unauthenticate the user
      const isrefreshTokenExists = await client.sismemberAsync('refreshToken:sessions:' + req.userId, decodedRefreshToken.sessionId)

      if (!isrefreshTokenExists) {
        const err = new Error('Not Authenticated')
        err.statusCode = 403
        throw err
      }

      // Get the sessionId from the payload of refresh token
      req.refreshTokenId = decodedRefreshToken.sessionId

      // Remove the uuid of the expired access token from the cache.
      const payload = jwt.verify(accessToken, 'secret1', { ignoreExpiration: true })
      client.sremAsync('accessToken:sessions:' + req.userId, payload.sessionId)

      // Generate the new access token
      const newAccessTokenId = uuidv4()
      accessToken = jwt.sign({
        email: decodedRefreshToken.email,
        userId: decodedRefreshToken.userId,
        type: 'access',
        sessionId: newAccessTokenId
      },
        'secret1',
        { expiresIn: '1h' })

      // Get the sessionId from the new access token
      req.accessTokenId = newAccessTokenId
      // Store the access token into the cookie
      res.cookie('accessToken', accessToken, {
        expires: new Date(Date.now() + 60 * 60 * 1000)
      })

      // Add the uuid of the new access token to the cache.
      client.saddAsync('accessToken:sessions:' + req.userId, newAccessTokenId)
    }
  } catch (err) {
    err.statusCode = 401
    next(err)
    return err
  }
  next()
}
