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

//THIS added by dyano for uploading image please change variable names
// Defines the superhero schema
var SuperheroSchema = new Schema({
    email: {type: String, required: true},
    picture: {type: Schema.Types.Mixed, required: true},
    createdAt: {type: Date, default: Date.now},    
});

// Sets the createdAt parameter equal to the current time
SuperheroSchema.pre('save', function(next){
    now = new Date();
    if (!this.createdAt) {
        this.createdAt = now;
    }
    next();
});

// Exports the SuperheroSchema for use elsewhere.
mongoose.model('superhero', SuperheroSchema);
//end of THIS

mongoose.model('Asset', assetSchema);
mongoose.model('Device', deviceSchema);