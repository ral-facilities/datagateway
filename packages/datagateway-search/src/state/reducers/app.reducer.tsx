import { combineReducers } from 'redux';
import DGSearchReducer from './dgsearch.reducer';
import { dGCommonReducer } from 'datagateway-common';

const AppReducer = combineReducers({
  dgsearch: DGSearchReducer,
  dgcommon: dGCommonReducer,
});

export default AppReducer;
