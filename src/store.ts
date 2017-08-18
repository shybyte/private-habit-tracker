import {Habit, HabitExecution, LatestHabitExecutions, NewHabit, NewHabitExecution, Types} from './model';
import {MILLISECONDS_IN_DAY, TimeRange} from './utils';
import PouchDB from 'pouchdb';

PouchDB.plugin(require('pouchdb-find').default);
PouchDB.plugin(require('pouchdb-authentication'));

interface DatabaseConfig {
  localDB: string;
  remoteDB: string;
}

export class Store {
  localDB: PouchDB.Database;
  remoteDB: PouchDB.Database;
  syncEmitter: PouchDB.Replication.Sync<any>;

  constructor(config: DatabaseConfig, private onChange: Function) {
    this.localDB = new PouchDB(config.localDB);
    this.remoteDB = new PouchDB(config.remoteDB);

    this.localDB.createIndex({
      index: {fields: ['type', 'timestamp']}
    });
    this.localDB.createIndex({
      index: {fields: ['timestamp', 'habitId']}
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


  async getLatestHabitExecutions(habitIds: string[]): Promise<LatestHabitExecutions> {
    const executionsLastMonth = (await this.localDB.find({
      selector: {
        timestamp: {$gt: Date.now() - MILLISECONDS_IN_DAY * 31},
      },
      sort: ['timestamp'],
    })).docs as HabitExecution[];

    const latestByHabit = {};
    for (const execution of executionsLastMonth) {
      latestByHabit[execution.habitId] = execution;
    }

    return {
      latestByHabit
    };

  }

  getLatestHabitExecution = (habitId: string): Promise<HabitExecution | undefined> => {
    return this.localDB.find({
      selector: {
        timestamp: {$gt: 0},
        habitId: habitId
      },
      sort: [{timestamp: 'desc'}],
      limit: 1
    }).then(r => {
      return r.docs[0] as HabitExecution;
    });
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

