const express = require('express')
const app = express()

// Import Routes
const authRoute = require('./routes/auth')

// Routes Middleware
app.get('/register', authRoute)

app.listen(3000, () => console.log('Server is up and running'))
