import React from 'react';
import { StateType } from './state/app.types';
import { Provider } from 'react-redux';
import { MemoryRouter, Router } from 'react-router';

import SearchPageTable, { SearchTableProps } from './searchPageTable.component';

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
import { createMemoryHistory, History } from 'history';

jest.mock('datagateway-common', () => ({
  ...jest.requireActual('datagateway-common'),
  __esModule: true,
  // mock table to opt out of rendering them in these tests as there's no need
  Table: jest.fn(() => 'MockedTable'),
}));

describe('SearchPageTable', () => {
  let mount: typeof enzymeMount;
  let state: StateType;
  let history: History;
  let props: SearchTableProps;
  const mockStore = configureStore([thunk]);

  const onCurrentTab = jest.fn();

  const createWrapper = (
    store: Store = mockStore(state),
    props: SearchTableProps
  ): ReactWrapper => {
    return mount(
      <Provider store={store}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <SearchPageTable {...props} />
          </QueryClientProvider>
        </Router>
      </Provider>
    );
  };

  beforeEach(() => {
    mount = createMount();
    history = createMemoryHistory({
      initialEntries: ['/search/data'],
    });

    state = JSON.parse(
      JSON.stringify({ dgsearch: initialState, dgcommon: dGCommonInitialState })
    );

    props = {
      onCurrentTab: onCurrentTab,
    };

    (axios.get as jest.Mock).mockImplementation((url) => {
      if (url.includes('count')) {
        return Promise.resolve({ data: 0 });
      } else {
        return Promise.resolve({ data: [] });
      }
    });
  });

  afterEach(() => {
    onCurrentTab.mockClear();
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

    const createWrapper = (store: Store = mockStore(state)): ReactWrapper => {
      return mount(
        <Provider store={store}>
          <MemoryRouter
            initialEntries={[{ key: 'testKey', pathname: '/search/data' }]}
          >
            <QueryClientProvider client={new QueryClient()}>
              <SearchPageTable {...props} />
            </QueryClientProvider>
          </MemoryRouter>
        </Provider>
      );
    };

    const testStore = mockStore(state);
    const wrapper = createWrapper(testStore);
    expect(wrapper).toMatchSnapshot();
  });

  it('changes selected tab value on click of a new tab', () => {
    state.dgsearch = {
      ...state.dgsearch,
      tabs: {
        datasetTab: true,
        datafileTab: true,
        investigationTab: true,
      },
    };

    const updatedProps = {
      ...props,
      currentTab: 'investigation',
    };

    const testStore = mockStore(state);
    const wrapper = createWrapper(testStore, updatedProps);

    expect(wrapper.exists(InvestigationSearchTable)).toBeTruthy();

    wrapper
      .find('[aria-controls="simple-tabpanel-dataset"]')
      .first()
      .simulate('click');

    expect(onCurrentTab).toHaveBeenNthCalledWith(2, 'dataset');
  });

  it('sets the current tab based on selected tabs', () => {
    state.dgsearch = {
      ...state.dgsearch,
      tabs: {
        datasetTab: true,
        datafileTab: true,
        investigationTab: false,
      },
    };

    let updatedProps = {
      ...props,
      currentTab: 'investigation',
    };

    let testStore = mockStore(state);
    createWrapper(testStore, updatedProps);

    expect(onCurrentTab).toHaveBeenNthCalledWith(1, 'dataset');

    state.dgsearch = {
      ...state.dgsearch,
      tabs: {
        datasetTab: false,
        datafileTab: true,
        investigationTab: false,
      },
    };

    updatedProps = {
      ...props,
      currentTab: 'investigation',
    };

    testStore = mockStore(state);
    createWrapper(testStore, updatedProps);

    expect(onCurrentTab).toHaveBeenNthCalledWith(2, 'datafile');

    state.dgsearch = {
      ...state.dgsearch,
      tabs: {
        datasetTab: false,
        datafileTab: true,
        investigationTab: false,
      },
    };

    updatedProps = {
      ...props,
      currentTab: 'dataset',
    };

    testStore = mockStore(state);
    createWrapper(testStore, updatedProps);

    expect(onCurrentTab).toHaveBeenNthCalledWith(3, 'datafile');

    state.dgsearch = {
      ...state.dgsearch,
      tabs: {
        datasetTab: true,
        datafileTab: false,
        investigationTab: false,
      },
    };

    updatedProps = {
      ...props,
      currentTab: 'datafile',
    };

    testStore = mockStore(state);
    createWrapper(testStore, updatedProps);

    expect(onCurrentTab).toHaveBeenNthCalledWith(4, 'dataset');

    state.dgsearch = {
      ...state.dgsearch,
      tabs: {
        datasetTab: false,
        datafileTab: true,
        investigationTab: true,
      },
    };

    updatedProps = {
      ...props,
      currentTab: 'dataset',
    };

    testStore = mockStore(state);
    createWrapper(testStore, updatedProps);

    expect(onCurrentTab).toHaveBeenNthCalledWith(5, 'investigation');

    state.dgsearch = {
      ...state.dgsearch,
      tabs: {
        datasetTab: true,
        datafileTab: false,
        investigationTab: true,
      },
    };

    updatedProps = {
      ...props,
      currentTab: 'datafile',
    };

    testStore = mockStore(state);
    createWrapper(testStore, updatedProps);

    expect(onCurrentTab).toHaveBeenNthCalledWith(6, 'investigation');
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
    const wrapper = createWrapper(testStore, props);
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
    const wrapper = createWrapper(testStore, props);

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
    const wrapper = createWrapper(testStore, props);

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
    const wrapper1 = createWrapper(testStore, props);
    expect(wrapper1.exists(InvestigationSearchTable)).toBeTruthy();
  });
});
