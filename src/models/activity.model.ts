import { Schema, model } from 'mongoose';
import validator from 'validator';

export interface IActivity {
  email: string;
  activitycode: string;
}

const activitySchema = new Schema<IActivity>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      validate(value: string) {
        if (!validator.isEmail(value)) {
          throw new Error('Email is not in correct format');
        }
      },
    },
    activitycode: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

activitySchema.index(
  {
    email: 1,
    activitycode: 1,
  },
  {
    unique: true,
  },
);

export const Activity = model<IActivity>('activity', activitySchema);
