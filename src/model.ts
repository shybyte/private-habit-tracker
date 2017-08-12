export enum Types {
  habit = 'habit'
}

export interface PouchObject {
  _id: string;
  _rev: string;
}

export interface Habit extends PouchObject {
  type: Types.habit;
  title: string;
}