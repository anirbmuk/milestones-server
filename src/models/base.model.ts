import { Model } from 'mongoose';

export interface IBase<T> {
  save(): Promise<T>;
}

export interface IStatics<T> extends Model<T> {
  getUpdatableAttributes: () => (keyof T)[];
  getSearchableAttributes: () => {
    attr: string;
    type: 'Number' | 'String';
  }[];
}
