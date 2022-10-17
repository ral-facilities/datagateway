import * as React from 'react';
import { initialState } from '../state/reducers/dgsearch.reducer';
import configureStore from 'redux-mock-store';
import { StateType } from '../state/app.types';
import {
  dGCommonInitialState,
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
} from 'datagateway-common';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createMemoryHistory, History } from 'history';
import { Router } from 'react-router-dom';
import InvestigationSearchTable from './investigationSearchTable.component';
import {
  render,
  type RenderResult,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import {
  applyDatePickerWorkaround,
  cleanupDatePickerWorkaround,
} from '../setupTests';
import userEvent from '@testing-library/user-event';
import { UserEvent } from '@testing-library/user-event/setup/setup';
import {
  findAllRows,
  findCellInRow,
  findColumnIndexByName,
  findRowAt,
} from 'datagateway-dataview/src/setupTests';

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
  let user: UserEvent;

  let rowData: Investigation[] = [];

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
    user = userEvent.setup();

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

  it('displays DOI and renders the expected Link ', async () => {
    renderComponent();

    expect(await screen.findByRole('link', { name: 'doi 1' })).toHaveAttribute(
      'href',
      'https://doi.org/doi 1'
    );
  });

  it('updates filter query params on text filter', async () => {
    renderComponent();

    const filterInput = await screen.findByRole('textbox', {
      name: 'Filter by investigations.title',
      hidden: true,
    });

    await user.type(filterInput, 'test');

    // user.type inputs the given string character by character to simulate user typing
    // each keystroke of user.type creates a new entry in the history stack
    // so the initial entry + 4 characters in "test" = 5 entries
    expect(history.length).toBe(5);
    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent(
        '{"title":{"value":"test","type":"include"}}'
      )}`
    );

    await user.clear(filterInput);

    expect(history.length).toBe(6);
    expect(history.location.search).toBe('?');
  });

  it('updates filter query params on date filter', async () => {
    applyDatePickerWorkaround();

    renderComponent();

    const filterInput = await screen.findByRole('textbox', {
      name: 'investigations.end_date filter to',
    });

    await user.type(filterInput, '2019-08-06');

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent('{"endDate":{"endDate":"2019-08-06"}}')}`
    );

    await user.clear(filterInput);

    expect(history.length).toBe(3);
    expect(history.location.search).toBe('?');

    cleanupDatePickerWorkaround();
  });

  it('updates sort query params on sort', async () => {
    renderComponent();

    await user.click(
      await screen.findByRole('button', { name: 'investigations.title' })
    );

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"title":"asc"}')}`
    );
  });

  it('calls addToCart mutate function on unchecked checkbox click', async () => {
    const addToCart = jest.fn();
    (useAddToCart as jest.Mock).mockReturnValue({
      mutate: addToCart,
      loading: false,
    });
    renderComponent();

    await user.click(
      await screen.findByRole('checkbox', { name: 'select row 0' })
    );

    expect(addToCart).toHaveBeenCalledWith([1]);
  });

  it('calls removeFromCart mutate function on checked checkbox click', async () => {
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

    renderComponent();

    await user.click(
      await screen.findByRole('checkbox', { name: 'select row 0' })
    );

    expect(removeFromCart).toHaveBeenCalledWith([1]);
  });

  it('selected rows only considers relevant cart items', async () => {
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

    renderComponent();

    const selectAllCheckbox = await screen.findByRole('checkbox', {
      name: 'select all rows',
    });

    expect(selectAllCheckbox).not.toBeChecked();
    expect(selectAllCheckbox).toHaveAttribute('data-indeterminate', 'false');
  });

  it('no select all checkbox appears and no fetchAllIds sent if selectAllSetting is false', async () => {
    state.dgsearch.selectAllSetting = false;

    renderComponent();

    await waitFor(() => {
      expect(
        screen.queryByRole('checkbox', { name: 'select all rows' })
      ).toBeNull();
    });
  });

  it('displays generic details panel when expanded', async () => {
    renderComponent();

    const row = await findRowAt(0);
    await user.click(within(row).getByRole('button', { name: 'Show details' }));

    expect(
      await screen.findByTestId('investigation-details-panel')
    ).toBeInTheDocument();
  });

  it('displays correct details panel for ISIS when expanded', async () => {
    renderComponent('isis');

    const row = await findRowAt(0);
    await user.click(within(row).getByRole('button', { name: 'Show details' }));

    expect(
      await screen.findByTestId('investigation-details-panel')
    ).toBeInTheDocument();
  });

  it('can navigate using the details panel for ISIS when there are facility cycles', async () => {
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

    renderComponent('isis');

    const row = await findRowAt(0);
    await user.click(within(row).getByRole('button', { name: 'Show details' }));

    await user.click(
      await screen.findByRole('tab', {
        name: 'investigations.details.datasets',
      })
    );

    expect(history.location.pathname).toBe(
      '/browse/instrument/3/facilityCycle/4/investigation/1/dataset'
    );
  });

  it('displays correct details panel for DLS when expanded', async () => {
    renderComponent('dls');

    const row = await findRowAt(0);
    await user.click(within(row).getByRole('button', { name: 'Show details' }));

    expect(
      await screen.findByTestId('visit-details-panel')
    ).toBeInTheDocument();
  });

  it('renders title, visit ID, Name and DOI as links', async () => {
    renderComponent();

    const titleColIndex = await findColumnIndexByName('investigations.title');
    const nameColIndex = await findColumnIndexByName('investigations.name');
    const doiColIndex = await findColumnIndexByName('investigations.doi');
    const visitIdColIndex = await findColumnIndexByName(
      'investigations.visit_id'
    );

    const row = await findRowAt(0);

    const titleCell = await findCellInRow(row, { columnIndex: titleColIndex });
    const nameCell = await findCellInRow(row, {
      columnIndex: nameColIndex,
    });
    const doiCell = await findCellInRow(row, { columnIndex: doiColIndex });
    const visitIdCell = await findCellInRow(row, {
      columnIndex: visitIdColIndex,
    });

    expect(
      within(titleCell).getByRole('link', { name: 'Test 1' })
    ).toBeInTheDocument();
    expect(within(nameCell).getByText('Test 1')).toBeInTheDocument();
    expect(
      within(doiCell).getByRole('link', { name: 'doi 1' })
    ).toBeInTheDocument();
    expect(within(visitIdCell).getByText('1'));
  });

  it('renders fine with incomplete data', async () => {
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

    renderComponent();

    expect(await findAllRows()).toHaveLength(1);
  });

  it('renders generic link correctly & pending count correctly', async () => {
    (useInvestigationsDatasetCount as jest.Mock).mockImplementation(() => [
      {
        isFetching: true,
      },
    ]);
    renderComponent('data');

    const titleColIndex = await findColumnIndexByName('investigations.title');
    const datafileCountColIndex = await findColumnIndexByName(
      'investigations.dataset_count'
    );
    const row = await findRowAt(0);
    const titleCell = await findCellInRow(row, { columnIndex: titleColIndex });
    const datafileCountCell = await findCellInRow(row, {
      columnIndex: datafileCountColIndex,
    });

    expect(
      within(titleCell).getByRole('link', { name: 'Test 1' })
    ).toHaveAttribute('href', '/browse/investigation/1/dataset');
    expect(
      within(datafileCountCell).getByText('Calculating...')
    ).toBeInTheDocument();
  });

  it("renders DLS link correctly and doesn't allow for cart selection", async () => {
    renderComponent('dls');

    const titleColIndex = await findColumnIndexByName('investigations.title');
    const row = await findRowAt(0);
    const titleCell = await findCellInRow(row, { columnIndex: titleColIndex });

    expect(
      within(titleCell).getByRole('link', { name: 'Test 1' })
    ).toHaveAttribute(
      'href',
      '/browse/proposal/Test 1/investigation/1/dataset'
    );
    expect(screen.queryByRole('checkbox', { name: 'select row 0' })).toBeNull();
  });

  it('renders ISIS link & file sizes correctly', async () => {
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

    renderComponent('isis');

    const titleColIndex = await findColumnIndexByName('investigations.title');
    const sizeColIndex = await findColumnIndexByName('investigations.size');
    const row = await findRowAt(0);
    const titleCell = await findCellInRow(row, { columnIndex: titleColIndex });
    const sizeCell = await findCellInRow(row, { columnIndex: sizeColIndex });

    expect(
      within(titleCell).getByRole('link', { name: 'Test 1' })
    ).toHaveAttribute(
      'href',
      '/browse/instrument/3/facilityCycle/2/investigation/1/dataset'
    );
    expect(within(sizeCell).getByText('1 B')).toBeInTheDocument();
  });

  it('does not render ISIS link when instrumentId cannot be found', async () => {
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
    renderComponent('isis');

    const titleColIndex = await findColumnIndexByName('investigations.title');
    const row = await findRowAt(0);
    const titleCell = await findCellInRow(row, { columnIndex: titleColIndex });

    expect(
      within(titleCell).queryByRole('link', { name: 'Test 1' })
    ).toBeNull();
    expect(within(titleCell).getByText('Test 1')).toBeInTheDocument();
  });

  it('does not render ISIS link when facilityCycleId cannot be found', async () => {
    renderComponent('isis');

    const titleColIndex = await findColumnIndexByName('investigations.title');
    const row = await findRowAt(0);
    const titleCell = await findCellInRow(row, { columnIndex: titleColIndex });

    expect(
      within(titleCell).queryByRole('link', { name: 'Test 1' })
    ).toBeNull();
    expect(within(titleCell).getByText('Test 1')).toBeInTheDocument();
  });

  it('does not render ISIS link when facilityCycleId has incompatible dates', async () => {
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

    renderComponent('isis');

    const titleColIndex = await findColumnIndexByName('investigations.title');
    const row = await findRowAt(0);
    const titleCell = await findCellInRow(row, { columnIndex: titleColIndex });

    expect(
      within(titleCell).queryByRole('link', { name: 'Test 1' })
    ).toBeNull();
    expect(within(titleCell).getByText('Test 1')).toBeInTheDocument();
  });
});
