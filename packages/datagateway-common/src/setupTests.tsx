/* eslint-disable @typescript-eslint/no-empty-function */
import '@testing-library/jest-dom';
import React from 'react';
import type { Action } from 'redux';
import type { StateType } from './state/app.types';
import { initialState } from './state/reducers/dgcommon.reducer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { createMemoryHistory, History } from 'history';
import failOnConsole from 'vitest-fail-on-console';

failOnConsole();

vi.setConfig({ testTimeout: 20_000 });

// see https://github.com/testing-library/react-testing-library/issues/1197
// and https://github.com/testing-library/user-event/issues/1115
vi.stubGlobal('jest', { advanceTimersByTime: vi.advanceTimersByTime.bind(vi) });

if (typeof window.URL.createObjectURL === 'undefined') {
  // required as work-around for jsdom environment not implementing window.URL.createObjectURL method
  Object.defineProperty(window.URL, 'createObjectURL', {
    value: () => 'testObjectUrl',
  });
}

if (typeof window.URL.revokeObjectURL === 'undefined') {
  // required as work-around for jsdom environment not implementing window.URL.createObjectURL method
  Object.defineProperty(window.URL, 'revokeObjectURL', {
    value: () => {},
  });
}

// Add in ResizeObserver as it's not in jsdom's environment
vi.stubGlobal(
  'ResizeObserver',
  vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
);

if (!global.structuredClone) {
  // structuredClone not available in jsdom/node <17, so this is a quick polyfill that should do the exact same thing
  global.structuredClone = (obj: unknown) => JSON.parse(JSON.stringify(obj));
}

// these are used for testing async actions
export let actions: Action[] = [];
export const resetActions = (): void => {
  actions = [];
};
export const getState = (): Partial<StateType> => ({ dgcommon: initialState });
export const dispatch = (action: Action): void | Promise<void> => {
  if (typeof action === 'function') {
    action(dispatch, getState);
    return Promise.resolve();
  } else {
    actions.push(action);
  }
};

// mock retry function to ensure it doesn't slow down query failure tests
vi.mock('./api/retryICATErrors', () => ({
  __esModule: true,
  useRetryICATErrors: vi.fn(() => () => false),
}));

// Mock Date.toLocaleDateString so that it always uses en-GB as locale and UTC timezone
// instead of using the system default, which can be different depending on the environment.
// save a reference to the original implementation of Date.toLocaleDateString

const toLocaleDateString = Date.prototype.toLocaleDateString;

vi.spyOn(Date.prototype, 'toLocaleDateString').mockImplementation(function (
  this: Date
) {
  // when toLocaleDateString is called with no argument
  // pass in 'en-GB' as the locale & UTC as timezone
  // so that Date.toLocaleDateString() is equivalent to
  // Date.toLocaleDateString('en-GB', { timeZone: 'UTC' })
  return toLocaleDateString.call(this, 'en-GB', { timeZone: 'UTC' });
});

export const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
    // silence react-query errors
    logger: {
      log: console.log,
      warn: console.warn,
      error: vi.fn(),
    },
  });

export const createReactQueryWrapper = (
  history: History = createMemoryHistory(),
  queryClient: QueryClient = createTestQueryClient()
): React.JSXElementConstructor<{ children: React.ReactElement }> => {
  const state = {
    dgcommon: {
      ...initialState,
      facilityName: 'TEST',
      urls: {
        apiUrl: 'https://example.com/api',
        icatUrl: 'https://example.com/icat',
        idsUrl: 'https://example.com/ids',
        downloadApiUrl: 'https://example.com/topcat',
      },
    },
  };

  const mockStore = configureStore([thunk]);

  const wrapper: React.JSXElementConstructor<{
    children: React.ReactElement;
  }> = ({ children }) => (
    <Provider store={mockStore(state)}>
      <Router history={history}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </Router>
    </Provider>
  );
  return wrapper;
};

// Recreate jest behaviour by mocking with __mocks__ by mocking globally here
vi.mock('axios');
vi.mock('react-i18next');
