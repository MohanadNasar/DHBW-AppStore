const fs = require('fs');
const path = require('path');
const App = require('../Models/App');

const getApps = async (req, res) => {
    try {
        const apps = await App.find();
        res.status(200).json(apps);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Function to generate component descriptor
const generateComponentDescriptor = (app, version, requiredParams, optionalParams, imagePath) => {
    return yaml.dump({
        apiVersion: 'ocm.software/v1',
        kind: 'ComponentDescriptor',
        metadata: {
            name: app.name,
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
                        image: imagePath || `docker.io/${app.name}:${version}`
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
                            name: `${app.name}-${version}`,
                            labels: {
                                app: app.name,
                                version: version
                            }
                        },
                        spec: {
                            replicas: requiredParams.find(param => param.name === 'replicas')?.value || 1,
                            selector: {
                                matchLabels: {
                                    app: app.name
                                }
                            },
                            template: {
                                metadata: {
                                    labels: {
                                        app: app.name
                                    }
                                },
                                spec: {
                                    containers: [
                                        {
                                            name: app.name,
                                            image: imagePath || `docker.io/${app.name}:${version}`,
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

        const descriptor = generateComponentDescriptor(newApp, '1.0.0', [], [], '');


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
                    createdAt: new Date(),
                    componentDescriptor: descriptor
                }
            ]
        });
        await newApp.save();

        // Generate and save the initial component descriptor

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
        await app.save();

        // Generate and save the updated component descriptor
        const descriptor = generateComponentDescriptor(app, appVersion.version, appVersion.requiredParams, appVersion.optionalParams);
        await saveComponentDescriptor(app, appVersion.version, descriptor);

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
    getApps,
    createApp,
    addAppVersion,
    getAppVersions,
    editAppVersion,
    toggleAppVersionStatus,
    deleteAppVersion,
    deleteApp
};
