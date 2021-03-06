const User = require('../model/user')

exports.register = (req, res, next) => {
  const username = req.body.username
  const name = req.body.name
  const email = req.body.email
  const password = req.body.password

  User.create({ username, name, email, password })
    .then(result => {
      res.send(result)
      console.log(result)
    })
    .catch(err => console.log(err))
}
