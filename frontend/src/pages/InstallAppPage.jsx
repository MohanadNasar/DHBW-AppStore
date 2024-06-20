import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { displaySuccessMessage } from '../utils/messages';
import { useParams } from 'react-router-dom';
import '../styles/InstallAppPage.css'; // CSS file for styling



const InstallAppPage = () => {
  const { userId } = useParams();   
  const [apps, setApps] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [installedFilter, setInstalledFilter] = useState('all'); // 'all', 'installed', 'notInstalled'
  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState('');
  const [parameters, setParameters] = useState({});
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const response = await axios.get('http://localhost:8000/apps');
        setApps(response.data);
      } catch (error) {
        console.error('Error fetching apps:', error);
      }
      console.log('userId:', userId);
    };
    fetchApps();
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (filter) => {
    setInstalledFilter(filter);
  };

  const handleInstallClick = (app) => {
    setSelectedApp(app);
    setSelectedVersion(app.versions[0].version); // Default to the first version
    setParameters({});
    setModalOpen(true);
  };

  const installAppVersion = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:8000/users/${userId}/apps/${selectedApp._id}`, {
        version: selectedVersion,
        parameters: parameters
      });
      console.log(`Version ${selectedVersion} of ${selectedApp.name} installed successfully!`);
      displaySuccessMessage(`Version ${selectedVersion} of ${selectedApp.name} installed successfully!`);
      setModalOpen(false);
    } catch (error) {
      console.error('Error installing app version:', error);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const getFilteredApps = () => {
    let filteredApps = apps.filter(app =>
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.description && app.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    switch (installedFilter) {
      case 'installed':
        filteredApps = filteredApps.filter(app => app.isInstalled);
        break;
      case 'notInstalled':
        filteredApps = filteredApps.filter(app => !app.isInstalled);
        break;
      default:
        break;
    }

    return filteredApps;
  };

  const handleVersionChange = (e) => {
    setSelectedVersion(e.target.value);
    setParameters({});
  };

  const handleParameterChange = (paramName, value) => {
    setParameters({ ...parameters, [paramName]: value });
  };

  return (
    <div className="install-app-page">
      <h1>Install an App</h1>
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search by name or description..."
          value={searchTerm}
          onChange={handleSearch}
        />
        <div className='filter-text'>Filter by:</div>
        <div className="filters">
          <button className={`filter-button ${installedFilter === 'all' ? 'active' : ''}`} onClick={() => handleFilterChange('all')}>All</button>
          <button className={`filter-button ${installedFilter === 'installed' ? 'active' : ''}`} onClick={() => handleFilterChange('installed')}>Installed</button>
          <button className={`filter-button ${installedFilter === 'notInstalled' ? 'active' : ''}`} onClick={() => handleFilterChange('notInstalled')}>Not Installed</button>
        </div>
      </div>
      <div className="app-list">
        {getFilteredApps().map(app => (
          <div key={app._id} className="app-card">
            <h3>{app.name}</h3>
            <p>{app.description}</p>
            <p>No of Versions: {app.versions.length}</p>
            {app.isInstalled ? (
              <button className="install-button disabled">Installed</button>
            ) : (
              <button className="install-button" onClick={() => handleInstallClick(app)}>Install</button>
            )}
          </div>
        ))}
      </div>

      {selectedApp && (
        <div className={`modal ${modalOpen ? 'open' : ''}`}>
          <div className="modal-content">
            <span className="close" onClick={closeModal}>&times;</span>
            <h2>Select Version and Parameters</h2>
            <form onSubmit={installAppVersion}>
              <div className="form-group">
                <label>Select Version:</label>
                <select value={selectedVersion} onChange={handleVersionChange}>
                  {selectedApp.versions.map(version => (
                    <option key={version.version} value={version.version}>{version.version}</option>
                  ))}
                </select>
              </div>
              {selectedApp.versions.find(v => v.version === selectedVersion).requiredParams.map(param => (
                <div className="form-group" key={param.name}>
                  <label>{param.name} ({param.type}):</label>
                  <input
                    type="text"
                    value={parameters[param.name] || ''}
                    onChange={(e) => handleParameterChange(param.name, e.target.value)}
                    required
                  />
                </div>
              ))}
              {selectedApp.versions.find(v => v.version === selectedVersion).optionalParams.map(param => (
                <div className="form-group" key={param.name}>
                  <label>{param.name} ({param.type}):</label>
                  <input
                    type="text"
                    value={parameters[param.name] || ''}
                    onChange={(e) => handleParameterChange(param.name, e.target.value)}
                  />
                </div>
              ))}
              <button type="submit" className="install-button">Install</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstallAppPage;
