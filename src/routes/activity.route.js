const router = require('express').Router();
const Activity = require('./../models/activity.model');
const guard = require('./../middleware/guard.mw');

router.post('', guard, async (req, res) => {
    try {
        req.body.email = req.user.email;
        const activity = new Activity(req.body);
        await activity.save();
        return res.status(201).send({ activity });
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
});

router.get('', guard, async(req, res) => {
    const searchString = req.query.q;
    if (!searchString) {
        return res.status(400).send({ error: 'Cannot perform a search without a query parameter' });
    }
    try {
        const activities = await Activity.find({ email: req.user.email, activitycode: { $regex: searchString } }).sort({ email: 1, activitycode: 1 });
        return res.status(200).send(activities.map(activity => activity.activitycode));
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
});

router.get('/:code', guard, async(req, res) => {
    const activitycode = req.params.code;
    try {
        const activity = await Activity.findOne({ email: req.user.email, activitycode });
        if (!activity) {
            return res.status(404).send({ error: `No activity found with code ${activitycode}` });
        }
        return res.status(200).send(activity);
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
});

router.delete('/:code', guard, async(req, res) => {
    const activitycode = req.params.code;
    try {
        const activity = await Activity.findOneAndDelete({ email: req.user.email, activitycode });
        if (!activity) {
            return res.status(404).send({ error: `No activity found with code ${activitycode}` });
        }
        return res.status(200).send(activity);
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
});

module.exports = router;
