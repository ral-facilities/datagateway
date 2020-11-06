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

    state.dgsearch.requestReceived = true;
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
      },
      searchData: {
        investigation: Array(1),
        dataset: Array(10),
        datafile: Array(100),
      },
    };
    const mockStore = configureStore([thunk]);
    const wrapper = mount(
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
        .find('[aria-label="searchPageTable.tabs_arialabel"]')
        .first()
        .prop('value')
    ).toEqual('investigation');
  });

  it('defaults to dataset tab when investigation tab is hidden', () => {
    state.dgsearch = {
      ...state.dgsearch,
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
        .find('[aria-label="searchPageTable.tabs_arialabel"]')
        .first()
        .prop('value')
    ).toEqual('dataset');
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
        .find('[aria-label="searchPageTable.tabs_arialabel"]')
        .first()
        .prop('value')
    ).toEqual('datafile');
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
        .find('[aria-label="searchPageTable.tabs_arialabel"]')
        .first()
        .prop('value')
    ).toEqual('investigation');

    wrapper
      .find('[aria-controls="simple-tabpanel-dataset"]')
      .first()
      .simulate('click');

    expect(
      wrapper
        .find('[aria-label="searchPageTable.tabs_arialabel"]')
        .first()
        .prop('value')
    ).toEqual('dataset');
  });
});
