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
// history package is part of react-router, which we depend on
// eslint-disable-next-line import/no-extraneous-dependencies
import { createBrowserHistory } from 'history';
import * as log from 'loglevel';
import React from 'react';
import { Translation } from 'react-i18next';
import { connect, Provider } from 'react-redux';
import { AnyAction, applyMiddleware, compose, createStore } from 'redux';
import { createLogger } from 'redux-logger';
import thunk, { ThunkDispatch } from 'redux-thunk';
import './App.css';
import { saveApiUrlMiddleware } from './page/idCheckFunctions';
import PageContainer from './page/pageContainer.component';
import { configureApp } from './state/actions';
import { StateType } from './state/app.types';
import AppReducer from './state/reducers/app.reducer';

const generateClassName = createGenerateClassName({
  productionPrefix: 'dgwt',

  // Only set disable when we are in production and not running e2e tests;
  // ensures class selectors are working on tests.
  disableGlobal:
    process.env.NODE_ENV === 'production' && !process.env.REACT_APP_E2E_TESTING,
});

const history = createBrowserHistory();
const middleware = [
  thunk,
  routerMiddleware(history),
  DGCommonMiddleware,
  saveApiUrlMiddleware,
];

if (process.env.NODE_ENV === `development`) {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const logger = (createLogger as any)();
  middleware.push(logger);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  whyDidYouRender(React);
}

/* eslint-disable no-underscore-dangle, @typescript-eslint/no-explicit-any */
const composeEnhancers =
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
/* eslint-enable */

const store = createStore(
  AppReducer(history),
  composeEnhancers(applyMiddleware(...middleware))
);

listenToMessages(store.dispatch);

const dispatch = store.dispatch as ThunkDispatch<StateType, null, AnyAction>;
dispatch(configureApp());

function mapPreloaderStateToProps(state: StateType): { loading: boolean } {
  return {
    loading: !state.dgdataview.settingsLoaded,
  };
}

export const ConnectedPreloader = connect(mapPreloaderStateToProps)(Preloader);

class App extends React.Component<unknown, { hasError: boolean }> {
  public constructor(props: unknown) {
    super(props);
    this.state = { hasError: false };
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
          <Provider store={store}>
            <ConnectedRouter history={history}>
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
            </ConnectedRouter>
          </Provider>
        </div>
      );
  }
}

export default App;
