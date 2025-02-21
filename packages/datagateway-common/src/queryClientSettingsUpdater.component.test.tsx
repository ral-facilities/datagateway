import React from 'react';
import { render, RenderResult } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { initialState as dGCommonInitialState } from './state/reducers/dgcommon.reducer';
import { StateType } from './state/app.types';
import configureStore from 'redux-mock-store';
import {
  QueryClientSettingsUpdater,
  QueryClientSettingsUpdaterRedux,
} from './queryClientSettingsUpdater.component';

describe('QueryClientSettingsUpdater', () => {
  const renderComponent = (
    queryRetries: number | undefined = undefined,
    queryClient = new QueryClient()
  ): RenderResult => {
    function Wrapper({
      children,
    }: React.PropsWithChildren<unknown>): JSX.Element {
      return (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );
    }
    return render(
      <QueryClientSettingsUpdater
        queryClient={queryClient}
        queryRetries={queryRetries}
      />,
      {
        wrapper: Wrapper,
      }
    );
  };

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('syncs retry prop to query client when it updates', async () => {
    const queryClient = new QueryClient({
      // set random other option to check it doesn't get overridden
      defaultOptions: { queries: { staleTime: 300000 } },
    });
    let queryRetries = 1;
    const { rerender } = renderComponent(queryRetries, queryClient);

    expect(queryClient.getDefaultOptions()).toEqual({
      queries: { staleTime: 300000, retry: 1 },
    });

    queryRetries = 0;

    rerender(
      <QueryClientSettingsUpdater
        queryClient={queryClient}
        queryRetries={queryRetries}
      />
    );

    expect(queryClient.getDefaultOptions()).toEqual({
      queries: { staleTime: 300000, retry: 0 },
    });
  });
});

describe('QueryClientSettingsUpdaterRedux', () => {
  const initialState: StateType = {
    dgcommon: dGCommonInitialState,
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
    return render(
      <QueryClientSettingsUpdaterRedux queryClient={queryClient} />,
      {
        wrapper: Wrapper,
      }
    );
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

    rerender(<QueryClientSettingsUpdaterRedux queryClient={queryClient} />);

    expect(queryClient.getDefaultOptions()).toEqual({
      queries: { staleTime: 300000, retry: 0 },
    });
  });
});
