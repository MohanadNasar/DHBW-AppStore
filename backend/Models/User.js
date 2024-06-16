const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const InstalledAppSchema = new mongoose.Schema({
    appId: { type: mongoose.Schema.Types.ObjectId, ref: 'App' },
    version: { type: String, required: true },
    parameters: mongoose.Schema.Types.Mixed,
    installedAt: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    installedApps: [InstalledAppSchema],
    createdAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
