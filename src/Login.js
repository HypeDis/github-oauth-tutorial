import React from 'react';

export default function Login() {
  return (
    <div>
      <a href={`http://localhost:5000/github/redirect`} className="login-link">
        <img
          src="https://github.githubassets.com/images/modules/logos_page/Octocat.png"
          alt="github cat"
        />
        <div>Login using github</div>
      </a>
    </div>
  );
}
