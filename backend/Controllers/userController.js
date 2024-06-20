const User = require('../Models/User');
const App = require('../Models/App');

//Register a new user
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const user = new User({ username, email, password });
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Login as a user
const loginUser = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = user.generateAuthToken();
        res.status(200).json({ user: { _id: user._id, username: user.username }, token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


// Install a specific version of an app
const installAppVersion = async (req, res) => {
    const { userId, appId } = req.params;
    const { version, parameters } = req.body;

    try {
        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the app
        const app = await App.findById(appId);
        if (!app) {
            return res.status(404).json({ message: 'App not found' });
        }

        // Find the specific version of the app
        const appVersion = app.versions.find(v => v.version === version);
        if (!appVersion) {
            return res.status(404).json({ message: 'App version not found' });
        }

        // Check if the version is enabled
        if (!appVersion.enabled) {
            return res.status(400).json({ message: 'This app version is disabled and cannot be installed.' });
        }

        // Validate required parameters
        for (let param of appVersion.requiredParams) {
            if (!(param.name in parameters)) {
                return res.status(400).json({ message: `Missing required parameter: ${param.name}` });
            }
            if (param.value !== parameters[param.value]) {
                return res.status(400).json({ message: `Invalid value for parameter: ${param.name}` });
            }
        }

        // Validate optional parameters (optional parameters can be omitted)
        for (let param of appVersion.optionalParams) {
            if (param.name in parameters && param.value !== parameters[param.value]) {
                return res.status(400).json({ message: `Invalid value for optional parameter: ${param.name}` });
            }

        }

        // Add the app version to the user's installed apps
        user.installedApps.push({ appId, version, parameters });
        await user.save();

        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};



// List installed apps and their versions
const listInstalledApps = async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findById(userId).populate('installedApps.appId', 'name');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user.installedApps);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Uninstall an app
const uninstallApp = async (req, res) => {
    const { userId, appId } = req.params;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.installedApps = user.installedApps.filter(app => app.appId.toString() !== appId);
        await user.save();
        res.status(200).json({ message: 'App uninstalled successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    installAppVersion,
    listInstalledApps,
    uninstallApp
};
