const mongoose = require('mongoose');
const validator = require('validator');

const activitySchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is not in correct format');
            }
        }
    },
    activitycode: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
});

activitySchema.index({
    email: 1,
    activitycode: 1
}, {
    unique: true
});

activitySchema.methods.toJSON = function() {
    const activity = this;
    const activityObject = activity.toObject();

    delete activityObject._id;
    delete activityObject.__v;

    return activityObject;

};

const Activity = mongoose.model('activity', activitySchema);

module.exports = Activity;
