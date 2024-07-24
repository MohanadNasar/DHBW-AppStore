const User = require('../Models/User');
const App = require('../Models/App');
const k8s = require('@kubernetes/client-node');
const yaml = require('js-yaml');

// Register a new user
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
    kc.loadFromCluster();
    const k8sApi = kc.makeApiClient(k8s.AppsV1Api);

    for (const manifest of manifests) {
        try {
            if (manifest.kind === 'Deployment') {
                // Ensure replicas is an integer
                if (typeof manifest.spec.replicas === 'string') {
                    manifest.spec.replicas = parseInt(manifest.spec.replicas, 10);
                }
                await k8sApi.createNamespacedDeployment('default', manifest);
            }
            // Handle other Kubernetes resources like Service, Ingress, etc.
            // You might need to add other API clients like k8s.CoreV1Api for Service
        } catch (error) {
            console.error(`Error applying manifest: ${manifest.kind} ${manifest.metadata.name}`, error.body);
        }
    }
};

// Function to replace placeholders in manifests with actual parameters
const replacePlaceholders = (manifest, parameters) => {
    const manifestStr = JSON.stringify(manifest);
    const replacedStr = manifestStr.replace(/{{\s*([^}]+)\s*}}/g, (match, p1) => parameters[p1.trim()] || match);
    return JSON.parse(replacedStr);
};

const installAppVersion = async (req, res) => {
    const { userId, appId } = req.params;
    const { version, parameters } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const app = await App.findById(appId);
        if (!app) {
            return res.status(404).json({ message: 'App not found' });
        }

        const alreadyInstalled = user.installedApps.some(installedApp => installedApp.appId.toString() === appId && installedApp.version === version);
        if (alreadyInstalled) {
            return res.status(400).json({ message: 'You have already installed this app version' });
        }

        const appVersion = app.versions.find(v => v.version === version);
        if (!appVersion) {
            return res.status(404).json({ message: 'App version not found' });
        }

        if (!appVersion.enabled) {
            return res.status(400).json({ message: 'This app version is disabled and cannot be installed.' });
        }

        // Validate required parameters
        for (let param of appVersion.requiredParams) {
            if (!(param.name in parameters)) {
                return res.status(400).json({ message: `Missing required parameter: ${param.name}` });
            }
        }

        // Create a unique deployment name
        const deploymentName = `${app.name}-${version.replace(/\./g, '-')}`.toLowerCase().replace(/[^a-z0-9-]/g, '');

        // Add the app version to the user's installed apps
        user.installedApps.push({ appId, version, parameters, deploymentName });
        await user.save();

        // Retrieve the component descriptor from the database
        const componentDescriptor = yaml.load(appVersion.componentDescriptor);

        // Inject parameters into manifests
        const manifests = componentDescriptor.spec.deployment.manifests.map(manifest => replacePlaceholders(manifest, parameters));

        // Apply Kubernetes manifests
        await applyK8sManifests(manifests);

        res.status(201).json(user);
    } catch (error) {
        console.error('Error installing app version:', error);
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

const uninstallAppVersion = async (req, res) => {
    const { userId, appId, version } = req.params; // Get version from the URL parameters

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const appToUninstall = user.installedApps.find(app => app.appId.toString() === appId && app.version === version);
        if (!appToUninstall) {
            return res.status(404).json({ message: 'App version not installed' });
        }

        // Delete the Kubernetes deployment
        const kc = new k8s.KubeConfig();
        kc.loadFromCluster();
        const k8sApi = kc.makeApiClient(k8s.AppsV1Api);

        console.log(`Deleting deployment: ${appToUninstall.deploymentName}`);
        try {
            await k8sApi.deleteNamespacedDeployment(appToUninstall.deploymentName, 'default');
            console.log(`Deployment deleted: ${appToUninstall.deploymentName}`);
        } catch (deleteError) {
            console.error(`Error deleting deployment: ${appToUninstall.deploymentName}`, deleteError.body);
        }

        // Remove the specific app version from the user's installed apps
        user.installedApps = user.installedApps.filter(app => !(app.appId.toString() === appId && app.version === version));
        await user.save();

        res.status(200).json({ message: 'App version uninstalled successfully' });
    } catch (error) {
        console.error('Error uninstalling app version:', error);
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    installAppVersion,
    listInstalledApps,
    uninstallAppVersion
};
