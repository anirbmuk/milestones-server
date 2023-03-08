import mongoose from 'mongoose';
import { config } from 'dotenv';

config();

let connectionURL: string;
const { app_environment } = process.env;

if (app_environment === 'dev') {
  connectionURL = process.env.mongodb_local_connection_url || '';
} else {
  connectionURL = process.env.mongodb_atlas_connection_url || '';
}

mongoose
  .connect(connectionURL, {
    autoIndex: true,
    autoCreate: true,
  })
  .catch((err: Error) =>
    console.error('Failed to connect to mongodb', `${err}`),
  );
