import {
  DGCommonMiddleware,
  DGThemeProvider,
  listenToMessages,
  MicroFrontendId,
  Preloader,
  BroadcastSignOutType,
  RequestPluginRerenderType,
  QueryClientSettingsUpdaterRedux,
} from 'datagateway-common';
import log from 'loglevel';
import React from 'react';
import { Translation } from 'react-i18next';
import { connect, Provider } from 'react-redux';
import { AnyAction, applyMiddleware, compose, createStore, Store } from 'redux';
import { createLogger } from 'redux-logger';
import thunk, { ThunkDispatch } from 'redux-thunk';
import './App.css';
import { saveApiUrlMiddleware } from './page/idCheckFunctions';
import PageContainer from './page/pageContainer.component';
import { configureApp } from './state/actions';
import { StateType } from './state/app.types';
import AppReducer from './state/reducers/app.reducer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter } from 'react-router-dom';

const middleware = [thunk, DGCommonMiddleware, saveApiUrlMiddleware];

if (import.meta.env.MODE === 'development') {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const logger = (createLogger as any)({ collapsed: true });
  middleware.push(logger);
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
      staleTime: 300000,
    },
  },
});

document.addEventListener(MicroFrontendId, (e) => {
  const action = (e as CustomEvent).detail;
  if (action.type === BroadcastSignOutType) {
    queryClient.clear();
  }
});

class App extends React.Component<unknown, { hasError: boolean }> {
  store: Store;

  public constructor(props: unknown) {
    super(props);
    this.state = { hasError: false };
    this.handler = this.handler.bind(this);

    // set up store in constructor to isolate from SciGateway redux store: https://redux.js.org/recipes/isolating-redux-sub-apps
    this.store = createStore(
      AppReducer(),
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

  handler(e: Event): void {
    // attempt to re-render the plugin if we get told to
    const action = (e as CustomEvent).detail;
    if (action.type === RequestPluginRerenderType) {
      this.forceUpdate();
    }
  }

  public componentDidMount(): void {
    document.addEventListener(MicroFrontendId, this.handler);
  }

  public componentWillUnmount(): void {
    document.removeEventListener(MicroFrontendId, this.handler);
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
            <BrowserRouter>
              <QueryClientProvider client={queryClient}>
                <QueryClientSettingsUpdaterRedux queryClient={queryClient} />
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
                <ReactQueryDevtools initialIsOpen={false} />
              </QueryClientProvider>
            </BrowserRouter>
          </Provider>
        </div>
      );
  }
}

export default App;
