import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './components/App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import PouchDB from 'pouchdb';
import {Habit, HabitExecution, NewHabitExecution, Types} from './model';

PouchDB.plugin(require('pouchdb-find').default);

const localDB = new PouchDB('habits');
const remoteDB = new PouchDB('http://localhost:5984/habits');

localDB.createIndex({
  index: {fields: ['type']}
});

localDB.sync(remoteDB, {
  live: true,
  retry: true
}).on('change', change => {
  console.log('sync change', change);
}).on('error', err => {
  console.error('sync error', err);
  console.log(JSON.stringify(err));
});


localDB.changes({
  since: 'now',
  live: true,
}).on('change', changes => {
  console.log('changes', changes);
  render();
}).on('error', err => {
  console.error('changes error', err);
});

function addHabit() {
  localDB.post({type: Types.habit, title: 'New'});
}

function saveHabit(habit: Habit) {
  localDB.put(habit);
}

function deleteHabit(habit: Habit) {
  localDB.remove(habit);
}

function executeHabit(habit: Habit) {
  const newHabitExecution: NewHabitExecution = {
    type: Types.habitExecution,
    habitId: habit._id,
    timestamp: Date.now()
  };
  localDB.post(newHabitExecution);
}

function getHabitExecutions(): Promise<HabitExecution[]> {
  return localDB.find({selector: {type: Types.habitExecution}})
    .then(docsResult => docsResult.docs as HabitExecution[]);
}

async function render() {
  const habitsResult = await localDB.find({selector: {type: Types.habit}});
  const habits = habitsResult.docs as Habit[];
  console.log(habits);
  ReactDOM.render(
    <App
      habits={habits}
      addHabit={addHabit}
      deleteHabit={deleteHabit}
      saveHabit={saveHabit}
      executeHabit={executeHabit}
      getHabitExecutions={getHabitExecutions}
    />,
    document.getElementById('root') as HTMLElement
  );

}

registerServiceWorker();
render();