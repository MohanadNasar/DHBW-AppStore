const express = require('express');
const router = express.Router();
const appController = require('../Controllers/appController');

// POST /apps - Create a new app
router.post('/', appController.createApp);

// POST /apps/:appId/versions - Add a new version to an existing app
router.post('/:appId/versions', appController.addAppVersion);

module.exports = router;
