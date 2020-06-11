import React from 'react';
import './App.css';
import * as log from 'loglevel';
import SearchPageContainer from './searchPageContainer.component';
import thunk, { ThunkDispatch } from 'redux-thunk';
import { applyMiddleware, createStore, compose, AnyAction } from 'redux';
import AppReducer from './state/reducers/app.reducer';
import { createLogger } from 'redux-logger';
import { ConnectedRouter, routerMiddleware } from 'connected-react-router';
// eslint-disable-next-line import/no-extraneous-dependencies
import { createBrowserHistory } from 'history';
import { DGCommonMiddleware, Preloader } from 'datagateway-common';
import {
  createGenerateClassName,
  StylesProvider,
} from '@material-ui/core/styles';
import { Provider, connect } from 'react-redux';
import { configureApp } from './state/actions';
import { StateType } from './state/app.types';

/* eslint-disable no-underscore-dangle, @typescript-eslint/no-explicit-any */
const composeEnhancers =
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
/* eslint-enable */

const history = createBrowserHistory();
const middleware = [thunk, routerMiddleware(history), DGCommonMiddleware];

const store = createStore(
  AppReducer(history),
  composeEnhancers(applyMiddleware(...middleware))
);

const dispatch = store.dispatch as ThunkDispatch<StateType, null, AnyAction>;
dispatch(configureApp());

const generateClassName = createGenerateClassName({
  productionPrefix: 'dgws',

  // Only set disable when we are in production and not running e2e tests;
  // ensures class selectors are working on tests.
  disableGlobal:
    process.env.NODE_ENV === 'production' && !process.env.REACT_APP_E2E_TESTING,
});

if (process.env.NODE_ENV === `development`) {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const logger = (createLogger as any)();
  middleware.push(logger);
}

function mapPreloaderStateToProps(state: StateType): { loading: boolean } {
  return {
    loading: !state.dgsearch.settingsLoaded,
  };
}

export const ConnectedPreloader = connect(mapPreloaderStateToProps)(Preloader);

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
            <ConnectedRouter history={history}>
              <StylesProvider generateClassName={generateClassName}>
                <ConnectedPreloader>
                  <SearchPageContainer />
                </ConnectedPreloader>
              </StylesProvider>
            </ConnectedRouter>
          </Provider>
        </div>
      );
  }
}

export default App;
