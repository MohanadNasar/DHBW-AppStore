import React, { useState } from 'react';
import axios from 'axios';
import { displaySuccessMessage, displayErrorMessage } from '../utils/messages'; 
import '../styles/CreateApp.css';

const CreateApp = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/apps', { name, description }, { withCredentials: true });
      setMessage('App created successfully!');
      setMessageType('success');
      console.log('App created:', response.data);
      displaySuccessMessage('App created successfully!');
      // Clear the form
      setName('');
      setDescription('');
    } catch (error) {
      console.error('Error creating app:', error);
      setMessage(error.response?.data?.message || 'An error occurred while creating the app');
      setMessageType('error');
      displayErrorMessage('An error occurred while creating the app');
    }
  };

  return (
    <div className="containerCreate">
      <h1>Create App</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">App Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <button type="submit">Create App</button>
        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default CreateApp;
