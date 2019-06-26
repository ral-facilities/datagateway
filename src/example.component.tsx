import React from 'react';
import { connect } from 'react-redux';
import { StateType, Investigation } from './state/app.types';
import { sortTable, fetchInvestigations } from './state/actions/actions';
import { Action, AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { CircularProgress } from '@material-ui/core';

interface ExampleComponentProps {
  sort: {
    column: string;
    order: 'ASC' | 'DESC';
  } | null;
  data: Investigation[];
  loading: boolean;
  error: string | null;
}

interface ExampleComponentDispatchProps {
  sortTable: (column: string, order: 'ASC' | 'DESC') => Action;
  fetchInvestigations: () => Promise<void>;
}

type ExampleComponentCombinedProps = ExampleComponentProps &
  ExampleComponentDispatchProps;

const ExampleComponent = (
  props: ExampleComponentCombinedProps
): React.ReactElement => (
  <div>
    <div id="sort_state">{JSON.stringify(props.sort)}</div>
    <button onClick={() => props.sortTable('column1', 'ASC')}>Set sort</button>
    {props.loading && <CircularProgress />}
    <div id="investigation_data">{JSON.stringify(props.data)}</div>
    <div id="investigation_data_error">{JSON.stringify(props.error)}</div>
    <button onClick={() => props.fetchInvestigations()}>Fetch data</button>
  </div>
);

const mapDispatchToProps = (
  dispatch: ThunkDispatch<StateType, null, AnyAction>
): ExampleComponentDispatchProps => ({
  sortTable: (column: string, order: 'ASC' | 'DESC') =>
    dispatch(sortTable(column, order)),
  fetchInvestigations: () => dispatch(fetchInvestigations()),
});

const mapStateToProps = (state: StateType): ExampleComponentProps => {
  return {
    sort: state.dgtable.sort,
    data: state.dgtable.data,
    loading: state.dgtable.loading,
    error: state.dgtable.error,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ExampleComponent);
