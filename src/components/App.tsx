import * as React from 'react';
import './App.css';
import {Habit, LatestHabitExecutions} from '../model';
import * as R from 'ramda';
import HabitComponent from './HabitComponent';
import {getDateRangeOfDay, MILLISECONDS_IN_DAY} from '../utils';
import {Store} from '../store';
import Login from './Login';
import {createExecutionCounts, ExecutionCounts, HabitTree, isRootNode} from '../habit-tree';

interface AppProps {
  habitTree: HabitTree;
  latestHabitExecutions: LatestHabitExecutions;
  store: Store;
  isLoggedIn: boolean;
  isOnline: boolean;
}

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
    this.setState({executionCounts: createExecutionCounts(this.props.habitTree, habitExecutions)});
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
    const rootHabitNodes = R.values(props.habitTree.habitTreeNodes)
      .filter(isRootNode);
    const sortedRootHabitNodes = R.sortBy(n => n.habit.title, rootHabitNodes);
    const selectedDate = this.selectedDate();
    const dayStatistic = createDayStatistic(rootHabitNodes.map(n => n.habit), state.executionCounts);
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
          <span className="dayStatistic">
            <span className="positiveCount">+{dayStatistic.positiveCount}</span>
            <span className="negativeCount">-{dayStatistic.negativeCount}</span>
          </span>
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
          {sortedRootHabitNodes.map(habitNode =>
            <HabitComponent
              key={habitNode.habit._id}
              habitNode={habitNode}
              habitTree={props.habitTree}
              latestHabitExecutions={props.latestHabitExecutions}
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

export default App;

function createDayStatistic(rootHabits: Habit[], executionCounts: ExecutionCounts): DayStatistic {
  let positiveCount = 0;
  let negativeCount = 0;

  for (const habit of rootHabits) {
    const executionCount = executionCounts[habit._id];
    if (!executionCount) {
      continue;
    }
    const executionCountComplete = executionCount.children + executionCount.direct;
    if (habit.rating > 0) {
      positiveCount += executionCountComplete;
    } else if (habit.rating < 0) {
      negativeCount += executionCountComplete;
    }
  }

  return {positiveCount, negativeCount};
}

interface DayStatistic {
  positiveCount: number;
  negativeCount: number;
}