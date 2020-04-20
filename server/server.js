require('dotenv').config('');
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { getGithubAccessToken, getGithubUserData } = require('./githubAuth');
const { cors } = require('./cors');
const morgan = require('morgan');

// Logging middleware to show us all the incoming requests
app.use(morgan('tiny'));
// This middleware parses all the incoming cookies and attaches them to the request object (req.cookies)
app.use(cookieParser());

// CORS middleware - this portion is not crucial to the understanding of oauth but neccessary due to having 2 servers talking to each other
// To learn more about CORS: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
app.use(
  // We need to include these headers in the response so that the front end served by create-react-app (localhost:3000) and api server (localhost:5000) can share resources (cookies in our case)
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST'],
    headers: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
  })
);

// Authentication middleware that checks if an incoming request has a valid token and attaches relevant user data to the request object
app.use((req, res, next) => {
  const token = req.cookies['jwt'];
  console.log('authentication user');
  if (token) {
    console.log('validating jwt');
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        // If there is an error it means the token is either expired or invalid
        console.log('Token is invalid or expired. Deleting cookie.');
        // Try setting the expiresIn value to 5 seconds inside of jwt.sign() in the GET /github/callback route to see this in action
        res.cookie('jwt', '', {
          httpOnly: true,
          // Theres no way to delete cookies across domains so we set the expiration date to Date.now() so that it expires upon arrival
          expires: new Date(Date.now()),
        });
        // if the api and client are located on the same server you can use res.clearCookie('jwt') instead
      } else {
        // if token is valid, attach the decoded jwt payload to the request object
        console.log('user authenticated');
        req.user = decoded;
      }
      next();
    });
  } else {
    console.log('no token found, authentication failed');
    next();
  }
});

// when the client tries to log in with github the server redirects them to the github authorization portal
app.get('/github/redirect', (req, res, next) => {
  console.log('redirecting to github for authorization');
  // in the scope portion of this query we are asking the user to give us access to their public profile as well their public repos
  const url = `https://github.com/login/oauth/authorize?client_id=${process.env.CLIENT_ID}&scope=user%20public_repo`;
  res.redirect(url);
});

// The callback route is the api endpoint that github sends the user code to once a user has successfully logged in with them
// The user code can be exchanged for an access token
// This route is set by the developer when they create the oauth credentials for the app
app.get('/github/callback', (req, res, next) => {
  const githubCode = req.query.code;
  // Exchange the code for the access token
  getGithubAccessToken(githubCode) // This is an axios call wrapped in a function check githubAuth.js for details
    .then(tokenResponse => {
      // NOTE: The access token lasts as long as you are logged into your github account. Try logging into this app then log out of both apps and try logging into this app again.
      const { access_token } = tokenResponse.data;

      // Exchange access token for user data
      return getGithubUserData(access_token); // This is an axios wrapper too
    })
    .then(userResponse => {
      const { id, avatar_url, login, repos_url } = userResponse.data;
      // We'll store all the user info in the jwt because im too lazy to make a database. Normally the jwt would be kept as minimal as possible
      // NOTICE: DO NOT put sensitive information in the jwt. Things like access tokens and secret keys should never touch the front end.
      const token = jwt.sign(
        {
          githubId: id,
          avatarUrl: avatar_url,
          userName: login,
          reposUrl: repos_url, // links to a list of public repos in json format
        },
        process.env.JWT_SECRET,
        {
          expiresIn: 5 * 60 /* seconds */,
        }
      );
      res.cookie('jwt', token, {
        httpOnly: true, // This flag helps prevent cross site scripting (xss) attacks by not allowing javascript to access this cookie
        // Read more here: https://owasp.org/www-community/HttpOnly
      });
      // We've successfully authenticated now redirect back to the front end server
      res.redirect('http://localhost:3000');
    })
    .catch(next);
});

// This route is used by the client facing application to check if the current user is logged in when the app loads
// This is how we maintain persistent login between browser reloads
app.get('/auth/user', (req, res, next) => {
  if (req.user) {
    return res.sendStatus(200);
  }
  res.sendStatus(401);
});

// this route uses the same cookie deleting hack as in the authentication middleware
app.get('/auth/logout', (req, res, next) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.sendStatus(200);
});

// This is a protected route that returns user data
app.get('/api/user', (req, res, next) => {
  // Block any unauthorized requests from going through
  if (!req.user) {
    return res.status(401).send({ error: 'not authorized' });
  }
  // Returning the jwt payload here because this app doesnt have a db
  res.status(200).send(req.user);
  // In a proper api we could use the user id from the jwt payload to query that user's data
});

// Error handling middlware
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(5000, () => {
  console.log('API server running on http://localhost:5000');
  console.log('Client server running on http://localhost:3000');
});
