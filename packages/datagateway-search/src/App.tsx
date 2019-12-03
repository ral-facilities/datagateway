import React from 'react';
import './App.css';
import Header from './search/Header';
import * as log from 'loglevel';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import SelectDates from './search/datePicker';
import CheckboxesGroup from './search/checkBoxes';
import SearchButton from './search/searchButton';
import axios from 'axios';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { applyMiddleware, createStore } from 'redux';
import AppReducer from './state/reducers/app.reducer';
import { StateType } from './state/app.types';

const middleware = [thunk];
const store = createStore(AppReducer, applyMiddleware(...middleware));

class App extends React.Component {
  public componentDidCatch(error: Error | null): void {
    log.error(`datagateway-search-plugin failed with error: ${error}`);
  }

  public render(): React.ReactNode {
    return (
      <div
        style={{
          padding: 15,
          margin: 10,
        }}
        className="App"
      >
        <Provider store={store}>
          <Grid
            container
            direction="column"
            justify="flex-start"
            alignItems="flex-start"
          >
            <Grid item>
              <Header />
            </Grid>

            <Grid item>
              <TextField
                id="filled-search"
                label="Search Text"
                type="search"
                margin="normal"
              />
            </Grid>

            <Grid item>
              <SelectDates />
            </Grid>

            <Grid item>
              <CheckboxesGroup />
            </Grid>

            <Grid item>
              <SearchButton />
            </Grid>
          </Grid>
        </Provider>
      </div>
    );
  }
}

export default App;
