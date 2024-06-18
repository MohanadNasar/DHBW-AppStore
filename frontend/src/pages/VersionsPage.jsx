// VersionsPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import '../styles/VersionsPage.css';

const VersionsPage = () => {
  const { appId } = useParams(); // Get the appId from URL params
  const [versions, setVersions] = useState([]);
  const [addVersionOpen, setAddVersionOpen] = useState(false); // State for add version modal
  ///const [editVersionId, setEditVersionId] = useState(null); // State for editing version
  const [deleteVersionId, setDeleteVersionId] = useState(null); // State for deleting version

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/apps/${appId}/versions`);
        setVersions(response.data);
      } catch (error) {
        console.error('Error fetching versions:', error);
      }
    };
    fetchVersions();
  }, [appId]);

  // Function to open modal for adding a new version
  const openAddVersionModal = () => {
    setAddVersionOpen(true);
  };

  // Function to close modal for adding a new version
  const closeAddVersionModal = () => {
    setAddVersionOpen(false);
  };

  // Function to handle deletion of a version
  const deleteVersion = async (versionId) => {
    try {
      await axios.delete(`http://localhost:8000/apps/${appId}/versions/${versionId}`);
      setVersions(prevVersions => prevVersions.filter(v => v._id !== versionId));
      setDeleteVersionId(null); // Reset deleteVersionId after deletion
    } catch (error) {
      console.error('Error deleting version:', error);
    }
  };

  // Function to open modal for confirming version deletion
  const openConfirmationModal = (versionId) => {
    setDeleteVersionId(versionId);
    const modal = document.getElementById('confirmation-modal');
    modal.style.display = 'flex'; // Display the modal
  };

  // Function to close confirmation modal
  const closeConfirmationModal = () => {
    setDeleteVersionId(null);
    const modal = document.getElementById('confirmation-modal');
    modal.style.display = 'none'; // Hide the modal
  };

  return (
    <div className="container">
      <h1>App Versions</h1>
      <div className="versions-actions">
        <button className="button" onClick={openAddVersionModal}>Add Version</button>
      </div>
      <div className="version-list">
        {versions.map(version => (
          <div key={version._id} className="version-card">
            <h3>{version.versionNumber}</h3>
            <p>{version.description}</p>
            <p>Status: {version.isActive ? 'Active' : 'Inactive'}</p>
            <div className="version-actions">
              <button className="button">Edit</button>
              <button className="button" onClick={() => openConfirmationModal(version._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Version Modal */}
      {addVersionOpen && (
        <div className="add-version-modal">
          <div className="modal-content">
            <span className="close" onClick={closeAddVersionModal}>&times;</span>
            <h2>Add Version</h2>
            {/* Form for adding version */}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {deleteVersionId && (
        <div id="confirmation-modal" className="confirmation-modal">
          <div className="modal-content">
            <p>Are you sure you want to delete this version?</p>
            <div className="modal-buttons">
              <button className="yes-button" onClick={() => deleteVersion(deleteVersionId)}>Yes</button>
              <button className="cancel-button" onClick={closeConfirmationModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionsPage;
