/* eslint-disable @typescript-eslint/no-empty-function */
import React from 'react';
import Enzyme from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { Action } from 'redux';
import { StateType } from './state/app.types';
import { initialState } from './state/reducers/dgcommon.reducer';
import { setLogger } from 'react-query';
import { WrapperComponent } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { createMemoryHistory, History } from 'history';

// Unofficial React 17 Enzyme adapter
Enzyme.configure({ adapter: new Adapter() });

function noOp(): void {
  // required as work-around for enzyme/jest environment not implementing window.URL.createObjectURL method
}

if (typeof window.URL.createObjectURL === 'undefined') {
  Object.defineProperty(window.URL, 'createObjectURL', { value: noOp });
}

// Add in ResizeObserver as it's not in Jest's environment
global.ResizeObserver = require('resize-observer-polyfill');

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

// silence react-query errors
setLogger({
  log: console.log,
  warn: console.warn,
  error: jest.fn(),
});

// mock retry function to ensure it doesn't slow down query failure tests
jest.mock('./api/retryICATErrors', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue(false),
}));

export const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

export const createReactQueryWrapper = (
  history: History = createMemoryHistory()
): WrapperComponent<unknown> => {
  const testQueryClient = createTestQueryClient();
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

  const wrapper: WrapperComponent<unknown> = ({ children }) => (
    <Provider store={mockStore(state)}>
      <Router history={history}>
        <QueryClientProvider client={testQueryClient}>
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
