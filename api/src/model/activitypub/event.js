/**
 * Models an ActivityPub Event object
 * @author mtownsend
 * @since April 2020
 * @flow
 */

import Mongoose from '../../service/db.js';
import { Object$Schema, Object$Document } from './object.js';

const Event$Schema = new Object$Schema();

const Event:Class<Object$Document> = Mongoose.model('Event', Event$Schema);

export default Event;
