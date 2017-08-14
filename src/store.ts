import {Habit, HabitExecution, NewHabit, NewHabitExecution, Types} from './model';
import {TimeRange} from './utils';
import PouchDB from 'pouchdb';

PouchDB.plugin(require('pouchdb-find').default);

export class Store {
  localDB = new PouchDB('habits');

  constructor(onChange: Function) {
    const remoteDB = new PouchDB('http://localhost:5984/habits');
    this.localDB.createIndex({
      index: {fields: ['type', 'timestamp']}
    });

    this.localDB.sync(remoteDB, {
      live: true,
      retry: true
    }).on('change', change => {
      console.log('sync change', change);
    }).on('error', err => {
      console.error('sync error', err);
      console.log(JSON.stringify(err));
    });


    this.localDB.changes({
      since: 'now',
      live: true,
    }).on('change', changes => {
      console.log('changes', changes);
      onChange();
    }).on('error', err => {
      console.error('changes error', err);
    });

  }

  addHabit = (parentId?: string) => {
    const newHabit: NewHabit = {type: Types.habit, title: 'New', parentId};
    this.localDB.post(newHabit);
  }

  saveHabit = (habit: Habit) => {
    this.localDB.put(habit);
  }

  deleteHabit = (habit: Habit) => {
    this.localDB.remove(habit);
  }

  executeHabit = (habit: Habit, date = new Date()) => {
    const newHabitExecution: NewHabitExecution = {
      type: Types.habitExecution,
      habitId: habit._id,
      timestamp: date.getTime()
    };
    this.localDB.post(newHabitExecution);
  }

  getHabits = (): Promise<Habit[]> => {
    return this.localDB.find({
      selector: {
        type: Types.habit,
      }
    }).then(docsResult => docsResult.docs as Habit[]);
  }

  getHabitExecutions = (timeRange: TimeRange): Promise<HabitExecution[]> => {
    return this.localDB.find({
      selector: {
        type: Types.habitExecution,
        timestamp: {$gt: timeRange.start, $lt: timeRange.end}
      }
    }).then(docsResult => docsResult.docs as HabitExecution[]);
  }
}

