const mongoose = require('mongoose');
const validator = require('validator');

const sequenceSchema = mongoose.Schema({
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
    sequencename: {
        type: String,
        required: true,
        trim: true
    },
    sequencevalue: {
        type: Number,
        default: 0
    }
});

sequenceSchema.index({
    email: 1,
    sequencename: 1
}, {
    unique: true
});

sequenceSchema.methods.toJSON = function() {
    const sequence = this;
    const sequenceObject = sequence.toObject();

    delete sequenceObject._id;
    delete sequenceObject.__v;

    return sequenceObject;
};

const Sequence = mongoose.model('sequence', sequenceSchema);

module.exports = Sequence;
