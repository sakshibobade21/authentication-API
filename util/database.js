const Sequelize = require('sequelize')

// const sequelize = new Sequelize('Authorization', 'root', 'password', {
//   dialect: 'mysql',
//   host: 'localhost'
// })

const sequelize = new Sequelize('GCb43jPaRq', 'GCb43jPaRq', 'OOejxUWJoE', {
  dialect: 'mysql',
  host: 'remotemysql.com',
  port: 3306
})

module.exports = sequelize
