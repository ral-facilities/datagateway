import React from 'react';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import DatasetSearchTable, {
  DatasetDetailsPanel,
} from './datasetSearchTable.component';
import { initialState } from '../state/reducers/dgsearch.reducer';
import configureStore from 'redux-mock-store';
import { StateType } from '../state/app.types';
import {
  Dataset,
  dGCommonInitialState,
  handleICATError,
  useAddToCart,
  useAllFacilityCycles,
  useCart,
  useDatasetCount,
  useDatasetsDatafileCount,
  useDatasetsInfinite,
  useDatasetSizes,
  useIds,
  useLuceneSearch,
  useRemoveFromCart,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { ReactWrapper } from 'enzyme';
import { QueryClientProvider, QueryClient } from 'react-query';
// this is a dependency of react-router so we already have it
// eslint-disable-next-line import/no-extraneous-dependencies
import { createMemoryHistory, History } from 'history';
import { Router } from 'react-router-dom';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    handleICATError: jest.fn(),
    useCart: jest.fn(),
    useLuceneSearch: jest.fn(),
    useDatasetCount: jest.fn(),
    useDatasetsInfinite: jest.fn(),
    useIds: jest.fn(),
    useAddToCart: jest.fn(),
    useRemoveFromCart: jest.fn(),
    useAllFacilityCycles: jest.fn(),
    useDatasetsDatafileCount: jest.fn(),
    useDatasetSizes: jest.fn(),
  };
});

