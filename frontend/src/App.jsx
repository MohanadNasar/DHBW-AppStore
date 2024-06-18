import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';
import ManageApplications from './pages/ManageApplications';
import ManageAppStore from './pages/ManageAppStore';
import CreateApp from './pages/CreateApp';
import './App.css'; 
import './styles/tailwind.css';

const App = () => {
  return (
    <Router>
      <div>
        <NavBar />
        <Routes>
          <Route path="/" exact element={<HomePage />} />
          <Route path="/manage-applications" element={<ManageApplications />} />
          <Route path="/manage-appstore" element={<ManageAppStore />} />
          <Route path="/create-app" element={<CreateApp />} />
          {/* Add more routes as needed */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
