# Authentication-API

This is JSON Web Token (JWT) based authentication REST API. Here access and refresh tokens are used for user authentication. 

There are several endpoints exposed in the project including user signup, login, logout from current/other/all devices along with a protected resource.
After providing credentials to the Authorization server user obtains refresh and access tokens. Both the jwt tokens are signed and contains user identity (e.g. user id), unique identifier etc.

User sends access token with each request to access the protected resource. Server verifies the access token's signature. 

If the access token is expired then a refresh token is used to generate a new access token. If Access token is malformed, or simply if token is not signed with the appropriate signing key then user has to login again. If the access token is valid then user is given the access to the protected res

Here Redis is used in order to persist user sessions from multiple devices.


