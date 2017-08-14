import * as R from 'ramda';
import * as React from 'react';
import './HabitComponent.css';
import {Habit} from '../model';
import {ExecutionCounts} from './App';
import {Store} from '../store';

interface HabitComponentProps {
  habits: Habit[];
  habit: Habit;
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
    this.props.store.saveHabit({...this.props.habit, title: this.titleInput.value});
    this.setState({editingTitle: false});
  }


  render(): JSX.Element {
    const {habit, executionCounts, store, habits, editMode} = this.props;
    const count = executionCounts[habit._id];
    const children = habits.filter(h => h.parentId === habit._id);
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
            {children.map(childHabit =>
              <HabitComponent
                {...this.props}
                key={childHabit._id}
                habit={childHabit}
              />)}
          </div>) : []}

      </div>
    );
  }
}

export default HabitComponent;
