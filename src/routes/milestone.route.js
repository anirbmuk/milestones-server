const router = require('express').Router();
const Milestone = require('./../models/milestone.model');
const Activity = require('./../models/activity.model');
const guard = require('./../middleware/guard.mw');
const getNextValue = require('./../utils/sequence.util');
const { validateStringDate, validateStringDateRange } = require('./../utils/date.util');

const addActivityCode = async (email, activitycode) => {
    if (!activitycode) {
        return;
    }
    const activity = new Activity({ email, activitycode });
    try {
        await activity.save();
    } catch { }
}

router.post('', guard, async (req, res) => {
    const email = req.user.email;
    const payload = { ... req.body };
    try {

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

        for (const activitycode of payload.activitycodeslc) {
            addActivityCode(email, activitycode);
        }
        return res.status(201).send(milestone);
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
});

router.get('', guard, async(req, res) => {
    const filterPattern = req.query.findBy;
    const searchString = req.query.q;
    let limit = 10;
    let skip = 10;
    if (!!req.query.limit && !isNaN(req.query.limit)) {
        limit = +req.query.limit;
    }
    if (!!req.query.skip && !isNaN(req.query.skip)) {
        skip = +req.query.skip;
    }
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
            const stringDateInput = `${month}-${day}-${year}`;
            if (!validateStringDate(stringDateInput)) {
                return res.status(400).send({ error: `${stringDateInput} is not a valid date` });
            }
            milestones = await Milestone.find({ email: req.user.email, month, day, year });
        } else if (filterPattern === 'id') {
            milestoneid = +searchString;
            milestones = await Milestone.findOne({ email: req.user.email, milestoneid });
        } else if (filterPattern === 'tag') {
            const filterDepth = req.query.depth || 'in';
            if (!searchString) {
                return res.status(400).send({ error: `At least one tag must be present in search query` });
            }
            activitycodes = !!searchString ? (searchString.toLowerCase()).split(',') : [];
            if (filterDepth === 'in') {
                milestones = await Milestone.find({ email: req.user.email, activitycodeslc: { $in: activitycodes } })
                                            .limit(limit)
                                            .skip(skip)
                                            .sort({ year: 1, month: 1, day: 1 });
            } else if (filterDepth === 'all') {
                milestones = await Milestone.find({ email: req.user.email, activitycodeslc: { $all: activitycodes } })
                                            .limit(limit)
                                            .skip(skip)
                                            .sort({ year: 1, month: 1, day: 1 });
            } else {
                return res.status(400).send({ error: `The value provided for depth is not supported` });
            }
        } else if (filterPattern === 'daterange') {
            const dateRanges = !!searchString ? searchString.split(',') : [];
            if (dateRanges.length === 2) {
                const date1 = dateRanges[0].split('-');
                const month1 = +date1[0];
                const day1 = +date1[1];
                const year1 = +date1[2];
                const stringDateInput1 = `${month1}-${day1}-${year1}`;
                const date2 = dateRanges[1].split('-');
                const month2 = +date2[0];
                const day2 = +date2[1];
                const year2 = +date2[2];
                const stringDateInput2 = `${month2}-${day2}-${year2}`;
                if (!validateStringDate(stringDateInput1) || !validateStringDate(stringDateInput2)) {
                    return res.status(400).send({ error: `Invalid date provided in at least one of the date range values` });
                }
                if (!validateStringDateRange(stringDateInput1, stringDateInput2)) {
                    return res.status(400).send({ error: `End date must be on or after start date` });
                }
                milestones = await Milestone.find({email: req.user.email, year: { $gte: year1, $lte: year2 }, month: { $gte: month1, $lte: month2 }, day: { $gte: day1, $lte: day2 } })
				                            .limit(limit)
                                            .skip(skip)
                                            .sort({ year: 1, month: 1, day: 1 });
            } else {
                return res.status(400).send({ error: `Invalid parameters provided for date ranges` });
            }
        } else {
            return res.status(400).send({ error: `The value provided for findBy is not supported` });
        }
        return res.status(200).send(milestones);
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
});

router.patch('/:milestoneid', guard, async (req, res) => {
    const allowedAttributes = Milestone.getUpdatableAttributes();
    const update = { ...req.body };
    const updateAttributes = Object.keys(update);
    const tgt = (!!update.activitycodes && Array.isArray(update.activitycodes)) ? update.activitycodes.map(each => each.toLowerCase()) : []

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
        const milestone = await Milestone.findOne({ milestoneid, email });
        if (!milestone) {
            return res.status(404).send({ error: `No milestone found with id ${milestoneid}` });
        }
        const src = milestone.activitycodeslc;

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

        const diff = tgt.map(each => src.includes(each) ? false : each).filter(each => Boolean(each));
        for (const activitycode of diff) {
            addActivityCode(email, activitycode);
        }

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
