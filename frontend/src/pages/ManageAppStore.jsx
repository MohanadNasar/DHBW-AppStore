import React from 'react';
import { Link } from 'react-router-dom';

const ManageAppStore = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Manage App Store</h1>
        <div className="grid grid-cols-2 gap-8">
          <Link to="/create-app" className="text-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-12 px-4 rounded-lg">
            <img src="create_app_icon.png" alt="Create App Icon" className="mx-auto mb-4" />
            Create an App
          </Link>
          <Link to="/view-apps" className="text-center bg-green-500 hover:bg-green-700 text-white font-bold py-12 px-4 rounded-lg">
            <img src="view_apps_icon.png" alt="View Apps Icon" className="mx-auto mb-4" />
            View Apps
          </Link>
        </div>
      </div>
      <div className="mt-8">
        {/* Placeholder for Create App section */}
        <div className="bg-white shadow-md rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Create App</h2>
          <p className="text-gray-700">Here you can create a new app.</p>
          {/* Add forms and components for creating an app */}
        </div>

        {/* Placeholder for View Apps section */}
        <div className="bg-white shadow-md rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">View Apps</h2>
          <p className="text-gray-700">Here you can view and manage existing apps.</p>
          {/* Add list and actions for viewing apps */}
        </div>
      </div>
    </div>
  );
};

export default ManageAppStore;
