import { Router, RequestHandler } from 'express';
import { Activity } from './../models/activity.model';
import guard from './../middleware/guard.mw';

const router = Router();

const addActivity: RequestHandler = async (req, res) => {
  try {
    req.body.email = req.user.email;
    const activity = new Activity(req.body);
    await activity.save();
    return res.status(201).send({ activity });
  } catch (error) {
    return res.status(500).send({ error: (error as Error).message });
  }
};

const getActivities: RequestHandler = async (req, res) => {
  const { q: searchString } = req.query;
  if (!searchString) {
    return res
      .status(400)
      .send({ error: 'Cannot perform a search without a query parameter' });
  }
  try {
    const activities = await Activity.find({
      email: req.user.email,
      activitycode: { $regex: searchString },
    }).sort({ email: 1, activitycode: 1 });
    return res
      .status(200)
      .send(activities.map(activity => activity.activitycode));
  } catch (error) {
    return res.status(500).send({ error: (error as Error).message });
  }
};

const getActivity: RequestHandler<{ code: string }> = async (req, res) => {
  const { code: activitycode } = req.params;
  try {
    const activity = await Activity.findOne({
      email: req.user.email,
      activitycode,
    });
    if (!activity) {
      return res
        .status(404)
        .send({ error: `No activity found with code ${activitycode}` });
    }
    return res.status(200).send(activity);
  } catch (error) {
    return res.status(500).send({ error: (error as Error).message });
  }
};

const deleteActivity: RequestHandler<{ code: string }> = async (req, res) => {
  const { code: activitycode } = req.params;
  try {
    const activity = await Activity.findOneAndDelete({
      email: req.user.email,
      activitycode,
    });
    if (!activity) {
      return res
        .status(404)
        .send({ error: `No activity found with code ${activitycode}` });
    }
    return res.status(200).send(activity);
  } catch (error) {
    return res.status(500).send({ error: (error as Error).message });
  }
};

router.post('', guard, addActivity);
router.get('', guard, getActivities);
router.get('/:code', guard, getActivity);
router.delete('/:code', guard, deleteActivity);

export default router;
