import * as R from 'ramda';
import * as React from 'react';
import './HabitComponent.css';
import {Store} from '../store';
import {ExecutionCounts, HabitTree, HabitTreeNode} from '../habit-tree';
import {LatestHabitExecutions, Rating} from '../model';
import TimeAgo from 'react-timeago';
import classNames = require('classnames');

interface HabitComponentProps {
  habitTree: HabitTree;
  latestHabitExecutions: LatestHabitExecutions;
  habitNode: HabitTreeNode;
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
  ratingInput: HTMLInputElement;

  startEditingTitle = () => {
    if (this.props.editMode) {
      this.setState({editingTitle: true});
    }
  }

  onSubmit = (ev: React.SyntheticEvent<{}>) => {
    console.log('onSubmit');
    ev.preventDefault();
    this.props.store.saveHabit({
      ...this.props.habitNode.habit,
      title: this.titleInput.value,
      rating: parseFloat(this.ratingInput.value)
    });
    this.setState({editingTitle: false});
  }

  render(): JSX.Element {
    const {habitNode, executionCounts, store, habitTree, editMode} = this.props;
    const habit = habitNode.habit;
    const executionCount = executionCounts[habit._id];
    const directCount = (executionCount && executionCount.direct) || 0;
    const childrenExecutionsCount = (executionCount && executionCount.children) || 0;
    const children = habitNode.children.map(id => habitTree.habitTreeNodes[id]);
    const latestExecution = this.props.latestHabitExecutions.latestByHabit[habit._id];
    return (
      <div
        className={classNames('habit', getRatingClassName(habit.rating), {
          doneToday: directCount > 0
        })}
        key={habit._id}
      >
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
            <input
              type="number"
              placeholder="multiple of 10"
              step={1}
              min={-1}
              max={1}
              defaultValue={'' + ( habit.rating || 0)}
              ref={el => {
                this.ratingInput = el!;
              }}
            />
            <button>Save</button>
          </form>
          : <span onClick={this.startEditingTitle} title={'Rating ' + habit.rating}>{habit.title}</span>
        }
        {latestExecution ? <TimeAgo className="timeAgo" date={new Date(latestExecution.timestamp)}/> : ''}
        <div className="habitButtons">
          {childrenExecutionsCount ?
            <span className="childrenExecutionCount">{childrenExecutionsCount + directCount}</span> : []
          }
          <button onClick={() => store.executeHabit(habit)}>{directCount || '+'}</button>
          {editMode ? <button onClick={() => store.addHabit(habit._id)}>New</button> : []}
          {editMode ? <button onClick={() => store.deleteHabit(habit)}>x</button> : []}
        </div>

        {!R.isEmpty(children) ? (
          <div>
            {children.map(childHabitNode =>
              <HabitComponent
                {...this.props}
                key={childHabitNode.habit._id}
                habitNode={childHabitNode}
              />)}
          </div>) : []}

      </div>
    );
  }
}

export default HabitComponent;


function getRatingClassName(rating: Rating) {
  if (rating > 0) {
    return 'positiveRating';
  } else if (rating < 0) {
    return 'negativeRating';
  } else {
    return 'neutralRating';
  }
}