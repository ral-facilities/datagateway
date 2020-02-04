import { combineReducers } from 'redux';
import DGSearchReducer from './dgsearch.reducer';

const AppReducer = combineReducers({
  dgsearch: DGSearchReducer,
  // dgcommon:
});

export default AppReducer;
