import React from 'react';
import { connect } from 'react-redux';
import { StateType } from './state/app.types';
import { sortTable } from './state/actions/actions';
import { Dispatch, Action } from 'redux';

interface ExampleComponentProps {
  sort: {
    column: string;
    order: 'ASC' | 'DESC';
  } | null;
}

interface ExampleComponentDispatchProps {
  sortTable: (column: string, order: 'ASC' | 'DESC') => Action;
}

type ExampleComponentCombinedProps = ExampleComponentProps &
  ExampleComponentDispatchProps;

const ExampleComponent = (
  props: ExampleComponentCombinedProps
): React.ReactElement => (
  <div>
    <div id="sort_state">{JSON.stringify(props.sort)}</div>
    <button onClick={() => props.sortTable('column1', 'ASC')}>Set sort</button>
  </div>
);

const mapDispatchToProps = (
  dispatch: Dispatch
): ExampleComponentDispatchProps => ({
  sortTable: (column: string, order: 'ASC' | 'DESC') =>
    dispatch(sortTable(column, order)),
});

const mapStateToProps = (state: StateType): ExampleComponentProps => {
  return {
    sort: state.dgtable.sort,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ExampleComponent);
