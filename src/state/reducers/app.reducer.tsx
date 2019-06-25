import { combineReducers, Reducer } from 'redux';
import dGTableReducer from './dgtable.reducer';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';

const AppReducer = (history: History): Reducer =>
  combineReducers({
    router: connectRouter(history),
    dgtable: dGTableReducer,
  });

export default AppReducer;
