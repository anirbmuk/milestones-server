const User = require('./../models/user.model');
const jwt = require('jsonwebtoken');

const client_secret = process.env.milestones_server_client_secret;

const guard = async (req, res, next) => {
    try {
        const authorizationHeader = req.header('Authorization');
        if (!authorizationHeader || !authorizationHeader.startsWith('Bearer')) {
            return res.status(401).send({ error: 'Cannot authenticate incoming request' });
        }
        
        const token = authorizationHeader.split(' ')[1];
        const decoded = jwt.verify(token, client_secret);

        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });
        if (!user) {
            return res.status(401).send({ error: 'Cannot authenticate incoming request' });
        }

        // if (user.email !== req.body.email) {
        //     return res.status(401).send({ error: 'Cannot authenticate incoming request' });
        // }

        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).send({ error: 'Cannot authenticate incoming request' });
    }
};

module.exports = guard;
