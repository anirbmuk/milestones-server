const mongoose = require('mongoose');
const validator = require('validator');

const milestoneSchema = mongoose.Schema({
    milestoneid: {
        type: Number,
        required: true,
        trim: true,
        unique: true
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
    description: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

milestoneSchema.methods.toJSON = function() {
    const milestone = this;
    const milestoneObject = milestone.toObject();

    delete milestoneObject._id;
    delete milestoneObject.__v;

    return milestoneObject;
};

milestoneSchema.statics.getUpdatableAttributes = function() {
    return ['day', 'month', 'year', 'activitycodes', 'description'];
};

const Milestone = mongoose.model('milestone', milestoneSchema);

module.exports = Milestone;
