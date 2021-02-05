const router = require('express').Router();
const Milestone = require('./../models/milestone.model');
// const Activity = require('./../models/activity.model');
const guard = require('./../middleware/guard.mw');
const getNextValue = require('./../utils/sequence.util');
const validateStringDate = require('./../utils/date.util');

/* const validateActivityCode = async (email, activitycode) => {
    if (!activitycode) {
        return null;
    }
    const activity = await Activity.findOne({ email, activitycode });
    if (!activity) {
        return null;
    }
    return activity.activitycode;
} */

router.post('', guard, async (req, res) => {
    const email = req.user.email;
    const payload = { ... req.body };
    // const activitycode = req.body.activitycode;
    try {        
        /* const activity = await validateActivityCode(email, activitycode);
        if (!activity) {
            return res.status(400).send({ error: `No activity found with code ${activitycode}` });
        } */

        const month = payload.month;
        const day = payload.day;
        const year = payload.year;

        if (month === undefined || day === undefined || year === undefined) {
            return res.status(400).send({ error: `Invalid date sent in request` });
        }
        const stringDateInput = `${month}-${day}-${year}`;
        if (!validateStringDate(stringDateInput)) {
            return res.status(400).send({ error: `${stringDateInput} is not a valid date` });
        }
        
        const milestoneid = await getNextValue(req.user.email, 'milestoneid');
        if (milestoneid < 0) {
            return res.status(400).send({ error: 'Error while fetching next value from sequence milestoneid' });
        }

        payload.milestoneid = milestoneid;
        payload.email = email;
        payload.activitycodeslc = (!!payload.activitycodes && Array.isArray(payload.activitycodes)) ? payload.activitycodes.map(each => each.toLowerCase()) : []

        const milestone = new Milestone(payload);
        await milestone.save();
        return res.status(201).send(milestone);
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
});

router.get('', guard, async(req, res) => {
    const filterPattern = req.query.findBy;
    const searchString = req.query.q;
    if (!filterPattern) {
        return res.status(400).send({ error: 'Cannot perform a search without a filter pattern' });
    }

    let day, month, year, activitycodes, milestoneid, milestones;
    try {
        if (filterPattern === 'date') {
            const milestonedateparts = (searchString).split('-');
            month = milestonedateparts[0];
            day = milestonedateparts[1];
            year = milestonedateparts[2];
            milestones = await Milestone.find({ email: req.user.email, month, day, year });
        } else if (filterPattern === 'id') {
            milestoneid = +searchString;
            milestones = await Milestone.findOne({ email: req.user.email, milestoneid });
        } else if (filterPattern === 'tag') {
            if (!searchString) {
                return res.status(400).send({ error: `At least one tag must be present in search query` });
            }
            activitycodes = !!searchString ? (searchString.toLowerCase()).split(',') : [];
            milestones = await Milestone.find({ email: req.user.email, activitycodeslc: { $in: activitycodes } });
        }
        return res.status(200).send(milestones);
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
});

router.patch('/:milestoneid', guard, async (req, res) => {
    const allowedAttributes = Milestone.getUpdatableAttributes();
    const update = req.body;
    const updateAttributes = Object.keys(update);

    const isValidOperation = updateAttributes.every(each => allowedAttributes.includes(each));
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Attempting to update restricted or non-existent attributes'});
    }

    const email = req.user.email;
    /* const activitycode = req.body.activitycode;
    if (!!activitycode) {
        const activity = await validateActivityCode(email, activitycode);
        if (!activity) {
            return res.status(400).send({ error: `No activity found with code ${activitycode}` });
        }
    }

    if (!req.body.month || !req.body.day || !req.body.year) {
        return res.status(400).send({ error: `Missing date information in update request` });
    } */

    const milestoneid = parseInt(req.params.milestoneid);
    try {
        const milestone = await Milestone.findOne({ email, milestoneid });
        if (!milestone) {
            return res.status(404).send({ error: `No milestone found with id ${milestoneid}` });
        }

        const month = req.body.month || milestone['month'];
        const day = req.body.day || milestone['day'];
        const year = req.body.year || milestone['year'];

        const stringDateInput = `${month}-${day}-${year}`;
        if (!validateStringDate(stringDateInput)) {
            return res.status(400).send({ error: `${stringDateInput} is not a valid date` });
        }

        updateAttributes.forEach(attribute => milestone[attribute] = update[attribute]);
        milestone.activitycodeslc = (!!milestone.activitycodes && Array.isArray(milestone.activitycodes)) ? milestone.activitycodes.map(each => each.toLowerCase()) : []
        await milestone.save();

        res.status(200).send(milestone);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

router.delete('/:milestoneid', guard, async(req, res) => {
    const milestoneid = req.params.milestoneid;
    try {
        const milestone = await Milestone.findOneAndDelete({ email: req.user.email, milestoneid });
        if (!milestone) {
            return res.status(404).send({ error: `No milestone found with id ${milestoneid}` });
        }
        return res.status(200).send(milestone);
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
});

module.exports = router;
