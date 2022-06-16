import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import DatafileSearchTable from './datafileSearchTable.component';
import { initialState as dgSearchInitialState } from '../state/reducers/dgsearch.reducer';
import configureStore from 'redux-mock-store';
import { StateType } from '../state/app.types';
import {
  Datafile,
  useAddToCart,
  useCart,
  useDatafileCount,
  useDatafilesInfinite,
  useIds,
  useLuceneSearch,
  useRemoveFromCart,
  useAllFacilityCycles,
  ISISDatafileDetailsPanel,
  DatafileDetailsPanel,
  DLSDatafileDetailsPanel,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { Router } from 'react-router-dom';
// this is a dependency of react-router so we already have it
// eslint-disable-next-line import/no-extraneous-dependencies
import { createMemoryHistory, History } from 'history';
import { dGCommonInitialState } from 'datagateway-common';
import { ReactWrapper } from 'enzyme';
import { QueryClientProvider, QueryClient } from 'react-query';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    handleICATError: jest.fn(),
    useCart: jest.fn(),
    useLuceneSearch: jest.fn(),
    useDatafileCount: jest.fn(),
    useDatafilesInfinite: jest.fn(),
    useIds: jest.fn(),
    useAddToCart: jest.fn(),
    useRemoveFromCart: jest.fn(),
    useAllFacilityCycles: jest.fn(),
  };
});

