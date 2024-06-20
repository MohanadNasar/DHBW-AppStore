import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { displaySuccessMessage } from '../utils/messages';
import '../styles/Register.css'; // Reuse the CSS file for styling

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();


  const loginHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        'http://localhost:8000/users/login',
        { username, password }
      );
      // Extract and store userId in local storage
      const { user} = data; // Destructure user and token from response
      localStorage.setItem('userId', user._id); // Store _id as userId
      console.log('userId:', user._id);
      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate('/');
      // Display success message
      displaySuccessMessage('Logged in successfully');
    } catch (error) {
      setError(error.response.data.error);
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
      </div>
    </div>
  );
};

export default Login;
