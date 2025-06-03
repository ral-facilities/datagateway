import { combineReducers, Reducer } from 'redux';
import DGSearchReducer from './dgsearch.reducer';
import { dGCommonReducer } from 'datagateway-common';

const AppReducer = (): Reducer =>
  combineReducers({
    dgsearch: DGSearchReducer,
    dgcommon: dGCommonReducer,
  });

export default AppReducer;
