const redis = require('redis')
const { promisifyAll } = require('bluebird')
promisifyAll(redis)
const config = require('config')

const host = config.get('redisConfig.host')
const port = config.get('redisConfig.port')
const password = config.get('redisConfig.password')

const client = redis.createClient({
  host: host,
  port: port,
  password: password
})

// const client = redis.createClient({
//   host: process.env.REDIS_HOST,
//   port: process.env.REDIS_PORT,
//   password: process.env.REDIS_PASSWORD
// })

module.exports = client
