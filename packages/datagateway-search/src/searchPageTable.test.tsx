import React from 'react';
import { StateType } from './state/app.types';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';

import SearchPageTable from './searchPageTable';

import { mount as enzymeMount, shallow as enzymeShallow } from 'enzyme';
import { createMount, createShallow } from '@material-ui/core/test-utils';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { initialState } from './state/reducers/dgsearch.reducer';
import { dGCommonInitialState } from 'datagateway-common';
import { setCurrentTab } from './state/actions/actions';
import axios from 'axios';

describe('SearchPageTable', () => {
  let mount: typeof enzymeMount;
  let shallow: typeof enzymeShallow;
  let state: StateType;

  beforeEach(() => {
    mount = createMount();
    shallow = createShallow({ untilSelector: 'Paper' });

    state = JSON.parse(
      JSON.stringify({ dgsearch: initialState, dgcommon: dGCommonInitialState })
    );

    state.dgsearch.requestReceived = true;

    (axios.get as jest.Mock).mockImplementation(() =>
      Promise.resolve({ data: [] })
    );
  });

  it('renders SearchPageTable correctly before request', () => {
    state.dgsearch.requestReceived = false;
    const mockStore = configureStore([thunk]);
    const wrapper = mount(
      <div>
        <SearchPageTable store={mockStore(state)} />
      </div>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders SearchPageTable correctly after request', () => {
    state.dgsearch = {
      ...state.dgsearch,
      tabs: {
        datasetTab: true,
        datafileTab: true,
        investigationTab: true,
        currentTab: 'investigation',
      },
      searchData: {
        investigation: Array(1),
        dataset: Array(10),
        datafile: Array(100),
      },
    };
    const mockStore = configureStore([thunk]);
    const wrapper = shallow(
      <Provider store={mockStore(state)}>
        <SearchPageTable store={mockStore(state)} />
      </Provider>
    );
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

    const mockStore = configureStore([thunk]);
    const testStore = mockStore(state);
    mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <SearchPageTable />
        </MemoryRouter>
      </Provider>
    );

    expect(testStore.getActions()).toContainEqual(
      setCurrentTab('investigation')
    );
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
    const mockStore = configureStore([thunk]);
    const testStore = mockStore(state);
    mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <SearchPageTable />
        </MemoryRouter>
      </Provider>
    );
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
    const mockStore = configureStore([thunk]);
    const testStore = mockStore(state);
    mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <SearchPageTable />
        </MemoryRouter>
      </Provider>
    );
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
    const mockStore = configureStore([thunk]);
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <SearchPageTable />
        </MemoryRouter>
      </Provider>
    );

    expect(testStore.getActions()).toContainEqual(
      setCurrentTab('investigation')
    );

    wrapper
      .find('[aria-controls="simple-tabpanel-dataset"]')
      .first()
      .simulate('click');

    expect(testStore.getActions()).toContainEqual(setCurrentTab('dataset'));
  });
});
