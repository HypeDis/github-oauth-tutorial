const axios = require('axios');
const { CLIENT_ID, CLIENT_SECRET } = process.env;
const getGithubAccessToken = code => {
  return axios.post(
    'https://github.com/login/oauth/access_token',
    {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
    },
    { headers: { accept: 'application/json' } }
  );
};

const getGithubUserData = accessToken => {
  return axios.get('https://api.github.com/user', {
    headers: { authorization: `token ${accessToken}` },
  });
};
module.exports = { getGithubAccessToken, getGithubUserData };
