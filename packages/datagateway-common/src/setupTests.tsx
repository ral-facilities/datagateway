import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { Action } from 'redux';
import { StateType } from './state/app.types';
import { initialState } from './state/reducers/dgcommon.reducer';
import { setLogger } from 'react-query';
import { WrapperComponent } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

// React 16 Enzyme adapter
Enzyme.configure({ adapter: new Adapter() });

function noOp(): void {
  // required as work-around for enzyme/jest environment not implementing window.URL.createObjectURL method
}

if (typeof window.URL.createObjectURL === 'undefined') {
  Object.defineProperty(window.URL, 'createObjectURL', { value: noOp });
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

// silence react-query errors
setLogger({
  log: console.log,
  warn: console.warn,
  error: jest.fn(),
});

export const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

export const createReactQueryWrapper = (): WrapperComponent<unknown> => {
  const testQueryClient = createTestQueryClient();
  const state = {
    dgcommon: {
      ...initialState,
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
      <MemoryRouter>
        <QueryClientProvider client={testQueryClient}>
          {children}
        </QueryClientProvider>
      </MemoryRouter>
    </Provider>
  );
  return wrapper;
};
