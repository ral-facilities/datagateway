import {
  createGenerateClassName,
  StylesProvider,
} from '@material-ui/core/styles';
import { ConnectedRouter, routerMiddleware } from 'connected-react-router';
import {
  DGCommonMiddleware,
  DGThemeProvider,
  listenToMessages,
  Preloader,
} from 'datagateway-common';
import {
  createBrowserHistory,
  LocationListener,
  Location,
  Action,
} from 'history';
import * as log from 'loglevel';
import React from 'react';
import { Translation } from 'react-i18next';
import { batch, connect, Provider } from 'react-redux';
import { AnyAction, applyMiddleware, compose, createStore, Store } from 'redux';
import { createLogger } from 'redux-logger';
import thunk, { ThunkDispatch } from 'redux-thunk';
import './App.css';
import { saveApiUrlMiddleware } from './page/idCheckFunctions';
import PageContainer from './page/pageContainer.component';
import { configureApp } from './state/actions';
import { StateType } from './state/app.types';
import AppReducer from './state/reducers/app.reducer';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

const generateClassName = createGenerateClassName({
  productionPrefix: 'dgwt',

  // Only set disable when we are in production and not running e2e tests;
  // ensures class selectors are working on tests.
  disableGlobal:
    process.env.NODE_ENV === 'production' && !process.env.REACT_APP_E2E_TESTING,
});

const history = createBrowserHistory();

// fix query string freeze bug
// see https://github.com/supasate/connected-react-router/issues/311#issuecomment-692017995
let listeners: LocationListener<unknown>[] = [];

function appendListener(fn: LocationListener<unknown>): () => void {
  let isActive = true;

  const listener: LocationListener<unknown> = (...args) => {
    if (isActive) fn(...args);
  };

  listeners.push(listener);

  return () => {
    isActive = false;
    listeners = listeners.filter((item) => item !== listener);
  };
}

function notifyListeners(
  ...args: [location: Location<unknown>, action: Action]
): void {
  listeners.forEach((listener) => listener(...args));
}

// make only one subscription to history changes and proxy to our internal listeners
history.listen((...args) => {
  // here's the key change
  batch(() => {
    notifyListeners(...args);
  });
});

// monkey patch to store subscriptions into our own pool
history.listen = (fn) => {
  return appendListener(fn);
};

const middleware = [
  thunk,
  routerMiddleware(history),
  DGCommonMiddleware,
  saveApiUrlMiddleware,
];

if (process.env.NODE_ENV === `development`) {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const logger = (createLogger as any)({ collapsed: true });
  middleware.push(logger);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  whyDidYouRender(React);
}

/* eslint-disable no-underscore-dangle, @typescript-eslint/no-explicit-any */
const composeEnhancers =
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
/* eslint-enable */

function mapPreloaderStateToProps(state: StateType): { loading: boolean } {
  return {
    loading: !state.dgdataview.settingsLoaded,
  };
}

export const ConnectedPreloader = connect(mapPreloaderStateToProps)(Preloader);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      staleTime: 5,
    },
  },
});

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

    listenToMessages(this.store.dispatch);

    const dispatch = this.store.dispatch as ThunkDispatch<
      StateType,
      null,
      AnyAction
    >;
    dispatch(configureApp());
  }

  public componentDidCatch(error: Error | null): void {
    this.setState({ hasError: true });
    log.error(`datagateway_dataview failed with error: ${error}`);
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
              <QueryClientProvider client={queryClient}>
                <StylesProvider generateClassName={generateClassName}>
                  <DGThemeProvider>
                    <ConnectedPreloader>
                      <React.Suspense
                        fallback={
                          <Preloader loading={true}>Finished loading</Preloader>
                        }
                      >
                        <PageContainer />
                      </React.Suspense>
                    </ConnectedPreloader>
                  </DGThemeProvider>
                </StylesProvider>
                <ReactQueryDevtools initialIsOpen={false} />
              </QueryClientProvider>
            </ConnectedRouter>
          </Provider>
        </div>
      );
  }
}

export default App;
