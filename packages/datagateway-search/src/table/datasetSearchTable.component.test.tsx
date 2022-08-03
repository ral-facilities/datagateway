import * as React from 'react';
import DatasetSearchTable from './datasetSearchTable.component';
import { initialState } from '../state/reducers/dgsearch.reducer';
import configureStore from 'redux-mock-store';
import { StateType } from '../state/app.types';
import {
  dGCommonInitialState,
  DatasetDetailsPanel,
  ISISDatasetDetailsPanel,
  DLSDatasetDetailsPanel,
  useAddToCart,
  useAllFacilityCycles,
  useCart,
  useDatasetsDatafileCount,
  useDatasetSizes,
  useLuceneSearchInfinite,
  useRemoveFromCart,
  SearchResult,
  SearchResponse,
  SearchResultSource,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { mount, ReactWrapper } from 'enzyme';
import { QueryClientProvider, QueryClient } from 'react-query';
import { createMemoryHistory, History } from 'history';
import { Router } from 'react-router-dom';
import { render, RenderResult } from '@testing-library/react';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useCart: jest.fn(),
    useLuceneSearchInfinite: jest.fn(),
    useAddToCart: jest.fn(),
    useRemoveFromCart: jest.fn(),
    useAllFacilityCycles: jest.fn(),
    useDatasetsDatafileCount: jest.fn(),
    useDatasetSizes: jest.fn(),
  };
});

