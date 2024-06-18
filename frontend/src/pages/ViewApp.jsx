import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ViewApp.css';
import { Link } from 'react-router-dom';

const ViewApp = () => {
  const [apps, setApps] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteAppId, setDeleteAppId] = useState(null); // State to hold app id for deletion

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

  const deleteApp = async () => {
    try {
      await axios.delete(`http://localhost:8000/apps/${deleteAppId}`);
      setApps(prevApps => prevApps.filter(app => app._id !== deleteAppId));
      setDeleteAppId(null); // Reset deleteAppId after deletion
      const modal = document.getElementById('confirmation-modal');
      if (modal) {
        modal.style.display = 'none'; // Hide the modal after deletion
      }
    } catch (error) {
      console.error('Error deleting app:', error);
    }
  };

  const openConfirmationModal = (appId) => {
    setDeleteAppId(appId);
    // Delay accessing the modal until after state has updated
    setTimeout(() => {
      const modal = document.getElementById('confirmation-modal');
      if (modal) {
        modal.style.display = 'flex'; // Display the modal
      }
    }, 0);
  };

  const closeConfirmationModal = () => {
    setDeleteAppId(null);
    const modal = document.getElementById('confirmation-modal');
    if (modal) {
      modal.style.display = 'none'; // Hide the modal
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
            <p>No of Versions:{app.versions.length}</p>
            <div className="app-actions">
              <Link to={`/apps/${app._id}/versions`} className="button">Versions</Link>
              <button className="delete-button" onClick={() => openConfirmationModal(app._id)}>Delete App</button>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {deleteAppId && (
        <div id="confirmation-modal" className="confirmation-modal">
          <div className="modal-content">
            <p>Are you sure you want to delete this app?</p>
            <div className="modal-buttons">
              <button className="yes-button" onClick={deleteApp}>Yes</button>
              <button className="cancel-button" onClick={closeConfirmationModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewApp;
