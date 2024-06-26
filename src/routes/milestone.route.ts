import { Router, RequestHandler } from 'express';
import { Activity, IMilestone, Milestone } from './../models';
import guard from './../middleware/guard.mw';
import getNextValue from './../utils/sequence.util';
import {
  validateStringDate,
  validateStringDateRange,
  getTime,
} from './../utils/date.util';
import { SortOrder } from 'mongoose';

type RequestQuery = {
  findBy: 'id' | 'tag' | 'date' | 'daterange';
  depth: 'in' | 'all';
  q: string | undefined;
  sort: 'asc' | 'desc' | undefined;
  limit: string | undefined;
  skip: string | undefined;
};

const router = Router();

const addActivityCode = async (email: string, activitycode: string) => {
  if (!activitycode) {
    return;
  }
  const activity = new Activity({ email, activitycode });
  try {
    await activity.save();
    // eslint-disable-next-line no-empty
  } catch {}
};

const addMilestone: RequestHandler = async (req, res) => {
  const { email } = req.user;
  const payload = { ...req.body };
  try {
    const { month, day, year } = payload;

    if (month === undefined || day === undefined || year === undefined) {
      return res.status(400).send({ error: 'Invalid date sent in request' });
    }
    const stringDateInput = `${day}-${month}-${year}`;
    if (!validateStringDate(stringDateInput)) {
      return res
        .status(400)
        .send({ error: `${stringDateInput} is not a valid date` });
    }

    const milestoneid = await getNextValue(req.user.email, 'milestoneid');
    if (milestoneid < 0) {
      return res.status(400).send({
        error: 'Error while fetching next value from sequence milestoneid',
      });
    }

    payload.milestoneid = milestoneid;
    payload.email = email;
    payload.activitycodeslc =
      !!payload.activitycodes && Array.isArray(payload.activitycodes)
        ? payload.activitycodes.map((each: string) => each.toLowerCase())
        : [];
    payload.dateobject = getTime(stringDateInput);

    const milestone = new Milestone(payload);
    await milestone.save();

    for (const activitycode of payload.activitycodeslc) {
      addActivityCode(email, activitycode);
    }
    return res.status(201).send(milestone);
  } catch (error) {
    return res.status(500).send({ error: (error as Error).message });
  }
};

const getMilestones: RequestHandler = async (req, res) => {
  const query = req.query as RequestQuery;
  const {
    findBy: filterPattern,
    q: searchString,
    depth: filterDepth = 'in',
    sort: sortDir = 'asc',
  } = query;
  const sortParam: { [key: string]: SortOrder } =
    sortDir === 'asc'
      ? { year: 1, month: 1, day: 1 }
      : { year: -1, month: -1, day: -1 };
  let limit = 8;
  let skip = 0;
  if (query.limit && !isNaN(+query.limit)) {
    limit = +query.limit;
  }
  if (query.skip && !isNaN(+query.skip)) {
    skip = +query.skip;
  }
  if (!filterPattern) {
    return res
      .status(400)
      .send({ error: 'Cannot perform a search without a filter pattern' });
  }

  let day: string,
    month: string,
    year: string,
    activitycodes: string[],
    milestoneid: number,
    milestones: IMilestone | IMilestone[] | null;
  try {
    if (filterPattern === 'date') {
      [day, month, year] = ((searchString as string) || '').split('-');
      const stringDateInput = `${day}-${month}-${year}`;
      if (!validateStringDate(stringDateInput)) {
        return res
          .status(400)
          .send({ error: `${stringDateInput} is not a valid date` });
      }
      milestones = await Milestone.find({
        email: req.user.email,
        month,
        day,
        year,
      });
    } else if (filterPattern === 'id') {
      milestoneid = +((searchString as string) || '');
      milestones = await Milestone.findOne({
        email: req.user.email,
        milestoneid,
      });
    } else if (filterPattern === 'tag') {
      if (!searchString) {
        return res
          .status(400)
          .send({ error: 'At least one tag must be present in search query' });
      }
      activitycodes =
        ((searchString as string) || '').toLowerCase().split(',') || [];
      if (filterDepth === 'in') {
        milestones = await Milestone.find({
          email: req.user.email,
          activitycodeslc: { $in: activitycodes },
        })
          .limit(limit)
          .skip(skip)
          .sort(sortParam);
      } else if (filterDepth === 'all') {
        milestones = await Milestone.find({
          email: req.user.email,
          activitycodeslc: { $all: activitycodes },
        })
          .limit(limit)
          .skip(skip)
          .sort(sortParam);
      } else {
        return res
          .status(400)
          .send({ error: 'The value provided for depth is not supported' });
      }
    } else if (filterPattern === 'daterange') {
      const dateRanges = ((searchString as string) || '').split(',') || [];
      if (dateRanges.length === 2) {
        const [stringDateInput1, stringDateInput2] = dateRanges;
        if (
          !validateStringDate(stringDateInput1) ||
          !validateStringDate(stringDateInput2)
        ) {
          return res.status(400).send({
            error:
              'Invalid date provided in at least one of the date range values',
          });
        }
        if (!validateStringDateRange(stringDateInput1, stringDateInput2)) {
          return res
            .status(400)
            .send({ error: 'End date must be on or after start date' });
        }
        milestones = await Milestone.find({
          email: req.user.email,
          dateobject: {
            $gte: getTime(stringDateInput1),
            $lte: getTime(stringDateInput2),
          },
        })
          .limit(limit)
          .skip(skip)
          .sort(sortParam);
      } else {
        return res
          .status(400)
          .send({ error: 'Invalid parameters provided for date ranges' });
      }
    } else {
      return res
        .status(400)
        .send({ error: 'The value provided for findBy is not supported' });
    }
    return res.status(200).send(milestones);
  } catch (error) {
    return res.status(500).send({ error: (error as Error).message });
  }
};

