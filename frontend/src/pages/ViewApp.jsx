// viewApp.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ViewApp.css';
import { Link } from 'react-router-dom';

const ViewApp = () => {
  const [apps, setApps] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const response = await axios.get('http://localhost:8000/apps');
        setApps(response.data);
      } catch (error) {
        console.error('Error fetching apps:', error);
      }
    };
    fetchApps();
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredApps = apps.filter(app =>
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (app.description && app.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const deleteApp = async (appId) => {
    try {
      await axios.delete(`http://localhost:8000/apps/${appId}`);
      setApps(prevApps => prevApps.filter(app => app._id !== appId));
    } catch (error) {
      console.error('Error deleting app:', error);
    }
  };

  return (
    <div className="container">
      <h1>View Apps</h1>
      <input
        type="text"
        placeholder="Search by name or description..."
        value={searchTerm}
        onChange={handleSearch}
      />
      <div className="app-list">
        {filteredApps.map(app => (
          <div key={app._id} className="app-card">
            <h3>{app.name}</h3>
            <p>{app.description}</p>
            <p>{app.versions.length} Versions</p>
            <div className="app-actions">
              <Link to={`/apps/${app._id}/versions`} className="button">Versions</Link>
              <button onClick={() => deleteApp(app._id)}>Delete App</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewApp;
