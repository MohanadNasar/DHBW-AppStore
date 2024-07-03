import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { displaySuccessMessage } from '../utils/messages';
import '../styles/Register.css'; // Reuse the CSS file for styling

const API_URL = process.env.REACT_APP_API_URL || 'http://dhbw-appstore.com';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    displaySuccessMessage('Logged in successfully');
    window.dispatchEvent(new Event('login'));
    navigate('/');
  };

  const loginHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${API_URL}/users/login`, { username, password }, { withCredentials: true });
      const { token, user } = data;
      localStorage.setItem('token', token);
      localStorage.setItem('userInfo', JSON.stringify(user));
      localStorage.setItem('userId', user._id);
      handleLoginSuccess();
    } catch (error) {
      setError(error.response.data.error);
    }
  };

  const handleGitHubSignIn = () => {
    try {
      console.log('Initiating GitHub sign-in');
      window.location.href = `${API_URL}/auth/github`; // Ensure your backend handles GitHub sign-in at this endpoint
    } catch (error) {
      console.error('Failed to initiate GitHub sign-in:', error);
      setError('Failed to initiate GitHub sign-in.');
    }
  };

  return (
    <div className="form-container">
      <div className="form-box">
        <h2>Login</h2>
        <form onSubmit={loginHandler}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <div className="error-message">{error}</div>}
          <button type="submit">Login</button>
        </form>
        <p>Do not have an account? <Link to="/register">Register here</Link></p>
        <hr />
        <button className="github-login-button" onClick={handleGitHubSignIn}>Sign in with GitHub</button>
      </div>
    </div>
  );
};

export default Login;
