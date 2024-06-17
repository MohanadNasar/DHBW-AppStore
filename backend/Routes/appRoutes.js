const express = require('express');
const router = express.Router();
const appController = require('../Controllers/appController');

// Create a new app
router.post('/', appController.createApp);

// Add a new app version to an existing app
router.post('/:appId/versions', appController.addAppVersion);

// Get all app versions of an app
router.get('/:appId/versions', appController.getAppVersions);

// Edit an app version
router.put('/:appId/versions/:versionId', appController.editAppVersion);

// Enable / Disable an app version
router.patch('/:appId/versions/:versionId/toggle', appController.toggleAppVersionStatus);

// Delete an app version
router.delete('/:appId/versions/:versionId', appController.deleteAppVersion);

// Delete an app
router.delete('/:appId', appController.deleteApp);

module.exports = router;
