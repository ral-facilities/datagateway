import React from 'react';
import { ReactWrapper } from 'enzyme';

import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { StateType } from './state/app.types';
import { initialState } from './state/reducers/dgtable.reducer';

import { createMount } from '@material-ui/core/test-utils';
// history package is part of react-router, which we depend on
// eslint-disable-next-line import/no-extraneous-dependencies
import { createLocation } from 'history';
import { MemoryRouter } from 'react-router';

import PageHead from './pageHead.component';

jest.mock('loglevel');

describe('PageHead - Tests', () => {
  let mount;
  let state: StateType;

  const createWrapper = (state: StateType): ReactWrapper => {
    const mockStore = configureStore([thunk]);
    return mount(
      <Provider store={mockStore(state)}>
        <MemoryRouter initialEntries={[{ key: 'testKey' }]}>
          <PageHead />
        </MemoryRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    mount = createMount();

    state = JSON.parse(
      JSON.stringify({
        dgtable: {
          ...initialState,

          totalDataCount: 101,
        },

        router: {
          action: 'POP',
          location: createLocation('/'),
        },
      })
    );
  });

  afterEach(() => {
    mount.cleanUp();
  });

  it('displays the correct entity count', () => {
    // Set up store with the test state and mounted page head.
    const wrapper = createWrapper(state);

    expect(wrapper).toMatchSnapshot();
  });
});
