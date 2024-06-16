import React from 'react';
import { Link } from 'react-router-dom';

const ManageAppPage = () => {
  return (
    <div className="min-h-screen flex justify-center items-center bg-black bg-opacity-90 backdrop-blur">
      <div className="text-center text-white p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-4">Manage your apps</h1>
        <div className="space-y-4">
          <Link to="/install-app" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-6 px-12 rounded-lg block">
            <img src="install_icon.png" alt="Install Icon" className="mx-auto mb-2" />
            Install an App
          </Link>
          <Link to="/view-apps" className="bg-green-500 hover:bg-green-700 text-white font-bold py-6 px-12 rounded-lg block">
            <img src="view_apps_icon.png" alt="View Apps Icon" className="mx-auto mb-2" />
            View My Apps
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ManageAppPage;
