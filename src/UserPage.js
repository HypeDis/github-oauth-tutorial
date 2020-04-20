import React from 'react';

export default function UserPage({ setIsLoggedIn, user, api, repos }) {
  return (
    <div className="logged-in">
      <div className="user">
        <img src={user.avatarUrl} alt="github avatar" />
        <p>Hello there, {user.userName}!</p>
      </div>
      <div className="repos">
        <p>You've got some nifty repos!</p>
        <ul className="repo-list">
          {repos.map(repo => (
            <li key={repo.html_url}>
              <a href={repo.html_url}>{repo.name}</a>
            </li>
          ))}
        </ul>
      </div>
      <button
        className="logout-btn"
        onClick={() => {
          api.get('/auth/logout').then(() => setIsLoggedIn(false));
        }}
      >
        Logout
      </button>
    </div>
  );
}
