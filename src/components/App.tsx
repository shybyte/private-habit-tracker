import * as React from 'react';
import './App.css';
import {Habit, HabitExecution} from '../model';
import * as R from 'ramda';
import HabitComponent from './HabitComponent';
import {getDateRangeOfDay, MILLISECONDS_IN_DAY, TimeRange} from '../utils';

interface AppProps {
  habits: Habit[];
  addHabit(): void;
  deleteHabit(habit: Habit): void;
  saveHabit(habit: Habit): void;
  executeHabit(habit: Habit): void;
  getHabitExecutions(timeRange: TimeRange): Promise<HabitExecution[]>;
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
    const habitExecutions = await this.props.getHabitExecutions(getDateRangeOfDay(this.selectedDate()));
    console.log('habitExecutions', habitExecutions);
    this.setState({executionCounts: createExecutionCounts(habitExecutions)});
  }

  selectedDate = () => new Date(Date.now() + this.state.selectedDay * MILLISECONDS_IN_DAY);

  render() {
    const props = this.props;
    const state = this.state;
    const sortedHabits = R.sortBy(h => h.title, props.habits);
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

  private changeDayByDelta(delta: number) {
    this.setState({selectedDay: this.state.selectedDay + delta}, () => this.updateCounts());
  }
}

function createExecutionCounts(executions: HabitExecution[]): ExecutionCounts {
  return R.countBy(e => e.habitId, executions);
}

export default App;
