import React from 'react';
import { StateType } from './state/app.types';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';

import SearchPageTable from './searchPageTable.component';

import { mount as enzymeMount, ReactWrapper } from 'enzyme';
import { createMount } from '@material-ui/core/test-utils';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { initialState } from './state/reducers/dgsearch.reducer';
import { dGCommonInitialState } from 'datagateway-common';
import axios from 'axios';
import { QueryClientProvider, QueryClient } from 'react-query';
import { Store } from 'redux';
import InvestigationSearchTable from './table/investigationSearchTable.component';
import DatasetSearchTable from './table/datasetSearchTable.component';
import DatafileSearchTable from './table/datafileSearchTable.component';

jest.mock('datagateway-common', () => ({
  ...jest.requireActual('datagateway-common'),
  __esModule: true,
  // mock table to opt out of rendering them in these tests as there's no need
  Table: jest.fn(() => 'MockedTable'),
}));

describe('SearchPageTable', () => {
  let mount: typeof enzymeMount;
  let state: StateType;
  const mockStore = configureStore([thunk]);

  const createWrapper = (store: Store = mockStore(state)): ReactWrapper => {
    return mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ key: 'testKey', pathname: '/search/data' }]}
        >
          <QueryClientProvider client={new QueryClient()}>
            <SearchPageTable />
          </QueryClientProvider>
        </MemoryRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    mount = createMount();

    state = JSON.parse(
      JSON.stringify({ dgsearch: initialState, dgcommon: dGCommonInitialState })
    );

    (axios.get as jest.Mock).mockImplementation((url) => {
      if (url.includes('count')) {
        return Promise.resolve({ data: 0 });
      } else {
        return Promise.resolve({ data: [] });
      }
    });
  });

  it('renders correctly when request received', () => {
    state.dgsearch = {
      ...state.dgsearch,
      tabs: {
        datasetTab: true,
        datafileTab: true,
        investigationTab: true,
      },
    };
    (axios.get as jest.Mock).mockImplementation((url) => {
      if (url.includes('count')) {
        return Promise.resolve({ data: 1 });
      } else {
        return Promise.resolve({ data: Array(1) });
      }
    });

    const testStore = mockStore(state);
    const wrapper = createWrapper(testStore);
    expect(wrapper).toMatchSnapshot();
  });

  it('defaults to investigation tab', () => {
    state.dgsearch = {
      ...state.dgsearch,
      tabs: {
        datasetTab: true,
        datafileTab: true,
        investigationTab: true,
      },
    };

    const testStore = mockStore(state);
    const wrapper = createWrapper(testStore);
    expect(wrapper.exists(InvestigationSearchTable)).toBeTruthy();
  });

  it('defaults to dataset tab when investigation tab is hidden', () => {
    state.dgsearch = {
      ...state.dgsearch,
      checkBox: {
        dataset: true,
        datafile: false,
        investigation: false,
      },
      tabs: {
        datasetTab: true,
        datafileTab: false,
        investigationTab: false,
      },
    };

    // Mock to prevent error logging
    const spy = jest.spyOn(console, 'error').mockImplementation();
    const testStore = mockStore(state);
    const wrapper = createWrapper(testStore);

    expect(wrapper.exists(DatasetSearchTable)).toBeTruthy();
    spy.mockRestore();
  });

  it('defaults to datafile tab when investigation and dataset tab is hidden', () => {
    state.dgsearch = {
      ...state.dgsearch,
      checkBox: {
        dataset: false,
        datafile: true,
        investigation: false,
      },
      tabs: {
        datasetTab: false,
        datafileTab: true,
        investigationTab: false,
      },
    };

    // Mock to prevent error logging
    const spy = jest.spyOn(console, 'error').mockImplementation();
    const testStore = mockStore(state);
    const wrapper = createWrapper(testStore);
    expect(wrapper.exists(DatafileSearchTable)).toBeTruthy();
    spy.mockRestore();
  });

  it('currentTab reverts to investigation if no tabs are selected', () => {
    state.dgsearch = {
      ...state.dgsearch,
      tabs: {
        datasetTab: false,
        datafileTab: false,
        investigationTab: false,
      },
    };
    const testStore = mockStore(state);
    const wrapper1 = createWrapper(testStore);
    expect(wrapper1.exists(InvestigationSearchTable)).toBeTruthy();
  });
});
