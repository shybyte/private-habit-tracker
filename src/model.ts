/**
 * Value between -1 and 1, 1 is good, -1 is bad
 */
export type Rating = number;

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
  rating: Rating;
}

export interface Habit extends NewHabit, PouchDocument {
}


export interface NewHabitExecution extends HabitExecutionContent {
  type: Types.habitExecution;
}

export interface HabitExecutionContent {
  habitId: string;
  timestamp: number;
}

export interface HabitExecution extends PouchDocument, NewHabitExecution {
}

export type AppPouchDocument = Habit | HabitExecution;

export function isRootHabit(habit: Habit) {
  return !habit.parentId;
}

export type LatestHabitExecutionsByHabit = { [habitId: string]: HabitExecution};
export type LatestHabitExecutions = {
  latestByHabit: LatestHabitExecutionsByHabit;
};