import React from 'react';
import './App.css';
import Header from './search/Header.component';
import * as log from 'loglevel';
import Grid from '@material-ui/core/Grid';
import SelectDates from './search/datePicker.component';
import CheckboxesGroup from './search/checkBoxes.component';
import SearchButton from './search/searchButton.component';
import SearchTextBox from './search/searchTextBox.component';
import PageTable from './pageSearchTable.component';
import thunk from 'redux-thunk';
import { applyMiddleware, createStore, compose } from 'redux';
import AppReducer from './state/reducers/app.reducer';
import {
  createGenerateClassName,
  StylesProvider,
} from '@material-ui/core/styles';
import { Provider } from 'react-redux';

import { Switch, Route, RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';

/* eslint-disable no-underscore-dangle, @typescript-eslint/no-explicit-any */
const composeEnhancers =
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
/* eslint-enable */

const middleware = [thunk];
const store = createStore(
  AppReducer,
  composeEnhancers(applyMiddleware(...middleware))
);

const generateClassName = createGenerateClassName({
  productionPrefix: 'dgws',

  // Only set disable when we are in production and not running e2e tests;
  // ensures class selectors are working on tests.
  disableGlobal:
    process.env.NODE_ENV === 'production' && !process.env.REACT_APP_E2E_TESTING,
});

class App extends React.Component<{}, { hasError: boolean }> {
  public constructor(props: {}) {
    super(props);
    this.state = { hasError: false };
  }

  public componentDidCatch(error: Error | null): void {
    this.setState({ hasError: true });
    log.error(`datagateway_search failed with error: ${error}`);
  }

  public render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="error">
          <div
            style={{
              padding: 20,
              background: 'red',
              color: 'white',
              margin: 5,
            }}
          >
            Something went wrong...
          </div>
        </div>
      );
    } else
      return (
        <div
          style={{
            padding: 10,
            margin: 10,
          }}
          className="App"
        >
          <Provider store={store}>
            <StylesProvider generateClassName={generateClassName}>
              <Grid
                container
                direction="row"
                justify="flex-start"
                alignItems="flex-start"
              >
                <Grid
                  item
                  direction="column"
                  justify="flex-start"
                  alignItems="flex-start"
                >
                  <Grid item>
                    <Header />
                  </Grid>

                  <Grid item>
                    <SearchTextBox />
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

                <Grid item>
                  <Grid item>
                    <PageTable />
                  </Grid>
                </Grid>
              </Grid>
            </StylesProvider>
          </Provider>
        </div>
      );
  }
}

export default App;
