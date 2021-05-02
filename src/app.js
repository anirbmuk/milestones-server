const express = require('express');
const app = express();

const userRoutes = require('./routes/user.route');
const activityRoutes = require('./routes/activity.route');
const sequenceRoutes = require('./routes/sequence.route');
const milestoneRoutes = require('./routes/milestone.route');

const basePath = process.env.milestones_server_base_path;

const allowedOrigins = [
    'http://127.0.0.1:4200',
    'http://localhost:4200',
    'http://127.0.0.1:8080',
    'http://localhost:8080',
    'http://127.0.0.1:4000',
    'http://localhost:4000',
    'https://milestones-home.firebaseapp.com',
    'https://home-milestones.el.r.appspot.com'
];

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
