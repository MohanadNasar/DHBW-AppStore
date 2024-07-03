import React from 'react';
import { Link } from 'react-router-dom';
import installAppIcon from '../assets/install_app.jpg'; // Update with your image path
import myAppsIcon from '../assets/myApps.jpg'; // Update with your image path


const ManageApplications = () => {

  const userId = localStorage.getItem('userId');

  return (
    <div className="container">
      <h1 className="title">Manage Applications</h1>
      <div className="content">
        <div className="box">
          <Link to={`/install-app/${userId}`} className="link">
            <img src={installAppIcon} alt="Install App Icon" className="icon" />
            <div className="text">Install App</div>
          </Link>
        </div>
        <div className="box">
          <Link to={`/my-apps/${userId}`} className="link">
            <img src={myAppsIcon} alt="My Apps Icon" className="icon" />
            <div className="text">My Apps</div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ManageApplications;
