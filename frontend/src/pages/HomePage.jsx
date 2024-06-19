import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/HomePage.css';
import manageAppStore_icon from '../assets/manageAppstore.jpg';
import manageApplications_icon from '../assets/ManageApplications.jpg';

const HomePage = () => {
  return (
    <div className="homepage">
      <div className="welcome-section">
        <h1>Welcome to <span className='redText'>DH<span className='greyTextHero'>BW</span></span>-AppStore</h1>
        <p>Empowering You with Effortless Cloud Application Management</p>
      </div>

      <section className="about-section">
        <div className="about-content">
          <h2>About Us</h2>
          <p>
            Simplifying cloud application management: Our goal is to make it easy for anyone to deploy and manage applications in the cloud, even without technical expertise. Whether you're a beginner or an expert, our platform offers a user-friendly interface to install and manage applications effortlessly.
          </p>
        </div>
      </section>

      <section className="services-section">
        <h2>Services</h2>
        <div className="servicesContent">
          <div className="serviceBox">
            <Link to="/manage-appstore" className='link'>
              <img src={manageAppStore_icon} alt="Manage App Store" className='icon' />
              <div className='text'>Manage App Store</div>
            </Link>
          </div>
          <div className="serviceBox">
            <Link to="/manage-applications" className='link'>
              <img src={manageApplications_icon} alt="Manage Applications" className='icon'/>
              <div className='text'>Manage Applications</div>  
            </Link>
          </div>  
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2024 DHBW-AppStore. All rights reserved.</p>
          <p>Contact us at <a href="mailto:dennis.pfisterer@dhbw-mannheim.de">dennis.pfisterer@dhbw-mannheim.de</a></p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
