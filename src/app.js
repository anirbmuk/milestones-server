const express = require('express');
const app = express();

const userRoutes = require('./routes/user.route');
const activityRoutes = require('./routes/activity.route');
const sequenceRoutes = require('./routes/sequence.route');
const milestoneRoutes = require('./routes/milestone.route');

const basePath = process.env.milestones_server_base_path;

const allowedOrigins = ['http://localhost:4200', 'http://localhost:8080', 'https://milestones-home.firebaseapp.com'];

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, accept-language');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, PUT, OPTIONS');
	next();
});

app.use(express.json());

app.use(basePath + 'user', userRoutes);
app.use(basePath + 'activity', activityRoutes);
app.use(basePath + 'sequence', sequenceRoutes);
app.use(basePath + 'milestone', milestoneRoutes);

module.exports = app;
