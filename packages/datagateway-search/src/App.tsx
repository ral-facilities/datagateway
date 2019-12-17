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
          </Provider>
        </div>
      );
  }
}

export default App;
