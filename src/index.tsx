import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './components/App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import {Store} from './store';

const store = new Store(render);

async function render() {
  const habits = await store.getHabits();
  console.log(habits);
  ReactDOM.render(
    <App
      habits={habits}
      store={store}
    />,
    document.getElementById('root') as HTMLElement
  );

}

registerServiceWorker();
render();