// @flow

import monk from 'monk';

const db = monk('db:27017/app');

export default db; // TODO