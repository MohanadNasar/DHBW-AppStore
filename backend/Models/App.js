//App.js Model
const mongoose = require('mongoose');

const ParameterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['int', 'string', 'yaml', 'json'], required: true },
    value: { type: mongoose.Schema.Types.Mixed },
});

const AppVersionSchema = new mongoose.Schema({
    version: { type: String, required: true },
    requiredParams: [ParameterSchema], // Required parameters for this version
    optionalParams: [ParameterSchema], // Optional parameters for this version
    enabled: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    componentDescriptor: { type: String } 
});


const AppSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: String,
    versions: [AppVersionSchema],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('App', AppSchema);
