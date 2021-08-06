import React from 'react';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import InvestigationSearchTable from './investigationSearchTable.component';
import { initialState } from '../state/reducers/dgsearch.reducer';
import configureStore from 'redux-mock-store';
import { StateType } from '../state/app.types';
import {
  fetchInvestigationsRequest,
  filterTable,
  sortTable,
  fetchInvestigationCountRequest,
  removeFromCartRequest,
  addToCartRequest,
  dGCommonInitialState,
  clearTable,
  fetchAllIdsRequest,
  handleICATError,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router';
import axios from 'axios';
import { act } from 'react-dom/test-utils';
import { flushPromises } from '../setupTests';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    handleICATError: jest.fn(),
  };
});

describe('Investigation Search Table component', () => {
  let shallow;
  let mount;
  let mockStore;
  let state: StateType;

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'InvestigationSearchTable' });
    mount = createMount();

    mockStore = configureStore([thunk]);
    state = JSON.parse(
      JSON.stringify({
        dgsearch: initialState,
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
        studyInvestigations: [
          {
            id: 6,
            study: {
              id: 7,
              pid: 'study pid',
              name: 'study name',
              modTime: '2019-06-10',
              createTime: '2019-06-10',
            },
          },
        ],
        startDate: '2019-06-10',
        endDate: '2019-06-11',
        facility: {
          id: 2,
          name: 'facility name',
        },
      },
    ];
    state.dgcommon.allIds = [1];
    (axios.get as jest.Mock).mockImplementation(() =>
      Promise.resolve({ data: [] })
    );
    (axios.post as jest.Mock).mockImplementation(() =>
      Promise.resolve({ data: {} })
    );
    (axios.delete as jest.Mock).mockImplementation(() =>
      Promise.resolve({ data: {} })
    );
    global.Date.now = jest.fn(() => 1);
  });

  afterEach(() => {
    mount.cleanUp();
    (handleICATError as jest.Mock).mockClear();
  });

  it('renders correctly', () => {
    const wrapper = shallow(
      <InvestigationSearchTable store={mockStore(state)} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('sends clearTable and fetches action on load', () => {
    const testStore = mockStore(state);
    mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <InvestigationSearchTable />
        </MemoryRouter>
      </Provider>
    );

    expect(testStore.getActions().length).toEqual(4);
    expect(testStore.getActions()[0]).toEqual(clearTable());
    expect(testStore.getActions()[1]).toEqual(
      fetchInvestigationCountRequest(1)
    );
    expect(testStore.getActions()[2]).toEqual(fetchAllIdsRequest(1));
    expect(testStore.getActions()[3]).toEqual(fetchInvestigationsRequest(1));
  });

  it('sends fetchInvestigations action when loadMoreRows is called', () => {
    const testStore = mockStore(state);
    const wrapper = shallow(<InvestigationSearchTable store={testStore} />);

    wrapper.prop('loadMoreRows')({ startIndex: 50, stopIndex: 74 });

    expect(testStore.getActions()[0]).toEqual(fetchInvestigationsRequest(1));
  });

  it('sends filterTable action on text filter', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <InvestigationSearchTable hierarchy="data" />
        </MemoryRouter>
      </Provider>
    );

    const filterInput = wrapper
      .find('[aria-label="Filter by investigations.title"] input')
      .first();
    filterInput.instance().value = 'test';
    filterInput.simulate('change');

    expect(testStore.getActions()[4]).toEqual(
      filterTable('title', { type: 'include', value: 'test' })
    );

    filterInput.instance().value = '';
    filterInput.simulate('change');

    expect(testStore.getActions()[5]).toEqual(filterTable('title', null));
  });

  it('sends filterTable action on date filter', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <InvestigationSearchTable />
        </MemoryRouter>
      </Provider>
    );

    const filterInput = wrapper.find(
      '[aria-label="investigations.end_date date filter to"]'
    );
    filterInput.instance().value = '2019-08-06';
    filterInput.simulate('change');

    expect(testStore.getActions()[4]).toEqual(
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
          <InvestigationSearchTable />
        </MemoryRouter>
      </Provider>
    );

    wrapper
      .find('[role="columnheader"] span[role="button"]')
      .first()
      .simulate('click');

    expect(testStore.getActions()[4]).toEqual(sortTable('title', 'asc'));
  });

  it('sends addToCart action on unchecked checkbox click', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <InvestigationSearchTable />
        </MemoryRouter>
      </Provider>
    );

    wrapper.find('[aria-label="select row 0"]').first().simulate('click');

    expect(testStore.getActions()[4]).toEqual(addToCartRequest());
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
          <InvestigationSearchTable />
        </MemoryRouter>
      </Provider>
    );

    wrapper.find('[aria-label="select row 0"]').first().simulate('click');

    expect(testStore.getActions()[4]).toEqual(removeFromCartRequest());
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
          <InvestigationSearchTable />
        </MemoryRouter>
      </Provider>
    );

    const selectAllCheckbox = wrapper
      .find('[aria-label="select all rows"]')
      .first();

    expect(selectAllCheckbox.prop('checked')).toEqual(false);
    expect(selectAllCheckbox.prop('data-indeterminate')).toEqual(false);
  });

  it('renders details panel correctly', () => {
    const wrapper = shallow(
      <MemoryRouter>
        <InvestigationSearchTable store={mockStore(state)} />
      </MemoryRouter>
    );
    const detailsPanelWrapper = shallow(
      wrapper.prop('detailsPanel')({
        rowData: state.dgcommon.data[0],
      })
    );
    expect(detailsPanelWrapper).toMatchSnapshot();
  });

  it('renders title, visit ID, Name and DOI as links', () => {
    const wrapper = mount(
      <Provider store={mockStore(state)}>
        <MemoryRouter>
          <InvestigationSearchTable />
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

  it('renders fine with incomplete data', () => {
    // this can happen when navigating between tables and the previous table's state still exists
    // also tests that empty arrays are fine for investigationInstruments
    state.dgcommon.data = [
      {
        id: 1,
        name: 'test',
        title: 'test',
        investigationInstruments: [],
      },
    ];

    expect(() =>
      mount(
        <Provider store={mockStore(state)}>
          <MemoryRouter>
            <InvestigationSearchTable />
          </MemoryRouter>
        </Provider>
      )
    ).not.toThrowError();
  });

  it('renders generic link correctly', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <InvestigationSearchTable hierarchy="data" />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find('[aria-colindex=3]').find('a').prop('href')).toEqual(
      '/browse/investigation/1/dataset'
    );
    expect(wrapper.find('[aria-colindex=3]').text()).toEqual('Test 1');
  });

  it('renders DLS link correctly', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <InvestigationSearchTable hierarchy="dls" />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find('[aria-colindex=3]').find('a').prop('href')).toEqual(
      '/browse/proposal/Test 1/investigation/1/dataset'
    );
    expect(wrapper.find('[aria-colindex=3]').text()).toEqual('Test 1');
  });

  it('throws an error if facility cycles could not be fetched', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.reject({
        message: 'Test error message',
      })
    );

    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <InvestigationSearchTable hierarchy="isis" />
        </MemoryRouter>
      </Provider>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(handleICATError).toHaveBeenCalled();
    expect(handleICATError).toHaveBeenCalledWith({
      message: 'Test error message',
    });
  });

  it('renders ISIS link correctly', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: [
          {
            id: 2,
            name: 'facility cycle name',
            startDate: '2000-06-10',
            endDate: '2020-06-11',
          },
        ],
      })
    );

    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <InvestigationSearchTable hierarchy="isis" />
        </MemoryRouter>
      </Provider>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.find('[aria-colindex=3]').find('a').prop('href')).toEqual(
      '/browse/instrument/3/facilityCycle/2/investigation/1/dataset'
    );
    expect(wrapper.find('[aria-colindex=3]').text()).toEqual('Test 1');
  });

  it('does not render ISIS link when instrumentId cannot be found', async () => {
    delete state.dgcommon.data[0].investigationInstruments;
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <InvestigationSearchTable hierarchy="isis" />
        </MemoryRouter>
      </Provider>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.find('[aria-colindex=3]').find('a')).toHaveLength(0);
    expect(wrapper.find('[aria-colindex=3]').text()).toEqual('Test 1');
  });

  it('does not render ISIS link when facilityCycleId cannot be found', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: [],
      })
    );

    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <InvestigationSearchTable hierarchy="isis" />
        </MemoryRouter>
      </Provider>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.find('[aria-colindex=3]').find('a')).toHaveLength(0);
    expect(wrapper.find('[aria-colindex=3]').text()).toEqual('Test 1');
  });

  it('does not render ISIS link when facilityCycleId has incompatible dates', async () => {
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: [
          {
            id: 2,
            name: 'facility cycle name',
            startDate: '2020-06-11',
            endDate: '2000-06-10',
          },
        ],
      })
    );

    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <InvestigationSearchTable hierarchy="isis" />
        </MemoryRouter>
      </Provider>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.find('[aria-colindex=3]').find('a')).toHaveLength(0);
    expect(wrapper.find('[aria-colindex=3]').text()).toEqual('Test 1');
  });
});
