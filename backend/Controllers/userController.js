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
    const coreV1Api = kc.makeApiClient(k8s.CoreV1Api);
    const networkingV1Api = kc.makeApiClient(k8s.NetworkingV1Api);

    for (const manifest of manifests) {
        try {
            switch (manifest.kind) {
                case 'Deployment':
                    if (typeof manifest.spec.replicas === 'string') {
                        manifest.spec.replicas = parseInt(manifest.spec.replicas, 10);
                    }
                    await k8sApi.createNamespacedDeployment('default', manifest);
                    break;
                case 'Service':
                    await coreV1Api.createNamespacedService('default', manifest);
                    break;
                case 'Ingress':
                    await networkingV1Api.createNamespacedIngress('default', manifest);
                    break;
                default:
                    console.error(`Unsupported manifest kind: ${manifest.kind}`);
            }
        } catch (error) {
            console.error(`Error applying manifest: ${manifest.kind} ${manifest.metadata.name}`, error.body);
        }
    }
};

// Function to replace placeholders in the component descriptor and manifests with actual parameters
const replacePlaceholders = (obj, parameters) => {
    if (typeof obj === 'string') {
        return obj.replace(/{{\s*([^}]+)\s*}}/g, (match, p1) => parameters[p1.trim()] || match);
    } else if (Array.isArray(obj)) {
        return obj.map(item => replacePlaceholders(item, parameters));
    } else if (typeof obj === 'object' && obj !== null) {
        const result = {};
        for (const key of Object.keys(obj)) {
            result[key] = replacePlaceholders(obj[key], parameters);
        }
        return result;
    } else {
        return obj;
    }
};

const installAppVersion = async (req, res) => {
    const { userId, appId } = req.params;    const { version, parameters, gitRepo } = req.body;  // Adding gitRepo to the request body

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const app = await App.findById(appId);
        if (!app) {
            return res.status(404).json({ message: 'App not found' });
        }

        const alreadyInstalled = user.installedApps.some(
            installedApp => installedApp.appId.toString() === appId && installedApp.version === version);
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
        const deploymentName = `${app.name}-${version.replace(/\./g, '-')}`.
        toLowerCase().replace(/[^a-z0-9-]/g, '');

        // Add the app version to the user's installed apps
        user.installedApps.push({ appId, version, parameters, deploymentName });
        await user.save();

        // Retrieve and update the component descriptor with provided parameters
        let componentDescriptor = yaml.load(appVersion.componentDescriptor);
        componentDescriptor = replacePlaceholders(componentDescriptor, parameters);
        const manifests = componentDescriptor.spec.deployment.manifests;

        // Add Service manifest
        const serviceManifest = {
            apiVersion: 'v1',
            kind: 'Service',
            metadata: {
                name: deploymentName,
                labels: {
                    app: deploymentName
                }
            },
            spec: {
                selector: {
                    app: deploymentName
                },
                ports: [
                    {
                        protocol: 'TCP',
                        port: 80,
                        targetPort: 80
                    }
                ]
            }
        };
        manifests.push(serviceManifest);

        // Add Ingress manifest
        const ingressManifest = {
            apiVersion: 'networking.k8s.io/v1',
            kind: 'Ingress',
            metadata: {
                name: deploymentName,
                labels: {
                    app: deploymentName
                }
            },
            spec: {
                rules: [
                    {
                        host: `${app.name.toLowerCase().replace(/[^a-z0-9-]/g, '')}.dhbw-appstore.com`,
                        http: {
                            paths: [
                                {
                                    path: '/',
                                    pathType: 'Prefix',
                                    backend: {
                                        service: {
                                            name: deploymentName,
                                            port: {
                                                number: 80
                                            }
                                        }
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        };
        manifests.push(ingressManifest);

        // Apply Kubernetes manifests
        await applyK8sManifests(manifests);

        // Configure FluxCD for the installed application
        //await configureFluxCD(gitRepo, deploymentName);

        res.status(201).json(user);
    } catch (error) {
        console.error('Error installing app version:', error);
        res.status(400).json({ error: error.message });
    }
};

const configureFluxCD = async (gitRepo, deploymentName) => {
    const fluxConfig = `
apiVersion: source.toolkit.fluxcd.io/v1
kind: GitRepository
metadata:
  name: ${deploymentName}-repo
  namespace: flux-system
spec:
  interval: 1m0s
  url: ${gitRepo}
  ref:
    branch: main
  secretRef:
    name: flux-system
  url: ssh://git@github.com/MohanadNasar/DHBW-AppStore
---
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: ${deploymentName}-kustomization
  namespace: flux-system
spec:
  interval: 10m0s
  
  path: ./${deploymentName}
  prune: true
  sourceRef:
    kind: GitRepository
    name: ${deploymentName}-repo
    namespace: flux-system
`;

    // Write the FluxCD configuration to a file
    fs.writeFileSync(`/tmp/${deploymentName}-flux.yaml`, fluxConfig);

    // Apply the FluxCD configuration to the Kubernetes cluster
    const { exec } = require('child_process');
    exec(`kubectl apply -f /tmp/${deploymentName}-flux.yaml`, (err, stdout, stderr) => {
        if (err) {
            console.error(`Error applying FluxCD configuration: ${err.message}`);
            return;
        }
        console.log(`FluxCD configuration applied: ${stdout}`);
    });
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

        // Delete the Kubernetes deployment, service, and ingress
        const kc = new k8s.KubeConfig();
        kc.loadFromCluster();
        const k8sApi = kc.makeApiClient(k8s.AppsV1Api);
        const coreV1Api = kc.makeApiClient(k8s.CoreV1Api);
        const networkingV1Api = kc.makeApiClient(k8s.NetworkingV1Api);

        console.log(`Deleting deployment: ${appToUninstall.deploymentName}`);
        try {
            await k8sApi.deleteNamespacedDeployment(appToUninstall.deploymentName, 'default');
            console.log(`Deployment deleted: ${appToUninstall.deploymentName}`);
        } catch (deleteError) {
            console.error(`Error deleting deployment: ${appToUninstall.deploymentName}`, deleteError.body);
        }

        console.log(`Deleting service: ${appToUninstall.deploymentName}`);
        try {
            await coreV1Api.deleteNamespacedService(appToUninstall.deploymentName, 'default');
            console.log(`Service deleted: ${appToUninstall.deploymentName}`);
        } catch (deleteError) {
            console.error(`Error deleting service: ${appToUninstall.deploymentName}`, deleteError.body);
        }

        console.log(`Deleting ingress: ${appToUninstall.deploymentName}`);
        try {
            await networkingV1Api.deleteNamespacedIngress(appToUninstall.deploymentName, 'default');
            console.log(`Ingress deleted: ${appToUninstall.deploymentName}`);
        } catch (deleteError) {
            console.error(`Error deleting ingress: ${appToUninstall.deploymentName}`, deleteError.body);
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
