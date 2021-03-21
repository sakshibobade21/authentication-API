/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
const expect = require('chai').expect
const jwt = require('jsonwebtoken')
const sinon = require('sinon')
const client = require('../middleware/redis')

const authMiddleware = require('../middleware/is-auth')

describe('Auth Middleware', () => {
  it('Should return when cookies are not present', async () => {
    const req = {
      cookies: {
      }
    }
    const result = await authMiddleware(req, {}, () => { })
    expect(result).to.be.an('Error')
  })
  it('Should throw an error when token is invalid', async () => {
    const req = {
      cookies: {
        accessToken: 'abc'
      }
    }
    const result = await authMiddleware(req, {}, () => { })
    expect(result).to.be.an('object')
    expect(result.name).to.be.equal('JsonWebTokenError')
  })

  // it('Should yeild a userId and a sessionId after decoding a token', async () => {
  //   const req = {
  //     cookies: {
  //       accessToken: 'abc'
  //     }
  //   }
  //   sinon.stub(jwt, 'verify')
  //   jwt.verify.returns({})
  //   await authMiddleware(req, {}, () => { })
  //   expect(jwt.verify.called).to.be.true
  //   expect(req).to.have.property('userId')
  //   jwt.verify.restore()
  // })

  it('Should return if the accessTokenId is not present in cache', async () => {
    const req = {
      cookies: {
        accessToken: 'abc'
      }
    }
    sinon.stub(jwt, 'verify')
    jwt.verify.returns({ userId: 'abc' })

    sinon.stub(client, 'sismemberAsync')
    client.sismemberAsync.returns(0)

    const result = await authMiddleware(req, {}, () => { })
    expect(result).to.be.an('Error')
    expect(result.name).to.be.not.equal('JsonWebTokenError')
    expect(result.name).to.be.not.equal('TypeError')

    client.sismemberAsync.restore()
    jwt.verify.restore()
  })
})
