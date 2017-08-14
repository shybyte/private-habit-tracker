import {Habit, HabitExecution, NewHabit, NewHabitExecution, Types} from './model';
import {TimeRange} from './utils';
import PouchDB from 'pouchdb';

PouchDB.plugin(require('pouchdb-find').default);
PouchDB.plugin(require('pouchdb-authentication'));

export class Store {
  localDB = new PouchDB('habits');
  remoteDB = new PouchDB('http://localhost:5984/habits');
  syncEmitter: PouchDB.Replication.Sync<any>;

  constructor(private onChange: Function) {
    this.localDB.createIndex({
      index: {fields: ['type', 'timestamp']}
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

    this.startSync();
  }

  private startSync() {
    console.log('startSync ... ');
    if (this.syncEmitter) {
      console.log('listenerCount', this.syncEmitter.listenerCount('change'));
      this.syncEmitter.removeAllListeners();
    }
    this.syncEmitter = this.localDB.sync(this.remoteDB, {
      live: true,
      retry: true
    }).on('change', this.onSyncChange)
      .on('error', this.onSyncError);
  }

  addHabit = (parentId?: string) => {
    const newHabit: NewHabit = {type: Types.habit, title: 'New', parentId};
    this.localDB.post(newHabit);
  }

  onSyncChange = (change: any) => {
    console.log('sync change', change);
    this.onChange();
  }

  onSyncError = (err: any) => {
    console.error('sync error', err);
    console.log(JSON.stringify(err));
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

  // err.name === 'forbidden' => invalid username
  login(username: string, password: string) {
    return this.remoteDB.login(username, password).then(
      (result) => {
        this.startSync();
        this.onChange();
        return result;
      },
      (err) => {
        this.onChange();
        throw err;
      });
  }

  logout() {
    return this.remoteDB.logout().then(
      (result) => {
        this.onChange();
        return result;
      },
      (err) => {
        this.onChange();
        throw err;
      });
  }

  isLoggedIn() {
    return this.remoteDB.getSession().then((session) => {
      console.log('session', session);
      return !!session.userCtx.name;
    });
  }
}

