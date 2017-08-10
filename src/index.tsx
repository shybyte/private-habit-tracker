import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import PouchDB from 'pouchdb';

const localDB = new PouchDB('kittens');
const remoteDB = new PouchDB('http://localhost:5984/kittens');

localDB.sync(remoteDB, {
  live: true,
  retry: true
}).on('change', function (change) {
  console.log('change', change);
}).on('error', function (err) {
  console.error(err);
  console.log(JSON.stringify(err));
});

function get () {
  localDB.get('mittens').then(function (doc) {
    console.log(doc);
  });
}


ReactDOM.render(
  <App />,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();


get();