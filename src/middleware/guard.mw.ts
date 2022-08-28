import { NextFunction, Request, Response } from 'express';
import { User, IUser } from './../models';
import { verify, JwtPayload } from 'jsonwebtoken';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      token: string;
      user: IUser;
    }
  }
}

const client_secret = process.env.milestones_server_client_secret || '';

const guard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authorizationHeader = req.header('Authorization');
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer')) {
      return res
        .status(401)
        .send({ error: 'Cannot authenticate incoming request' });
    }

    const [, token] = authorizationHeader.split(' ');
    const decoded = verify(token, client_secret) as JwtPayload;

    const user = await User.findOne({
      _id: decoded._id,
      'tokens.token': token,
    });
    if (!user) {
      return res
        .status(401)
        .send({ error: 'Cannot authenticate incoming request' });
    }

    // if (user.email !== req.body.email) {
    //     return res.status(401).send({ error: 'Cannot authenticate incoming request' });
    // }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    return res
      .status(401)
      .send({ error: 'Cannot authenticate incoming request' });
  }
};

export default guard;
