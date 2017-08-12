import * as React from 'react';
import './App.css';
import {Habit, HabitExecution} from '../model';
import * as R from 'ramda';
import HabitComponent from './HabitComponent';

interface AppProps {
  habits: Habit[];
  addHabit(): void;
  deleteHabit(habit: Habit): void;
  saveHabit(habit: Habit): void;
  executeHabit(habit: Habit): void;
  getHabitExecutions(): Promise<HabitExecution[]>;
}

export type ExecutionCounts = { [habitId: string]: number };

interface AppState {
  executionCounts: ExecutionCounts;
  day: number;
}

class App extends React.Component<AppProps, AppState> {
  state = {
    executionCounts: {},
    day: 0
  };

  async componentDidMount() {
    this.updateCounts();
  }

  componentWillReceiveProps() {
    this.updateCounts();
  }

  async updateCounts() {
    const habitExecutions = await this.props.getHabitExecutions();
    console.log('habitExecutions', habitExecutions);
    this.setState({executionCounts: createExecutionCounts(habitExecutions)});
  }

  render() {
    const props = this.props;
    const sortedHabits = R.sortBy(h => h.title, props.habits);
    const displayedDate = new Date(Date.now() - this.state.day * 1000 * 60 * 60 * 24);
    const displayedDateString = displayedDate.getDate() + '.'
      + (displayedDate.getMonth() + 1) + '.'
      + displayedDate.getFullYear();
    return (
      <div className="app">
        <header className="header">
          <h2>Private Habit Tracker</h2>
        </header>
        <main>
          <div className="selectedDate">
            {displayedDateString}
          </div>
          {sortedHabits.map(habit =>
            <HabitComponent
              key={habit._id}
              habit={habit}
              executionCounts={this.state.executionCounts}
              deleteHabit={props.deleteHabit}
              saveHabit={props.saveHabit}
              executeHabit={props.executeHabit}
            />
          )}
          <button onClick={props.addHabit}>+</button>
        </main>
      </div>
    );
  }
}

function createExecutionCounts(executions: HabitExecution[]): ExecutionCounts {
  return R.countBy(e => e.habitId, executions);
}

export default App;
