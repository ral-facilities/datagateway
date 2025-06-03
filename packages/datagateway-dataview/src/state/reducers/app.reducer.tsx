import { combineReducers, Reducer } from 'redux';
import dGDataViewReducer from './dgdataview.reducer';
import { dGCommonReducer } from 'datagateway-common';

const AppReducer = (): Reducer =>
  combineReducers({
    dgdataview: dGDataViewReducer,
    dgcommon: dGCommonReducer,
  });

export default AppReducer;
