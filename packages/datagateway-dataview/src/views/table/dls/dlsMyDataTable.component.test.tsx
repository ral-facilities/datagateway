import { createMount, createShallow } from '@material-ui/core/test-utils';
import axios from 'axios';
import {
  dGCommonInitialState,
  fetchInvestigationCountRequest,
  fetchInvestigationDetailsRequest,
  fetchInvestigationSizeRequest,
  fetchInvestigationsRequest,
  filterTable,
  NotificationType,
  sortTable,
  Table,
} from 'datagateway-common';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { AnyAction } from 'redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { StateType } from '../../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import DLSMyDataTable from './dlsMyDataTable.component';

describe('DLS Visits table component', () => {
  let shallow;
  let mount;
  let mockStore;
  let state: StateType;
  let events: CustomEvent<AnyAction>[] = [];

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'DLSMyDataTable' });
    mount = createMount();
    events = [];

    document.dispatchEvent = (e: Event) => {
      events.push(e as CustomEvent<AnyAction>);
      return true;
    };

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
    const wrapper = shallow(<DLSMyDataTable store={mockStore(state)} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('sends default sortTable and default filterTable action on load', () => {
    const testStore = mockStore(state);
    mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <DLSMyDataTable />
        </MemoryRouter>
      </Provider>
    );

    expect(testStore.getActions().length).toEqual(6);
    expect(testStore.getActions()[0]).toEqual(sortTable('startDate', 'desc'));
    expect(testStore.getActions()[2]).toEqual(
      filterTable('startDate', {
        endDate: `1970-01-01`,
      })
    );
  });

  it('sends fetchInvestigationCount and fetchInvestigations actions when watched store values change', () => {
    let testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <DLSMyDataTable />
        </MemoryRouter>
      </Provider>
    );

    // simulate clearTable action
    testStore = mockStore({
      ...state,
      dgdataview: { ...state.dgdataview, sort: {}, filters: {} },
    });
    wrapper.setProps({ store: testStore });

    expect(testStore.getActions()[4]).toEqual(
      fetchInvestigationCountRequest(1)
    );
    expect(testStore.getActions()[5]).toEqual(fetchInvestigationsRequest(1));
  });

  it('sends fetchInvestigations action when loadMoreRows is called', () => {
    const testStore = mockStore(state);
    const wrapper = shallow(<DLSMyDataTable store={testStore} />);

    wrapper.prop('loadMoreRows')({ startIndex: 50, stopIndex: 74 });

    expect(testStore.getActions()[0]).toEqual(fetchInvestigationsRequest(1));
  });

  it('sends filterTable action on text filter', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <DLSMyDataTable />
        </MemoryRouter>
      </Provider>
    );

    const filterInput = wrapper
      .find('[aria-label="Filter by investigations.visit_id"] input')
      .first();
    filterInput.instance().value = 'test';
    filterInput.simulate('change');

    expect(testStore.getActions()[6]).toEqual(
      filterTable('visitId', { value: 'test', type: 'include' })
    );

    filterInput.instance().value = '';
    filterInput.simulate('change');

    expect(testStore.getActions()[8]).toEqual(filterTable('visitId', null));
  });

  it('sends filterTable action on date filter', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <DLSMyDataTable />
        </MemoryRouter>
      </Provider>
    );

    const filterInput = wrapper.find(
      '[aria-label="investigations.end_date date filter to"]'
    );
    filterInput.instance().value = '2019-08-06';
    filterInput.simulate('change');

    expect(testStore.getActions()[6]).toEqual(
      filterTable('endDate', { endDate: '2019-08-06' })
    );

    filterInput.instance().value = '';
    filterInput.simulate('change');

    expect(testStore.getActions()[8]).toEqual(filterTable('endDate', null));
  });

  it('sends sortTable action on sort', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <DLSMyDataTable />
        </MemoryRouter>
      </Provider>
    );

    wrapper
      .find('[role="columnheader"] span[role="button"]')
      .first()
      .simulate('click');

    expect(testStore.getActions()[6]).toEqual(sortTable('title', 'asc'));
  });

  it('renders details panel correctly and it sends off an FetchInvestigationDetails action', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <DLSMyDataTable />
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

    expect(testStore.getActions()[6]).toEqual(
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
          <DLSMyDataTable />
        </MemoryRouter>
      </Provider>
    );

    wrapper.find('[aria-label="Show details"]').first().simulate('click');

    wrapper.find('#calculate-size-btn').first().simulate('click');

    expect(testStore.getActions()[7]).toEqual(fetchInvestigationSizeRequest());
  });

  it('renders title and visit ID as a links', () => {
    const wrapper = mount(
      <Provider store={mockStore(state)}>
        <MemoryRouter>
          <DLSMyDataTable />
        </MemoryRouter>
      </Provider>
    );

    expect(
      wrapper.find('[aria-colindex=2]').find('p').children()
    ).toMatchSnapshot();

    expect(
      wrapper.find('[aria-colindex=3]').find('p').children()
    ).toMatchSnapshot();
  });

  it('gracefully handles empty InvestigationInstrument and missing Instrument from InvestigationInstrument object', () => {
    state.dgcommon.data[0] = {
      ...state.dgcommon.data[0],
      investigationInstruments: [],
    };

    let wrapper = mount(
      <Provider store={mockStore(state)}>
        <MemoryRouter>
          <DLSMyDataTable />
        </MemoryRouter>
      </Provider>
    );

    expect(() => wrapper).not.toThrowError();

    state.dgcommon.data[0] = {
      ...state.dgcommon.data[0],
      investigationInstruments: [
        {
          id: 1,
        },
      ],
    };
    wrapper = mount(
      <Provider store={mockStore(state)}>
        <MemoryRouter>
          <DLSMyDataTable />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find('[aria-colindex=5]').find('p').text()).toEqual('');
  });

  it('sends a notification to SciGateway if user is not logged in', () => {
    state.dgcommon.data = [];
    localStorage.setItem('autoLogin', 'true');

    mount(
      <Provider store={mockStore(state)}>
        <MemoryRouter>
          <DLSMyDataTable />
        </MemoryRouter>
      </Provider>
    );

    expect(events.length).toBe(1);
    expect(events[0].detail).toEqual({
      type: NotificationType,
      payload: {
        severity: 'warning',
        message: 'my_data_table.login_warning_msg',
      },
    });
  });
});
