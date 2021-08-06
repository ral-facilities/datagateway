import React from 'react';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import DatasetSearchTable from './datasetSearchTable.component';
import { initialState } from '../state/reducers/dgsearch.reducer';
import configureStore from 'redux-mock-store';
import { StateType } from '../state/app.types';
import {
  fetchDatasetsRequest,
  filterTable,
  clearTable,
  sortTable,
  addToCartRequest,
  removeFromCartRequest,
  fetchDatasetCountRequest,
  fetchAllIdsRequest,
  dGCommonInitialState,
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

describe('Dataset table component', () => {
  let shallow;
  let mount;
  let mockStore;
  let state: StateType;

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'DatasetSearchTable' });
    mount = createMount();

    mockStore = configureStore([thunk]);
    state = JSON.parse(
      JSON.stringify({ dgcommon: dGCommonInitialState, dgsearch: initialState })
    );
    state.dgcommon.data = [
      {
        id: 1,
        name: 'Dataset test name',
        size: 1,
        modTime: '2019-07-23',
        createTime: '2019-07-23',
        startDate: '2019-07-24',
        endDate: '2019-07-25',
        investigation: {
          id: 2,
          title: 'Investigation test title',
          name: 'Investigation test name',
          summary: 'foo bar',
          visitId: '1',
          doi: 'doi 1',
          size: 1,
          investigationInstruments: [
            {
              id: 3,
              instrument: {
                id: 4,
                name: 'LARMOR',
              },
            },
          ],
          studyInvestigations: [
            {
              id: 5,
              study: {
                id: 6,
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
            id: 7,
            name: 'facility name',
          },
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
    const wrapper = shallow(<DatasetSearchTable store={mockStore(state)} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('sends clearTable and fetches action on load', () => {
    const testStore = mockStore(state);
    mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <DatasetSearchTable />
        </MemoryRouter>
      </Provider>
    );

    expect(testStore.getActions().length).toEqual(4);
    expect(testStore.getActions()[0]).toEqual(clearTable());
    expect(testStore.getActions()[1]).toEqual(fetchDatasetCountRequest(1));
    expect(testStore.getActions()[2]).toEqual(fetchAllIdsRequest(1));
    expect(testStore.getActions()[3]).toEqual(fetchDatasetsRequest(1));
  });

  it('sends fetchDatasets action when loadMoreRows is called', () => {
    const testStore = mockStore(state);
    const wrapper = shallow(<DatasetSearchTable store={testStore} />);

    wrapper.prop('loadMoreRows')({ startIndex: 50, stopIndex: 74 });

    expect(testStore.getActions()[0]).toEqual(fetchDatasetsRequest(1));
  });

  it('sends filterTable action on text filter', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <DatasetSearchTable />
        </MemoryRouter>
      </Provider>
    );

    const filterInput = wrapper
      .find('[aria-label="Filter by datasets.name"] input')
      .first();
    filterInput.instance().value = 'test';
    filterInput.simulate('change');

    expect(testStore.getActions()[4]).toEqual(
      filterTable('name', { type: 'include', value: 'test' })
    );

    filterInput.instance().value = '';
    filterInput.simulate('change');

    expect(testStore.getActions()[5]).toEqual(filterTable('name', null));
  });

  it('sends filterTable action on date filter', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <DatasetSearchTable />
        </MemoryRouter>
      </Provider>
    );

    const filterInput = wrapper.find(
      '[aria-label="datasets.modified_time date filter to"]'
    );
    filterInput.instance().value = '2019-08-06';
    filterInput.simulate('change');

    expect(testStore.getActions()[4]).toEqual(
      filterTable('modTime', { endDate: '2019-08-06' })
    );

    filterInput.instance().value = '';
    filterInput.simulate('change');

    expect(testStore.getActions()[5]).toEqual(filterTable('modTime', null));
  });

  it('sends sortTable action on sort', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <DatasetSearchTable />
        </MemoryRouter>
      </Provider>
    );

    wrapper
      .find('[role="columnheader"] span[role="button"]')
      .first()
      .simulate('click');

    expect(testStore.getActions()[4]).toEqual(sortTable('name', 'asc'));
  });

  it('sends addToCart action on unchecked checkbox click', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <DatasetSearchTable />
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
        entityType: 'dataset',
        id: 1,
        name: 'test',
        parentEntities: [],
      },
    ];

    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <DatasetSearchTable />
        </MemoryRouter>
      </Provider>
    );

    wrapper.find('[aria-label="select row 0"]').first().simulate('click');

    expect(testStore.getActions()[4]).toEqual(removeFromCartRequest());
  });

  it('selected rows only considers relevant cart items', () => {
    state.dgcommon.cartItems = [
      {
        entityId: 1,
        entityType: 'investigation',
        id: 1,
        name: 'test',
        parentEntities: [],
      },
      {
        entityId: 2,
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
          <DatasetSearchTable />
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
        <DatasetSearchTable store={mockStore(state)} />
      </MemoryRouter>
    );
    const detailsPanelWrapper = shallow(
      wrapper.prop('detailsPanel')({
        rowData: state.dgcommon.data[0],
      })
    );
    expect(detailsPanelWrapper).toMatchSnapshot();
  });

  it('renders Dataset title as a link', () => {
    const wrapper = mount(
      <Provider store={mockStore(state)}>
        <MemoryRouter>
          <DatasetSearchTable />
        </MemoryRouter>
      </Provider>
    );

    expect(
      wrapper.find('[aria-colindex=3]').find('p').children()
    ).toMatchSnapshot();
  });

  // new tests

  it('renders fine with incomplete data', () => {
    // this can happen when navigating between tables and the previous table's state still exists
    state.dgcommon.data = [
      {
        id: 1,
        name: 'test',
        size: 1,
        modTime: '2019-07-23',
        createTime: '2019-07-23',
        investigation: {},
      },
    ];

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() =>
      mount(
        <Provider store={mockStore(state)}>
          <MemoryRouter>
            <DatasetSearchTable />
          </MemoryRouter>
        </Provider>
      )
    ).not.toThrowError();

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('renders generic link correctly', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <DatasetSearchTable hierarchy="data" />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find('[aria-colindex=3]').find('a').prop('href')).toEqual(
      `/browse/investigation/2/dataset/1/datafile`
    );
    expect(wrapper.find('[aria-colindex=3]').text()).toEqual(
      'Dataset test name'
    );
  });

  it('renders DLS link correctly', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <DatasetSearchTable hierarchy="dls" />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find('[aria-colindex=3]').find('a').prop('href')).toEqual(
      '/browse/proposal/Investigation test name/investigation/2/dataset/1/datafile'
    );
    expect(wrapper.find('[aria-colindex=3]').text()).toEqual(
      'Dataset test name'
    );
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
          <DatasetSearchTable hierarchy="isis" />
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
            id: 6,
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
          <DatasetSearchTable hierarchy="isis" />
        </MemoryRouter>
      </Provider>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.find('[aria-colindex=3]').find('a').prop('href')).toEqual(
      `/browse/instrument/4/facilityCycle/6/investigation/2/dataset/1`
    );
    expect(wrapper.find('[aria-colindex=3]').text()).toEqual(
      'Dataset test name'
    );
  });

  it('does not render ISIS link when instrumentId cannot be found', async () => {
    delete state.dgcommon.data[0].investigationInstruments;
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <DatasetSearchTable hierarchy="isis" />
        </MemoryRouter>
      </Provider>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.find('[aria-colindex=3]').find('a')).toHaveLength(0);
    expect(wrapper.find('[aria-colindex=3]').text()).toEqual(
      'Dataset test name'
    );
  });

  it('does not render ISIS link when facilityCycleId cannot be found', async () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <DatasetSearchTable hierarchy="isis" />
        </MemoryRouter>
      </Provider>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.find('[aria-colindex=3]').find('a')).toHaveLength(0);
    expect(wrapper.find('[aria-colindex=3]').text()).toEqual(
      'Dataset test name'
    );
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
          <DatasetSearchTable hierarchy="isis" />
        </MemoryRouter>
      </Provider>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.find('[aria-colindex=3]').find('a')).toHaveLength(0);
    expect(wrapper.find('[aria-colindex=3]').text()).toEqual(
      'Dataset test name'
    );
  });
});
