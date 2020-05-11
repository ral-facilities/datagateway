import React from 'react';
import { StateType } from './state/app.types';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';

import SearchPageTable from './searchPageTable';

import { mount as enzymeMount } from 'enzyme';
import { createMount } from '@material-ui/core/test-utils';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { initialState } from './state/reducers/dgsearch.reducer';
import { dGCommonInitialState } from 'datagateway-common';

describe('SearchPageTable', () => {
  let mount: typeof enzymeMount;
  let state: StateType;

  beforeEach(() => {
    mount = createMount();

    state = JSON.parse(
      JSON.stringify({ dgsearch: initialState, dgcommon: dGCommonInitialState })
    );
  });

  it('renders SearchPageTable correctly', () => {
    const mockStore = configureStore([thunk]);
    const wrapper = mount(
      <div>
        <SearchPageTable store={mockStore(state)} />
      </div>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('defaults to investigation tab', () => {
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
        investigation: true,
      },
      tabs: {
        datasetTab: true,
        datafileTab: true,
        investigationTab: true,
      },
      requestReceived: true,
      searchData: {
        dataset: [],
        datafile: [],
        investigation: [],
      },
    };
    const mockStore = configureStore([thunk]);
    const wrapper = mount(
      <Provider store={mockStore(state)}>
        <MemoryRouter>
          <SearchPageTable />
        </MemoryRouter>
      </Provider>
    );

    expect(
      wrapper
        .find('[aria-label="simple tabs example"]')
        .first()
        .prop('value')
    ).toEqual('investigation');
  });
  it('defaults to dataset tab when investigation tab is hidden', () => {
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
      tabs: {
        datasetTab: true,
        datafileTab: true,
        investigationTab: false,
      },
      requestReceived: true,
      searchData: {
        dataset: [],
        datafile: [],
        investigation: [],
      },
    };
    const mockStore = configureStore([thunk]);
    const wrapper = mount(
      <Provider store={mockStore(state)}>
        <MemoryRouter>
          <SearchPageTable />
        </MemoryRouter>
      </Provider>
    );

    expect(
      wrapper
        .find('[aria-label="simple tabs example"]')
        .first()
        .prop('value')
    ).toEqual('dataset');
  });
  it('defaults to datafile tab when investigation and dataset tab is hidden', () => {
    state.dgsearch = {
      searchText: '',
      text: '',
      selectDate: {
        startDate: null,
        endDate: null,
      },
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
      requestReceived: true,
      searchData: {
        dataset: [],
        datafile: [],
        investigation: [],
      },
    };
    const mockStore = configureStore([thunk]);
    const wrapper = mount(
      <Provider store={mockStore(state)}>
        <MemoryRouter>
          <SearchPageTable />
        </MemoryRouter>
      </Provider>
    );

    expect(
      wrapper
        .find('[aria-label="simple tabs example"]')
        .first()
        .prop('value')
    ).toEqual('datafile');
  });
  it('changes selected tab value on click of a new tab', () => {
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
        investigation: true,
      },
      tabs: {
        datasetTab: true,
        datafileTab: true,
        investigationTab: true,
      },
      requestReceived: true,
      searchData: {
        dataset: [],
        datafile: [],
        investigation: [],
      },
    };
    const mockStore = configureStore([thunk]);
    const wrapper = mount(
      <Provider store={mockStore(state)}>
        <MemoryRouter>
          <SearchPageTable />
        </MemoryRouter>
      </Provider>
    );

    expect(
      wrapper
        .find('[aria-label="simple tabs example"]')
        .first()
        .prop('value')
    ).toEqual('investigation');

    wrapper
      .find('[aria-controls="simple-tabpanel-dataset"]')
      .first()
      .simulate('click');

    expect(
      wrapper
        .find('[aria-label="simple tabs example"]')
        .first()
        .prop('value')
    ).toEqual('dataset');
  });
});
