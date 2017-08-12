import * as React from 'react';
import './HabitComponent.css';
import {Habit} from '../model';

interface HabitComponentProps {
  habit: Habit;
  deleteHabit(habit: Habit): void;
  saveHabit(habit: Habit): void;
}

interface HabitComponentState {
  editing: boolean;
}

class HabitComponent extends React.Component<HabitComponentProps, HabitComponentState> {
  state = {
    editing: false
  };
  titleInput: HTMLInputElement;

  startEditing = () => {
    this.setState({editing: true});
  }

  onSubmit = (ev: React.SyntheticEvent<{}>) => {
    ev.preventDefault();
    this.props.saveHabit({...this.props.habit, title: this.titleInput.value});
    this.setState({editing: false});
  }


  render() {
    const {habit} = this.props;
    return (
      <div className="habit" key={habit._id}>
        {this.state.editing ?
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
          : <span onClick={this.startEditing}>{habit.title}</span>
        }
        <div className="habitButtons">
          <button onClick={() => this.props.deleteHabit(habit)}>x</button>
        </div>
      </div>
    );
  }
}

export default HabitComponent;
