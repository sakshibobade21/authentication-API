const redis = require('redis')
const { promisifyAll } = require('bluebird')
promisifyAll(redis)

// Make connection to the instance of the redis
// const client = redis.createClient()
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
})

module.exports = client
