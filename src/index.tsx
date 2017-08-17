import * as R from 'ramda';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './components/App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import {Store} from './store';
import {getUrlParameter} from './utils';
import {createHabitTree} from './habit-tree';

const throttle = require('lodash.throttle');

function init() {
  const store = new Store(
    {
      localDB: getUrlParameter('localdb') || 'habits',
      remoteDB: getUrlParameter('remotedb') || 'http://localhost:5984/habits'
    },
    throttle(render, 500)
  );

  async function render() {
    const habits = await store.getHabits();
    let isLoggedIn = await store.isLoggedIn().catch(R.always(false));
    const latestHabitExecutions = await store.getLatestHabitExecutions(habits.map(h => h._id));
    console.log('habits', habits);
    console.log('latestHabitExecutions', latestHabitExecutions);
    ReactDOM.render(
      <App
        habitTree={createHabitTree(habits)}
        latestHabitExecutions={latestHabitExecutions}
        store={store}
        isLoggedIn={isLoggedIn}
        isOnline={window.navigator.onLine}
      />,
      document.getElementById('root') as HTMLElement
    );
  }

  registerServiceWorker();

  render();

  window.addEventListener('online', render);
  window.addEventListener('offline', render);
}

// (window as any).init = init;

init();
