import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './components/App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import {Store} from './store';
const throttle = require('lodash.throttle');

const store = new Store(throttle(render, 500));

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