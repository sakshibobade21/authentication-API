const Sequelize = require('sequelize')

const sequelize = new Sequelize('Authorization-Api', 'root', 'password', {
  dialect: 'mysql',
  host: 'localhost'
})

module.exports = sequelize
