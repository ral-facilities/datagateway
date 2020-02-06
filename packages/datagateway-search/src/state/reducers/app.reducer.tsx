import { combineReducers } from 'redux';
import DGSearchReducer from './dgsearch.reducer';

const AppReducer = combineReducers({
  dgsearch: DGSearchReducer,
});

export default AppReducer;