describe('Datafile search table component', () => {
  let mount;
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let history: History;

  let rowData: Datafile[] = [];

  const createWrapper = (hierarchy?: string): ReactWrapper => {
    return mount(
      <Provider store={mockStore(state)}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <DatafileSearchTable hierarchy={hierarchy ?? ''} />
          </QueryClientProvider>
        </Router>
      </Provider>
    );
  };

  beforeEach(() => {
    mount = createMount();
    history = createMemoryHistory();

    state = JSON.parse(
      JSON.stringify({
        dgcommon: dGCommonInitialState,
        dgsearch: dgSearchInitialState,
      })
    );

    rowData = [
      {
        id: 1,
        name: 'Datafile test name',
        location: '/datafiletest',
        fileSize: 1,
        modTime: '2019-07-23',
        createTime: '2019-07-23',
        dataset: {
          id: 2,
          name: 'Dataset test name',
          size: 1,
          modTime: '2019-07-23',
          createTime: '2019-07-23',
          startDate: '2019-07-24',
          endDate: '2019-07-25',
          investigation: {
            id: 3,
            title: 'Investigation test title',
            name: 'Investigation test name',
            summary: 'foo bar',
            visitId: '1',
            doi: 'doi 1',
            size: 1,
            investigationInstruments: [
              {
                id: 4,
                instrument: {
                  id: 5,
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
                investigation: {
                  id: 3,
                  title: 'Investigation test title',
                  name: 'Investigation test name',
                  visitId: '1',
                },
              },
            ],
            startDate: '2019-06-10',
            endDate: '2019-06-11',
            facility: {
              id: 8,
              name: 'facility name',
            },
          },
        },
      },
    ];

    (useCart as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });
    (useLuceneSearch as jest.Mock).mockReturnValue({
      data: [],
    });
    (useDatafileCount as jest.Mock).mockReturnValue({
      data: 0,
    });
    (useDatafilesInfinite as jest.Mock).mockReturnValue({
      data: { pages: [rowData] },
      fetchNextPage: jest.fn(),
    });
    (useIds as jest.Mock).mockReturnValue({
      data: [1],
    });
    (useAddToCart as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isLoading: false,
    });
    (useRemoveFromCart as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isLoading: false,
    });
    (useAllFacilityCycles as jest.Mock).mockReturnValue({
      data: [],
    });
  });

  afterEach(() => {
    mount.cleanUp();
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('VirtualizedTable').props()).toMatchSnapshot();
  });

  it('calls the correct data fetching hooks on load', () => {
    (useLuceneSearch as jest.Mock).mockReturnValue({
      data: [1],
    });

    createWrapper();

    expect(useCart).toHaveBeenCalled();
    expect(useLuceneSearch).toHaveBeenCalledWith('Datafile', {
      searchText: '',
      startDate: null,
      endDate: null,
      maxCount: 300,
    });

    expect(useDatafileCount).toHaveBeenCalledWith([
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          id: { in: [1] },
        }),
      },
    ]);
    expect(useDatafilesInfinite).toHaveBeenCalledWith([
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          id: { in: [1] },
        }),
      },
      {
        filterType: 'include',
        filterValue: JSON.stringify({
          dataset: {
            investigation: { investigationInstruments: 'instrument' },
          },
        }),
      },
    ]);
    expect(useIds).toHaveBeenCalledWith(
      'datafile',
      [
        {
          filterType: 'where',
          filterValue: JSON.stringify({
            id: { in: [1] },
          }),
        },
      ],
      true
    );

    expect(useAddToCart).toHaveBeenCalledWith('datafile');
    expect(useRemoveFromCart).toHaveBeenCalledWith('datafile');
  });

  it('calls fetchNextPage function of useDatafilesInfinite when loadMoreRows is called', () => {
    const fetchNextPage = jest.fn();
    (useDatafilesInfinite as jest.Mock).mockReturnValue({
      data: { pages: [rowData] },
      fetchNextPage,
    });
    const wrapper = createWrapper();

    wrapper.find('VirtualizedTable').prop('loadMoreRows')({
      startIndex: 50,
      stopIndex: 74,
    });

    expect(fetchNextPage).toHaveBeenCalledWith({
      pageParam: { startIndex: 50, stopIndex: 74 },
    });
  });

  it('updates filter query params on text filter', () => {
    const wrapper = createWrapper();

    const filterInput = wrapper
      .find('[aria-label="Filter by datafiles.name"]')
      .first();
    filterInput.instance().value = 'test';
    filterInput.simulate('change');

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent(
        '{"name":{"value":"test","type":"include"}}'
      )}`
    );

    filterInput.instance().value = '';
    filterInput.simulate('change');

    expect(history.length).toBe(3);
    expect(history.location.search).toBe('?');
  });

  it('updates filter query params on date filter', () => {
    const wrapper = createWrapper();

    const filterInput = wrapper.find(
      'input[id="datafiles.modified_time filter to"]'
    );
    filterInput.instance().value = '2019-08-06';
    filterInput.simulate('change');

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent('{"modTime":{"endDate":"2019-08-06"}}')}`
    );

    filterInput.instance().value = '';
    filterInput.simulate('change');

    expect(history.length).toBe(3);
    expect(history.location.search).toBe('?');
  });

  it('updates sort query params on sort', () => {
    const wrapper = createWrapper();

    wrapper
      .find('[role="columnheader"] span[role="button"]')
      .first()
      .simulate('click');

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"name":"asc"}')}`
    );
  });

  it('calls addToCart mutate function on unchecked checkbox click', () => {
    const addToCart = jest.fn();
    (useAddToCart as jest.Mock).mockReturnValue({
      mutate: addToCart,
      loading: false,
    });
    const wrapper = createWrapper();

    wrapper.find('[aria-label="select row 0"]').first().simulate('click');

    expect(addToCart).toHaveBeenCalledWith([1]);
  });

  it('calls removeFromCart mutate function on checked checkbox click', () => {
    (useCart as jest.Mock).mockReturnValue({
      data: [
        {
          entityId: 1,
          entityType: 'datafile',
          id: 1,
          name: 'test',
          parentEntities: [],
        },
      ],
      isLoading: false,
    });

    const removeFromCart = jest.fn();
    (useRemoveFromCart as jest.Mock).mockReturnValue({
      mutate: removeFromCart,
      loading: false,
    });

    const wrapper = createWrapper();

    wrapper.find('[aria-label="select row 0"]').first().simulate('click');

    expect(removeFromCart).toHaveBeenCalledWith([1]);
  });

  it('selected rows only considers relevant cart items', () => {
    (useCart as jest.Mock).mockReturnValue({
      data: [
        {
          entityId: 1,
          entityType: 'dataset',
          id: 1,
          name: 'test',
          parentEntities: [],
        },
        {
          entityId: 2,
          entityType: 'datafile',
          id: 2,
          name: 'test',
          parentEntities: [],
        },
      ],
      isLoading: false,
    });

    const wrapper = createWrapper();

    const selectAllCheckbox = wrapper
      .find('[aria-label="select all rows"]')
      .first();

    expect(selectAllCheckbox.prop('checked')).toEqual(false);
    expect(selectAllCheckbox.prop('data-indeterminate')).toEqual(false);
  });

  it('no select all checkbox appears and no fetchAllIds sent if selectAllSetting is false', () => {
    state.dgsearch.selectAllSetting = false;

    const wrapper = createWrapper();

    expect(useIds).toHaveBeenCalledWith('datafile', expect.anything(), false);
    expect(useIds).not.toHaveBeenCalledWith(
      'datafile',
      expect.anything(),
      true
    );
    expect(wrapper.find('[aria-label="select all rows"]')).toHaveLength(0);
  });

  it('displays generic details panel when expanded', () => {
    const wrapper = createWrapper();
    expect(wrapper.find(DatafileDetailsPanel).exists()).toBeFalsy();
    wrapper.find('[aria-label="Show details"]').first().simulate('click');

    expect(wrapper.find(DatafileDetailsPanel).exists()).toBeTruthy();
  });

  it('displays correct details panel for ISIS when expanded', () => {
    const wrapper = createWrapper('isis');
    expect(wrapper.find(ISISDatafileDetailsPanel).exists()).toBeFalsy();
    wrapper.find('[aria-label="Show details"]').first().simulate('click');
    expect(wrapper.find(ISISDatafileDetailsPanel).exists()).toBeTruthy();
  });

  it('displays correct details panel for DLS when expanded', () => {
    const wrapper = createWrapper('dls');
    expect(wrapper.find(DLSDatafileDetailsPanel).exists()).toBeFalsy();
    wrapper.find('[aria-label="Show details"]').first().simulate('click');

    expect(wrapper.find(DLSDatafileDetailsPanel).exists()).toBeTruthy();
  });

  // Not necessary as this should be a test of the formatBytes function
  // it('renders file size as bytes', () => {
  //   const wrapper = mount(
  //     <Provider store={mockStore(state)}>
  //       <MemoryRouter>
  //         <DatafileSearchTable />
  //       </MemoryRouter>
  //     </Provider>
  //   );

  //   expect(wrapper.find('[aria-colindex=5]').find('p').text()).toEqual('1 B');
  // });

  // new tests

  it('renders fine with incomplete data', () => {
    // this can happen when navigating between tables and the previous table's state still exists
    rowData = [
      {
        id: 1,
        name: 'Datafile test name',
        location: '/datafiletest',
        fileSize: 1,
        modTime: '2019-07-23',
        dataset: {},
      },
    ];
    (useDatafilesInfinite as jest.Mock).mockReturnValue({
      data: { pages: [rowData] },
      fetchNextPage: jest.fn(),
    });

    expect(() => createWrapper()).not.toThrowError();
  });

  it('renders generic link correctly', () => {
    const wrapper = createWrapper('data');

    expect(wrapper.find('[aria-colindex=3]').find('a').prop('href')).toEqual(
      `/browse/investigation/3/dataset/2/datafile`
    );
    expect(wrapper.find('[aria-colindex=3]').text()).toEqual(
      'Datafile test name'
    );
  });

  it('renders DLS link correctly', () => {
    const wrapper = createWrapper('dls');

    expect(wrapper.find('[aria-colindex=3]').find('a').prop('href')).toEqual(
      '/browse/proposal/Dataset test name/investigation/3/dataset/2/datafile'
    );
    expect(wrapper.find('[aria-colindex=3]').text()).toEqual(
      'Datafile test name'
    );
  });

  it('renders ISIS link correctly', () => {
    (useAllFacilityCycles as jest.Mock).mockReturnValue({
      data: [
        {
          id: 4,
          name: 'facility cycle name',
          startDate: '2000-06-10',
          endDate: '2020-06-11',
        },
      ],
    });

    const wrapper = createWrapper('isis');

    expect(wrapper.find('[aria-colindex=3]').find('a').prop('href')).toEqual(
      `/browse/instrument/5/facilityCycle/4/investigation/3/dataset/2/datafile`
    );
    expect(wrapper.find('[aria-colindex=3]').text()).toEqual(
      'Datafile test name'
    );
  });

  it('does not render ISIS link when instrumentId cannot be found', () => {
    (useAllFacilityCycles as jest.Mock).mockReturnValue({
      data: [
        {
          id: 4,
          name: 'facility cycle name',
          startDate: '2000-06-10',
          endDate: '2020-06-11',
        },
      ],
    });
    delete rowData[0].dataset?.investigation?.investigationInstruments;
    (useDatafilesInfinite as jest.Mock).mockReturnValue({
      data: { pages: [rowData] },
      fetchNextPage: jest.fn(),
    });
    const wrapper = createWrapper('isis');

    expect(wrapper.find('[aria-colindex=3]').find('a')).toHaveLength(0);
    expect(wrapper.find('[aria-colindex=3]').text()).toEqual(
      'Datafile test name'
    );
  });

  it('does not render ISIS link when facilityCycleId cannot be found', () => {
    const wrapper = createWrapper('isis');

    expect(wrapper.find('[aria-colindex=3]').find('a')).toHaveLength(0);
    expect(wrapper.find('[aria-colindex=3]').text()).toEqual(
      'Datafile test name'
    );
  });

  it('does not render ISIS link when facilityCycleId has incompatible dates', () => {
    (useAllFacilityCycles as jest.Mock).mockReturnValue({
      data: [
        {
          id: 2,
          name: 'facility cycle name',
          startDate: '2020-06-11',
          endDate: '2000-06-10',
        },
      ],
    });

    const wrapper = createWrapper('isis');

    expect(wrapper.find('[aria-colindex=3]').find('a')).toHaveLength(0);
    expect(wrapper.find('[aria-colindex=3]').text()).toEqual(
      'Datafile test name'
    );
  });

  it('displays only the datafile name when there is no generic dataset to link to', () => {
    rowData = [
      {
        id: 1,
        name: 'Datafile test name',
        location: '/datafiletest',
        fileSize: 1,
        modTime: '2019-07-23',
        dataset: {},
      },
    ];
    (useDatafilesInfinite as jest.Mock).mockReturnValue({
      data: { pages: [rowData] },
      fetchNextPage: jest.fn(),
    });

    const wrapper = createWrapper('data');

    expect(wrapper.find('[aria-colindex=3]').find('a')).toHaveLength(0);
    expect(wrapper.find('[aria-colindex=3]').text()).toEqual(
      'Datafile test name'
    );
  });

  it('displays only the datafile name when there is no DLS dataset to link to', () => {
    rowData = [
      {
        id: 1,
        name: 'Datafile test name',
        location: '/datafiletest',
        fileSize: 1,
        modTime: '2019-07-23',
        dataset: {},
      },
    ];
    (useDatafilesInfinite as jest.Mock).mockReturnValue({
      data: { pages: [rowData] },
      fetchNextPage: jest.fn(),
    });

    const wrapper = createWrapper('dls');

    expect(wrapper.find('[aria-colindex=3]').find('a')).toHaveLength(0);
    expect(wrapper.find('[aria-colindex=3]').text()).toEqual(
      'Datafile test name'
    );
  });

  it('displays only the datafile name when there is no ISIS investigation to link to', () => {
    (useAllFacilityCycles as jest.Mock).mockReturnValue({
      data: [
        {
          id: 4,
          name: 'facility cycle name',
          startDate: '2000-06-10',
          endDate: '2020-06-11',
        },
      ],
    });
    rowData = [
      {
        id: 1,
        name: 'Datafile test name',
        location: '/datafiletest',
        fileSize: 1,
        modTime: '2019-07-23',
        dataset: {},
      },
    ];
    (useDatafilesInfinite as jest.Mock).mockReturnValue({
      data: { pages: [rowData] },
      fetchNextPage: jest.fn(),
    });

    const wrapper = createWrapper('isis');

    expect(wrapper.find('[aria-colindex=3]').find('a')).toHaveLength(0);
    expect(wrapper.find('[aria-colindex=3]').text()).toEqual(
      'Datafile test name'
    );
  });
});
