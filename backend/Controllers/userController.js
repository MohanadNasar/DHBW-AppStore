//userController.js
const User = require('../Models/User');
const App = require('../Models/App');
const k8s = require('@kubernetes/client-node');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');


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
            return res.status(401).json({ error: 'This Username does not exist' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Password is wrong!' });
        }

        const token = user.generateAuthToken();
        res.status(200).json({ user: { _id: user._id, username: user.username }, token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


// Function to apply Kubernetes manifests
const applyK8sManifests = async (manifests) => {
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();
    const k8sApi = kc.makeApiClient(k8s.AppsV1Api);

    for (const manifest of manifests) {
        if (manifest.kind === 'Deployment') {
            await k8sApi.createNamespacedDeployment('default', manifest);
        }
        // Handle other Kubernetes resources like Service, Ingress, etc.
        // You might need to add other API clients like k8s.CoreV1Api for Service
    }
};

// Function to replace placeholders in manifests with actual parameters
const replacePlaceholders = (manifest, parameters) => {
    const manifestStr = JSON.stringify(manifest);
    const replacedStr = manifestStr.replace(/{{\s*([^}]+)\s*}}/g, (match, p1) => parameters[p1.trim()] || match);
    return JSON.parse(replacedStr);
};

// Modify the installAppVersion function to apply Kubernetes manifests
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

        // Check if the app version is already installed for the user
        const alreadyInstalled = user.installedApps.some(installedApp => installedApp.appId.toString() === appId && installedApp.version === version);
        if (alreadyInstalled) {
            return res.status(400).json({ message: 'You have already Installed this app version' });
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
        }

        // Add the app version to the user's installed apps
        user.installedApps.push({ appId, version, parameters });
        await user.save();

        // Load the component descriptor and extract manifests
        const descriptorPath = path.join(__dirname, `../descriptors/${app.name}/${version}/component-descriptor.yaml`);
        const descriptor = fs.readFileSync(descriptorPath, 'utf8');
        const componentDescriptor = yaml.load(descriptor);

        // Inject parameters into manifests
        const manifests = componentDescriptor.spec.deployment.manifests.map(manifest => replacePlaceholders(manifest, parameters));

        // Apply Kubernetes manifests
        await applyK8sManifests(manifests);

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
