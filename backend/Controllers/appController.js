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

module.exports = {
    createApp,
    addAppVersion
};
