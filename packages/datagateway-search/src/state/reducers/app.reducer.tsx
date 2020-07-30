import { combineReducers, Reducer } from 'redux';
import DGSearchReducer from './dgsearch.reducer';
import { dGCommonReducer } from 'datagateway-common';
import { connectRouter } from 'connected-react-router';
// history package is part of react-router, which we depend on
// eslint-disable-next-line import/no-extraneous-dependencies
import { History } from 'history';

const AppReducer = (history: History): Reducer =>
  combineReducers({
    router: connectRouter(history),
    dgsearch: DGSearchReducer,
    dgcommon: dGCommonReducer,
  });

export default AppReducer;
