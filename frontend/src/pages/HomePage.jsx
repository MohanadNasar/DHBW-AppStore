import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/HomePage.css';

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
              <img src="../assets/manageAppstore.jpg" alt="Manage App Store" />
              <span>Manage App Store</span>
            </div>
          </Link>
          <Link to="/manage-applications">
            <div className="link-box">
              <img src="../assets/manageApplications.png" alt="Manage Applications" />
              <span>Manage Applications</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
