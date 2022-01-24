import React from 'react';
import { StateType } from './state/app.types';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';

import SearchPageCardView from './searchPageCardView.component';

import { mount as enzymeMount, ReactWrapper } from 'enzyme';
import { createMount } from '@material-ui/core/test-utils';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { initialState } from './state/reducers/dgsearch.reducer';
import { dGCommonInitialState } from 'datagateway-common';
import { setCurrentTab } from './state/actions/actions';
import axios from 'axios';
import { QueryClientProvider, QueryClient } from 'react-query';
import { Store } from 'redux';
import InvestigationSearchCardView from './card/investigationSearchCardView.component';

jest.mock('datagateway-common', () => ({
  ...jest.requireActual('datagateway-common'),
  __esModule: true,
  // mock card view to opt out of rendering them in these tests as there's no need
  CardView: jest.fn(() => 'MockedCardView'),
}));

describe('SearchPageCardView', () => {
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
            <SearchPageCardView />
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
        currentTab: 'investigation',
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
        currentTab: 'investigation',
      },
    };

    const testStore = mockStore(state);
    const wrapper = createWrapper(testStore);
    expect(testStore.getState().dgsearch.tabs.currentTab).toEqual(
      'investigation'
    );
    expect(wrapper.exists(InvestigationSearchCardView)).toBeTruthy();
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
        currentTab: 'investigation',
      },
    };

    // Mock to prevent error logging
    const spy = jest.spyOn(console, 'error').mockImplementation();
    const testStore = mockStore(state);
    createWrapper(testStore);
    spy.mockRestore();

    expect(testStore.getActions()).toHaveLength(1);
    expect(testStore.getActions()[0]).toEqual(setCurrentTab('dataset'));
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
        currentTab: 'investigation',
      },
    };

    // Mock to prevent error logging
    const spy = jest.spyOn(console, 'error').mockImplementation();
    const testStore = mockStore(state);
    createWrapper(testStore);
    spy.mockRestore();

    expect(testStore.getActions()).toHaveLength(1);
    expect(testStore.getActions()[0]).toEqual(setCurrentTab('datafile'));
  });

  it('changes selected tab value on click of a new tab', () => {
    state.dgsearch = {
      ...state.dgsearch,
      tabs: {
        datasetTab: true,
        datafileTab: true,
        investigationTab: true,
        currentTab: 'investigation',
      },
    };
    const testStore = mockStore(state);

    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter
          initialEntries={[
            {
              key: 'testKey',
              pathname: '/search/data?view=card&page=3&results=20',
            },
          ]}
        >
          <QueryClientProvider client={new QueryClient()}>
            <SearchPageCardView />
          </QueryClientProvider>
        </MemoryRouter>
      </Provider>
    );

    expect(testStore.getState().dgsearch.tabs.currentTab).toEqual(
      'investigation'
    );
    expect(wrapper.exists(InvestigationSearchCardView)).toBeTruthy();

    wrapper
      .find('[aria-controls="simple-tabpanel-dataset"]')
      .first()
      .simulate('click');

    expect(testStore.getActions()).toContainEqual(setCurrentTab('dataset'));
  });

  it('sets the current tab based on selected tabs', () => {
    state.dgsearch = {
      ...state.dgsearch,
      tabs: {
        datasetTab: true,
        datafileTab: true,
        investigationTab: false,
        currentTab: 'investigation',
      },
    };
    let testStore = mockStore(state);
    createWrapper(testStore);

    expect(testStore.getActions()).toContainEqual(setCurrentTab('dataset'));

    state.dgsearch = {
      ...state.dgsearch,
      tabs: {
        datasetTab: false,
        datafileTab: true,
        investigationTab: false,
        currentTab: 'investigation',
      },
    };

    testStore = mockStore(state);
    createWrapper(testStore);

    expect(testStore.getActions()).toContainEqual(setCurrentTab('datafile'));

    state.dgsearch = {
      ...state.dgsearch,
      tabs: {
        datasetTab: false,
        datafileTab: true,
        investigationTab: true,
        currentTab: 'dataset',
      },
    };

    testStore = mockStore(state);
    createWrapper(testStore);

    expect(testStore.getActions()).toContainEqual(
      setCurrentTab('investigation')
    );

    state.dgsearch = {
      ...state.dgsearch,
      tabs: {
        datasetTab: false,
        datafileTab: true,
        investigationTab: false,
        currentTab: 'dataset',
      },
    };

    testStore = mockStore(state);
    createWrapper(testStore);

    expect(testStore.getActions()).toContainEqual(setCurrentTab('datafile'));

    state.dgsearch = {
      ...state.dgsearch,
      tabs: {
        datasetTab: true,
        datafileTab: false,
        investigationTab: true,
        currentTab: 'datafile',
      },
    };

    testStore = mockStore(state);
    createWrapper(testStore);

    expect(testStore.getActions()).toContainEqual(
      setCurrentTab('investigation')
    );

    state.dgsearch = {
      ...state.dgsearch,
      tabs: {
        datasetTab: true,
        datafileTab: false,
        investigationTab: false,
        currentTab: 'datafile',
      },
    };

    testStore = mockStore(state);
    createWrapper(testStore);

    expect(testStore.getActions()).toContainEqual(setCurrentTab('dataset'));
  });

  it('currentTab reverts to investigation if no tabs are selected', () => {
    state.dgsearch = {
      ...state.dgsearch,
      tabs: {
        datasetTab: false,
        datafileTab: false,
        investigationTab: false,
        currentTab: 'dataset',
      },
    };
    let testStore = mockStore(state);
    createWrapper(testStore);

    expect(testStore.getActions()).toContainEqual(
      setCurrentTab('investigation')
    );

    state.dgsearch = {
      ...state.dgsearch,
      tabs: {
        datasetTab: false,
        datafileTab: false,
        investigationTab: false,
        currentTab: 'datafile',
      },
    };
    testStore = mockStore(state);
    createWrapper(testStore);

    expect(testStore.getActions()).toContainEqual(
      setCurrentTab('investigation')
    );
  });
});
