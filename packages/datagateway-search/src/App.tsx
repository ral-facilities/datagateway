import React from 'react';
import './App.css';
import Header from './search/Header.component';
import * as log from 'loglevel';
import Grid from '@material-ui/core/Grid';
import SelectDates from './search/datePicker.component';
import CheckboxesGroup from './search/checkBoxes.component';
import SearchButton from './search/searchButton.component';
import SearchTextBox from './search/searchTextBox.component';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { applyMiddleware, createStore, compose } from 'redux';
import AppReducer from './state/reducers/app.reducer';

/* eslint-disable no-underscore-dangle, @typescript-eslint/no-explicit-any */
const composeEnhancers =
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
/* eslint-enable */

const middleware = [thunk];
const store = createStore(
  AppReducer,
  composeEnhancers(applyMiddleware(...middleware))
);

class App extends React.Component<{}, { hasError: boolean }> {
  public constructor(props: {}) {
    super(props);
    this.state = { hasError: false };
    
import {
  createGenerateClassName,
  StylesProvider,
} from '@material-ui/core/styles';

const generateClassName = createGenerateClassName({
  productionPrefix: 'dgws',

  // Only set disable when we are in production and not running e2e tests;
  // ensures class selectors are working on tests.
  disableGlobal:
    process.env.NODE_ENV === 'production' && !process.env.REACT_APP_E2E_TESTING,
});

class App extends React.Component {
  public componentDidCatch(error: Error | null): void {
    this.setState({ hasError: true });
    log.error(`datagateway-search-plugin failed with error: ${error}`);
  }

  public componentDidCatch(error: Error | null): void {
    this.setState({ hasError: true });
    log.error(`datagateway_search failed with error: ${error}`);
  }

  public render(): React.ReactElement {
    return (
      <div
        style={{
          padding: 15,
          margin: 10,
        }}
        className="App"
      >
        <StylesProvider generateClassName={generateClassName}>
          <Grid
            container
            direction="column"
            justify="flex-start"
            alignItems="flex-start"
          >
            <Grid item>
              <Header />
              <p> Fill out form and then click search. </p>
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
              <SelectDates startOrEnd="Start Date" />
              <br></br>
              <SelectDates startOrEnd="End Date" />
            </Grid>

            <Grid item>
              <Checkboxes />
            </Grid>

            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={this.handleClick}
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </StylesProvider>
      </div>
    );
  }
}

export default App;
