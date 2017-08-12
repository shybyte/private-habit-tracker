export enum Types {
  habit = 'habit',
  habitExecution = 'habitExecution'
}

export interface PouchDocument {
  _id: string;
  _rev: string;
}

export interface Habit extends PouchDocument {
  type: Types.habit;
  title: string;
}


export interface NewHabitExecution {
  type: Types.habitExecution;
  habitId: string;
  timestamp: number;
}

export interface HabitExecution extends PouchDocument, NewHabitExecution {
}

export type AppPouchDocument = Habit | HabitExecution;
