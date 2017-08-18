import {createExecutionCounts, createHabitTree} from './habit-tree';
import * as assert from 'assert';
import {Habit, Types} from './model';

describe('createExecutionCounts', () => {
  const opa = mockHabit('opa');
  const vater = mockHabit('vater', opa._id);
  const kind1 = mockHabit('kind1', vater._id);
  const kind2 = mockHabit('kind2', vater._id);

  const habitTree = createHabitTree([opa, vater, kind1, kind2]);


  it('works with empty arrays', () => {
    const result = createExecutionCounts(habitTree, []);
    assert.deepEqual(result, {
      kind1: {children: 0, direct: 0},
      kind2: {children: 0, direct: 0},
      opa: {children: 0, direct: 0},
      vater: {children: 0, direct: 0}
    });
  });

  it('direct', () => {
    const result = createExecutionCounts(habitTree, [{habitId: opa._id, timestamp: 0}]);
    assert.deepEqual(result, {
      kind1: {children: 0, direct: 0},
      kind2: {children: 0, direct: 0},
      opa: {children: 0, direct: 1},
      vater: {children: 0, direct: 0}
    });
  });

  it('add child values upwards', () => {
    const result = createExecutionCounts(habitTree, [
      {habitId: kind1._id, timestamp: 0},
      {habitId: kind2._id, timestamp: 0},
      {habitId: kind2._id, timestamp: 0}
    ]);
    assert.deepEqual(result, {
      opa: {direct: 0, children: 3},
      vater: {direct: 0, children: 3},
      kind1: {direct: 1, children: 0},
      kind2: {direct: 2, children: 0},
    });
  });

});


function mockHabit(title: string, parentId?: string): Habit {
  return {
    _id: title,
    _rev: '',
    type: Types.habit,
    rating: 0,
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