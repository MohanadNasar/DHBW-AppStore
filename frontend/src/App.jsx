import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';
import ManageApplications from './pages/ManageApplications';
import ManageAppStore from './pages/ManageAppStore';
import CreateApp from './pages/CreateApp';
import ViewApp from './pages/ViewApp';
import VersionsPage from './pages/VersionsPage';
import Register from './pages/Register';
import Login from './pages/Login';
import InstallAppPage from './pages/InstallAppPage';
import MyApps from './pages/MyApps';
import './App.css'; 
import './styles/tailwind.css';

const App = () => {
  return (
    <Router>
      <div>
        <NavBar />
        <Routes>
          <Route path="/" exact element={<HomePage />} />
          <Route path="/register" element={<Register/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/manage-applications" element={<ManageApplications />} />
          <Route path="/manage-appstore" element={<ManageAppStore />} />
          <Route path="/create-app" element={<CreateApp />} />
          <Route path="/view-apps" element={<ViewApp />} />
          <Route path="/apps/:appId/versions" element={<VersionsPage />} />
          <Route path="/manage-applications" element={<ManageApplications />} />
          <Route path="/install-app/:userId" element={<InstallAppPage />} />
          <Route path="/my-apps/:userId" element={<MyApps />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
