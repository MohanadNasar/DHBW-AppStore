import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/ManageAppStore.css';
import createAppIcon from '../assets/create_app.jpeg';
import viewAppsIcon from '../assets/view_apps.jpg';

const ManageAppStore = () => {
  return (
    <div className="container">
      <h1 className="title">Manage App Store</h1>
      <div className="content">
        <div className="box">
          <Link to="/create-app" className="link">
            <img src={createAppIcon} alt="Create App Icon" className="icon" />
            <div className="text">Create an App</div>
          </Link>
        </div>
        <div className="box">
          <Link to="/view-apps" className="link">
            <img src={viewAppsIcon} alt="View Apps Icon" className="icon" />
            <div className="text">View Apps</div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ManageAppStore;
