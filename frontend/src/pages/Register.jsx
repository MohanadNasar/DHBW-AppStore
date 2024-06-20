import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Register.css'; // Import the CSS file

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const registerHandler = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/users/', { username, email, password } , {withCredentials: true});
      navigate('/login');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="form-container">
      <div className="form-box">
        <h2>Register</h2>
        <form onSubmit={registerHandler}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
