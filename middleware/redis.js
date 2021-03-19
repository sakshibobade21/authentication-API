const redis = require('redis')
const { promisifyAll } = require('bluebird')
promisifyAll(redis)

// Make connection to the instance of the redis
const client = redis.createClient()
module.exports = client
