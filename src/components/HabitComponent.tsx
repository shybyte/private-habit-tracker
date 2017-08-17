import * as R from 'ramda';
import * as React from 'react';
import './HabitComponent.css';
import {ExecutionCounts} from './App';
import {Store} from '../store';
import {HabitTree, HabitTreeNode} from '../habit-tree';

interface HabitComponentProps {
  habitTree: HabitTree;
  habitNode: HabitTreeNode;
  executionCounts: ExecutionCounts;
  store: Store;
  editMode: boolean;
}

interface HabitComponentState {
  editingTitle: boolean;
}

class HabitComponent extends React.Component<HabitComponentProps, HabitComponentState> {
  state = {
    editingTitle: false
  };
  titleInput: HTMLInputElement;

  startEditingTitle = () => {
    if (this.props.editMode) {
      this.setState({editingTitle: true});
    }
  }

  onSubmit = (ev: React.SyntheticEvent<{}>) => {
    ev.preventDefault();
    this.props.store.saveHabit({...this.props.habitNode.habit, title: this.titleInput.value});
    this.setState({editingTitle: false});
  }


  render(): JSX.Element {
    const {habitNode, executionCounts, store, habitTree, editMode} = this.props;
    const habit = habitNode.habit;
    const count = executionCounts[habit._id];
    const children = habitNode.children.map(id => habitTree.habitTreeNodes[id]);
    return (
      <div className="habit" key={habit._id}>
        {this.state.editingTitle ?
          <form onSubmit={this.onSubmit}>
            <input
              defaultValue={habit.title}
              ref={el => {
                if (el) {
                  el.focus();
                  this.titleInput = el;
                }
              }}
            />
          </form>
          : <span onClick={this.startEditingTitle}>{habit.title}</span>
        }
        <div className="habitButtons">
          <button onClick={() => store.executeHabit(habit)}>{count || '+'}</button>
          {editMode ? <button onClick={() => store.addHabit(habit._id)}>New</button> : []}
          {editMode ? <button onClick={() => store.deleteHabit(habit)}>x</button> : []}
        </div>

        {!R.isEmpty(children) ? (
          <div>
            {children.map(childHabitNode =>
              <HabitComponent
                {...this.props}
                key={childHabitNode.habit._id}
                habitNode={childHabitNode}
              />)}
          </div>) : []}

      </div>
    );
  }
}

export default HabitComponent;
