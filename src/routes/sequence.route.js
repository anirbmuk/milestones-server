const router = require('express').Router();
const Sequence = require('./../models/sequence.model');
const guard = require('./../middleware/guard.mw');

router.post('', guard, async (req, res) => {
    try {
        req.body.email = req.user.email;
        const sequence = new Sequence(req.body);
        await sequence.save();
        return res.status(201).send(sequence);
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
});

module.exports = router;