import { combineReducers, Reducer } from 'redux';
import dGTableReducer from './dgtable.reducer';
import { connectRouter } from 'connected-react-router';
// history package is part of react-router, which we depend on
// eslint-disable-next-line import/no-extraneous-dependencies
import { History } from 'history';

// import common reducer

const AppReducer = (history: History): Reducer =>
  combineReducers({
    router: connectRouter(history),
    dgtable: dGTableReducer,
    dgcommon: dGCommonReducer,
  });

export default AppReducer;
