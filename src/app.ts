import express, { NextFunction, Request, Response } from 'express';
import { json } from 'body-parser';
import './database/database';

const app = express();

import userRoutes from './routes/user.route';
import activityRoutes from './routes/activity.route';
import sequenceRoutes from './routes/sequence.route';
import milestoneRoutes from './routes/milestone.route';

const basePath = process.env.milestones_server_base_path;

const allowedOrigins = [
  'http://127.0.0.1:4200',
  'http://localhost:4200',
  'http://127.0.0.1:3000',
  'http://localhost:3000',
  'http://127.0.0.1:4000',
  'http://localhost:4000',
  'https://home-milestones.firebaseapp.com',
];

app.use((req: Request, res: Response, next: NextFunction) => {
  const { origin } = req.headers;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, accept-language',
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE, PUT, OPTIONS',
  );
  next();
});

app.use(json());

app.use(basePath + 'user', userRoutes);
app.use(basePath + 'activity', activityRoutes);
app.use(basePath + 'sequence', sequenceRoutes);
app.use(basePath + 'milestone', milestoneRoutes);

export default app;
