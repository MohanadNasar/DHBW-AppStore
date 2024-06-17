const App = require('../Models/App');

// Create a new app
const createApp = async (req, res) => {
    const { name, description, versions } = req.body;
    try {
        const newApp = new App({ name, description, versions });
        await newApp.save();
        res.status(201).json(newApp);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Add a new app version to an existing app
const addAppVersion = async (req, res) => {
    const { appId } = req.params;
    const { version, requiredParams, optionalParams } = req.body;
    try {
        const app = await App.findById(appId);
        console.log(app)
        if (!app) {
            return res.status(404).json({ message: 'App not found' });
        }
        app.versions.push({ version, requiredParams, optionalParams });
        await app.save();
        res.status(201).json(app);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all app versions of an app
const getAppVersions = async (req, res) => {
    const { appId } = req.params;
    try {
        const app = await App.findById(appId);
        if (!app) {
            return res.status(404).json({ message: 'App not found' });
        }
        res.status(200).json(app.versions);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Edit an app version
const editAppVersion = async (req, res) => {
    const { appId, versionId } = req.params;
    const { version, requiredParams, optionalParams } = req.body;
    try {
        const app = await App.findById(appId);
        if (!app) {
            return res.status(404).json({ message: 'App not found' });
        }
        const appVersion = app.versions.id(versionId);
        if (!appVersion) {
            return res.status(404).json({ message: 'App version not found' });
        }
        appVersion.version = version || appVersion.version;
        appVersion.requiredParams = requiredParams || appVersion.requiredParams;
        appVersion.optionalParams = optionalParams || appVersion.optionalParams;
        await app.save();
        res.status(200).json(appVersion);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Enable / Disable an app version
const toggleAppVersionStatus = async (req, res) => {
    const { appId, versionId } = req.params;
    try {
        const app = await App.findById(appId);
        if (!app) {
            return res.status(404).json({ message: 'App not found' });
        }
        const appVersion = app.versions.id(versionId);
        if (!appVersion) {
            return res.status(404).json({ message: 'App version not found' });
        }
        appVersion.enabled = !appVersion.enabled;
        await app.save();
        res.status(200).json(appVersion);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete an app version
const deleteAppVersion = async (req, res) => {
    const { appId, versionId } = req.params;
    try {
        const app = await App.findById(appId);
        if (!app) {
            return res.status(404).json({ message: 'App not found' });
        }
        app.versions.id(versionId).deleteOne();
        await app.save();
        res.status(200).json({ message: 'App version deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete an app
const deleteApp = async (req, res) => {
    const { appId } = req.params;
    try {
        await App.findByIdAndDelete(appId);
        res.status(200).json({ message: 'App deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    createApp,
    addAppVersion,
    getAppVersions,
    editAppVersion,
    toggleAppVersionStatus,
    deleteAppVersion,
    deleteApp
};