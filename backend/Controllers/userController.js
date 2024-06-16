const User = require('../Models/User');

// Install an app version for a user
const installAppVersion = async (req, res) => {
    const { userId, appId } = req.params;
    const { version, parameters } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.installedApps.push({ appId, version, parameters });
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    installAppVersion
};
