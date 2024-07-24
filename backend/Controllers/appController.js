const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const App = require('../Models/App');
const User = require('../Models/User');
const k8s = require('@kubernetes/client-node');

const getApps = async (req, res) => {
    try {
        const apps = await App.find();
        res.status(200).json(apps);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const generateComponentDescriptor = (app, version, requiredParams, optionalParams, imagePath) => {
    const appNameLowerCase = app.name.toLowerCase().replace(/[^a-z0-9-]/g, '');
    const replicasParam = requiredParams.find(param => param.name === 'replicas');

    return yaml.dump({
        apiVersion: 'ocm.software/v1',
        kind: 'ComponentDescriptor',
        metadata: {
            name: appNameLowerCase,
            version: version,
            provider: app.provider || 'unknown'
        },
        spec: {
            resources: [
                {
                    name: 'app-image',
                    type: 'ociImage',
                    relation: 'external',
                    access: {
                        type: 'ociRegistry',
                        image: imagePath || `docker.io/${appNameLowerCase}:${version}`
                    }
                }
            ],
            configuration: {
                required: requiredParams,
                optional: optionalParams
            },
            deployment: {
                manifests: [
                    {
                        apiVersion: 'apps/v1',
                        kind: 'Deployment',
                        metadata: {
                            name: `${appNameLowerCase}-${version.replace(/\./g, '-')}`,
                            labels: {
                                app: appNameLowerCase,
                                version: version
                            }
                        },
                        spec: {
                            replicas: replicasParam ? replicasParam.value : 1,
                            selector: {
                                matchLabels: {
                                    app: appNameLowerCase
                                }
                            },
                            template: {
                                metadata: {
                                    labels: {
                                        app: appNameLowerCase
                                    }
                                },
                                spec: {
                                    containers: [
                                        {
                                            name: appNameLowerCase,
                                            image: imagePath || `docker.io/${appNameLowerCase}:${version}`,
                                            ports: [
                                                {
                                                    containerPort: optionalParams.find(param => param.name === 'port')?.value || 80
                                                }
                                            ],
                                            env: optionalParams.find(param => param.name === 'env')?.value || []
                                        }
                                    ]
                                }
                            }
                        }
                    }
                ]
            }
        }
    });
};





// Create a new app with an initial version
const createApp = async (req, res) => {
    const { name, description, provider } = req.body;
    try {
        // Check if the app name already exists
        const existingApp = await App.findOne({ name });
        if (existingApp) {
            return res.status(400).json({ message: 'App already exists' });
        }

        const newApp = new App({
            name,
            description,
            provider,
            versions: [
                {
                    version: '1.0.0',
                    requiredParams: [],
                    optionalParams: [],
                    enabled: true,
                    createdAt: new Date()
                }
            ]
        });

        const descriptor = generateComponentDescriptor(newApp, '1.0.0', [], [], '');

        newApp.versions[0].componentDescriptor = descriptor;

        await newApp.save();

        res.status(201).json(newApp);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


// Update addAppVersion to save the descriptor in the database
const addAppVersion = async (req, res) => {
    const { appId } = req.params;
    const { version, requiredParams, optionalParams, imagePath } = req.body;
    try {
        const app = await App.findById(appId);
        if (!app) {
            return res.status(404).json({ message: 'App not found' });
        }

        // Check if the version already exists
        const existingVersion = app.versions.find(v => v.version === version);
        if (existingVersion) {
            return res.status(400).json({ message: 'Version already exists' });
        }

        const descriptor = generateComponentDescriptor(app, version, requiredParams, optionalParams, imagePath);

        app.versions.push({
            version,
            requiredParams,
            optionalParams,
            enabled: true,
            createdAt: new Date(),
            componentDescriptor: descriptor // Store descriptor in the database
        });
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
        res.status(200).json({
            appName: app.name, // Return the app name along with the versions
            versions: app.versions
        });
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

        // Generate and save the updated component descriptor
        const descriptor = generateComponentDescriptor(app, appVersion.version, appVersion.requiredParams, appVersion.optionalParams);
        appVersion.componentDescriptor = descriptor;

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

const deleteK8sDeployment = async (deploymentName) => {
    const kc = new k8s.KubeConfig();
    kc.loadFromCluster();
    const k8sApi = kc.makeApiClient(k8s.AppsV1Api);

    try {
        await k8sApi.deleteNamespacedDeployment(deploymentName, 'default');
    } catch (error) {
        console.error(`Error deleting deployment: ${deploymentName}`, error.body);
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

        const versionToDelete = app.versions.id(versionId);
        if (!versionToDelete) {
            return res.status(404).json({ message: 'App version not found' });
        }

        const version = versionToDelete.version;

        // Find users with this app version installed
        const users = await User.find({ "installedApps.appId": appId, "installedApps.version": version });

        // Delete the corresponding Kubernetes deployments
        for (const user of users) {
            const appToUninstall = user.installedApps.find(app => app.appId.toString() === appId && app.version === version);
            if (appToUninstall) {
                await deleteK8sDeployment(appToUninstall.deploymentName);
                user.installedApps = user.installedApps.filter(app => !(app.appId.toString() === appId && app.version === version));
                await user.save();
            }
        }

        // Delete the app version
        versionToDelete.deleteOne();
        await app.save();

        res.status(200).json({ message: 'App version deleted successfully' });
    } catch (error) {
        console.error('Error deleting app version:', error);
        res.status(400).json({ error: error.message });
    }
};

// Delete an app
const deleteApp = async (req, res) => {
    const { appId } = req.params;
    try {
        const app = await App.findById(appId);
        if (!app) {
            return res.status(404).json({ message: 'App not found' });
        }

        // Find users with any version of this app installed
        const users = await User.find({ "installedApps.appId": appId });

        // Delete the corresponding Kubernetes deployments
        for (const user of users) {
            const appsToUninstall = user.installedApps.filter(app => app.appId.toString() === appId);
            for (const appToUninstall of appsToUninstall) {
                await deleteK8sDeployment(appToUninstall.deploymentName);
            }
            user.installedApps = user.installedApps.filter(app => app.appId.toString() !== appId);
            await user.save();
        }

        // Delete the app
        await app.deleteOne();

        res.status(200).json({ message: 'App deleted successfully' });
    } catch (error) {
        console.error('Error deleting app:', error);
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    getApps,
    createApp,
    addAppVersion,
    getAppVersions,
    editAppVersion,
    toggleAppVersionStatus,
    deleteAppVersion,
    deleteApp
};
