## Authentication-API

### Contents
* [Description](#Description)
* [Requirements](#Requirements)
* [Documentation](#Documentation)

### Description
----
This is a REST API developed using Node.js that implememts the user authentication. Following are the functionalities available:

* SignUp
* Login
* JWT Auth
* Logout from current/other/all devices


### Requirements
----
* Node.js

### Documentation
----

#### Install Dependencies
```
npm install
```

#### Run
```
npm start
```

#### Routes
```
  Route: http://localhost:3000/user/register/
    Request Type: POST
    Body:
        {
            "username":"johndoe",
            "name": "John Doe",
            "email":"johndoe@gmail.com"
            "password":"qwertyuiop"
        }
```