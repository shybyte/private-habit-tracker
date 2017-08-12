import * as React from 'react';
import './App.css';
import { Habit } from '../model';
import * as R from 'ramda';

interface AppProps {
  habits: Habit[];

  addHabit(): void;

  deleteHabit(habit: Habit): void;
}

class App extends React.Component<AppProps, {}> {
  render() {
    const sortedHabits = R.sortBy(h => h.title, this.props.habits);
    return (
      <div className="app">
        <header className="header">
          <h2>Private Habit Tracker</h2>
        </header>
        <main>
          {sortedHabits.map(habit =>
            <div className="habit" key={habit._id}>
              {habit.title}
              <div className="habitButtons">
                <button onClick={() => this.props.deleteHabit(habit)}>x</button>
              </div>
            </div>
          )}
          <button onClick={this.props.addHabit}>+</button>
        </main>
      </div>
    );
  }
}

export default App;
