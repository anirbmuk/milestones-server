import { Router } from 'express';
import { Sequence } from './../models';
import guard from './../middleware/guard.mw';

const router = Router();

router.post('', guard, async (req, res) => {
  try {
    req.body.email = req.user.email;
    const sequence = new Sequence(req.body);
    await sequence.save();
    return res.status(201).send(sequence);
  } catch (error) {
    return res.status(500).send({ error: (error as Error).message });
  }
});

export default router;
