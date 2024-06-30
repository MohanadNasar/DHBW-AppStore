const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');

//Github Authentication
router.post('/callback', authController.githubAuthCallback);

module.exports = router;