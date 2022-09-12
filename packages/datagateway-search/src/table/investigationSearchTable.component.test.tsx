import * as React from 'react';
import { initialState } from '../state/reducers/dgsearch.reducer';
import configureStore from 'redux-mock-store';
import { StateType } from '../state/app.types';
import {
  dGCommonInitialState,
  DLSVisitDetailsPanel,
  Investigation,
  InvestigationDetailsPanel,
  ISISInvestigationDetailsPanel,
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
} from 'datagateway-common';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { mount, ReactWrapper } from 'enzyme';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createMemoryHistory, History } from 'history';
import { Router } from 'react-router-dom';
import InvestigationSearchTable from './investigationSearchTable.component';
import {
  render,
  type RenderResult,
  screen,
  waitFor,
} from '@testing-library/react';
import {
  applyDatePickerWorkaround,
  cleanupDatePickerWorkaround,
} from '../setupTests';

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

  const renderComponent = (hierarchy?: string): RenderResult => {
    return render(
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
        title: 'Test title 1',
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
        investigationFacilityCycles: [
          {
            id: 23,
            facilityCycle: {
              id: 402,
              name: 'within cell interlinked',
              description: 'He waited for the stop sign to turn to a go sign.',
              startDate: '2017-03-17T14:03:11Z',
              endDate: '2020-11-29T05:41:54Z',
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
      isLoading: false,
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
      isLoading: false,
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
          investigationFacilityCycles: 'facilityCycle',
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
    expect(useInvestigationSizes).toHaveBeenCalledWith(undefined);
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
    applyDatePickerWorkaround();

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

    cleanupDatePickerWorkaround();
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
    const wrapper = createWrapper('isis');
    expect(wrapper.find(ISISInvestigationDetailsPanel).exists()).toBeFalsy();
    wrapper.find('[aria-label="Show details"]').last().simulate('click');
    expect(wrapper.find(ISISInvestigationDetailsPanel).exists()).toBeTruthy();

    wrapper.find('#investigation-datasets-tab').last().simulate('click');
    expect(history.location.pathname).toBe(
      '/browse/instrument/3/facilityCycle/402/investigation/1/dataset'
    );
  });

  it('displays correct details panel for DLS when expanded', () => {
    const wrapper = createWrapper('dls');
    expect(wrapper.find(DLSVisitDetailsPanel).exists()).toBeFalsy();
    wrapper.find('[aria-label="Show details"]').last().simulate('click');
    expect(wrapper.find(DLSVisitDetailsPanel).exists()).toBeTruthy();
  });

  it('renders title, visit ID, Name and DOI as links', () => {
    const wrapper = renderComponent();

    //Title and name
    expect(wrapper.getAllByText('Test title 1')).toMatchSnapshot();

    expect(wrapper.getAllByText('1')).toMatchSnapshot();

    expect(wrapper.getByText('doi 1')).toMatchSnapshot();
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

  it('renders generic link correctly & pending count correctly', async () => {
    (useInvestigationsDatasetCount as jest.Mock).mockImplementation(() => [
      {
        isFetching: true,
      },
    ]);
    renderComponent('data');

    expect(
      await screen.findByRole('link', { name: 'Test title 1' })
    ).toHaveAttribute('href', '/browse/investigation/1/dataset');
    expect(screen.getByText('Calculating...')).toBeInTheDocument();
  });

  it("renders DLS link correctly and doesn't allow for cart selection", async () => {
    renderComponent('dls');

    expect(
      await screen.findByRole('link', { name: 'Test title 1' })
    ).toHaveAttribute(
      'href',
      '/browse/proposal/Test 1/investigation/1/dataset'
    );
    expect(screen.queryByRole('checkbox', { name: 'select row 0' })).toBeNull();
  });

  it('renders ISIS link & file sizes correctly', async () => {
    renderComponent('isis');

    expect(
      await screen.findByRole('link', { name: 'Test title 1' })
    ).toHaveAttribute(
      'href',
      '/browse/instrument/3/facilityCycle/402/investigation/1/dataset'
    );

    expect(screen.getByText('1 B')).toBeInTheDocument();
  });

  it('does not render ISIS link when instrumentId cannot be found', async () => {
    delete rowData[0].investigationInstruments;

    (useInvestigationsInfinite as jest.Mock).mockReturnValue({
      data: { pages: [rowData] },
      fetchNextPage: jest.fn(),
    });
    renderComponent('isis');

    await waitFor(() => {
      expect(screen.queryByRole('link', { name: 'Test title 1' })).toBeNull();
    });
    expect(screen.getByText('Test title 1')).toBeInTheDocument();
  });

  it('does not render ISIS link when the investigation does not belong to any facility cycle', async () => {
    rowData[0].investigationFacilityCycles = [];

    renderComponent('isis');

    await waitFor(() => {
      expect(screen.queryByRole('link', { name: 'Test 1' })).toBeNull();
    });

    expect(screen.getByText('Test title 1')).toBeInTheDocument();
  });
});
