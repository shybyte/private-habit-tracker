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


type ExecutionCount = { direct: number, children: number };
export type ExecutionCounts = { [habitId: string]: ExecutionCount };

export function createExecutionCounts(habitTree: HabitTree, executions: HabitExecutionContent[]): ExecutionCounts {
  const directCounts = R.countBy(e => e.habitId, executions);

  const executionCounts: ExecutionCounts = R.mapObjIndexed<HabitTreeNode, ExecutionCount, {}>(node => ({
    direct: directCounts[node.habit._id] || 0,
    children: 0
  }),                                                                                         habitTree.habitTreeNodes);

  const nodesFifo: HabitTreeNode[] = R.values(habitTree.habitTreeNodes)
    .filter(node => R.isEmpty(node.children) && node.habit.parentId);

  const countedHabitIds = new Set();

  while (!R.isEmpty(nodesFifo)) {
    const node = nodesFifo.shift()!;
    if (countedHabitIds.has(node.habit._id)) {
      continue;
    }
    countedHabitIds.add(node.habit._id);
    const nodeExecutionCount = executionCounts[node.habit._id];
    const parent = habitTree.habitTreeNodes[node.habit.parentId!];
    if (parent) {
      executionCounts[parent.habit._id].children += nodeExecutionCount.direct + nodeExecutionCount.children;
      if (parent.habit.parentId) {
        nodesFifo.push(parent);
      }
    }

  }

  return executionCounts;
}


