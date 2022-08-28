import { RequestHandler, Router } from 'express';
import { User } from './../models';
import guard from './../middleware/guard.mw';

const router = Router();

const addUser: RequestHandler = async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    return res.status(201).send({ user });
  } catch (error) {
    return res.status(500).send({ error: (error as Error).message });
  }
};

const login: RequestHandler = async (req, res) => {
  try {
    const user = await User.authenticate(req.body.email, req.body.password);
    const token = await user.generateToken();
    return res.status(200).send({ user, token, auth: true });
  } catch (error) {
    res.status(500).send({ error: (error as Error).message });
  }
};

const logout: RequestHandler = async (req, res) => {
  const { user, token } = req;
  user.tokens = user.tokens.filter(eachToken => eachToken.token !== token);
  try {
    await user.save();
    return res.status(200).send({ auth: false });
  } catch (error) {
    res.status(500).send({ error: (error as Error).message });
  }
};

const logoutall: RequestHandler = async (req, res) => {
  const { user } = req;
  user.tokens = [];
  try {
    await user.save();
    return res.status(200).send({ auth: false });
  } catch (error) {
    res.status(500).send({ error: (error as Error).message });
  }
};

router.post('', addUser);
router.post('/login', login);

router.get('/me', guard, async (req, res) => {
  return res.status(200).send({ user: req.user });
});

router.post('/logout', guard, logout);
router.post('/logoutall', guard, logoutall);

export default router;
