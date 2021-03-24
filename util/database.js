const Sequelize = require('sequelize')
const config = require('config')

const dbName = config.get('dbConfig.name')
const usename = config.get('dbConfig.usename')
const password = config.get('dbConfig.password')
const host = config.get('dbConfig.host')
const port = config.get('dbConfig.port')

const sequelize = new Sequelize(dbName, usename, password, {
  dialect: 'mysql',
  host: host,
  port: port
})

// const sequelize = new Sequelize('GCb43jPaRq', 'GCb43jPaRq', 'OOejxUWJoE', {
//   dialect: 'mysql',
//   host: 'remotemysql.com',
//   port: 3306
// })

// const sequelize = new Sequelize(process.env.MYSQL_DB_NAME, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
//   dialect: 'mysql',
//   host: process.env.MYSQL_HOST,
//   port: process.env.MYSQL_PORT
// })
module.exports = sequelize
