const router = require('express').Router();
const User = require('./../models/user.model');
const guard = require('./../middleware/guard.mw');

router.post('', async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        return res.status(201).send({ user });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const user = await User.authenticate(req.body.email, req.body.password);
        const token = await user.generateToken();
        return res.status(200).send({ user, token, auth: true });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

router.get('/me', guard, async (req, res) => {
    return res.status(200).send({ user: req.user });
});

router.post('/logout', guard, async(req, res) => {
    const user = req.user;
    const token = req.token;
    user.tokens = user.tokens.filter(eachToken => eachToken.token !== token);
    try {
        await user.save();
        return res.status(200).send({ auth: false });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

router.post('/logoutall', guard, async(req, res) => {
    const user = req.user;
    user.tokens = [];
    try {
        await user.save();
        return res.status(200).send({ auth: false });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

module.exports = router;
