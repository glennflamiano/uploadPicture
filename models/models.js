var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//schema if asset.warehouse has no reference
var assetSchema = new mongoose.Schema({
    tag: {type: String, required: true, index: {unique: true}},
    name: {type: String, required: true},
    warehouse: {type: String, required: true},
    status: {type: String, required: true},
});

//schema if devices has no reference
var deviceSchema = new mongoose.Schema({
    deviceId: {type: String, required: true, index: {unique: true}},
    deviceName: {type: String, required: true},
    location: {type: String, required: true},
});

mongoose.model('Asset', assetSchema);
mongoose.model('Device', deviceSchema);