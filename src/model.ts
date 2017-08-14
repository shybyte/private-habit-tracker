export enum Types {
  habit = 'habit',
  habitExecution = 'habitExecution'
}

export interface PouchDocument {
  _id: string;
  _rev: string;
}

export interface NewHabit {
  type: Types.habit;
  title: string;
  parentId?: string;
}

export interface Habit extends NewHabit, PouchDocument {
}


export interface NewHabitExecution {
  type: Types.habitExecution;
  habitId: string;
  timestamp: number;
}

export interface HabitExecution extends PouchDocument, NewHabitExecution {
}

export type AppPouchDocument = Habit | HabitExecution;

export function isRootHabit(habit: Habit) {
  return !habit.parentId;
}