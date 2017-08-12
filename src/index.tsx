import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './components/App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import PouchDB from 'pouchdb';
import { Habit, Types } from './model';

const localDB = new PouchDB('habits');
const remoteDB = new PouchDB('http://localhost:5984/habits');

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

async function render() {
  const docs = await localDB.allDocs({include_docs: true});
  const habits: Habit[] = docs.rows.map(doc => doc.doc as any);
  console.log(docs, habits);
  ReactDOM.render(
    <App habits={habits} addHabit={addHabit} deleteHabit={deleteHabit} saveHabit={saveHabit} />,
    document.getElementById('root') as HTMLElement
  );

}

registerServiceWorker();
render();