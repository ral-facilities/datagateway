import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { initialState } from '../state/reducers/dgsearch.reducer';
import configureStore from 'redux-mock-store';
import { StateType } from '../state/app.types';
import {
  dGCommonInitialState,
  handleICATError,
  useAddToCart,
  useAllFacilityCycles,
  useCart,
  useInvestigationsDatasetCount,
  useInvestigationSizes,
  useLuceneSearchInfinite,
  useRemoveFromCart,
  ISISInvestigationDetailsPanel,
  InvestigationDetailsPanel,
  DLSVisitDetailsPanel,
  SearchResultSource,
  SearchResponse,
  SearchResult,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { ReactWrapper } from 'enzyme';
import { QueryClientProvider, QueryClient } from 'react-query';
// this is a dependency of react-router so we already have it
// eslint-disable-next-line import/no-extraneous-dependencies
import { createMemoryHistory, History } from 'history';
import { Router } from 'react-router-dom';
import InvestigationSearchTable from './investigationSearchTable.component';

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
    useInvestigationsDatasetCount: jest.fn(),
    useInvestigationSizes: jest.fn(),
  };
});

describe('Investigation Search Table component', () => {
  let mount;
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
            <InvestigationSearchTable hierarchy={hierarchy ?? ''} />
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
        dgsearch: initialState,
        dgcommon: dGCommonInitialState,
      })
    );
    rowData = {
      id: 1,
      title: 'Test 1',
      name: 'Test 1',
      summary: 'foo bar',
      visitId: '1',
      doi: 'doi 1',
      investigationinstrument: [
        {
          'instrument.id': 3,
          'instrument.name': 'LARMOR',
        },
      ],
      startDate: 1560121200000,
      endDate: 1560207600000,
      'facility.name': 'facility name',
      'facility.id': 2,
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
    (useInvestigationsDatasetCount as jest.Mock).mockImplementation(
      (investigations) =>
        (investigations
          ? 'pages' in investigations
            ? investigations.pages.flat()
            : investigations
          : []
        ).map(() => ({
          data: 1,
          isFetching: false,
          isSuccess: true,
        }))
    );
    (useInvestigationSizes as jest.Mock).mockImplementation((investigations) =>
      (investigations
        ? 'pages' in investigations
          ? investigations.pages.flat()
          : investigations
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
    (useLuceneSearchInfinite as jest.Mock).mockClear();
    (useAddToCart as jest.Mock).mockClear();
    (useRemoveFromCart as jest.Mock).mockClear();
    (useAllFacilityCycles as jest.Mock).mockClear();
    (useInvestigationsDatasetCount as jest.Mock).mockClear();
    (useInvestigationSizes as jest.Mock).mockClear();
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('VirtualizedTable').props()).toMatchSnapshot();
  });

  it('calls the correct data fetching hooks on load', () => {
    createWrapper();

    expect(useCart).toHaveBeenCalled();
    expect(useLuceneSearchInfinite).toHaveBeenCalledWith(
      'Investigation',
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
            target: 'Investigation',
          },
          {
            dimensions: [{ dimension: 'type.name' }],
            target: 'InvestigationParameter',
          },
          {
            dimensions: [{ dimension: 'type.name' }],
            target: 'Sample',
          },
        ],
      },
      {}
    );

    expect(useAddToCart).toHaveBeenCalledWith('investigation');
    expect(useRemoveFromCart).toHaveBeenCalledWith('investigation');
    expect(useInvestigationsDatasetCount).toHaveBeenCalledWith([rowData]);
    expect(useInvestigationSizes).toHaveBeenCalledWith(undefined);
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

  it('displays DOI and renders the expected Link ', () => {
    const wrapper = createWrapper();
    expect(
      wrapper
        .find('[data-testid="investigation-search-table-doi-link"]')
        .first()
        .text()
    ).toEqual('doi 1');

    expect(
      wrapper
        .find('[data-testid="investigation-search-table-doi-link"]')
        .first()
        .prop('href')
    ).toEqual('https://doi.org/doi 1');
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
          entityType: 'investigation',
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
      ],
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
    expect(wrapper.find(InvestigationDetailsPanel).exists()).toBeFalsy();
    wrapper.find('[aria-label="Show details"]').first().simulate('click');

    expect(wrapper.find(InvestigationDetailsPanel).exists()).toBeTruthy();
  });

  it('displays correct details panel for ISIS when expanded', () => {
    const wrapper = createWrapper('isis');
    expect(wrapper.find(ISISInvestigationDetailsPanel).exists()).toBeFalsy();
    wrapper.find('[aria-label="Show details"]').first().simulate('click');
    expect(wrapper.find(ISISInvestigationDetailsPanel).exists()).toBeTruthy();
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
    expect(wrapper.find(ISISInvestigationDetailsPanel).exists()).toBeFalsy();
    wrapper.find('[aria-label="Show details"]').first().simulate('click');
    expect(wrapper.find(ISISInvestigationDetailsPanel).exists()).toBeTruthy();

    wrapper.find('#investigation-datasets-tab').first().simulate('click');
    expect(history.location.pathname).toBe(
      '/browse/instrument/3/facilityCycle/4/investigation/1/dataset'
    );
  });

  it('displays correct details panel for DLS when expanded', () => {
    const wrapper = createWrapper('dls');
    expect(wrapper.find(DLSVisitDetailsPanel).exists()).toBeFalsy();
    wrapper.find('[aria-label="Show details"]').first().simulate('click');
    expect(wrapper.find(DLSVisitDetailsPanel).exists()).toBeTruthy();
  });

  it('renders title, visit ID, Name and DOI as links', () => {
    const wrapper = createWrapper();

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
    rowData = {
      id: 1,
      name: 'test',
      title: 'test',
      visitId: '1',
      doi: 'Test 1',
      investigationinstrument: [],
    };

    expect(() => createWrapper()).not.toThrowError();
  });

  it('renders generic link correctly & pending count correctly', () => {
    (useInvestigationsDatasetCount as jest.Mock).mockImplementation(() => [
      {
        isFetching: true,
      },
    ]);
    const wrapper = createWrapper('data');

    expect(wrapper.find('[aria-colindex=3]').find('a').prop('href')).toEqual(
      '/browse/investigation/1/dataset'
    );
    expect(wrapper.find('[aria-colindex=3]').text()).toEqual('Test 1');
    expect(wrapper.find('[aria-colindex=7]').text()).toEqual('Calculating...');
  });

  it("renders DLS link correctly and doesn't allow for cart selection", () => {
    const wrapper = createWrapper('dls');

    expect(wrapper.find('[aria-colindex=2]').find('a').prop('href')).toEqual(
      '/browse/proposal/Test 1/investigation/1/dataset'
    );
    expect(wrapper.find('[aria-colindex=2]').text()).toEqual('Test 1');
    expect(wrapper.find('[aria-label="select row 0"]')).toHaveLength(0);
  });

  it('renders ISIS link & file sizes correctly', () => {
    (useAllFacilityCycles as jest.Mock).mockReturnValue({
      data: [
        {
          id: 2,
          name: 'facility cycle name',
          startDate: '2000-06-10',
          endDate: '2020-06-11',
        },
      ],
    });

    const wrapper = createWrapper('isis');

    expect(useInvestigationSizes).toHaveBeenCalledWith([rowData]);
    expect(useInvestigationsDatasetCount).toHaveBeenCalledWith(undefined);

    expect(wrapper.find('[aria-colindex=3]').find('a').prop('href')).toEqual(
      '/browse/instrument/3/facilityCycle/2/investigation/1/dataset'
    );
    expect(wrapper.find('[aria-colindex=3]').text()).toEqual('Test 1');
    expect(wrapper.find('[aria-colindex=7]').text()).toEqual('1 B');
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
    expect(wrapper.find('[aria-colindex=3]').text()).toEqual('Test 1');
  });

  it('does not render ISIS link when facilityCycleId cannot be found', () => {
    const wrapper = createWrapper('isis');

    expect(wrapper.find('[aria-colindex=3]').find('a')).toHaveLength(0);
    expect(wrapper.find('[aria-colindex=3]').text()).toEqual('Test 1');
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
    expect(wrapper.find('[aria-colindex=3]').text()).toEqual('Test 1');
  });
});
