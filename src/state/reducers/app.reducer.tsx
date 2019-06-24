import { combineReducers, Reducer } from 'redux';
import dGTableReducer from './dgtable.reducer';

const AppReducer = (): Reducer =>
  combineReducers({
    dgtable: dGTableReducer,
  });

export default AppReducer;
