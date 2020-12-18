import { createMount, createShallow } from '@material-ui/core/test-utils';
import axios from 'axios';
import { push } from 'connected-react-router';
import {
  addToCartRequest,
  dGCommonInitialState,
  fetchInvestigationCountRequest,
  fetchInvestigationDetailsRequest,
  fetchInvestigationsRequest,
  filterTable,
  removeFromCartRequest,
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
import ISISMyDataTable from './isisMyDataTable.component';

describe('ISIS Investigations table component', () => {
  let shallow;
  let mount;
  let mockStore;
  let state: StateType;
  (axios.get as jest.Mock).mockImplementation(() =>
    Promise.resolve({ data: [] })
  );
  global.Date.now = jest.fn(() => 1);

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'ISISMyDataTable' });
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
        TITLE: 'Test 1 title',
        NAME: 'Test 1 name',
        SUMMARY: 'foo bar',
        VISIT_ID: '1',
        RB_NUMBER: '1',
        DOI: 'doi 1',
        SIZE: 1,
        INVESTIGATIONINSTRUMENT: [
          {
            ID: 1,
            INVESTIGATION_ID: 1,
            INSTRUMENT_ID: 3,
            INSTRUMENT: {
              ID: 3,
              NAME: 'LARMOR',
              FACILITY_ID: 8,
            },
          },
        ],
        STUDYINVESTIGATION: [
          {
            ID: 6,
            STUDY_ID: 7,
            INVESTIGATION_ID: 1,
            STUDY: {
              ID: 7,
              PID: 'study pid',
            },
          },
        ],
        FACILITY: {
          ID: 8,
          NAME: 'LILS',
          FACILITYCYCLE: [
            {
              ID: 8,
              NAME: 'Cycle name',
              FACILITY_ID: 8,
              STARTDATE: '2019-06-01',
              ENDDATE: '2019-07-01',
            },
          ],
        },
        STARTDATE: '2019-06-10',
        ENDDATE: '2019-06-11',
      },
    ];
    state.dgcommon.allIds = [1];
  });

  afterEach(() => {
    mount.cleanUp();
  });

  it('renders correctly', () => {
    const wrapper = shallow(<ISISMyDataTable store={mockStore(state)} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('sends default sortTable action on load', () => {
    const testStore = mockStore(state);
    mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISMyDataTable />
        </MemoryRouter>
      </Provider>
    );

    expect(testStore.getActions().length).toEqual(5);
    expect(testStore.getActions()[0]).toEqual(sortTable('STARTDATE', 'desc'));
  });

  it('sends fetchInvestigationCount and fetchInvestigations actions when watched store values change', () => {
    let testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISMyDataTable />
        </MemoryRouter>
      </Provider>
    );

    // simulate clearTable action
    testStore = mockStore({
      ...state,
      dgdataview: { ...state.dgdataview, sort: {}, filters: {} },
    });
    wrapper.setProps({ store: testStore });

    expect(testStore.getActions()[2]).toEqual(
      fetchInvestigationCountRequest(1)
    );
    expect(testStore.getActions()[3]).toEqual(fetchInvestigationsRequest(1));
  });

  it('sends fetchInvestigations action when loadMoreRows is called', () => {
    const testStore = mockStore(state);
    const wrapper = shallow(<ISISMyDataTable store={testStore} />);

    wrapper.prop('loadMoreRows')({ startIndex: 50, stopIndex: 74 });

    expect(testStore.getActions()[0]).toEqual(fetchInvestigationsRequest(1));
  });

  it('sends filterTable action on text filter', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISMyDataTable />
        </MemoryRouter>
      </Provider>
    );

    const filterInput = wrapper.find(
      '[aria-label="Filter by investigations.title"] input'
    );
    filterInput.instance().value = 'test';
    filterInput.simulate('change');

    expect(testStore.getActions()[5]).toEqual(filterTable('TITLE', 'test'));

    filterInput.instance().value = '';
    filterInput.simulate('change');

    expect(testStore.getActions()[7]).toEqual(filterTable('TITLE', null));
  });

  it('sends filterTable action on date filter', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISMyDataTable />
        </MemoryRouter>
      </Provider>
    );

    const filterInput = wrapper.find(
      '[aria-label="investigations.end_date date filter to"]'
    );
    filterInput.instance().value = '2019-08-06';
    filterInput.simulate('change');

    expect(testStore.getActions()[5]).toEqual(
      filterTable('ENDDATE', { endDate: '2019-08-06' })
    );

    filterInput.instance().value = '';
    filterInput.simulate('change');

    expect(testStore.getActions()[7]).toEqual(filterTable('ENDDATE', null));
  });

  it('sends sortTable action on sort', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISMyDataTable />
        </MemoryRouter>
      </Provider>
    );

    wrapper
      .find('[role="columnheader"] span[role="button"]')
      .first()
      .simulate('click');

    expect(testStore.getActions()[5]).toEqual(sortTable('TITLE', 'asc'));
  });

  it('sends addToCart action on unchecked checkbox click', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISMyDataTable />
        </MemoryRouter>
      </Provider>
    );

    wrapper.find('[aria-label="select row 0"]').first().simulate('click');

    expect(testStore.getActions()[5]).toEqual(addToCartRequest());
  });

  it('sends removeFromCart action on checked checkbox click', () => {
    state.dgcommon.cartItems = [
      {
        entityId: 1,
        entityType: 'investigation',
        id: 1,
        name: 'test',
        parentEntities: [],
      },
    ];

    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISMyDataTable />
        </MemoryRouter>
      </Provider>
    );

    wrapper.find('[aria-label="select row 0"]').first().simulate('click');

    expect(testStore.getActions()[5]).toEqual(removeFromCartRequest());
  });

  it('selected rows only considers relevant cart items', () => {
    state.dgcommon.cartItems = [
      {
        entityId: 2,
        entityType: 'investigation',
        id: 1,
        name: 'test',
        parentEntities: [],
      },
      {
        entityId: 1,
        entityType: 'dataset',
        id: 2,
        name: 'test',
        parentEntities: [],
      },
    ];

    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISMyDataTable />
        </MemoryRouter>
      </Provider>
    );

    const selectAllCheckbox = wrapper
      .find('[aria-label="select all rows"]')
      .first();

    expect(selectAllCheckbox.prop('checked')).toEqual(false);
    expect(selectAllCheckbox.prop('data-indeterminate')).toEqual(false);
  });

  it('renders details panel correctly and it sends actions', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISMyDataTable />
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

    expect(testStore.getActions()[5]).toEqual(
      fetchInvestigationDetailsRequest()
    );

    detailsPanelWrapper.find('#investigation-datasets-tab').simulate('click');
    expect(testStore.getActions()).toHaveLength(7);
    expect(testStore.getActions()[6]).toEqual(
      push('/browse/instrument/3/facilityCycle/8/investigation/1/dataset')
    );
  });

  it('renders details panel without datasets link if Facility not set', () => {
    state.dgcommon.data[0].FACILITY = {};
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISMyDataTable />
        </MemoryRouter>
      </Provider>
    );

    const detailsPanelWrapper = shallow(
      wrapper.find(Table).prop('detailsPanel')({
        rowData: state.dgcommon.data[0],
      })
    );

    expect(
      detailsPanelWrapper.find('#investigation-datasets-tab').length
    ).toEqual(0);
  });

  it('renders title and RB number as links', () => {
    const wrapper = mount(
      <Provider store={mockStore(state)}>
        <MemoryRouter>
          <ISISMyDataTable />
        </MemoryRouter>
      </Provider>
    );

    expect(
      wrapper.find('[aria-colindex=3]').find('p').children()
    ).toMatchSnapshot();

    expect(
      wrapper.find('[aria-colindex=6]').find('p').children()
    ).toMatchSnapshot();
  });

  it('gracefully handles missing Study from Study Investigation object and missing Instrument from InvestigationInstrument object and missing facility cycles', () => {
    // check it renders plain text if valid facility cycle can't be found
    state.dgcommon.data[0] = {
      ...state.dgcommon.data[0],
      FACILITY: {
        ID: 8,
        NAME: 'LILS',
        FACILITYCYCLE: [
          {
            ID: 9,
            STARTDATE: '2018-01-01',
            ENDDATE: '2019-01-01',
          },
        ],
      },
    };
    let wrapper = mount(
      <Provider store={mockStore(state)}>
        <MemoryRouter>
          <ISISMyDataTable />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find('[aria-colindex=3]').find('p').text()).toEqual(
      'Test 1 title'
    );

    expect(wrapper.find('[aria-colindex=6]').find('p').text()).toEqual(
      'Test 1 name'
    );

    // now check that blank is returned if objects are missing
    state.dgcommon.data[0] = {
      ...state.dgcommon.data[0],
      INVESTIGATIONINSTRUMENT: [
        {
          ID: 1,
          INVESTIGATION_ID: 1,
          INSTRUMENT_ID: 3,
        },
      ],
      STUDYINVESTIGATION: [
        {
          ID: 6,
          STUDY_ID: 7,
          INVESTIGATION_ID: 1,
        },
      ],
      FACILITY: {
        ID: 8,
        NAME: 'LILS',
      },
    };
    wrapper = mount(
      <Provider store={mockStore(state)}>
        <MemoryRouter>
          <ISISMyDataTable />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find('[aria-colindex=4]').find('p').text()).toEqual('');

    expect(wrapper.find('[aria-colindex=7]').find('p').text()).toEqual('');
  });
});
