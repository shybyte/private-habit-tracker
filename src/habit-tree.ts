import * as R from 'ramda';
import {Habit, HabitExecutionContent, isRootHabit} from './model';


export interface HabitTree {
  habitTreeNodes: { [habitId: string]: HabitTreeNode };
}

export interface HabitTreeNode {
  habit: Habit;
  children: string[];
}

export function createHabitTree(habits: Habit[]): HabitTree {
  const habitTreeNodesList = habits.map(habit => ({habit, children: []}));
  const habitTree: HabitTree = {
    habitTreeNodes: R.indexBy((node => node.habit._id), habitTreeNodesList)
  };
  for (const node of habitTreeNodesList) {
    if (node.habit.parentId) {
      const parentNode = habitTree.habitTreeNodes[node.habit.parentId];
      if (parentNode) {
        parentNode.children.push(node.habit._id);
      } else {
        console.error(`Habit ${node.habit.title} has invalid parentId ${node.habit.parentId}`);
      }
    }
  }
  return habitTree;
}

export function isRootNode(node: HabitTreeNode) {
  return isRootHabit(node.habit);
}


type ExecutionCounts = { [habitId: string]: { direct: number, children: number } };

export function createExecutionCounts(executions: HabitExecutionContent[]): ExecutionCounts {
  const executionCounts = R.mapObjIndexed((value: number, key) => ({
    direct: value,
    children: 0
  }),                                     R.countBy(e => e.habitId, executions));
  return executionCounts;
}


