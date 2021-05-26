import {
  createGenerateClassName,
  StylesProvider,
} from '@material-ui/core/styles';
import { ConnectedRouter, routerMiddleware } from 'connected-react-router';
import {
  DGCommonMiddleware,
  DGThemeProvider,
  Preloader,
} from 'datagateway-common';
// eslint-disable-next-line import/no-extraneous-dependencies
import { createBrowserHistory } from 'history';
import * as log from 'loglevel';
import React from 'react';
import { connect, Provider } from 'react-redux';
import { AnyAction, applyMiddleware, compose, createStore, Store } from 'redux';
import { createLogger } from 'redux-logger';
import thunk, { ThunkDispatch } from 'redux-thunk';
import './App.css';
import SearchPageContainer from './searchPageContainer.component';
import { configureApp } from './state/actions';
import { StateType } from './state/app.types';
import AppReducer from './state/reducers/app.reducer';
import { Translation } from 'react-i18next';

/* eslint-disable no-underscore-dangle, @typescript-eslint/no-explicit-any */
const composeEnhancers =
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
/* eslint-enable */

const history = createBrowserHistory();
const middleware = [thunk, routerMiddleware(history), DGCommonMiddleware];

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

class App extends React.Component<unknown, { hasError: boolean }> {
  store: Store;
  public constructor(props: unknown) {
    super(props);
    this.state = { hasError: false };

    // set up store in constructor to isolate from SciGateway redux store: https://redux.js.org/recipes/isolating-redux-sub-apps
    this.store = createStore(
      AppReducer(history),
      composeEnhancers(applyMiddleware(...middleware))
    );

    const dispatch = this.store.dispatch as ThunkDispatch<
      StateType,
      null,
      AnyAction
    >;
    dispatch(configureApp());
  }

  public componentDidCatch(error: Error | null): void {
    this.setState({ hasError: true });
    log.error(`datagateway_search failed with error: ${error}`);
  }

  public render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="error">
          <React.Suspense
            fallback={<Preloader loading={true}>Finished loading</Preloader>}
          >
            <div
              style={{
                padding: 20,
                background: 'red',
                color: 'white',
                margin: 5,
              }}
            >
              <Translation>{(t) => t('app.error')}</Translation>
            </div>
          </React.Suspense>
        </div>
      );
    } else
      return (
        <div className="App">
          <Provider store={this.store}>
            <ConnectedRouter history={history}>
              <StylesProvider generateClassName={generateClassName}>
                <DGThemeProvider>
                  <ConnectedPreloader>
                    <React.Suspense
                      fallback={
                        <Preloader loading={true}>Finished loading</Preloader>
                      }
                    >
                      <SearchPageContainer />
                    </React.Suspense>
                  </ConnectedPreloader>
                </DGThemeProvider>
              </StylesProvider>
            </ConnectedRouter>
          </Provider>
        </div>
      );
  }
}

export default App;
