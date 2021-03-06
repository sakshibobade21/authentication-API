const Sequelize = require('sequelize')

const sequelize = new Sequelize('Authorization', 'root', 'password', {
  dialect: 'mysql',
  host: 'localhost'
})

module.exports = sequelize
