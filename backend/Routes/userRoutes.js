//userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../Controllers/userController');

// Register a new user
router.post('/', userController.registerUser);

// Login as a user
router.post('/login', userController.loginUser);

// Install an app version for a user
router.post('/:userId/apps/:appId', userController.installAppVersion);

// List installed apps and their versions
router.get('/:userId/apps', userController.listInstalledApps);

// Uninstall an app
router.delete('/:userId/apps/:appId', userController.uninstallAppVersion);



module.exports = router;
