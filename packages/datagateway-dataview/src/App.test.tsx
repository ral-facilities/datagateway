import * as React from 'react';
import App, { QueryClientSettingUpdater } from './App';
import log from 'loglevel';
import {
  render,
  screen,
  waitFor,
  type RenderResult,
} from '@testing-library/react';
import PageContainer from './page/pageContainer.component';
import { configureApp, settingsLoaded } from './state/actions';
import { StateType } from './state/app.types';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { QueryClient, QueryClientProvider } from 'react-query';
import { dGCommonInitialState } from 'datagateway-common';
import { initialState as dgDataViewInitialState } from './state/reducers/dgdataview.reducer';
import { createLocation } from 'history';

jest
  .mock('loglevel')
  .mock('./page/pageContainer.component')
  .mock('./state/actions', () => ({
    ...jest.requireActual('./state/actions'),
    configureApp: jest.fn(),
  }))
  .mock('react', () => ({
    ...jest.requireActual('react'),
    // skip React suspense mechanism and show children directly.
    Suspense: ({ children }: { children: React.ReactNode }) => children,
  }));

describe('App', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', async () => {
    // pretend app is configured successfully
    (configureApp as jest.MockedFn<typeof configureApp>).mockReturnValue(
      async (dispatch) => {
        dispatch(settingsLoaded());
      }
    );
    (PageContainer as jest.Mock).mockImplementation(() => <div>page</div>);

    render(<App />);

    expect(await screen.findByText('page')).toBeInTheDocument();
  });

  it('shows loading screen when configuring app', async () => {
    (configureApp as jest.MockedFn<typeof configureApp>).mockReturnValue(
      () =>
        new Promise((_) => {
          // never resolve the promise to pretend the app is still being configured
        })
    );
    (PageContainer as jest.Mock).mockImplementation(() => <div>page</div>);

    render(<App />);

    expect(await screen.findByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('page')).toBeNull();
  });

  it('catches errors using componentDidCatch and shows fallback UI', async () => {
    // pretend app is configured successfully
    (configureApp as jest.MockedFn<typeof configureApp>).mockReturnValue(
      async (dispatch) => {
        dispatch(settingsLoaded());
      }
    );
    // pretend PageContainer throw an error and see if <App /> will catch the error
    (PageContainer as jest.Mock).mockImplementation(() => {
      throw new Error('test PageContainer error');
    });

    jest.spyOn(console, 'error').mockImplementation(() => {
      // suppress console error
    });

    render(<App />);

    await waitFor(() => {
      // check that the error is logged
      expect(log.error).toHaveBeenCalled();
    });

    // check that fallback UI is shown
    expect(await screen.findByText('app.error')).toBeInTheDocument();
  });
});

describe('QueryClientSettingUpdater', () => {
  const initialState: StateType = {
    dgcommon: dGCommonInitialState,
    dgdataview: dgDataViewInitialState,
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
