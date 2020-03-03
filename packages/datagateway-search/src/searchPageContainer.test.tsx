import React from 'react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { StateType } from './state/app.types';
import { initialState as dgSearchInitialState } from './state/reducers/dgsearch.reducer';
import { dGCommonInitialState } from 'datagateway-common';

import { createMount } from '@material-ui/core/test-utils';
// history package is part of react-router, which we depend on
// eslint-disable-next-line import/no-extraneous-dependencies
import { MemoryRouter } from 'react-router';

import SearchPageContainer from './searchPageContainer.component';

jest.mock('loglevel');

describe('SearchPageContainer - Tests', () => {
  let state: StateType;
  let mockStore;
  let mount;

  beforeEach(() => {
    mount = createMount();

    state = JSON.parse(
      JSON.stringify({
        dgsearch: dgSearchInitialState,
        dgcommon: dGCommonInitialState,
      })
    );

    mockStore = configureStore([thunk]);
  });

  it('renders initial container correctly', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter initialEntries={[{ key: 'testKey' }]}>
          <SearchPageContainer />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper).toMatchSnapshot();
    // TODO: test that the container is rednering the search table and box
    // expect(wrapper.exists(SearchPageTable)).toBe(true);
    // expect(wrapper.exists(SearchBoxContainer)).toBe(true);
  });
});
