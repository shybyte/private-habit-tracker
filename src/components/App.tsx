import * as React from 'react';
import Modal from 'react-modal';
import './App.css';
import {Habit, LatestHabitExecutions} from '../model';
import * as R from 'ramda';
import HabitComponent from './HabitComponent';
import {getDateForHour, getDateRangeOfDay, MILLISECONDS_IN_DAY} from '../utils';
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
  executeHabitDialog?: Habit;
}

class App extends React.Component<AppProps, AppState> {
  hourInput: HTMLInputElement;

  state = {
    executionCounts: {},
    selectedDay: 0,
    editMode: false,
    executeHabitDialog: undefined
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

  closeModal = () => {
    this.setState({executeHabitDialog: undefined});
  }

  executeHabit = (habit: Habit) => {
    if (this.state.editMode) {
      this.setState({executeHabitDialog: habit});
    } else {
      this.props.store.executeHabit(habit);
    }
  }

  onSubmitExecution = (ev: React.SyntheticEvent<{}>) => {
    console.log('onSubmitExecution');
    ev.preventDefault();
    const hours = parseInt(this.hourInput.value, 10);
    const date = getDateForHour(this.selectedDate(), hours);
    this.props.store.executeHabit(this.state.executeHabitDialog!, date);
    this.closeModal();
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
        <Modal
          isOpen={!!this.state.executeHabitDialog}
          onRequestClose={this.closeModal}
          contentLabel="Example Modal"
          className="dialog"
        >
          <form onSubmit={this.onSubmitExecution}>
          <input
            type="number"
            placeholder="Hour"
            step={1}
            min={0}
            max={24}
            defaultValue={'' + new Date().getHours()}
            ref={el => {
              if (el) {
                this.hourInput = el!;
                el.focus();
              }
            }}
          />
            <button>Save</button>
          </form>
        </Modal>
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
              executeHabit={this.executeHabit}
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