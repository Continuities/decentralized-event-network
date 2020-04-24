/**
  * Api User data model
  * @author mtownsend
  * @since April 2020
  * @flow
  */

import Mongoose from '../../service/db.js';
import { hashPassword } from '../../service/auth.js';

const User$Schema = new Mongoose.Schema({
  username: { type: String, unique: true, index: true },
  email: { type: String, unique: true, index: true },
  displayName: { type: String },
  password: { type: String },
  actorId: String,
  privateKey: String
});

User$Schema.pre('save', async function() {
  if (!this.isModified('password')) { return; }
  this.password = await hashPassword(this.password);    
});

class User$Document /* :: extends Mongoose$Document */ {
  username:string;
  displayName:string;
  email:string;
  password:string;
  actorId:string;
  privateKey:string;
}

User$Schema.loadClass(User$Document);

const User = Mongoose.model('User', User$Schema);

export default User;
