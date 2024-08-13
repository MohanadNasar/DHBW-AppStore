import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/HomePage.css';
import manageAppStore_icon from '../assets/manageAppstore.jpg';
import manageApplications_icon from '../assets/ManageApplications.jpg';
import { displaySuccessMessage } from '../utils/messages';

const API_URL = process.env.REACT_APP_API_URL || 'http://dhbw-appstore.com';

const HomePage = () => {
  const [error, setError] = useState('');

  useEffect(() => {
    const extractCodeFromUrl = () => {
      const urlParams = new URLSearchParams(window.location.hash.substring(1)); 
      const code = urlParams.get('code');
      return code;
    };
  
    const handleOAuthResponse = async (code) => {
      console.log('Handling OAuth response with code:', code);
      try {
        const { data } = await axios.post(`${API_URL}/auth/callback`, { code }, { withCredentials: true });
        const { token, user } = data;
        localStorage.setItem('token', token);
        localStorage.setItem('userInfo', JSON.stringify(user));
        localStorage.setItem('userId', user._id);
        displaySuccessMessage('Logged in successfully');
      } catch (error) {
        console.error('Error during OAuth response handling:', error.message, error.response?.data);
        setError('Authentication failed. Please try again.');
      }
    };
  
    const code = extractCodeFromUrl();
    if (code) {
      handleOAuthResponse(code);
    }
  }, []);
  
  

  return (
    <div className="homepage">
      <div className="welcome-section">
        <h1>Welcome to <span className='redText'>DH<span className='greyTextHero'>BW</span></span>-AppStore !!</h1>
        <p>Empowering You with Effortless Cloud Applications Management</p>
      </div>

      {error && <div className="error-message">{error}</div>}

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
          <p>Contact us at <a href="mailto:dennis.pfisterer@dhbw-mannheim.de">dennis.pfisterer@dhbw-mannheim.de</a></p>
          <p>&copy; 2024 DHBW-AppStore. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
