const mongoose = require('mongoose');
require('dotenv').config();

let connectionURL = '';
const appEnvironment = process.env.app_environment;
const connectionParameters = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};

if (appEnvironment === 'dev') {
    connectionURL = process.env.mongodb_local_connection_url;
} else if (appEnvironment === 'prod') {
    connectionURL = process.env.mongodb_atlas_connection_url;
}

mongoose
.connect(connectionURL, connectionParameters)
.catch(() => console.error('Failed to connect to mongodb'));

module.exports = mongoose;
