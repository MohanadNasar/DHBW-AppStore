import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/NavBar.css'; // Import CSS file for NavBar styles

const NavBar = () => {
  const isLoggedIn = false; // Replace this with actual login state
  const navigate = useNavigate();

  const handleLogout = () => {
    // Add your logout logic here
    console.log('User logged out');
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
          {/* Add more navigation links as needed */}
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
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;
