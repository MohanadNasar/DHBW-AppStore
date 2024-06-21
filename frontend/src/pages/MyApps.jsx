import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ViewApp.css';

const MyApps = () => {
  const [installedApps, setInstalledApps] = useState([]);
  const [deleteAppId, setDeleteAppId] = useState(null);
  const [error, setError] = useState('');
  const userId = JSON.parse(localStorage.getItem('userInfo')).user._id;

  useEffect(() => {
    const fetchInstalledApps = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/users/${userId}/apps`);
        setInstalledApps(response.data);
      } catch (error) {
        setError('Error fetching installed apps');
      }
    };
    fetchInstalledApps();
  }, [userId]);

  const uninstallApp = async () => {
    try {
      await axios.delete(`http://localhost:8000/users/${userId}/apps/${deleteAppId}`);
      setInstalledApps(prevApps => prevApps.filter(app => app.appId._id !== deleteAppId));
      setDeleteAppId(null);
      const modal = document.getElementById('confirmation-modal');
      if (modal) {
        modal.style.display = 'none';
      }
    } catch (error) {
      setError('Error uninstalling app');
    }
  };

  const openConfirmationModal = (appId) => {
    setDeleteAppId(appId);
    setTimeout(() => {
      const modal = document.getElementById('confirmation-modal');
      if (modal) {
        modal.style.display = 'flex';
      }
    }, 0);
  };

  const closeConfirmationModal = () => {
    setDeleteAppId(null);
    const modal = document.getElementById('confirmation-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  };

  return (
    <div className="container">
      <h1>My Installed Apps</h1>
      {error && <div className="error-message">{error}</div>}
      <div className="app-list">
        {installedApps.map(app => (
          <div key={app.appId._id} className="app-card">
            <h3>{app.appId.name}</h3>
            <p>Version: {app.version}</p>
            <div className="app-actions">
              <button className="delete-button" onClick={() => openConfirmationModal(app.appId._id)}>Uninstall</button>
            </div>
          </div>
        ))}
      </div>

      {deleteAppId && (
        <div id="confirmation-modal" className="confirmation-modal">
          <div className="modal-content">
            <p>Are you sure you want to uninstall this app?</p>
            <div className="modal-buttons">
              <button className="yes-button" onClick={uninstallApp}>Yes</button>
              <button className="cancel-button" onClick={closeConfirmationModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyApps;
