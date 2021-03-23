const Sequelize = require('sequelize')

// const sequelize = new Sequelize('Authorization', 'root', 'password', {
//   dialect: 'mysql',
//   host: 'localhost'
// })

// const sequelize = new Sequelize('GCb43jPaRq', 'GCb43jPaRq', 'OOejxUWJoE', {
//   dialect: 'mysql',
//   host: 'remotemysql.com',
//   port: 3306
// })

// const sequelize = new Sequelize('GCb43jPaRq', 'GCb43jPaRq', 'OOejxUWJoE', {
//   dialect: 'mysql',
//   host: 'remotemysql.com',
//   port: 3306
// })

const sequelize = new Sequelize(process.env.MYSQL_DB_NAME, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
  dialect: 'mysql',
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT
})
module.exports = sequelize
