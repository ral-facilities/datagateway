/* eslint-disable @typescript-eslint/no-empty-function */
import React from 'react';
import { initialState } from '../state/reducers/dgsearch.reducer';
import configureStore from 'redux-mock-store';
import { StateType } from '../state/app.types';
import {
  dGCommonInitialState,
  handleICATError,
  Investigation,
  useAddToCart,
  useAllFacilityCycles,
  useCart,
  useIds,
  useInvestigationCount,
  useInvestigationsDatasetCount,
  useInvestigationsInfinite,
  useInvestigationSizes,
  useLuceneSearch,
  useRemoveFromCart,
  ISISInvestigationDetailsPanel,
  InvestigationDetailsPanel,
  DLSVisitDetailsPanel,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { mount, ReactWrapper } from 'enzyme';
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
    useLuceneSearch: jest.fn(),
    useInvestigationCount: jest.fn(),
    useInvestigationsInfinite: jest.fn(),
    useIds: jest.fn(),
    useAddToCart: jest.fn(),
    useRemoveFromCart: jest.fn(),
    useAllFacilityCycles: jest.fn(),
    useInvestigationsDatasetCount: jest.fn(),
    useInvestigationSizes: jest.fn(),
  };
});

describe('Investigation Search Table component', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let history: History;

  let rowData: Investigation[] = [];

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
    history = createMemoryHistory();

    state = JSON.parse(
      JSON.stringify({
        dgsearch: initialState,
        dgcommon: dGCommonInitialState,
      })
    );
    rowData = [
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
            investigation: {
              id: 1,
              title: 'Test 1',
              name: 'Test 1',
              visitId: '1',
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
    (useCart as jest.Mock).mockReturnValue({
      data: [],
    });
    (useLuceneSearch as jest.Mock).mockReturnValue({
      data: [],
    });
    (useInvestigationCount as jest.Mock).mockReturnValue({
      data: 0,
    });
    (useInvestigationsInfinite as jest.Mock).mockReturnValue({
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
    (handleICATError as jest.Mock).mockClear();
    (useCart as jest.Mock).mockClear();
    (useLuceneSearch as jest.Mock).mockClear();
    (useInvestigationCount as jest.Mock).mockClear();
    (useInvestigationsInfinite as jest.Mock).mockClear();
    (useIds as jest.Mock).mockClear();
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
    (useLuceneSearch as jest.Mock).mockReturnValue({
      data: [1],
    });

    createWrapper();

    expect(useCart).toHaveBeenCalled();
    expect(useLuceneSearch).toHaveBeenCalledWith('Investigation', {
      searchText: '',
      startDate: null,
      endDate: null,
      maxCount: 300,
    });

    expect(useInvestigationCount).toHaveBeenCalledWith([
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          id: { in: [1] },
        }),
      },
    ]);
    expect(useInvestigationsInfinite).toHaveBeenCalledWith([
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          id: { in: [1] },
        }),
      },
      {
        filterType: 'include',
        filterValue: JSON.stringify({
          investigationInstruments: 'instrument',
        }),
      },
    ]);
    expect(useIds).toHaveBeenCalledWith(
      'investigation',
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

    expect(useAddToCart).toHaveBeenCalledWith('investigation');
    expect(useRemoveFromCart).toHaveBeenCalledWith('investigation');
    expect(useInvestigationsDatasetCount).toHaveBeenCalledWith({
      pages: [rowData],
    });
    expect(useInvestigationSizes).toHaveBeenCalledWith([]);
  });

  it('calls fetchNextPage function of useDatafilesInfinite when loadMoreRows is called', () => {
    const fetchNextPage = jest.fn();
    (useInvestigationsInfinite as jest.Mock).mockReturnValue({
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

  it('updates filter query params on text filter', () => {
    const wrapper = createWrapper();

    const filterInput = wrapper
      .find('[aria-label="Filter by investigations.title"]')
      .last();
    filterInput.instance().value = 'test';
    filterInput.simulate('change');

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent(
        '{"title":{"value":"test","type":"include"}}'
      )}`
    );

    filterInput.instance().value = '';
    filterInput.simulate('change');

    expect(history.length).toBe(3);
    expect(history.location.search).toBe('?');
  });

  it('updates filter query params on date filter', () => {
    //https://github.com/mui/material-ui-pickers/issues/2073

    // add window.matchMedia
    // this is necessary for the date picker to be rendered in desktop mode.
    // if this is not provided, the mobile mode is rendered, which might lead to unexpected behavior
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query) => ({
        media: query,
        // this is the media query that @material-ui/pickers uses to determine if a device is a desktop device
        matches: query === '(pointer: fine)',
        onchange: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }),
    });

    const wrapper = createWrapper();

    const filterInput = wrapper.find(
      'input[id="investigations.end_date filter to"]'
    );
    filterInput.instance().value = '2019-08-06';
    filterInput.simulate('change');

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent('{"endDate":{"endDate":"2019-08-06"}}')}`
    );

    filterInput.instance().value = '';
    filterInput.simulate('change');

    expect(history.length).toBe(3);
    expect(history.location.search).toBe('?');

    delete window.matchMedia;
  });

  it('updates sort query params on sort', () => {
    const wrapper = createWrapper();

    wrapper
      .find('[role="columnheader"] span[role="button"]')
      .first()
      .simulate('click');

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"title":"asc"}')}`
    );
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

    wrapper.find('[aria-label="select row 0"]').last().simulate('click');

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

    expect(useIds).toHaveBeenCalledWith(
      'investigation',
      expect.anything(),
      false
    );
    expect(useIds).not.toHaveBeenCalledWith(
      'investigation',
      expect.anything(),
      true
    );
    expect(wrapper.find('[aria-label="select all rows"]')).toHaveLength(0);
  });

  it('displays generic details panel when expanded', () => {
    const wrapper = createWrapper();
    expect(wrapper.find(InvestigationDetailsPanel).exists()).toBeFalsy();
    wrapper.find('[aria-label="Show details"]').last().simulate('click');

    expect(wrapper.find(InvestigationDetailsPanel).exists()).toBeTruthy();
  });

  it('displays correct details panel for ISIS when expanded', () => {
    const wrapper = createWrapper('isis');
    expect(wrapper.find(ISISInvestigationDetailsPanel).exists()).toBeFalsy();
    wrapper.find('[aria-label="Show details"]').last().simulate('click');
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
    wrapper.find('[aria-label="Show details"]').last().simulate('click');
    expect(wrapper.find(ISISInvestigationDetailsPanel).exists()).toBeTruthy();

    wrapper.find('#investigation-datasets-tab').last().simulate('click');
    expect(history.location.pathname).toBe(
      '/browse/instrument/3/facilityCycle/4/investigation/1/dataset'
    );
  });

  it('displays correct details panel for DLS when expanded', () => {
    const wrapper = createWrapper('dls');
    expect(wrapper.find(DLSVisitDetailsPanel).exists()).toBeFalsy();
    wrapper.find('[aria-label="Show details"]').last().simulate('click');
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
    rowData = [
      {
        id: 1,
        name: 'test',
        title: 'test',
        visitId: '1',
        doi: 'Test 1',
        investigationInstruments: [],
      },
    ];

    (useInvestigationsInfinite as jest.Mock).mockReturnValue({
      data: { pages: [rowData] },
      fetchNextPage: jest.fn(),
    });

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

    expect(useInvestigationSizes).toHaveBeenCalledWith({ pages: [rowData] });
    expect(useInvestigationsDatasetCount).toHaveBeenCalledWith([]);

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
    delete rowData[0].investigationInstruments;

    (useInvestigationsInfinite as jest.Mock).mockReturnValue({
      data: { pages: [rowData] },
      fetchNextPage: jest.fn(),
    });
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
