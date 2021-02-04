import React from 'react';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import ISISStudiesTable from './isisStudiesTable.component';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import configureStore from 'redux-mock-store';
import { StateType } from '../../../state/app.types';
import {
  fetchStudiesRequest,
  filterTable,
  sortTable,
  fetchStudyCountRequest,
  dGCommonInitialState,
  fetchAllIdsRequest,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router';
import axios from 'axios';

describe('ISIS Studies table component', () => {
  let shallow;
  let mount;
  let mockStore;
  let state: StateType;
  (axios.get as jest.Mock).mockImplementation(() =>
    Promise.resolve({ data: [] })
  );
  global.Date.now = jest.fn(() => 1);

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'ISISStudiesTable' });
    mount = createMount();

    mockStore = configureStore([thunk]);
    state = JSON.parse(
      JSON.stringify({
        dgdataview: dgDataViewInitialState,
        dgcommon: dGCommonInitialState,
      })
    );
    state.dgcommon.data = [
      {
        ID: 1,
        STUDY_ID: 1,
        INVESTIGATION_ID: 1,
        STUDY: {
          ID: 1,
          PID: 'doi',
          NAME: 'Test 1',
          MOD_TIME: '2000-01-01',
          CREATE_TIME: '2000-01-01',
        },
      },
    ];
  });

  afterEach(() => {
    mount.cleanUp();
  });

  it('renders correctly', () => {
    const wrapper = shallow(
      <ISISStudiesTable store={mockStore(state)} instrumentId="1" />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('sends fetchAllIds action on load', () => {
    const testStore = mockStore(state);
    mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISStudiesTable instrumentId="1" />
        </MemoryRouter>
      </Provider>
    );
    expect(testStore.getActions()[0]).toEqual(fetchAllIdsRequest(1));
  });

  it('sends fetchStudyCount and fetchStudies requests when allIds fetched', () => {
    let testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISStudiesTable instrumentId="1" />
        </MemoryRouter>
      </Provider>
    );
    testStore = mockStore({
      ...state,
      dgcommon: { ...state.dgcommon, allIds: [1] },
    });
    wrapper.setProps({ store: testStore });
    expect(testStore.getActions().length).toEqual(3);
    expect(testStore.getActions()[1]).toEqual(fetchStudyCountRequest(1));
    expect(testStore.getActions()[2]).toEqual(fetchStudiesRequest(1));
  });

  it('sends fetchStudies action when loadMoreRows is called', () => {
    const testStore = mockStore(state);
    const wrapper = shallow(
      <ISISStudiesTable instrumentId="1" store={testStore} />
    );

    wrapper.prop('loadMoreRows')({ startIndex: 50, stopIndex: 74 });

    expect(testStore.getActions()[0]).toEqual(fetchStudiesRequest(1));
  });

  it('sends filterTable action on text filter', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISStudiesTable instrumentId="1" />
        </MemoryRouter>
      </Provider>
    );

    const filterInput = wrapper
      .find('[aria-label="Filter by studies.name"] input')
      .first();
    filterInput.instance().value = 'test';
    filterInput.simulate('change');

    expect(testStore.getActions()[1]).toEqual(
      filterTable('STUDY.NAME', { value: 'test', type: 'include' })
    );

    filterInput.instance().value = '';
    filterInput.simulate('change');

    expect(testStore.getActions()[3]).toEqual(filterTable('STUDY.NAME', null));
  });

  it('sends filterTable action on date filter', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISStudiesTable instrumentId="1" />
        </MemoryRouter>
      </Provider>
    );

    const filterInput = wrapper.find(
      '[aria-label="studies.end_date date filter to"]'
    );
    filterInput.instance().value = '2019-08-06';
    filterInput.simulate('change');

    expect(testStore.getActions()[1]).toEqual(
      filterTable('STUDY.ENDDATE', { endDate: '2019-08-06' })
    );

    filterInput.instance().value = '';
    filterInput.simulate('change');

    expect(testStore.getActions()[3]).toEqual(
      filterTable('STUDY.ENDDATE', null)
    );
  });

  it('sends sortTable action on sort', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISStudiesTable instrumentId="1" />
        </MemoryRouter>
      </Provider>
    );

    wrapper
      .find('[role="columnheader"] span[role="button"]')
      .first()
      .simulate('click');

    expect(testStore.getActions()[1]).toEqual(sortTable('STUDY.NAME', 'asc'));
  });

  it('renders studies name as a link', () => {
    const wrapper = mount(
      <Provider store={mockStore(state)}>
        <MemoryRouter>
          <ISISStudiesTable instrumentId="1" />
        </MemoryRouter>
      </Provider>
    );

    expect(
      wrapper.find('[aria-colindex=1]').find('p').children()
    ).toMatchSnapshot();
  });
});
