import React, { Component } from 'react';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import { Provider } from 'react-redux';
import { applyMiddleware, compose, createStore, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import * as log from 'loglevel';
// eslint-disable-next-line import/no-extraneous-dependencies
import { createBrowserHistory } from 'history';

import DownloadTabs from './downloadTab/downloadTab.component';

import {
  createGenerateClassName,
  StylesProvider,
} from '@material-ui/core/styles';
import ConfigProvider from './ConfigProvider';
import {
  Preloader,
  DGCommonMiddleware,
  dGCommonReducer,
} from 'datagateway-common';
import { DGThemeProvider } from 'datagateway-common';

/* eslint-disable no-underscore-dangle, @typescript-eslint/no-explicit-any */
const composeEnhancers =
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
/* eslint-enable */

const history = createBrowserHistory();
const middleware = [thunk, routerMiddleware(history), DGCommonMiddleware];

const store = createStore(
  combineReducers({
    router: connectRouter(history),
    dgcommon: dGCommonReducer,
  }),
  composeEnhancers(applyMiddleware(...middleware))
);

const generateClassName = createGenerateClassName({
  productionPrefix: 'dgwd',

  // Only set disable when we are in production and not running e2e tests;
  // ensures class selectors are working on tests.
  disableGlobal:
    process.env.NODE_ENV === 'production' && !process.env.REACT_APP_E2E_TESTING,
});

class App extends Component<unknown, { hasError: boolean }> {
  public constructor(props: unknown) {
    super(props);
    this.state = { hasError: false };
  }

  public componentDidCatch(error: Error | null): void {
    this.setState({ hasError: true });
    log.error(`datagateway-download failed with error: ${error}`);
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
    }

    return (
      <div className="App">
        <Provider store={store}>
          <StylesProvider generateClassName={generateClassName}>
            <DGThemeProvider>
              <ConfigProvider>
                <React.Suspense
                  fallback={
                    <Preloader loading={true}>Finished loading</Preloader>
                  }
                >
                  <DownloadTabs />
                </React.Suspense>
              </ConfigProvider>
            </DGThemeProvider>
          </StylesProvider>
        </Provider>
      </div>
    );
  }
}

export default App;
