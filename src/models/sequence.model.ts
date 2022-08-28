import { Schema, model } from 'mongoose';
import validator from 'validator';

export interface ISequence {
  email: string;
  sequencename: string;
  sequencevalue: number;
}

const sequenceSchema = new Schema<ISequence>({
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
  sequencename: {
    type: String,
    required: true,
    trim: true,
  },
  sequencevalue: {
    type: Number,
    default: 0,
  },
});

sequenceSchema.index(
  {
    email: 1,
    sequencename: 1,
  },
  {
    unique: true,
  },
);

sequenceSchema.method('toJSON', function () {
  const sequence = this;
  const sequenceObject = sequence.toObject();

  delete sequenceObject._id;
  delete sequenceObject.__v;

  return sequenceObject;
});

export const Sequence = model<ISequence>('sequence', sequenceSchema);
