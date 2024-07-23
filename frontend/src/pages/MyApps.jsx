import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../styles/ViewApp.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://dhbw-appstore.com';

const MyApps = () => {
  const { userId } = useParams();
  const [installedApps, setInstalledApps] = useState([]);
  const [deleteAppId, setDeleteAppId] = useState(null);
  const [deleteAppVersion, setDeleteAppVersion] = useState(null); // State to store the app version to be deleted
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInstalledApps = async () => {
      try {
        const response = await axios.get(`${API_URL}/users/${userId}/apps`);
        setInstalledApps(response.data);
      } catch (error) {
        setError('Error fetching installed apps');
      }
    };
    fetchInstalledApps();
  }, [userId]);

  const uninstallApp = async () => {
    try {
      await axios.delete(`${API_URL}/users/${userId}/apps/${deleteAppId}/${deleteAppVersion}`);
      setInstalledApps(prevApps => prevApps.filter(app => !(app.appId._id === deleteAppId && app.version === deleteAppVersion)));
      setDeleteAppId(null);
      setDeleteAppVersion(null);
      const modal = document.getElementById('confirmation-modal');
      if (modal) {
        modal.style.display = 'none';
      }
    } catch (error) {
      setError('Error uninstalling app');
    }
  };

  const openConfirmationModal = (appId, version) => {
    setDeleteAppId(appId);
    setDeleteAppVersion(version); // Set the version to be deleted
    setTimeout(() => {
      const modal = document.getElementById('confirmation-modal');
      if (modal) {
        modal.style.display = 'flex';
      }
    }, 0);
  };

  const closeConfirmationModal = () => {
    setDeleteAppId(null);
    setDeleteAppVersion(null); // Clear the version
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
              <button className="delete-button" onClick={() => openConfirmationModal(app.appId._id, app.version)}>Uninstall</button>
            </div>
          </div>
        ))}
      </div>

      {deleteAppId && (
        <div id="confirmation-modal" className="confirmation-modal">
          <div className="modal-content">
            <p>Are you sure you want to uninstall this app version?</p>
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
