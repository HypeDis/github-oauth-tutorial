import React, { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';

import UserPage from './UserPage';
import Login from './Login';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true, // this flag tells axios to send cookies when making requests to servers with different domains (cross domain) be careful only to use it between trusted services
  headers: {
    accept: 'application/json',
  },
});

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({
    githubId: '',
    avatarUrl: '',
    userName: '',
    reposUrl: '',
  });
  const [repos, setRepos] = useState([]);

  // check user's login status on page load
  useEffect(() => {
    console.log('checking login status');
    api
      .get('/auth/user')
      .then(() => {
        setIsLoggedIn(true);
      })
      .catch(err => {
        console.error('Authentication Failed');
        setUser({});
        setIsLoggedIn(false);
      });
  }, []);

  // grab the users data from the api server once they log in
  useEffect(() => {
    if (isLoggedIn) {
      console.log('Fetching user data');
      api
        .get('/api/user')
        .then(response => {
          const incomingUser = response.data;
          setUser(incomingUser);
        })
        .catch(err => console.error('Error retrieving user data', err));
    }
  }, [isLoggedIn]);

  // grab the repo data from github once the user data comes in
  useEffect(() => {
    if (user.reposUrl) {
      console.log("Fetching user's repos");
      axios
        .get(user.reposUrl)
        .then(response => {
          const incomingRepos = response.data;
          setRepos(incomingRepos);
        })
        .catch(err => console.error('Error fetching repos', err));
    }
  }, [user.reposUrl]);

  return (
    <div className="App">
      {isLoggedIn ? (
        <UserPage
          user={user}
          setIsLoggedIn={setIsLoggedIn}
          repos={repos}
          api={api}
        />
      ) : (
        <Login />
      )}
    </div>
  );
}

export default App;