describe('Dataset table component', () => {
  let shallow;
  let mount;
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let history: History;

  let rowData: Dataset[] = [];

  const createWrapper = (hierarchy?: string): ReactWrapper => {
    return mount(
      <Provider store={mockStore(state)}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <DatasetSearchTable hierarchy={hierarchy ?? ''} />
          </QueryClientProvider>
        </Router>
      </Provider>
    );
  };

  beforeEach(() => {
    shallow = createShallow();
    mount = createMount();
    history = createMemoryHistory();

    state = JSON.parse(
      JSON.stringify({ dgcommon: dGCommonInitialState, dgsearch: initialState })
    );
    rowData = [
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
              investigation: {
                id: 2,
                title: 'Investigation test title',
                name: 'Investigation test name',
                visitId: '1',
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
    (useCart as jest.Mock).mockReturnValue({
      data: [],
    });
    (useLuceneSearch as jest.Mock).mockReturnValue({
      data: [],
    });
    (useDatasetCount as jest.Mock).mockReturnValue({
      data: 0,
    });
    (useDatasetsInfinite as jest.Mock).mockReturnValue({
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
    (useDatasetsDatafileCount as jest.Mock).mockImplementation((datasets) =>
      (datasets
        ? 'pages' in datasets
          ? datasets.pages.flat()
          : datasets
        : []
      ).map(() => ({
        data: 1,
        isFetching: false,
        isSuccess: true,
      }))
    );
    (useDatasetSizes as jest.Mock).mockImplementation((datasets) =>
      (datasets
        ? 'pages' in datasets
          ? datasets.pages.flat()
          : datasets
        : []
      ).map(() => ({
        data: 1,
        isFetching: false,
        isSuccess: true,
      }))
    );
  });

  afterEach(() => {
    mount.cleanUp();
    (handleICATError as jest.Mock).mockClear();
    (useCart as jest.Mock).mockClear();
    (useLuceneSearch as jest.Mock).mockClear();
    (useDatasetCount as jest.Mock).mockClear();
    (useDatasetsInfinite as jest.Mock).mockClear();
    (useIds as jest.Mock).mockClear();
    (useAddToCart as jest.Mock).mockClear();
    (useRemoveFromCart as jest.Mock).mockClear();
    (useAllFacilityCycles as jest.Mock).mockClear();
    (useDatasetsDatafileCount as jest.Mock).mockClear();
    (useDatasetSizes as jest.Mock).mockClear();
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
    expect(useLuceneSearch).toHaveBeenCalledWith('Dataset', {
      searchText: state.dgsearch.searchText,
      startDate: state.dgsearch.selectDate.startDate,
      endDate: state.dgsearch.selectDate.endDate,
    });

    expect(useDatasetCount).toHaveBeenCalledWith([
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          id: { in: [1] },
        }),
      },
    ]);
    expect(useDatasetsInfinite).toHaveBeenCalledWith([
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          id: { in: [1] },
        }),
      },
      {
        filterType: 'include',
        filterValue: JSON.stringify({
          investigation: { investigationInstruments: 'instrument' },
        }),
      },
    ]);
    expect(useIds).toHaveBeenCalledWith('dataset', [
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          id: { in: [1] },
        }),
      },
    ]);

    expect(useAddToCart).toHaveBeenCalledWith('dataset');
    expect(useRemoveFromCart).toHaveBeenCalledWith('dataset');
    expect(useDatasetsDatafileCount).toHaveBeenCalledWith({ pages: [rowData] });
    expect(useDatasetSizes).toHaveBeenCalledWith([]);
  });

  it('calls fetchNextPage function of useDatafilesInfinite when loadMoreRows is called', () => {
    const fetchNextPage = jest.fn();
    (useDatasetsInfinite as jest.Mock).mockReturnValue({
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
      .find('[aria-label="Filter by datasets.name"]')
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
      '[aria-label="datasets.modified_time filter to"]'
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
          entityType: 'dataset',
          id: 1,
          name: 'test',
          parentEntities: [],
        },
      ],
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
      ],
    });

    const wrapper = createWrapper();

    const selectAllCheckbox = wrapper
      .find('[aria-label="select all rows"]')
      .first();

    expect(selectAllCheckbox.prop('checked')).toEqual(false);
    expect(selectAllCheckbox.prop('data-indeterminate')).toEqual(false);
  });

  it('renders details panel correctly', () => {
    const wrapper = shallow(
      <DatasetDetailsPanel
        rowData={rowData[0]}
        detailsPanelResize={jest.fn()}
      />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('renders Dataset title as a link', () => {
    const wrapper = createWrapper();

    expect(
      wrapper.find('[aria-colindex=3]').find('p').children()
    ).toMatchSnapshot();
  });

  // new tests

  it('renders fine with incomplete data', () => {
    // this can happen when navigating between tables and the previous table's state still exists
    rowData = [
      {
        id: 1,
        name: 'test',
        size: 1,
        modTime: '2019-07-23',
        createTime: '2019-07-23',
        investigation: {},
      },
    ];
    (useDatasetsInfinite as jest.Mock).mockReturnValue({
      data: { pages: [rowData] },
      fetchNextPage: jest.fn(),
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => createWrapper()).not.toThrowError();

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('renders generic link & pending count correctly', () => {
    (useDatasetsDatafileCount as jest.Mock).mockImplementation(() => [
      {
        isFetching: true,
      },
    ]);
    const wrapper = createWrapper('data');

    expect(wrapper.find('[aria-colindex=3]').find('a').prop('href')).toEqual(
      `/browse/investigation/2/dataset/1/datafile`
    );
    expect(wrapper.find('[aria-colindex=3]').text()).toEqual(
      'Dataset test name'
    );
    expect(wrapper.find('[aria-colindex=4]').text()).toEqual('Calculating...');
  });

  it('renders DLS link correctly', () => {
    const wrapper = createWrapper('dls');

    expect(wrapper.find('[aria-colindex=3]').find('a').prop('href')).toEqual(
      '/browse/proposal/Investigation test name/investigation/2/dataset/1/datafile'
    );
    expect(wrapper.find('[aria-colindex=3]').text()).toEqual(
      'Dataset test name'
    );
  });

  it('renders ISIS link & file sizes correctly', () => {
    (useAllFacilityCycles as jest.Mock).mockReturnValue({
      data: [
        {
          id: 6,
          name: 'facility cycle name',
          startDate: '2000-06-10',
          endDate: '2020-06-11',
        },
      ],
    });

    const wrapper = createWrapper('isis');

    expect(useDatasetSizes).toHaveBeenCalledWith({ pages: [rowData] });
    expect(useDatasetsDatafileCount).toHaveBeenCalledWith([]);

    expect(wrapper.find('[aria-colindex=3]').find('a').prop('href')).toEqual(
      `/browse/instrument/4/facilityCycle/6/investigation/2/dataset/1`
    );
    expect(wrapper.find('[aria-colindex=3]').text()).toEqual(
      'Dataset test name'
    );
    expect(wrapper.find('[aria-colindex=4]').text()).toEqual('1 B');
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
    delete rowData[0].investigation?.investigationInstruments;

    (useDatasetsInfinite as jest.Mock).mockReturnValue({
      data: { pages: [rowData] },
      fetchNextPage: jest.fn(),
    });
    const wrapper = createWrapper('isis');

    expect(wrapper.find('[aria-colindex=3]').find('a')).toHaveLength(0);
    expect(wrapper.find('[aria-colindex=3]').text()).toEqual(
      'Dataset test name'
    );
  });

  it('does not render ISIS link when facilityCycleId cannot be found', () => {
    const wrapper = createWrapper('isis');

    expect(wrapper.find('[aria-colindex=3]').find('a')).toHaveLength(0);
    expect(wrapper.find('[aria-colindex=3]').text()).toEqual(
      'Dataset test name'
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
      'Dataset test name'
    );
  });

  it('displays only the dataset name when there is no generic investigation to link to', () => {
    delete rowData[0].investigation;
    (useDatasetsInfinite as jest.Mock).mockReturnValue({
      data: { pages: [rowData] },
      fetchNextPage: jest.fn(),
    });

    const wrapper = createWrapper('data');

    expect(wrapper.find('[aria-colindex=3]').find('a')).toHaveLength(0);
    expect(wrapper.find('[aria-colindex=3]').text()).toEqual(
      'Dataset test name'
    );
  });

  it('displays only the dataset name when there is no DLS investigation to link to', () => {
    delete rowData[0].investigation;
    (useDatasetsInfinite as jest.Mock).mockReturnValue({
      data: { pages: [rowData] },
      fetchNextPage: jest.fn(),
    });

    const wrapper = createWrapper('dls');

    expect(wrapper.find('[aria-colindex=3]').find('a')).toHaveLength(0);
    expect(wrapper.find('[aria-colindex=3]').text()).toEqual(
      'Dataset test name'
    );
  });

  it('displays only the dataset name when there is no ISIS investigation to link to', () => {
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
    delete rowData[0].investigation;
    (useDatasetsInfinite as jest.Mock).mockReturnValue({
      data: { pages: [rowData] },
      fetchNextPage: jest.fn(),
    });

    const wrapper = createWrapper('isis');

    expect(wrapper.find('[aria-colindex=3]').find('a')).toHaveLength(0);
    expect(wrapper.find('[aria-colindex=3]').text()).toEqual(
      'Dataset test name'
    );
  });
});
