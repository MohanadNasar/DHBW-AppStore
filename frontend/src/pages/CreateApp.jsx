import React, { useState } from 'react';
import axios from 'axios';
import '../styles/CreateApp.css';

const CreateApp = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/apps', { name, description }, { withCredentials: true });
      alert('App created successfully!');
      console.log('App created:', response.data);
      // Clear the form
      setName('');
      setDescription('');
    } catch (error) {
      console.error('Error creating app:', error);
      alert(error.response?.data?.message || 'An error occurred while creating the app');
    }
  };

  return (
    <div className="container">
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
      </form>
    </div>
  );
};

export default CreateApp;
