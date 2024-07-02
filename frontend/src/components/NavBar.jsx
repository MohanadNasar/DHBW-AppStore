import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/NavBar.css'; // Import CSS file for NavBar styles


const NavBar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track login status
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in by inspecting local storage or session state
    const userInfo = localStorage.getItem('userInfo');
    setIsLoggedIn(!!userInfo); // Set isLoggedIn based on whether userInfo exists

    // Event listener to update isLoggedIn dynamically
    const handleLoginEvent = () => {
      setIsLoggedIn(true);
    };

    window.addEventListener('login', handleLoginEvent);

    return () => {
      window.removeEventListener('login', handleLoginEvent);
    };
  }, []);

  const handleLogout = () => {
    // Clear user session information
    localStorage.removeItem('userId');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token');
    // Update state to reflect logged out status
    setIsLoggedIn(false);
    // Redirect to logout endpoint and then to login page
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navContainer">
        <div className="logo">
          <Link to="/" className="nav-link">
            <span className='redText'>DH<span className='greyText'>BW</span> </span> App Store
          </Link>
        </div>
        <ul className="nav-links">
          <li>
            <Link to="/" className="nav-link">Home</Link>
          </li>
          <li>
            <Link to="/manage-applications" className="nav-link">Manage Applications</Link>
          </li>
          <li>
            <Link to="/manage-appstore" className="nav-link">Manage AppStore</Link>
          </li>
          <div className="nav-auth">
            {isLoggedIn ? (
              <li>
                <button onClick={handleLogout} className="nav-button">Log Out</button>
              </li>
            ) : (
              <>
                <li>
                  <Link to="/login" className="nav-link">Log In</Link>
                </li>
                <li>
                  <Link to="/register" className="nav-link">Register</Link>
                </li>
              </>
            )}
          </div>
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;
