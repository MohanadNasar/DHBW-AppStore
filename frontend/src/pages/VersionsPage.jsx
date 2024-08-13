import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { displaySuccessMessage, displayErrorMessage } from '../utils/messages';
import { useParams } from 'react-router-dom';
import '../styles/VersionsPage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://dhbw-appstore.com';

const VersionsPage = () => {
    const { appId } = useParams(); // Get the appId from URL params
    const [appName, setAppName] = useState(''); // State for app name
    const [versions, setVersions] = useState([]);
    const [addVersionOpen, setAddVersionOpen] = useState(false); // State for add version modal
    const [editVersionOpen, setEditVersionOpen] = useState(false); // State for edit version modal
    const [editVersion, setEditVersion] = useState(null); // State for editing version
    const [deleteVersionId, setDeleteVersionId] = useState(null); // State for deleting version

    const [newVersion, setNewVersion] = useState(''); 
    const [newVersionRequiredParams, setNewVersionRequiredParams] = useState([]); 
    const [newVersionOptionalParams, setNewVersionOptionalParams] = useState([]); 
    const [newImagePath, setNewImagePath] = useState('');
    const [newGitRepo, setNewGitRepo] = useState(''); 


    useEffect(() => {
        const fetchAppDetailsAndVersions = async () => {
            try {
                const response = await axios.get(`${API_URL}/apps/${appId}/versions`);
                setAppName(response.data.appName); // Set the app name from response
                setVersions(response.data.versions);
            } catch (error) {
                console.error('Error fetching app details and versions:', error);
            }
        };
        fetchAppDetailsAndVersions();
    }, [appId]);

    // Function to open modal for adding a new version
    const openAddVersionModal = () => {
        setNewVersion('');
        setNewVersionRequiredParams([]);
        setNewVersionOptionalParams([]);
        setAddVersionOpen(true);
        setNewGitRepo('');
        setNewImagePath('');
    };

    // Function to close modal for adding a new version
    const closeAddVersionModal = () => {
        setAddVersionOpen(false);
    };

    // Function to open modal for editing a version
    const openEditVersionModal = (version) => {
        setEditVersion(version);
        setNewVersion(version.version);
        setNewVersionRequiredParams(version.requiredParams);
        setNewVersionOptionalParams(version.optionalParams);
        setEditVersionOpen(true);
    };

    // Function to close modal for editing a version
    const closeEditVersionModal = () => {
        setEditVersionOpen(false);
    };

    // Function to handle deletion of a version
    const deleteVersion = async (versionId) => {
        try {
            await axios.delete(`${API_URL}/apps/${appId}/versions/${versionId}`);
            setVersions((prevVersions) => prevVersions.filter((v) => v._id !== versionId));
            setDeleteVersionId(null); // Reset deleteVersionId after deletion
            const modal = document.getElementById('confirmation-modal');
            if (modal) {
                modal.style.display = 'none'; // Hide the modal after deletion
            }
            displaySuccessMessage('Version deleted successfully');
        } catch (error) {
            console.error('Error deleting version:', error);
        }
    };

    // Function to open modal for confirming version deletion
    const openConfirmationModal = (versionId) => {
        setDeleteVersionId(versionId);
        setTimeout(() => {
            const modal = document.getElementById('confirmation-modal');
            if (modal) {
                modal.style.display = 'flex'; // Display the modal
            }
        }, 0);
    };

    // Function to close confirmation modal
    const closeConfirmationModal = () => {
        setDeleteVersionId(null);
        const modal = document.getElementById('confirmation-modal');
        if (modal) {
            modal.style.display = 'none'; // Hide the modal
        }
    };

    // Function to handle input change for parameter name in new version form
    const handleParamNameChange = (value, index, type) => {
        if (type === 'requiredParams') {
            const updatedParams = [...newVersionRequiredParams];
            updatedParams[index].name = value;
            setNewVersionRequiredParams(updatedParams);
        } else if (type === 'optionalParams') {
            const updatedParams = [...newVersionOptionalParams];
            updatedParams[index].name = value;
            setNewVersionOptionalParams(updatedParams);
        }
    };

    // Function to handle dropdown change for parameter type in new version form
    const handleParamTypeChange = (value, index, type) => {
        if (type === 'requiredParams') {
            const updatedParams = [...newVersionRequiredParams];
            updatedParams[index].type = value;
            setNewVersionRequiredParams(updatedParams);
        } else if (type === 'optionalParams') {
            const updatedParams = [...newVersionOptionalParams];
            updatedParams[index].type = value;
            setNewVersionOptionalParams(updatedParams);
        }
    };

    // Function to handle input change for parameter value in new version form
    const handleParamValueChange = (value, index, type) => {
        if (type === 'requiredParams') {
            const updatedParams = [...newVersionRequiredParams];
            updatedParams[index].value = value;
            setNewVersionRequiredParams(updatedParams);
        } else if (type === 'optionalParams') {
            const updatedParams = [...newVersionOptionalParams];
            updatedParams[index].value = value;
            setNewVersionOptionalParams(updatedParams);
        }
    };

    // Function to handle adding a new parameter in new version form
    const handleAddParameter = (type) => {
        if (type === 'requiredParams') {
            const newParam = { name: '', type: 'int', value: '' };
            setNewVersionRequiredParams([...newVersionRequiredParams, newParam]);
        } else if (type === 'optionalParams') {
            const newParam = { name: '', type: 'int', value: '' };
            setNewVersionOptionalParams([...newVersionOptionalParams, newParam]);
        }
    };

    // Function to handle removing a parameter in new version form
    const handleRemoveParameter = (index, type) => {
        if (type === 'requiredParams') {
            const updatedParams = [...newVersionRequiredParams];
            updatedParams.splice(index, 1);
            setNewVersionRequiredParams(updatedParams);
        } else if (type === 'optionalParams') {
            const updatedParams = [...newVersionOptionalParams];
            updatedParams.splice(index, 1);
            setNewVersionOptionalParams(updatedParams);
        }
    };

    // Function to handle form submission for adding a new version
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_URL}/apps/${appId}/versions`, {
                version: newVersion,
                requiredParams: newVersionRequiredParams,
                optionalParams: newVersionOptionalParams,
                imagePath: newImagePath,

            });
            setVersions(response.data.versions);
            console.log('New version added:', response.data);
            setNewVersion(''); // Clear input fields
            setNewVersionRequiredParams([]); // Clear required params
            setNewVersionOptionalParams([]); // Clear optional params
            setAddVersionOpen(false); // Close the modal after successful submission
            displaySuccessMessage('Version added successfully');
        } catch (error) {
            console.error('Error adding version:', error);
        }
    };

    // Function to handle form submission for editing a version
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`${API_URL}/apps/${appId}/versions/${editVersion._id}`, {
                version: newVersion,
                requiredParams: newVersionRequiredParams,
                optionalParams: newVersionOptionalParams,
            });
            setVersions(versions.map((v) => (v._id === editVersion._id ? response.data : v)));
            setEditVersionOpen(false); // Close the modal after successful submission
            displaySuccessMessage('Version edited successfully');
        } catch (error) {
            console.error('Error editing version:', error);
        }
    };

    // Function to toggle the enabled state of a version
    const toggleEnabled = async (version) => {
        try {
            const response = await axios.patch(`${API_URL}/apps/${appId}/versions/${version._id}/toggle`);
            setVersions(versions.map((v) => (v._id === version._id ? response.data : v)));
            displaySuccessMessage('Version enabled state toggled successfully');
        } catch (error) {
            console.error('Error toggling enabled state:', error);
        }
    };

    return (
        <div className="container">
            <h1>{appName} Versions</h1>
            <div className="versions-actions">
                <button className="button add-version-button" onClick={openAddVersionModal}>
                    Add Version
                </button>
            </div>
            <div className="version-list">
                {versions.map((version) => (
                    <div key={version._id} className="version-card">
                        <h3>Version: {version.version}</h3>
                        <p>Enabled: {version.enabled ? 'Yes' : 'No'}</p>
                        {version.requiredParams && <p>Required Params: {version.requiredParams.length === 0 ? 'None' : version.requiredParams.map(param => param.name).join(', ')}</p>}
                        {version.requiredParams && <p>Optional Params: {version.optionalParams.length === 0 ? 'None' : version.optionalParams.map(param => param.name).join(', ')}</p>}
                        <p>Created At: {new Date(version.createdAt).toLocaleString()}</p>
                        <div className="version-actions">
                            <button className="button edit-button" onClick={() => openEditVersionModal(version)}>Edit</button>
                            <button
                                className={`toggle-button ${version.enabled ? 'enable' : 'disable'}`}
                                onClick={() => toggleEnabled(version)}
                            >
                                {version.enabled ? 'Disable' : 'Enable'}
                            </button>
                            <button className="button delete-button" onClick={() => openConfirmationModal(version._id)}>Delete</button>
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
                        <form onSubmit={handleSubmit}>
                            <div className="param-input">
                                <input
                                    type="text"
                                    placeholder="Version Number"
                                    value={newVersion}
                                    onChange={(e) => setNewVersion(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="param-input">
                                <input
                                    type="text"
                                    placeholder="Docker Image Path"
                                    value={newImagePath}
                                    onChange={(e) => setNewImagePath(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="param-input">
                                <input
                                    type="text"
                                    placeholder="Git Repository"
                                    value={newGitRepo}
                                    onChange={(e) => setNewGitRepo(e.target.value)}
                                    required
                                />
                            </div>
                            <h3>Required Parameters</h3>
                            {newVersionRequiredParams.map((param, index) => (
                                <div key={index} className="param-input">
                                    <input
                                        type="text"
                                        placeholder="Parameter Name"
                                        value={param.name}
                                        onChange={(e) => handleParamNameChange(e.target.value, index, 'requiredParams')}
                                    />
                                    <select
                                        value={param.type}
                                        onChange={(e) => handleParamTypeChange(e.target.value, index, 'requiredParams')}
                                    >
                                        <option value="int">Integer</option>
                                        <option value="string">String</option>
                                        <option value="yaml">YAML</option>
                                        <option value="json">JSON</option>
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveParameter(index, 'requiredParams')}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={() => handleAddParameter('requiredParams')}>
                                Add Required Param
                            </button>

                            <h3>Optional Parameters</h3>
                            {newVersionOptionalParams.map((param, index) => (
                                <div key={index} className="param-input">
                                    <input
                                        type="text"
                                        placeholder="Parameter Name"
                                        value={param.name}
                                        onChange={(e) => handleParamNameChange(e.target.value, index, 'optionalParams')}
                                    />
                                    <select
                                        value={param.type}
                                        onChange={(e) => handleParamTypeChange(e.target.value, index, 'optionalParams')}
                                    >
                                        <option value="int">Integer</option>
                                        <option value="string">String</option>
                                        <option value="yaml">YAML</option>
                                        <option value="json">JSON</option>
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveParameter(index, 'optionalParams')}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={() => handleAddParameter('optionalParams')}>
                                Add Optional Param
                            </button>

                            <div className="modal-buttons">
                                <button className="button submit-button" type="submit">Add Version</button>
                                <button className="button cancel-button" type="button" onClick={closeAddVersionModal}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Version Modal */}
            {editVersionOpen && (
                <div className="add-version-modal">
                    <div className="modal-content">
                        <span className="close" onClick={closeEditVersionModal}>&times;</span>
                        <h2>Edit Version</h2>
                        <form onSubmit={handleEditSubmit}>
                            <div className="param-input">
                                <input
                                    type="text"
                                    placeholder="Version Number"
                                    value={newVersion}
                                    onChange={(e) => setNewVersion(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="param-input">
                                <input
                                    type="text"
                                    placeholder="Docker Image Path"
                                    value={newImagePath}
                                    onChange={(e) => setNewImagePath(e.target.value)}
                                    required
                                />
                            </div>
                            <h3>Required Parameters</h3>
                            {newVersionRequiredParams.map((param, index) => (
                                <div key={index} className="param-input">
                                    <input
                                        type="text"
                                        placeholder="Parameter Name"
                                        value={param.name}
                                        onChange={(e) => handleParamNameChange(e.target.value, index, 'requiredParams')}
                                        required
                                    />
                                    <select
                                        value={param.type}
                                        onChange={(e) => handleParamTypeChange(e.target.value, index, 'requiredParams')}
                                    >
                                        <option value="int">Integer</option>
                                        <option value="string">String</option>
                                        <option value="yaml">YAML</option>
                                        <option value="json">JSON</option>
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveParameter(index, 'requiredParams')}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={() => handleAddParameter('requiredParams')}>
                                Add Required Param
                            </button>

                            <h3>Optional Parameters</h3>
                            {newVersionOptionalParams.map((param, index) => (
                                <div key={index} className="param-input">
                                    <input
                                        type="text"
                                        placeholder="Parameter Name"
                                        value={param.name}
                                        onChange={(e) => handleParamNameChange(e.target.value, index, 'optionalParams')}
                                    />
                                    <select
                                        value={param.type}
                                        onChange={(e) => handleParamTypeChange(e.target.value, index, 'optionalParams')}
                                    >
                                        <option value="int">Integer</option>
                                        <option value="string">String</option>
                                        <option value="yaml">YAML</option>
                                        <option value="json">JSON</option>
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveParameter(index, 'optionalParams')}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={() => handleAddParameter('optionalParams')}>
                                Add Optional Param
                            </button>

                            <div className="modal-buttons">
                                <button className="button submit-button" type="submit">Save Changes</button>
                                <button className="button cancel-button" type="button" onClick={closeEditVersionModal}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            <div id="confirmation-modal" className="confirmation-modal">
                <div className="modal-content">
                    <h2>Confirm Deletion</h2>
                    <p>Are you sure you want to delete this version?</p>
                    <div className="modal-buttons">
                        <button className="button confirm-button" onClick={() => deleteVersion(deleteVersionId)}>Yes, Delete</button>
                        <button className="button cancel-button" onClick={closeConfirmationModal}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VersionsPage;
