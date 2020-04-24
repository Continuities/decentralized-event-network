// @flow

import Mongoose from 'mongoose';

Mongoose.connect('mongodb://db/app');

export default Mongoose;

export const sanitized = (record:Mongoose$Document) => {
  const ret = record.toObject();
  delete ret._id;
  delete ret.__v;
  return ret;
};
