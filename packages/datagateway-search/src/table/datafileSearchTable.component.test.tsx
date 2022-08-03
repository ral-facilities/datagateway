import React from 'react';
import DatafileSearchTable from './datafileSearchTable.component';
import { initialState as dgSearchInitialState } from '../state/reducers/dgsearch.reducer';
import configureStore from 'redux-mock-store';
import { StateType } from '../state/app.types';
import {
  useAddToCart,
  useCart,
  useLuceneSearchInfinite,
  useRemoveFromCart,
  useAllFacilityCycles,
  ISISDatafileDetailsPanel,
  DatafileDetailsPanel,
  DLSDatafileDetailsPanel,
  SearchResultSource,
  SearchResponse,
  SearchResult,
  dGCommonInitialState,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { Router } from 'react-router-dom';
import { createMemoryHistory, History } from 'history';
import { mount, ReactWrapper } from 'enzyme';
import { QueryClientProvider, QueryClient } from 'react-query';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    handleICATError: jest.fn(),
    useCart: jest.fn(),
    useLuceneSearchInfinite: jest.fn(),
    useAddToCart: jest.fn(),
    useRemoveFromCart: jest.fn(),
    useAllFacilityCycles: jest.fn(),
  };
});

describe('Datafile search table component', () => {
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
            <DatafileSearchTable hierarchy={hierarchy ?? ''} />
          </QueryClientProvider>
        </Router>
      </Provider>
    );
  };

  beforeEach(() => {
    history = createMemoryHistory();

    state = JSON.parse(
      JSON.stringify({
        dgcommon: dGCommonInitialState,
        dgsearch: dgSearchInitialState,
      })
    );

    rowData = {
      id: 1,
      name: 'Datafile test name',
      location: '/datafiletest',
      fileSize: 1,
      date: 1563836400000,
      'dataset.id': 2,
      'dataset.name': 'Dataset test name',
      'investigation.id': 3,
      'investigation.title': 'Investigation test title',
      'investigation.name': 'Investigation test name',
      'investigation.startDate': 1560121200000,
      investigationinstrument: [
        {
          'instrument.id': 5,
          'instrument.name': 'LARMOR',
        },
      ],
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
      'Datafile',
      {
        searchText: '',
        startDate: null,
        endDate: null,
        maxCount: 100,
        minCount: 10,
        restrict: true,
        sort: {},
        facets: [
          { target: 'Datafile' },
          {
            target: 'DatafileParameter',
            dimensions: [{ dimension: 'type.name' }],
          },
        ],
      },
      {}
    );

    expect(useAddToCart).toHaveBeenCalledWith('datafile');
    expect(useRemoveFromCart).toHaveBeenCalledWith('datafile');
  });

  it('calls fetchNextPage function of useLuceneSearchInfinite when loadMoreRows is called', () => {
    const fetchNextPage = jest.fn();
    (useLuceneSearchInfinite as jest.Mock).mockReturnValue({
      data: { pages: [searchResponse] },
      fetchNextPage,
    });
    const wrapper = createWrapper();

    // We don't actually use these in the call to Lucene since the searchAfter functionality is
    // more complex, but it still needs to be consistent with the DB calls
    wrapper.find('VirtualizedTable').prop('loadMoreRows')({
      startIndex: 50,
      stopIndex: 74,
    });

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

    wrapper.find('[aria-label="select row 0"]').last().simulate('click');

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
    expect(wrapper.find('[aria-label="select all rows"]')).toHaveLength(0);
  });

  it('displays generic details panel when expanded', () => {
    const wrapper = createWrapper();
    expect(wrapper.find(DatafileDetailsPanel).exists()).toBeFalsy();
    wrapper.find('[aria-label="Show details"]').last().simulate('click');

    expect(wrapper.find(DatafileDetailsPanel).exists()).toBeTruthy();
  });

  it('displays correct details panel for ISIS when expanded', () => {
    const wrapper = createWrapper('isis');
    expect(wrapper.find(ISISDatafileDetailsPanel).exists()).toBeFalsy();
    wrapper.find('[aria-label="Show details"]').last().simulate('click');
    expect(wrapper.find(ISISDatafileDetailsPanel).exists()).toBeTruthy();
  });

  it('displays correct details panel for DLS when expanded', () => {
    const wrapper = createWrapper('dls');
    expect(wrapper.find(DLSDatafileDetailsPanel).exists()).toBeFalsy();
    wrapper.find('[aria-label="Show details"]').last().simulate('click');

    expect(wrapper.find(DLSDatafileDetailsPanel).exists()).toBeTruthy();
  });

  it('renders fine with incomplete data', () => {
    // this can happen when navigating between tables and the previous table's state still exists
    rowData = {
      id: 1,
      name: 'Datafile test name',
      location: '/datafiletest',
      fileSize: 1,
      modTime: 1563836400000,
    };

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
    delete rowData.investigationinstrument;
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
    delete rowData['investigation.id'];
    delete rowData['investigation.name'];
    delete rowData['investigation.title'];
    delete rowData['investigation.startDate'];

    const wrapper = createWrapper('data');

    expect(wrapper.find('[aria-colindex=3]').find('a')).toHaveLength(0);
    expect(wrapper.find('[aria-colindex=3]').text()).toEqual(
      'Datafile test name'
    );
  });

  it('displays only the datafile name when there is no DLS dataset to link to', () => {
    delete rowData['investigation.id'];
    delete rowData['investigation.name'];
    delete rowData['investigation.title'];
    delete rowData['investigation.startDate'];

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
    delete rowData['investigation.id'];
    delete rowData['investigation.name'];
    delete rowData['investigation.title'];
    delete rowData['investigation.startDate'];

    const wrapper = createWrapper('isis');

    expect(wrapper.find('[aria-colindex=3]').find('a')).toHaveLength(0);
    expect(wrapper.find('[aria-colindex=3]').text()).toEqual(
      'Datafile test name'
    );
  });
});