describe('Dataset table component', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let history: History;

  let rowData: SearchResultSource;
  let searchResult: SearchResult;
  let searchResponse: SearchResponse;

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

  const createRTLWrapper = (hierarchy?: string): RenderResult => {
    return render(
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
    history = createMemoryHistory();

    state = JSON.parse(
      JSON.stringify({ dgcommon: dGCommonInitialState, dgsearch: initialState })
    );
    rowData = {
      id: 1,
      name: 'Dataset test name',
      startDate: 1563922800000,
      endDate: 1564009200000,
      investigationinstrument: [
        {
          'instrument.id': 4,
          'instrument.name': 'LARMOR',
        },
      ],
      'investigation.id': 2,
      'investigation.title': 'Investigation test title',
      'investigation.name': 'Investigation test name',
      'investigation.startDate': 1560121200000,
    };
    searchResult = {
      score: 1,
      id: 1,
      source: rowData,
    };
    searchResponse = {
      results: [searchResult],
    };
    (useCart as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });
    (useLuceneSearchInfinite as jest.Mock).mockReturnValue({
      data: { pages: [searchResponse] },
      fetchNextPage: jest.fn(),
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
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('VirtualizedTable').props()).toMatchSnapshot();
  });

  it('calls the correct data fetching hooks on load', () => {
    createWrapper();

    expect(useCart).toHaveBeenCalled();
    expect(useLuceneSearchInfinite).toHaveBeenCalledWith(
      'Dataset',
      {
        searchText: '',
        startDate: null,
        endDate: null,
        maxCount: 100,
        minCount: 10,
        restrict: true,
        sort: {},
        facets: [
          {
            target: 'Dataset',
          },
        ],
      },
      {}
    );

    expect(useAddToCart).toHaveBeenCalledWith('dataset');
    expect(useRemoveFromCart).toHaveBeenCalledWith('dataset');
    expect(useDatasetsDatafileCount).toHaveBeenCalledWith([rowData]);
    expect(useDatasetSizes).toHaveBeenCalledWith(undefined);
  });

  it('calls fetchNextPage function of useLuceneSearchInfinite when loadMoreRows is called', () => {
    const fetchNextPage = jest.fn();
    (useLuceneSearchInfinite as jest.Mock).mockReturnValue({
      data: { pages: [searchResponse] },
      fetchNextPage,
    });
    const wrapper = createWrapper();

    wrapper.find('VirtualizedTable').prop('loadMoreRows')({
      startIndex: 50,
      stopIndex: 74,
    });

    // useLuceneSearchInfinite handles the parameters itself, so startIndex/stopIndex are not used
    expect(fetchNextPage).toHaveBeenCalledWith();
  });

  it('calls addToCart mutate function on unchecked checkbox click', () => {
    const addToCart = jest.fn();
    (useAddToCart as jest.Mock).mockReturnValue({
      mutate: addToCart,
      loading: false,
    });
    const wrapper = createWrapper();

    wrapper.find('[aria-label="select row 0"]').last().simulate('click');

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
      isLoading: false,
    });

    const removeFromCart = jest.fn();
    (useRemoveFromCart as jest.Mock).mockReturnValue({
      mutate: removeFromCart,
      loading: false,
    });

    const wrapper = createWrapper();

    wrapper.find('[aria-label="select row 0"]').last().simulate('click');

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

    expect(wrapper.find('[aria-label="select all rows"]')).toHaveLength(0);
  });

  it('displays generic details panel when expanded', () => {
    const wrapper = createWrapper();
    expect(wrapper.find(DatasetDetailsPanel).exists()).toBeFalsy();
    wrapper.find('[aria-label="Show details"]').last().simulate('click');

    expect(wrapper.find(DatasetDetailsPanel).exists()).toBeTruthy();
  });

  it('displays correct details panel for ISIS when expanded', () => {
    const wrapper = createWrapper('isis');
    expect(wrapper.find(ISISDatasetDetailsPanel).exists()).toBeFalsy();
    wrapper.find('[aria-label="Show details"]').last().simulate('click');
    expect(wrapper.find(ISISDatasetDetailsPanel).exists()).toBeTruthy();
  });

  it('can navigate using the details panel for ISIS when there are facility cycles', () => {
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
    expect(wrapper.find(ISISDatasetDetailsPanel).exists()).toBeFalsy();
    wrapper.find('[aria-label="Show details"]').last().simulate('click');

    expect(wrapper.find(ISISDatasetDetailsPanel).exists()).toBeTruthy();

    wrapper.find('#dataset-datafiles-tab').last().simulate('click');
    expect(history.location.pathname).toBe(
      '/browse/instrument/4/facilityCycle/4/investigation/2/dataset/1'
    );
  });

  it('displays correct details panel for DLS when expanded', () => {
    const wrapper = createWrapper('dls');
    expect(wrapper.find(DLSDatasetDetailsPanel).exists()).toBeFalsy();
    wrapper.find('[aria-label="Show details"]').last().simulate('click');

    expect(wrapper.find(DLSDatasetDetailsPanel).exists()).toBeTruthy();
  });

  it('renders Dataset title as a link', () => {
    const wrapper = createRTLWrapper();

    expect(wrapper.getByText('Dataset test name')).toMatchSnapshot();
  });

  it('renders fine with incomplete data', () => {
    // this can happen when navigating between tables and the previous table's state still exists
    rowData = {
      id: 1,
      name: 'test',
    };

    expect(() => createWrapper()).not.toThrowError();
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

    expect(useDatasetSizes).toHaveBeenCalledWith([rowData]);
    expect(useDatasetsDatafileCount).toHaveBeenCalledWith(undefined);

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
    delete rowData.investigationinstrument;

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
    delete rowData['investigation.id'];
    delete rowData['investigation.name'];
    delete rowData['investigation.title'];
    delete rowData['investigation.startDate'];

    const wrapper = createWrapper('data');

    expect(wrapper.find('[aria-colindex=3]').find('a')).toHaveLength(0);
    expect(wrapper.find('[aria-colindex=3]').text()).toEqual(
      'Dataset test name'
    );
  });

  it('displays only the dataset name when there is no DLS investigation to link to', () => {
    delete rowData['investigation.id'];
    delete rowData['investigation.name'];
    delete rowData['investigation.title'];
    delete rowData['investigation.startDate'];

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
    delete rowData['investigation.id'];
    delete rowData['investigation.name'];
    delete rowData['investigation.title'];
    delete rowData['investigation.startDate'];

    const wrapper = createWrapper('isis');

    expect(wrapper.find('[aria-colindex=3]').find('a')).toHaveLength(0);
    expect(wrapper.find('[aria-colindex=3]').text()).toEqual(
      'Dataset test name'
    );
  });
});
