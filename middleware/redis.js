const redis = require('redis')
const { promisifyAll } = require('bluebird')
promisifyAll(redis)

// Make connection to the instance of the redis
// const client = redis.createClient()
const client = redis.createClient({
  host: 'redis-10837.c253.us-central1-1.gce.cloud.redislabs.com',
  port: 10837,
  password: 'Zz2W8EcqVcCxEPmik1oVSpxctXEMcDAq'
})

module.exports = client
