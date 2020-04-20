## Introduction

This tutorial is designed to give you a working understanding of oauth.
We will be using github as our authentication service.
Additionally we will be using JSON Web Tokens to pass user data between between the client and server after being authenticated.

## Setup

### Documentation

Github oauth:
https://developer.github.com/apps/building-oauth-apps/authorizing-oauth-apps/#web-application-flow

json-web-token library:
https://www.npmjs.com/package/jsonwebtoken

axios:
https://github.com/axios/axios

### Oauth setup

Go to your github page and go to Settings > Developer Settings > OAuth Apps > New OAuth App
Create a new oauth app with these parameters:

- Application name: oauth tutorial
- Homepage URL: http://localhost:3000
- Authorization callback URL: http://localhost:5000/github/callback

### Your Computer

Fork and clone this repo

then run

```
npm i
```

to install all the dependencies

Create a file named '.env' in the root directory
and add your github client id and client secret to the file
as well as a jwt secret

```
### example .env file
CLIENT_ID=123abc
CLIENT_SECRET=abc123
JWT_SECRET=helloworld
```

## Basic authentication flow:

The 3 main players

- the client (src/App.js)
- the api server(server/server.js)
- github

The flow

- A User wants to log into the app. They click the login button which is sent as a request to the api server. (client -> api)
- The api server immediately redirects them to the github login portal (this portal is not connected to the app in any way and is fully maintained by github) (api -> github)
- Once the user logs in through the github portal, git hub sends a request to the api server with a code attached (this is what the callback url is for). (github -> api)
- The api server can exchange this code for an access token. (api <-> github)

  - The access token is used by the api server to get information about a particular user from github and can even be used to modify data on the users github account. It should never be exposed on any client facing applications.

- After authentication with github the api server creates a json web token which gets passed around so that github servers don't need to be contacted anymore. (api <-> client)

## Instructions

To start the client and api servers run

```
npm run start:dev
```

Look through the client and server code to familiarize yourself
then try following the authentication flow starting from the login link located in src/Login.js

```jsx
// start here
// src/Login.js
<a href={`http://localhost:5000/github/redirect`} className="login-link">
  ...
</a>
```
