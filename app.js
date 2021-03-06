const express = require('express')
const app = express()

// Import Database Connection
const sequelize = require('./util/database')

// Import Routes
const authRoute = require('./routes/auth')

// Import Models
const User = require('./model/user')

// Routes Middleware
app.get('/register', authRoute)

sequelize.sync()
  .then(() => {
    app.listen(3000, () => console.log('Server is up and running'))
  })
  .catch(err => console.log('ERR:', err))
