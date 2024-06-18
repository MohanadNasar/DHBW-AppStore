import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/HomePage.css';
import manageAppStore_icon from '../assets/manageAppstore.jpg';
import manageApplications_icon from '../assets/manageApplications.png';

const HomePage = () => {
  return (
    <div className="homepage">
      <div className="welcome-section">
        <h1>Welcome to <span className='redText'>DHBW-AppStore</span></h1>
        <p>Creating & Installing Apps are much easier now!!</p>
      </div>
      <div className="content-section">
        <div className="link-container">
          <Link to="/manage-appstore">
            <div className="link-box">
              <img src={manageAppStore_icon} alt="Manage App Store" />
              <span>Manage App Store</span>
            </div>
          </Link>
          <Link to="/manage-applications">
            <div className="link-box">
              <img src={manageApplications_icon} alt="Manage Applications" />
              <span>Manage Applications</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
