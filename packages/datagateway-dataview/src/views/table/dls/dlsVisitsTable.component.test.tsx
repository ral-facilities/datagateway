import { createMount, createShallow } from '@material-ui/core/test-utils';
import axios from 'axios';
import {
  dGCommonInitialState,
  fetchInvestigationCountRequest,
  fetchInvestigationDetailsRequest,
  fetchInvestigationSizeRequest,
  fetchInvestigationsRequest,
  filterTable,
  sortTable,
  Table,
} from 'datagateway-common';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { StateType } from '../../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import DLSVisitsTable from './dlsVisitsTable.component';

describe('DLS Visits table component', () => {
  let shallow;
  let mount;
  let mockStore;
  let state: StateType;

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'DLSVisitsTable' });
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
        id: 1,
        title: 'Test 1',
        name: 'Test 1',
        summary: 'foo bar',
        visitId: '1',
        rbNumber: '1',
        doi: 'doi 1',
        size: 1,
        investigationInstruments: [
          {
            id: 1,
            instrument: {
              id: 3,
              name: 'LARMOR',
            },
          },
        ],
        startDate: '2019-06-10',
        endDate: '2019-06-11',
      },
    ];

    (axios.get as jest.Mock).mockImplementation(() =>
      Promise.resolve({ data: [] })
    );
    global.Date.now = jest.fn(() => 1);
  });

  afterEach(() => {
    mount.cleanUp();
  });

  it('renders correctly', () => {
    const wrapper = shallow(<DLSVisitsTable store={mockStore(state)} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('sends fetchInvestigationCount and fetchInvestigations actions when watched store values change', () => {
    let testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <DLSVisitsTable proposalName="Test 1" />
        </MemoryRouter>
      </Provider>
    );

    // simulate clearTable action
    testStore = mockStore({
      ...state,
      dgdataview: { ...state.dgdataview, sort: {}, filters: {} },
    });
    wrapper.setProps({ store: testStore });

    expect(testStore.getActions()[0]).toEqual(
      fetchInvestigationCountRequest(1)
    );
    expect(testStore.getActions()[1]).toEqual(fetchInvestigationsRequest(1));
  });

  it('sends fetchInvestigations action when loadMoreRows is called', () => {
    const testStore = mockStore(state);
    const wrapper = shallow(
      <DLSVisitsTable proposalName="Test 1" store={testStore} />
    );

    wrapper.prop('loadMoreRows')({ startIndex: 50, stopIndex: 74 });

    expect(testStore.getActions()[0]).toEqual(fetchInvestigationsRequest(1));
  });

  it('sends filterTable action on text filter', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <DLSVisitsTable proposalName="Test 1" />
        </MemoryRouter>
      </Provider>
    );

    const filterInput = wrapper
      .find('[aria-label="Filter by investigations.visitId"] input')
      .first();
    filterInput.instance().value = 'test';
    filterInput.simulate('change');

    expect(testStore.getActions()[2]).toEqual(
      filterTable('visitId', { value: 'test', type: 'include' })
    );

    filterInput.instance().value = '';
    filterInput.simulate('change');

    expect(testStore.getActions()[4]).toEqual(filterTable('visitId', null));
  });

  it('sends filterTable action on date filter', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <DLSVisitsTable proposalName="Test 1" />
        </MemoryRouter>
      </Provider>
    );

    const filterInput = wrapper.find(
      '[aria-label="investigations.end_date date filter to"]'
    );
    filterInput.instance().value = '2019-08-06';
    filterInput.simulate('change');

    expect(testStore.getActions()[2]).toEqual(
      filterTable('endDate', { endDate: '2019-08-06' })
    );

    filterInput.instance().value = '';
    filterInput.simulate('change');

    expect(testStore.getActions()[4]).toEqual(filterTable('endDate', null));
  });

  it('sends sortTable action on sort', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <DLSVisitsTable proposalName="Test 1" />
        </MemoryRouter>
      </Provider>
    );

    wrapper
      .find('[role="columnheader"] span[role="button"]')
      .first()
      .simulate('click');

    expect(testStore.getActions()[2]).toEqual(sortTable('visitId', 'asc'));
  });

  it('renders details panel correctly and it sends off an FetchInvestigationDetails action', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <DLSVisitsTable proposalName="Test 1" />
        </MemoryRouter>
      </Provider>
    );

    const detailsPanelWrapper = shallow(
      wrapper.find(Table).prop('detailsPanel')({
        rowData: state.dgcommon.data[0],
      })
    );
    expect(detailsPanelWrapper).toMatchSnapshot();

    mount(
      wrapper.find(Table).prop('detailsPanel')({
        rowData: state.dgcommon.data[0],
        detailsPanelResize: jest.fn(),
      })
    );
    expect(testStore.getActions()[2]).toEqual(
      fetchInvestigationDetailsRequest()
    );
  });

  it('sends off an FetchInvestigationSize action when Calculate button is clicked', () => {
    const { size, ...rowDataWithoutSize } = state.dgcommon.data[0];
    const newState = state;
    newState.dgcommon.data[0] = rowDataWithoutSize;
    const testStore = mockStore(newState);

    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <DLSVisitsTable proposalName="Test 1" />
        </MemoryRouter>
      </Provider>
    );

    wrapper.find('[aria-label="Show details"]').first().simulate('click');

    wrapper.find('#calculate-size-btn').first().simulate('click');

    expect(testStore.getActions()[3]).toEqual(fetchInvestigationSizeRequest());
  });

  it('renders visit ID as a links', () => {
    const wrapper = mount(
      <Provider store={mockStore(state)}>
        <MemoryRouter>
          <DLSVisitsTable proposalName="Test 1" />
        </MemoryRouter>
      </Provider>
    );

    expect(
      wrapper.find('[aria-colindex=2]').find('p').children()
    ).toMatchSnapshot();
  });

  it('gracefully handles missing Instrument from InvestigationInstrument object', () => {
    state.dgcommon.data[0] = {
      ...state.dgcommon.data[0],
      investigationInstruments: [
        {
          id: 1,
        },
      ],
    };
    const wrapper = mount(
      <Provider store={mockStore(state)}>
        <MemoryRouter>
          <DLSVisitsTable proposalName="Test 1" />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find('[aria-colindex=4]').find('p').text()).toEqual('');
  });
});