const updateMilestone: RequestHandler<{ milestoneid: string }> = async (
  req,
  res,
) => {
  const allowedAttributes = Milestone.getUpdatableAttributes();
  const update = { ...req.body } as IMilestone;
  const updateAttributes = Object.keys(update) as (keyof IMilestone)[];
  const tgt: string[] =
    !!update.activitycodes && Array.isArray(update.activitycodes)
      ? update.activitycodes.map((each: string) => each.toLowerCase())
      : [];

  const isValidOperation = updateAttributes.every(each =>
    allowedAttributes.includes(each),
  );
  if (!isValidOperation) {
    return res.status(400).send({
      error: 'Attempting to update restricted or non-existent attributes',
    });
  }

  const { email } = req.user;
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
    const milestone: IMilestone | null = await Milestone.findOne({
      milestoneid,
      email,
    });
    if (!milestone) {
      return res
        .status(404)
        .send({ error: `No milestone found with id ${milestoneid}` });
    }
    const src = milestone.activitycodeslc;

    const month = req.body.month || milestone['month'];
    const day = req.body.day || milestone['day'];
    const year = req.body.year || milestone['year'];

    const stringDateInput = `${day}-${month}-${year}`;
    if (!validateStringDate(stringDateInput)) {
      return res
        .status(400)
        .send({ error: `${stringDateInput} is not a valid date` });
    }

    updateAttributes.forEach(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      attribute => (milestone[attribute] = update[attribute]),
    );
    milestone.activitycodeslc =
      !!milestone.activitycodes && Array.isArray(milestone.activitycodes)
        ? milestone.activitycodes.map((each: string) => each.toLowerCase())
        : [];
    milestone.dateobject = getTime(`${day}-${month}-${year}`);
    await milestone.save();

    const diff = tgt
      .map(each => (src.includes(each) ? '' : each))
      .filter(each => Boolean(each));
    for (const activitycode of diff) {
      addActivityCode(email, activitycode);
    }

    res.status(200).send(milestone);
  } catch (error) {
    res.status(500).send({ error: (error as Error).message });
  }
};

const deleteMilestone: RequestHandler<{ milestoneid: string }> = async (
  req,
  res,
) => {
  const { milestoneid } = req.params;
  try {
    const milestone = await Milestone.findOneAndDelete({
      email: req.user.email,
      milestoneid,
    });
    if (!milestone) {
      return res
        .status(404)
        .send({ error: `No milestone found with id ${milestoneid}` });
    }
    return res.status(204).send(milestone);
  } catch (error) {
    return res.status(500).send({ error: (error as Error).message });
  }
};

router.post('', guard, addMilestone);
router.get('', guard, getMilestones);
router.patch('/:milestoneid', guard, updateMilestone);
router.delete('/:milestoneid', guard, deleteMilestone);

export default router;
