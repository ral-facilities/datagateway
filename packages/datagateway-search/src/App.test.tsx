import React from 'react';
import ReactDOM from 'react-dom';
import App, { QueryClientSettingUpdater } from './App';
import log from 'loglevel';
import { RenderResult, render, screen, waitFor } from '@testing-library/react';
import { configureApp, settingsLoaded } from './state/actions';
import { dGCommonInitialState } from 'datagateway-common';
import { createLocation } from 'history';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { initialState as dgSearchInitialState } from './state/reducers/dgsearch.reducer';
import { StateType } from './state/app.types';

jest.mock('loglevel').mock('./state/actions', () => ({
  ...jest.requireActual('./state/actions'),
  configureApp: jest.fn(),
}));

describe('App', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();

    // pretend app is configured successfully
    (configureApp as jest.MockedFn<typeof configureApp>).mockReturnValue(
      async (dispatch) => {
        dispatch(settingsLoaded());
      }
    );
  });

  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<App />, div);
    ReactDOM.unmountComponentAtNode(div);
  });

  it('shows loading screen when configuring app', async () => {
    (configureApp as jest.MockedFn<typeof configureApp>).mockReturnValue(
      () =>
        new Promise((_) => {
          // never resolve the promise to pretend the app is still being configured
        })
    );

    render(<App />);

    expect(await screen.findByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('page')).toBeNull();
  });

  it('catches errors using componentDidCatch and shows fallback UI', async () => {
    const error = 'test SearchPageContainer error';

    // throw an error in function used by searchPageContainer
    jest
      .spyOn(window.localStorage.__proto__, 'removeItem')
      .mockImplementation(() => {
        throw new Error(error);
      });

    jest.spyOn(console, 'error').mockImplementation(() => {
      // suppress console error
    });

    render(<App />);

    await waitFor(() => {
      // check that the error is logged
      expect(log.error).toHaveBeenCalledWith(
        `datagateway_search failed with error: Error: ${error}`
      );
    });

    // check that fallback UI is shown
    expect(await screen.findByText('app.error')).toBeInTheDocument();
  });
});

describe('QueryClientSettingUpdater', () => {
  const initialState: StateType = {
    dgcommon: dGCommonInitialState,
    dgsearch: dgSearchInitialState,
    router: {
      action: 'POP',
      location: { ...createLocation('/'), query: {} },
    },
  };
  const renderComponent = (
    state: StateType = initialState,
    queryClient = new QueryClient()
  ): RenderResult => {
    const mockStore = configureStore([thunk]);
    function Wrapper({
      children,
    }: React.PropsWithChildren<unknown>): JSX.Element {
      return (
        <Provider store={mockStore(state)}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </Provider>
      );
    }
    return render(<QueryClientSettingUpdater queryClient={queryClient} />, {
      wrapper: Wrapper,
    });
  };

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('syncs retry setting to query client when it updates', async () => {
    const queryClient = new QueryClient({
      // set random other option to check it doesn't get overridden
      defaultOptions: { queries: { staleTime: 300000 } },
    });
    const { rerender } = renderComponent(initialState, queryClient);

    initialState.dgcommon.queryRetries = 0;

    rerender(<QueryClientSettingUpdater queryClient={queryClient} />);

    expect(queryClient.getDefaultOptions()).toEqual({
      queries: { staleTime: 300000, retry: 0 },
    });
  });
});
