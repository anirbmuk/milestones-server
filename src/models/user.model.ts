import { Schema, model } from 'mongoose';
import validator from 'validator';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { IBase, IStatics } from './base.model';
import { ErrorCodes } from '../constants/messages';
import { maskEmail } from '../utils/string.util';

const client_secret = process.env.milestones_server_client_secret || '';
const MIN_PASSWORD_HASH_CYCLE = 8;
const client_password_hash_cycle = Number(
  process.env.client_password_hash_cycle || MIN_PASSWORD_HASH_CYCLE,
);

export interface IUser extends IBase<IUser> {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  locale: 'en-US' | 'es';
  tokens: { token: string }[];
  generateToken: () => Promise<string>;
}

export interface IUserStatics extends IStatics<IUser> {
  authenticate: (email: string, password: string) => Promise<IUser>;
}

const userSchema = new Schema<IUser, IUserStatics>({
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
    trim: true,
    validate(value: string) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is not in correct format');
      }
    },
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minLength: 8,
  },
  firstname: {
    type: String,
    required: true,
    trim: true,
  },
  lastname: {
    type: String,
    trim: true,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject._id;
  delete userObject.__v;
  delete userObject.password;
  delete userObject.tokens;

  userObject.email = maskEmail(userObject.email);

  return userObject;
};

userSchema.method('generateToken', async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, client_secret, {
    expiresIn: '1d',
  });
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
});

userSchema.static('authenticate', async function (email, password) {
  if (!email || !password) {
    throw new Error(ErrorCodes.INVALID_INPUT);
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error(ErrorCodes.INVALID_CREDENTIALS);
  }
  const match = await bcryptjs.compare(password, user.password);
  if (!match) {
    throw new Error(ErrorCodes.INVALID_CREDENTIALS);
  }
  return user;
});

userSchema.pre('save', async function (next) {
  const user = this;
  let password_hash_cycle = client_password_hash_cycle;
  if (password_hash_cycle < MIN_PASSWORD_HASH_CYCLE) {
    password_hash_cycle = MIN_PASSWORD_HASH_CYCLE;
  }
  if (user.isModified('password')) {
    user.password = await bcryptjs.hash(user.password, password_hash_cycle);
  }
  next();
});

export const User = model<IUser, IUserStatics>('user', userSchema);
