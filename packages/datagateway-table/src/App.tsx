import React from 'react';
import './App.css';
import * as log from 'loglevel';
import thunk, { ThunkDispatch } from 'redux-thunk';
import {
  createStore,
  applyMiddleware,
  compose,
  AnyAction,
  Middleware,
  Dispatch,
} from 'redux';
import AppReducer from './state/reducers/app.reducer';
import { Provider, connect } from 'react-redux';
import { createLogger } from 'redux-logger';
import { ConnectedRouter, routerMiddleware } from 'connected-react-router';
// history package is part of react-router, which we depend on
// eslint-disable-next-line import/no-extraneous-dependencies
import { createBrowserHistory } from 'history';
import {
  DGCommonMiddleware,
  listenToMessages,
  RegisterRouteType,
  MicroFrontendMessageId,
  ConfigureURLsType,
} from 'datagateway-common';
import { configureApp } from './state/actions';
import { StateType } from './state/app.types';
import { Preloader } from 'datagateway-common';
import { setApiUrl } from './idCheckFunctions';

import {
  createGenerateClassName,
  StylesProvider,
} from '@material-ui/core/styles';

import PageContainer from './pageContainer.component';

const generateClassName = createGenerateClassName({
  productionPrefix: 'dgwt',

  // Only set disable when we are in production and not running e2e tests;
  // ensures class selectors are working on tests.
  disableGlobal:
    process.env.NODE_ENV === 'production' && !process.env.REACT_APP_E2E_TESTING,
});

// this is so that idCheckFunctions have access to the apiUrl
const saveApiUrl: Middleware = (() => (next: Dispatch<AnyAction>) => (
  action: AnyAction
): AnyAction => {
  if (action.type === ConfigureURLsType) {
    setApiUrl(action.payload.urls.apiUrl);
  }

  return next(action);
}) as Middleware;

const history = createBrowserHistory();
const middleware = [
  thunk,
  routerMiddleware(history),
  DGCommonMiddleware,
  saveApiUrl,
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

const registerRouteAction = {
  type: RegisterRouteType,
  payload: {
    section: 'Data',
    link: '/browse/investigation',
    plugin: 'datagateway-table',
    displayName: 'DataGateway Table',
    order: 0,
    helpText: 'TODO: write some help text for the user tour',
  },
};

document.dispatchEvent(
  new CustomEvent(MicroFrontendMessageId, { detail: registerRouteAction })
);

function mapPreloaderStateToProps(state: StateType): { loading: boolean } {
  return {
    loading: !state.dgtable.settingsLoaded,
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
    log.error(`datagateway_table failed with error: ${error}`);
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
        <div className="App">
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <StylesProvider generateClassName={generateClassName}>
                <ConnectedPreloader>
                  <PageContainer />
                </ConnectedPreloader>
              </StylesProvider>
            </ConnectedRouter>
          </Provider>
        </div>
      );
  }
}

export default App;
