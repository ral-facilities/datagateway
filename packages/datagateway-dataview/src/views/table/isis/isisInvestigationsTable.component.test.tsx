import React from 'react';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import ISISInvestigationsTable from './isisInvestigationsTable.component';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import configureStore from 'redux-mock-store';
import { StateType } from '../../../state/app.types';
import {
  fetchInvestigationsRequest,
  filterTable,
  sortTable,
  fetchInvestigationDetailsRequest,
  fetchInvestigationCountRequest,
  removeFromCartRequest,
  addToCartRequest,
  dGCommonInitialState,
  fetchAllIdsRequest,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { Table } from 'datagateway-common';
import { MemoryRouter } from 'react-router';
import axios from 'axios';

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
    shallow = createShallow({ untilSelector: 'ISISInvestigationsTable' });
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
        RB_NUMBER: '1',
        doi: 'doi 1',
        size: 1,
        investigationInstruments: [
          {
            id: 1,
            INVESTIGATION_ID: 1,
            INSTRUMENT_ID: 3,
            instrument: {
              id: 3,
              name: 'LARMOR',
              FACILITY_ID: 8,
            },
          },
        ],
        studyInvestigations: [
          {
            id: 6,
            STUDY_ID: 7,
            INVESTIGATION_ID: 1,
            study: {
              id: 7,
              PID: 'study pid',
            },
          },
        ],
        startDate: '2019-06-10',
        endDate: '2019-06-11',
      },
    ];
    state.dgcommon.allIds = [1];
  });

  afterEach(() => {
    mount.cleanUp();
  });

  it('renders correctly', () => {
    const wrapper = shallow(
      <ISISInvestigationsTable
        studyHierarchy={false}
        store={mockStore(state)}
        instrumentId="4"
        instrumentChildId="5"
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('sends fetchInvestigationCount and fetchInvestigations actions when watched store values change', () => {
    let testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISInvestigationsTable
            studyHierarchy={false}
            instrumentId="4"
            instrumentChildId="5"
          />
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
    expect(testStore.getActions()[1]).toEqual(fetchAllIdsRequest(1));
    expect(testStore.getActions()[2]).toEqual(fetchInvestigationsRequest(1));
  });

  it('sends fetchInvestigations action when loadMoreRows is called', () => {
    const testStore = mockStore(state);
    const wrapper = shallow(
      <ISISInvestigationsTable
        studyHierarchy={false}
        instrumentId="4"
        instrumentChildId="5"
        store={testStore}
      />
    );

    wrapper.prop('loadMoreRows')({ startIndex: 50, stopIndex: 74 });

    expect(testStore.getActions()[0]).toEqual(fetchInvestigationsRequest(1));
  });

  it('sends filterTable action on text filter', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISInvestigationsTable
            studyHierarchy={false}
            instrumentId="4"
            instrumentChildId="5"
          />
        </MemoryRouter>
      </Provider>
    );

    const filterInput = wrapper.find(
      '[aria-label="Filter by investigations.title"] input'
    );
    filterInput.instance().value = 'test';
    filterInput.simulate('change');

    expect(testStore.getActions()[3]).toEqual(filterTable('title', 'test'));

    filterInput.instance().value = '';
    filterInput.simulate('change');

    expect(testStore.getActions()[5]).toEqual(filterTable('title', null));
  });

  it('sends filterTable action on date filter', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISInvestigationsTable
            studyHierarchy={false}
            instrumentId="4"
            instrumentChildId="5"
          />
        </MemoryRouter>
      </Provider>
    );

    const filterInput = wrapper.find(
      '[aria-label="investigations.end_date date filter to"]'
    );
    filterInput.instance().value = '2019-08-06';
    filterInput.simulate('change');

    expect(testStore.getActions()[3]).toEqual(
      filterTable('endDate', { endDate: '2019-08-06' })
    );

    filterInput.instance().value = '';
    filterInput.simulate('change');

    expect(testStore.getActions()[5]).toEqual(filterTable('endDate', null));
  });

  it('sends sortTable action on sort', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISInvestigationsTable
            studyHierarchy={false}
            instrumentId="4"
            instrumentChildId="5"
          />
        </MemoryRouter>
      </Provider>
    );

    wrapper
      .find('[role="columnheader"] span[role="button"]')
      .first()
      .simulate('click');

    expect(testStore.getActions()[3]).toEqual(sortTable('title', 'asc'));
  });

  it('sends addToCart action on unchecked checkbox click', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISInvestigationsTable
            studyHierarchy={false}
            instrumentId="4"
            instrumentChildId="5"
          />
        </MemoryRouter>
      </Provider>
    );

    wrapper.find('[aria-label="select row 0"]').first().simulate('click');

    expect(testStore.getActions()[3]).toEqual(addToCartRequest());
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
          <ISISInvestigationsTable
            studyHierarchy={false}
            instrumentId="4"
            instrumentChildId="5"
          />
        </MemoryRouter>
      </Provider>
    );

    wrapper.find('[aria-label="select row 0"]').first().simulate('click');

    expect(testStore.getActions()[3]).toEqual(removeFromCartRequest());
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
          <ISISInvestigationsTable
            studyHierarchy={false}
            instrumentId="4"
            instrumentChildId="5"
          />
        </MemoryRouter>
      </Provider>
    );

    const selectAllCheckbox = wrapper
      .find('[aria-label="select all rows"]')
      .first();

    expect(selectAllCheckbox.prop('checked')).toEqual(false);
    expect(selectAllCheckbox.prop('data-indeterminate')).toEqual(false);
  });

  it('renders details panel correctly and it sends off an FetchInvestigationDetails action', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <ISISInvestigationsTable
            studyHierarchy={false}
            instrumentId="4"
            instrumentChildId="5"
          />
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

    expect(testStore.getActions()[3]).toEqual(
      fetchInvestigationDetailsRequest()
    );
  });

  it('renders title, visit ID, RB number and DOI as links', () => {
    const wrapper = mount(
      <Provider store={mockStore(state)}>
        <MemoryRouter>
          <ISISInvestigationsTable
            studyHierarchy={false}
            instrumentId="4"
            instrumentChildId="5"
          />
        </MemoryRouter>
      </Provider>
    );

    expect(
      wrapper.find('[aria-colindex=3]').find('p').children()
    ).toMatchSnapshot();

    expect(
      wrapper.find('[aria-colindex=4]').find('p').children()
    ).toMatchSnapshot();

    expect(
      wrapper.find('[aria-colindex=5]').find('p').children()
    ).toMatchSnapshot();

    expect(
      wrapper.find('[aria-colindex=6]').find('p').children()
    ).toMatchSnapshot();
  });

  it('renders title, visit ID, RB number and DOI as links in StudyHierarchy', () => {
    const wrapper = mount(
      <Provider store={mockStore(state)}>
        <MemoryRouter>
          <ISISInvestigationsTable
            studyHierarchy={true}
            instrumentId="4"
            instrumentChildId="5"
          />
        </MemoryRouter>
      </Provider>
    );

    expect(
      wrapper.find('[aria-colindex=3]').find('p').children()
    ).toMatchSnapshot();

    expect(
      wrapper.find('[aria-colindex=4]').find('p').children()
    ).toMatchSnapshot();

    expect(
      wrapper.find('[aria-colindex=5]').find('p').children()
    ).toMatchSnapshot();

    expect(
      wrapper.find('[aria-colindex=6]').find('p').children()
    ).toMatchSnapshot();
  });

  it('gracefully handles missing Study from Study Investigation object and missing Instrument from InvestigationInstrument object', () => {
    state.dgcommon.data[0] = {
      ...state.dgcommon.data[0],
      investigationInstruments: [
        {
          id: 1,
          INVESTIGATION_ID: 1,
          INSTRUMENT_ID: 3,
        },
      ],
      studyInvestigations: [
        {
          id: 6,
          STUDY_ID: 7,
          INVESTIGATION_ID: 1,
        },
      ],
    };
    const wrapper = mount(
      <Provider store={mockStore(state)}>
        <MemoryRouter>
          <ISISInvestigationsTable
            studyHierarchy={false}
            instrumentId="4"
            instrumentChildId="5"
          />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find('[aria-colindex=6]').find('p').text()).toEqual('');

    expect(wrapper.find('[aria-colindex=8]').find('p').text()).toEqual('');
  });
});
