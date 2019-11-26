import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './state/reducers/app.reducer';

const initialState = {
  searchText: '',
  Investigation: true,
  Dataset: true,
  Datafile: true,
  startDate: '2001-01-01',
  endDate: '2019-01-01',
};

const middleware = [thunk];

const store = createStore(
    rootReducer,
    initialState, 
    applyMiddleware(...middleware));

export default store;