const mongoose = require('mongoose');
const validator = require('validator');

const milestoneSchema = mongoose.Schema({
    milestoneid: {
        type: Number,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is not in correct format');
            }
        }
    },
    day: {
        type: Number,
        required: true,
        trim: true
    },
    month: {
        type: Number,
        required: true,
        trim: true
    },
    year: {
        type: Number,
        required: true,
        trim: true
    },
    activitycodes: [String],
    activitycodeslc: [String],
    description: {
        type: String,
        trim: true
    },
    dateobject: {
        type: Number,
        trim: true
    },
}, {
    timestamps: true
});

milestoneSchema.index({
    milestoneid: 1,
    email: 1
}, {
    unique: true
});

milestoneSchema.index({
    day: 1,
    month: 1,
    year: 1
});

milestoneSchema.index({
    activitycodeslc: 1
});

milestoneSchema.methods.toJSON = function() {
    const milestone = this;
    const milestoneObject = milestone.toObject();

    delete milestoneObject._id;
    delete milestoneObject.__v;
    delete milestoneObject.activitycodeslc;

    return milestoneObject;
};

milestoneSchema.statics.getUpdatableAttributes = function() {
    return ['day', 'month', 'year', 'activitycodes', 'description'];
};

const Milestone = mongoose.model('milestone', milestoneSchema);

module.exports = Milestone;
