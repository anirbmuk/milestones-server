import { Schema, model } from 'mongoose';
import validator from 'validator';
import { IBase, IStatics } from './base.model';

export interface IMilestone extends IBase<IMilestone> {
  milestoneid: number;
  email: string;
  day: number;
  month: number;
  year: number;
  activitycodes: string[];
  activitycodeslc: string[];
  description: string;
  dateobject: number;
}

const milestoneSchema = new Schema<IMilestone, IStatics<IMilestone>>(
  {
    milestoneid: {
      type: Number,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      validate(value: string) {
        if (!validator.isEmail(value)) {
          throw new Error('Email is not in correct format');
        }
      },
    },
    day: {
      type: Number,
      required: true,
      trim: true,
    },
    month: {
      type: Number,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      required: true,
      trim: true,
    },
    activitycodes: [String],
    activitycodeslc: [String],
    description: {
      type: String,
      trim: true,
    },
    dateobject: {
      type: Number,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

milestoneSchema.index(
  {
    milestoneid: 1,
    email: 1,
  },
  {
    unique: true,
  },
);

milestoneSchema.index({
  day: 1,
  month: 1,
  year: 1,
});

milestoneSchema.index({
  activitycodeslc: 1,
});

milestoneSchema.static(
  'getUpdatableAttributes',
  function (): (keyof IMilestone)[] {
    return ['day', 'month', 'year', 'activitycodes', 'description'];
  },
);

export const Milestone = model<IMilestone, IStatics<IMilestone>>(
  'milestone',
  milestoneSchema,
);
