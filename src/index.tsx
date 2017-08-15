import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './components/App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import {Store} from './store';
import {getUrlParameter} from './utils';

const throttle = require('lodash.throttle');

const store = new Store(
  {
    localDB: getUrlParameter('localdb') || 'habits',
    remoteDB: getUrlParameter('remotedb') || 'http://localhost:5984/habits'
  },
  throttle(render, 500)
);

async function render() {
  const habits = await store.getHabits();
  let isLoggedIn = await store.isLoggedIn();
  console.log(habits);
  ReactDOM.render(
    <App
      habits={habits}
      store={store}
      isLoggedIn={isLoggedIn}
    />,
    document.getElementById('root') as HTMLElement
  );
}

registerServiceWorker();

render();