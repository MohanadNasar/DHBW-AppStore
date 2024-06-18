import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/NavBar.css'; // Import CSS file for NavBar styles

const NavBar = () => {
  return (
    <nav className="navbar">
      <div className="navContainer">
        <div className="logo">
          <Link to="/" className="nav-link">
            DHBW App Store
          </Link>
        </div>
        <ul className="nav-links">
          <li>
            <Link to="/" className="nav-link">
              Home
            </Link>
          </li>
          <li>
            <Link to="/manage-applications" className="nav-link">
              Manage Applications
            </Link>
          </li>
          <li>
            <Link to="/manage-appstore" className="nav-link">
              Manage AppStore
            </Link>
          </li>
          {/* Add more navigation links as needed */}
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;
