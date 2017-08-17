import {createExecutionCounts, createHabitTree} from './habit-tree';
import * as assert from 'assert';
import {Habit, Types} from './model';

describe('createExecutionCounts', () => {
  it('works with empty arrays', () => {
    const result = createExecutionCounts([]);
    assert.deepEqual(result, {});
  });

  it('direct', () => {
    const result = createExecutionCounts([{habitId: 'habit1', timestamp: 0}]);
    assert.deepEqual(result, {habit1: {direct: 1, children: 0}});
  });

});


function mockHabit(title: string, parentId?: string): Habit {
  return {
    _id: title,
    _rev: '',
    type: Types.habit,
    title,
    parentId,
  };
}

describe('createHabitTree', () => {
  it('works with empty arrays', () => {
    const result = createHabitTree([]);
    assert.deepEqual(result, {habitTreeNodes: {}});
  });

  it('works with root element', () => {
    const rootElement = mockHabit('root');
    const result = createHabitTree([rootElement]);
    assert.deepEqual(result, {
      habitTreeNodes: {
        root: {
          habit: rootElement,
          children: []
        }
      }
    });
  });

  it('works with root elements', () => {
    const rootElement1 = mockHabit('root1');
    const rootElement2 = mockHabit('root2');
    const result = createHabitTree([rootElement1, rootElement2]);
    assert.deepEqual(result, {
      habitTreeNodes: {
        root1: {
          habit: rootElement1,
          children: []
        },
        root2: {
          habit: rootElement2,
          children: []
        }
      }
    });
  });

  it('works with children elements', () => {
    const rootElement1 = mockHabit('root1');
    const rootElement2 = mockHabit('root2', rootElement1._id);
    const result = createHabitTree([rootElement1, rootElement2]);
    assert.deepEqual(result, {
      habitTreeNodes: {
        root1: {
          habit: rootElement1,
          children: [rootElement2._id]
        },
        root2: {
          habit: rootElement2,
          children: []
        }
      }
    });
  });

  it('works with grand children elements', () => {
    const opa = mockHabit('opa');
    const vater = mockHabit('vater', opa._id);
    const kind1 = mockHabit('kind1', vater._id);
    const kind2 = mockHabit('kind2', vater._id);
    const result = createHabitTree([opa, vater, kind1, kind2]);
    assert.deepEqual(result, {
      habitTreeNodes: {
        opa: {
          habit: opa,
          children: [vater._id]
        },
        vater: {
          habit: vater,
          children: [kind1._id, kind2._id]
        },
        kind1: {
          habit: kind1,
          children: []
        },
        kind2: {
          habit: kind2,
          children: []
        }
      }
    });
  });

});