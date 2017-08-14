import * as React from 'react';
import './App.css';
import {Habit, HabitExecution, isRootHabit} from '../model';
import * as R from 'ramda';
import HabitComponent from './HabitComponent';
import {getDateRangeOfDay, MILLISECONDS_IN_DAY} from '../utils';
import {Store} from '../store';

interface AppProps {
  habits: Habit[];
  store: Store;
}

export type ExecutionCounts = { [habitId: string]: number };

interface AppState {
  executionCounts: ExecutionCounts;
  selectedDay: number;  // 0 = today, -1 = yesterday ...
}

class App extends React.Component<AppProps, AppState> {
  state = {
    executionCounts: {},
    selectedDay: 0
  };

  async componentDidMount() {
    this.updateCounts();
  }

  componentWillReceiveProps() {
    this.updateCounts();
  }

  async updateCounts() {
    const habitExecutions = await this.props.store.getHabitExecutions(getDateRangeOfDay(this.selectedDate()));
    console.log('habitExecutions', habitExecutions);
    this.setState({executionCounts: createExecutionCounts(habitExecutions)});
  }

  selectedDate = () => new Date(Date.now() + this.state.selectedDay * MILLISECONDS_IN_DAY);

  render() {
    const props = this.props;
    const state = this.state;
    const sortedRootHabits = R.sortBy(h => h.title, props.habits.filter(isRootHabit));
    const selectedDate = this.selectedDate();
    const selectedDateString = selectedDate.getDate() + '.'
      + (selectedDate.getMonth() + 1) + '.'
      + selectedDate.getFullYear();
    return (
      <div className="app">
        <header className="header">
          <h2>Private Habit Tracker</h2>
        </header>
        <main>
          <div className="selectedDate">
            <button onClick={() => this.changeDayByDelta(-1)}>&lt;</button>
            {selectedDateString}
            <button disabled={state.selectedDay >= 0} onClick={() => this.changeDayByDelta(1)}>&gt;</button>
          </div>
          {sortedRootHabits.map(habit =>
            <HabitComponent
              key={habit._id}
              habit={habit}
              habits={props.habits}
              executionCounts={this.state.executionCounts}
              store={props.store}
            />
          )}
          <button onClick={() => props.store.addHabit()}>+</button>
        </main>
      </div>
    );
  }

  private changeDayByDelta(delta: number) {
    this.setState({selectedDay: this.state.selectedDay + delta}, () => this.updateCounts());
  }
}

function createExecutionCounts(executions: HabitExecution[]): ExecutionCounts {
  return R.countBy(e => e.habitId, executions);
}

export default App;
