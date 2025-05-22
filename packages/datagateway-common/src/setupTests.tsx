/* eslint-disable @typescript-eslint/no-empty-function */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import { History, createMemoryHistory } from 'history';
import failOnConsole from 'jest-fail-on-console';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { Action } from 'redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { StateType } from './state/app.types';
import { initialState } from './state/reducers/dgcommon.reducer';

failOnConsole();

jest.setTimeout(20000);

if (typeof window.URL.createObjectURL === 'undefined') {
  // required as work-around for enzyme/jest environment not implementing window.URL.createObjectURL method
  Object.defineProperty(window.URL, 'createObjectURL', {
    value: () => 'testObjectUrl',
  });
}

if (typeof window.URL.revokeObjectURL === 'undefined') {
  // required as work-around for enzyme/jest environment not implementing window.URL.createObjectURL method
  Object.defineProperty(window.URL, 'revokeObjectURL', {
    value: () => {},
  });
}

// Add in ResizeObserver as it's not in Jest's environment
global.ResizeObserver = require('resize-observer-polyfill');

if (!global.structuredClone) {
  // structuredClone not available in jest/node <17, so this is a quick polyfill that should do the exact same thing
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
jest.mock('./api/retryICATErrors', () => ({
  __esModule: true,
  useRetryICATErrors: jest.fn(() => () => false),
}));

// Mock Date.toLocaleDateString so that it always uses en-GB as locale and UTC timezone
// instead of using the system default, which can be different depending on the environment.
// save a reference to the original implementation of Date.toLocaleDateString

const toLocaleDateString = Date.prototype.toLocaleDateString;

jest
  .spyOn(Date.prototype, 'toLocaleDateString')
  .mockImplementation(function (this: Date) {
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
      error: jest.fn(),
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

// MUI date pickers default to mobile versions during testing and so functions
// like .simulate('change') will not work, this workaround ensures desktop
// datepickers are used in tests instead
// https://github.com/mui/material-ui-pickers/issues/2073
export const applyDatePickerWorkaround = (): void => {
  // add window.matchMedia
  // this is necessary for the date picker to be rendered in desktop mode.
  // if this is not provided, the mobile mode is rendered, which might lead to unexpected behavior
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      media: query,
      // this is the media query that @material-ui/pickers uses to determine if a device is a desktop device
      matches: query === '(pointer: fine)',
      onchange: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
};

export const cleanupDatePickerWorkaround = (): void => {
  delete window.matchMedia;
};

export const flushPromises = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve));
