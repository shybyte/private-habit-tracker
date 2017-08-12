import * as React from 'react';
import './App.css';
import { Habit } from '../model';
import * as R from 'ramda';
import HabitComponent from './HabitComponent';

interface AppProps {
  habits: Habit[];
  addHabit(): void;
  deleteHabit(habit: Habit): void;
  saveHabit(habit: Habit): void;
}

class App extends React.Component<AppProps, {}> {
  render() {
    const props = this.props;
    const sortedHabits = R.sortBy(h => h.title, props.habits);
    return (
      <div className="app">
        <header className="header">
          <h2>Private Habit Tracker</h2>
        </header>
        <main>
          {sortedHabits.map(habit =>
            <HabitComponent key={habit._id} habit={habit} deleteHabit={props.deleteHabit} saveHabit={props.saveHabit}/>
          )}
          <button onClick={props.addHabit}>+</button>
        </main>
      </div>
    );
  }
}

export default App;
