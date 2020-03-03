import React from 'react';

import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { StateType } from './state/app.types';

import { createMount } from '@material-ui/core/test-utils';
import { MemoryRouter } from 'react-router';
import { Provider } from 'react-redux';
import { initialState as dgSearchInitialState } from './state/reducers/dgsearch.reducer';
import { dGCommonInitialState } from 'datagateway-common';

import SearchPageTable from './searchPageContainer.component';

jest.mock('loglevel');

describe('SearchPageTable - Tests', () => {
  let state: StateType;
  let mockStore;
  let mount;

  beforeEach(() => {
    mount = createMount();

    state = JSON.parse(
      JSON.stringify({
        dgtable: dgSearchInitialState,
        dgcommon: dGCommonInitialState,
      })
    );

    mockStore = configureStore([thunk]);
  });

  it('renders initial search page correctly', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter initialEntries={[{ key: 'testKey' }]}>
          <SearchPageTable />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders SearchPageTable on button click', () => {
    state.dgsearch = {
      searchText: '',
      text: '',
      selectDate: {
        startDate: null,
        endDate: null,
      },
      checkBox: {
        dataset: true,
        datafile: true,
        investigation: false,
      },
      requestReceived: true,
      searchData: {
        dataset: [],
        datafile: [],
        investigation: [],
      },
    };
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <SearchPageTable />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper).toMatchSnapshot();

    // TODO: test that entity search tables are being rendered
    // expect(wrapper.exists(InvestigationSearchTable)).toBe(true);
    // expect(wrapper.exists(DatasetSearchTable)).toBe(true);
    // expect(wrapper.exists(DatafileSearchTable)).toBe(true);

    // TODO: test tabpanel functionality
  });
});
