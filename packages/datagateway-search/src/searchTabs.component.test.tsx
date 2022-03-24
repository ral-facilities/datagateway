import React from 'react';
import { StateType } from './state/app.types';
import { Provider } from 'react-redux';
import { MemoryRouter, Router } from 'react-router-dom';

import SearchPageTabs, { SearchTabsProps } from './searchTabs.component';

import { mount, ReactWrapper } from 'enzyme';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { initialState } from './state/reducers/dgsearch.reducer';
import { dGCommonInitialState, CartProps } from 'datagateway-common';
import axios from 'axios';
import { QueryClientProvider, QueryClient } from 'react-query';
import { Store } from 'redux';
import InvestigationSearchTable from './table/investigationSearchTable.component';
import DatasetSearchTable from './table/datasetSearchTable.component';
import DatafileSearchTable from './table/datafileSearchTable.component';
import { createMemoryHistory, History } from 'history';
import { render } from '@testing-library/react';
import InvestigationCardView from './card/investigationSearchCardView.component';
import DatasetCardView from './card/datasetSearchCardView.component';

jest.mock('datagateway-common', () => ({
  ...jest.requireActual('datagateway-common'),
  __esModule: true,
  // mock table to opt out of rendering them in these tests as there's no need
  Table: jest.fn(() => 'MockedTable'),
}));

describe('SearchTabs', () => {
  let state: StateType;
  let history: History;
  let props: SearchTabsProps & CartProps;
  const mockStore = configureStore([thunk]);

  const onTabChange = jest.fn();
  const navigateToDownload = jest.fn();

  const createWrapper = (
    store: Store = mockStore(state),
    props: SearchTabsProps & CartProps
  ): ReactWrapper => {
    return mount(
      <Provider store={store}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <SearchPageTabs {...props} />
          </QueryClientProvider>
        </Router>
      </Provider>
    );
  };

  beforeEach(() => {
    history = createMemoryHistory({
      initialEntries: ['/search/data'],
    });

    state = JSON.parse(
      JSON.stringify({ dgsearch: initialState, dgcommon: dGCommonInitialState })
    );

    props = {
      view: 'table',
      onTabChange: onTabChange,
      currentTab: 'investigation',
      cartItems: [],
      navigateToDownload: navigateToDownload,
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
    onTabChange.mockClear();
    navigateToDownload.mockClear();
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
    const wrapper = render(
      <Provider store={testStore}>
        <MemoryRouter
          initialEntries={[{ key: 'testKey', pathname: '/search/data' }]}
        >
          <QueryClientProvider client={new QueryClient()}>
            <SearchPageTabs {...props} />
          </QueryClientProvider>
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.asFragment()).toMatchSnapshot();
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

    const testStore = mockStore(state);
    const wrapper = createWrapper(testStore, props);

    expect(wrapper.exists(InvestigationSearchTable)).toBeTruthy();

    wrapper
      .find('[aria-controls="simple-tabpanel-dataset"]')
      .last()
      .simulate('click');

    expect(onTabChange).toHaveBeenNthCalledWith(1, 'dataset');
  });

  describe('table view', () => {
    it('has the investigation search table component when on the investigation tab', () => {
      const updatedProps = {
        ...props,
        currentTab: 'investigation',
      };

      const testStore = mockStore(state);
      const wrapper = createWrapper(testStore, updatedProps);
      expect(wrapper.exists(InvestigationSearchTable)).toBeTruthy();
    });

    it('has the dataset search table component when on the dataset tab', () => {
      const updatedProps = {
        ...props,
        currentTab: 'dataset',
      };

      // Mock to prevent error logging
      const spy = jest.spyOn(console, 'error').mockImplementation();
      const testStore = mockStore(state);
      const wrapper = createWrapper(testStore, updatedProps);

      expect(wrapper.exists(DatasetSearchTable)).toBeTruthy();
      spy.mockRestore();
    });

    it('has the datafile search table component when on the datafile tab', () => {
      const updatedProps = {
        ...props,
        currentTab: 'datafile',
      };

      // Mock to prevent error logging
      const spy = jest.spyOn(console, 'error').mockImplementation();
      const testStore = mockStore(state);
      const wrapper = createWrapper(testStore, updatedProps);

      expect(wrapper.exists(DatafileSearchTable)).toBeTruthy();
      spy.mockRestore();
    });
  });

  describe('card view', () => {
    beforeEach(() => {
      props.view = 'card';
    });

    it('has the investigation search card view component when on the investigation tab', () => {
      const updatedProps = {
        ...props,
        currentTab: 'investigation',
      };

      const testStore = mockStore(state);
      const wrapper = createWrapper(testStore, updatedProps);
      expect(wrapper.exists(InvestigationCardView)).toBeTruthy();
    });

    it('has the dataset search card view component when on the dataset tab', () => {
      const updatedProps = {
        ...props,
        currentTab: 'dataset',
      };

      // Mock to prevent error logging
      const spy = jest.spyOn(console, 'error').mockImplementation();
      const testStore = mockStore(state);
      const wrapper = createWrapper(testStore, updatedProps);

      expect(wrapper.exists(DatasetCardView)).toBeTruthy();
      spy.mockRestore();
    });

    it('has the datafile search table component when on the datafile tab', () => {
      const updatedProps = {
        ...props,
        currentTab: 'datafile',
      };

      // Mock to prevent error logging
      const spy = jest.spyOn(console, 'error').mockImplementation();
      const testStore = mockStore(state);
      const wrapper = createWrapper(testStore, updatedProps);

      expect(wrapper.exists(DatafileSearchTable)).toBeTruthy();
      spy.mockRestore();
    });
  });
});