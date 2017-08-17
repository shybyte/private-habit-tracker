import * as React from 'react';
import './App.css';
import {HabitExecution} from '../model';
import * as R from 'ramda';
import HabitComponent from './HabitComponent';
import {getDateRangeOfDay, MILLISECONDS_IN_DAY} from '../utils';
import {Store} from '../store';
import Login from './Login';
import {HabitTree, isRootNode} from '../habit-tree';

interface AppProps {
  habitTree: HabitTree;
  store: Store;
  isLoggedIn: boolean;
  isOnline: boolean;
}

export type ExecutionCounts = { [habitId: string]: number };

interface AppState {
  executionCounts: ExecutionCounts;
  selectedDay: number;  // 0 = today, -1 = yesterday ...
  editMode: boolean;
}

class App extends React.Component<AppProps, AppState> {
  state = {
    executionCounts: {},
    selectedDay: 0,
    editMode: false,
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

  onClickEditModeCheckBox = (ev: React.SyntheticEvent<HTMLInputElement>) => {
    this.setState({editMode: ev.currentTarget.checked});
  }

  onLogout = () => {
    this.props.store.logout();
  }

  render() {
    const props = this.props;
    const {isLoggedIn, isOnline} = props;
    const state = this.state;
    const {editMode} = state;
    const sortedRootHabits = R.sortBy(n => n.habit.title, R.values(props.habitTree.habitTreeNodes).filter(isRootNode));
    const selectedDate = this.selectedDate();
    const selectedDateString = selectedDate.getDate() + '.'
      + (selectedDate.getMonth() + 1) + '.'
      + selectedDate.getFullYear();
    return (
      <div className="app">
        <header className="header">
          {isLoggedIn && isOnline ? <button className="logoutButton" onClick={this.onLogout}>Logout</button> :
            []}
          {isOnline ? [] : <span className="offlineMarker">Offline</span>}
          <h2>Private Habit Tracker</h2>
          {isOnline && !isLoggedIn ? <Login store={props.store}/> : []}
          <label className="editModeCheckbox">
            <input type="checkbox" checked={editMode} onClick={this.onClickEditModeCheckBox}/> Edit
          </label>
          <div className="selectedDate">
            <button onClick={() => this.changeDayByDelta(-1)}>&lt;</button>
            {selectedDateString}
            <button disabled={state.selectedDay >= 0} onClick={() => this.changeDayByDelta(1)}>&gt;</button>
          </div>
        </header>
        <main>
          {sortedRootHabits.map(habitNode =>
            <HabitComponent
              key={habitNode.habit._id}
              habitNode={habitNode}
              habitTree={props.habitTree}
              executionCounts={this.state.executionCounts}
              store={props.store}
              editMode={editMode}
            />
          )}
          {editMode ? <button onClick={() => props.store.addHabit()}>+</button> : []}
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
