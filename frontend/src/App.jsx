import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';
import ManageApplications from './pages/ManageApplications';
import ManageAppStore from './pages/ManageAppStore';
import './App.css'; // Import global CSS for App styles
import './index.css'; // Import global CSS for index styles
import './styles/tailwind.css'; // Import Tailwind CSS for global styles  

const App = () => {
  return (
    <Router>
      <div>
        <NavBar />
        <Routes>
          <Route path="/" exact element={<HomePage />} />
          <Route path="/manage-applications" element={<ManageApplications />} />
          <Route path="/manage-appstore" element={<ManageAppStore />} />
          {/* Add more routes as needed */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
