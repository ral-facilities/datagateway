import React from 'react';
import './App.css';
import * as log from 'loglevel';
import SearchPageContainer from './searchPageContainer.component';
import thunk from 'redux-thunk';
import { applyMiddleware, createStore, compose } from 'redux';
import AppReducer from './state/reducers/app.reducer';
import {
  createGenerateClassName,
  StylesProvider,
} from '@material-ui/core/styles';
import { Provider } from 'react-redux';

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
              <SearchPageContainer />
            </StylesProvider>
          </Provider>
        </div>
      );
  }
}

export default App;
