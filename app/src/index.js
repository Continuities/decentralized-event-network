import React from 'react';
import ReactDOM from 'react-dom';
import App from './view/App';

import { TestString, ObjectBase } from 'activitypub';

console.log(TestString);
console.log(ObjectBase);

ReactDOM.render(<App />, document.getElementById('app'));
