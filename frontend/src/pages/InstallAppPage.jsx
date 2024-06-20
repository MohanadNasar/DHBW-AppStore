import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/InstallAppPage.css'; // CSS file for styling

const InstallAppPage = ({ userId }) => {
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
    setModalOpen(true);
  };

  const installAppVersion = async () => {
    try {
      await axios.post(`http://localhost:8000/users/${userId}/apps/${selectedApp._id}`, {
        version: selectedVersion,
        parameters: parameters
      });
      // Optionally show a success message or update state to reflect installation
      console.log(`Version ${selectedVersion} of ${selectedApp.name} installed successfully!`);
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
        <div className="filters">
          <button className={installedFilter === 'all' ? 'active' : ''} onClick={() => handleFilterChange('all')}>All</button>
          <button className={installedFilter === 'installed' ? 'active' : ''} onClick={() => handleFilterChange('installed')}>Installed</button>
          <button className={installedFilter === 'notInstalled' ? 'active' : ''} onClick={() => handleFilterChange('notInstalled')}>Not Installed</button>
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

      {/* Modal for selecting app version and parameters */}
      {selectedApp && (
        <div className={`modal ${modalOpen ? 'open' : ''}`}>
          <div className="modal-content">
            <span className="close" onClick={closeModal}>&times;</span>
            <h2>Select Version and Parameters</h2>
            <form onSubmit={installAppVersion}>
              <div className="form-group">
                <label>Select Version:</label>
                <select value={selectedVersion} onChange={(e) => setSelectedVersion(e.target.value)}>
                  {selectedApp.versions.map(version => (
                    <option key={version.version} value={version.version}>{version.version}</option>
                  ))}
                </select>
              </div>
              {/* Example: Add input fields for parameters based on your app's requirements */}
              <div className="form-group">
                <label>Parameters:</label>
                <input
                  type="text"
                  placeholder="Parameter 1"
                  value={parameters.param1 || ''}
                  onChange={(e) => setParameters({ ...parameters, param1: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Parameter 2"
                  value={parameters.param2 || ''}
                  onChange={(e) => setParameters({ ...parameters, param2: e.target.value })}
                />
                {/* Add more input fields for additional parameters as needed */}
              </div>
              <button type="submit" className="install-button">Install</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstallAppPage;
