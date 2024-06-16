const express = require('express');
const router = express.Router();
const userController = require('../Controllers/userController');

// POST /users/:userId/apps/:appId/install - Install an app version for a user
router.post('/:userId/apps/:appId/install', userController.installAppVersion);

module.exports = router;
