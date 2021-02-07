const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');

const client_secret = process.env.milestones_server_client_secret;
const MIN_PASSWORD_HASH_CYCLE = 8;
const client_password_hash_cycle = process.client_password_hash_cycle || MIN_PASSWORD_HASH_CYCLE;

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is not in correct format');
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 8
    },
    firstname: {
        type: String,
        required: true,
        trim: true
    },
    lastname: {
        type: String,
        trim: true
    },
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ]
});

userSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();

    delete userObject._id;
    delete userObject.__v;
    delete userObject.password;
    delete userObject.tokens;

    return userObject;
};

userSchema.methods.generateToken = async function() {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, client_secret);
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
};

userSchema.statics.authenticate = async function(email, password) {
    if (!email || !password) {
        throw new Error(`Username or password cannot be empty`);
    }
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error(`Invalid credentials provided for milestones system`);
    }
    const match = await bcryptjs.compare(password, user.password);
    if (!match) {
        throw new Error(`Invalid credentials provided for milestones system`);
    }
    return user;
};

userSchema.pre('save', async function(next) {
    const user = this;
    let password_hash_cycle = client_password_hash_cycle;
    if (password_hash_cycle < MIN_PASSWORD_HASH_CYCLE) {
        password_hash_cycle = MIN_PASSWORD_HASH_CYCLE;
    }
    if(user.isModified('password')) {
        user.password = await bcryptjs.hash(user.password, password_hash_cycle);
    }
    next();
});

const User = mongoose.model('user', userSchema);

module.exports = User;
