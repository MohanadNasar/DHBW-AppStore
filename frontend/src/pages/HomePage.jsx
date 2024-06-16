import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/tailwind.css';
import manageAppstoreImage from '../assets/manageAppstore.jpg';
import manageApplicationsImage from '../assets/manageApplications.png';

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <div className="flex flex-col items-center justify-start pt-16 w-full">
        <h1 className="text-5xl font-bold text-red-600 mb-4">Welcome to DHBW-AppStore</h1>
        <p className="text-lg text-gray-800 mb-12">Creating & Installing Apps are much easier now!!</p>
        
        <div className="flex space-x-8 mb-12">
          <Link
            to="/manage-appstore"
            className="group w-48 h-48 bg-gray-900 rounded-lg flex flex-col items-center justify-center p-4 shadow-lg transition-transform duration-300 hover:scale-105"
          >
            <img
              src={manageAppstoreImage}
              alt="Manage App Store"
              className="w-24 h-24 object-cover rounded-md mb-2"
            />
            <div className="text-white text-sm font-semibold mt-2">
              Manage App Store
            </div>
          </Link>
          <Link
            to="/manage-applications"
            className="group w-48 h-48 bg-gray-900 rounded-lg flex flex-col items-center justify-center p-4 shadow-lg transition-transform duration-300 hover:scale-105"
          >
            <img
              src={manageApplicationsImage}
              alt="Manage Applications"
              className="w-24 h-24 object-cover rounded-md mb-2"
            />
            <div className="text-white text-sm font-semibold mt-2">
              Manage Applications
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
