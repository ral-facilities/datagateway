import * as React from 'react';
import DatafileSearchTable from './datafileSearchTable.component';
import { initialState as dgSearchInitialState } from '../state/reducers/dgsearch.reducer';
import configureStore from 'redux-mock-store';
import { StateType } from '../state/app.types';
import {
  Datafile,
  dGCommonInitialState,
  useAddToCart,
  useAllFacilityCycles,
  useCart,
  useDatafileCount,
  useDatafilesInfinite,
  useIds,
  useLuceneSearch,
  useRemoveFromCart,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { Router } from 'react-router-dom';
import { createMemoryHistory, History } from 'history';
import { QueryClient, QueryClientProvider } from 'react-query';
import {
  applyDatePickerWorkaround,
  cleanupDatePickerWorkaround,
} from '../setupTests';
import {
  render,
  type RenderResult,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event/setup/setup';
import userEvent from '@testing-library/user-event';
import {
  findAllRows,
  findCellInRow,
  findColumnHeaderByName,
  findColumnIndexByName,
  findRowAt,
} from '../setupTests';

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
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let history: History;
  let user: UserEvent;

  let rowData: Datafile[] = [];

  const renderComponent = (hierarchy?: string): RenderResult =>
    render(
      <Provider store={mockStore(state)}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <DatafileSearchTable hierarchy={hierarchy ?? ''} />
          </QueryClientProvider>
        </Router>
      </Provider>
    );

  beforeEach(() => {
    history = createMemoryHistory();
    user = userEvent.setup();

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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', async () => {
    renderComponent();

    // check that column headers are shown correctly.
    expect(await findColumnHeaderByName('datafiles.name')).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('datafiles.location')
    ).toBeInTheDocument();
    expect(await findColumnHeaderByName('datafiles.size')).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('datafiles.dataset')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('datafiles.modified_time')
    ).toBeInTheDocument();

    const rows = await findAllRows();
    // should have 1 row in the table
    expect(rows).toHaveLength(1);

    const row = rows[0];

    // each cell in the row should contain the correct value
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('datafiles.name'),
        })
      ).getByText('Datafile test name')
    ).toBeInTheDocument();
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('datafiles.location'),
        })
      ).getByText('/datafiletest')
    ).toBeInTheDocument();
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('datafiles.size'),
        })
      ).getByText('1 B')
    ).toBeInTheDocument();
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('datafiles.dataset'),
        })
      ).getByText('Dataset test name')
    ).toBeInTheDocument();
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('datafiles.modified_time'),
        })
      ).getByText('2019-07-23')
    ).toBeInTheDocument();
  });

  it('updates filter query params on text filter', async () => {
    renderComponent();

    const filterInput = await screen.findByRole('textbox', {
      name: 'Filter by datafiles.name',
      hidden: true,
    });

    await user.type(filterInput, 'test');

    // user.type inputs the given string character by character to simulate user typing
    // each keystroke of user.type creates a new entry in the history stack
    // so the initial entry + 4 characters in "test" = 5 entries
    expect(history.length).toBe(5);
    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent(
        '{"name":{"value":"test","type":"include"}}'
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
      name: 'datafiles.modified_time filter to',
    });

    await user.type(filterInput, '2019-08-06');

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent('{"modTime":{"endDate":"2019-08-06"}}')}`
    );

    await user.clear(filterInput);

    expect(history.length).toBe(3);
    expect(history.location.search).toBe('?');

    cleanupDatePickerWorkaround();
  });

  it('updates sort query params on sort', async () => {
    renderComponent();

    await user.click(
      await screen.findByRole('button', { name: 'datafiles.name' })
    );

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"name":"asc"}')}`
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
      await screen.findByTestId('datafile-details-panel')
    ).toBeInTheDocument();
  });

  it('displays correct details panel for ISIS when expanded', async () => {
    renderComponent('isis');

    const row = await findRowAt(0);
    await user.click(within(row).getByRole('button', { name: 'Show details' }));

    expect(
      await screen.findByTestId('datafile-details-panel')
    ).toBeInTheDocument();
  });

  it('displays correct details panel for DLS when expanded', async () => {
    renderComponent('dls');

    const row = await findRowAt(0);
    await user.click(within(row).getByRole('button', { name: 'Show details' }));

    expect(
      await screen.findByTestId('datafile-details-panel')
    ).toBeInTheDocument();
  });

  it('renders fine with incomplete data', async () => {
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

    renderComponent();

    expect(await findAllRows()).toHaveLength(1);
  });

  it('renders generic link correctly', async () => {
    renderComponent('data');

    const datasetColIndex = await findColumnIndexByName('datafiles.dataset');

    const row = await findRowAt(0);
    const datasetLinkCell = await findCellInRow(row, {
      columnIndex: datasetColIndex,
    });

    expect(
      within(datasetLinkCell).getByRole('link', { name: 'Dataset test name' })
    ).toHaveAttribute('href', '/browse/investigation/3/dataset/2/datafile');
  });

  it('renders DLS link correctly', async () => {
    renderComponent('dls');

    const datasetColIndex = await findColumnIndexByName('datafiles.name');

    const row = await findRowAt(0);
    const datasetLinkCell = await findCellInRow(row, {
      columnIndex: datasetColIndex,
    });

    expect(
      within(datasetLinkCell).getByRole('link', { name: 'Datafile test name' })
    ).toHaveAttribute(
      'href',
      '/browse/proposal/Dataset test name/investigation/3/dataset/2/datafile'
    );
  });

  it('renders ISIS link correctly', async () => {
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

    const datasetColIndex = await findColumnIndexByName('datafiles.name');

    const row = await findRowAt(0);
    const datasetLinkCell = await findCellInRow(row, {
      columnIndex: datasetColIndex,
    });

    expect(
      within(datasetLinkCell).getByRole('link', { name: 'Datafile test name' })
    ).toHaveAttribute(
      'href',
      '/browse/instrument/5/facilityCycle/4/investigation/3/dataset/2/datafile'
    );
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
    delete rowData[0].dataset?.investigation?.investigationInstruments;
    (useDatafilesInfinite as jest.Mock).mockReturnValue({
      data: { pages: [rowData] },
      fetchNextPage: jest.fn(),
    });
    renderComponent('isis');

    const datasetColIndex = await findColumnIndexByName('datafiles.name');

    const row = await findRowAt(0);
    const datasetLinkCell = await findCellInRow(row, {
      columnIndex: datasetColIndex,
    });

    await waitFor(() => {
      expect(
        within(datasetLinkCell).queryByRole('link', {
          name: 'Datafile test name',
        })
      ).toBeNull();
    });

    expect(
      within(datasetLinkCell).getByText('Datafile test name')
    ).toBeInTheDocument();
  });

  it('does not render ISIS link when facilityCycleId cannot be found', async () => {
    renderComponent('isis');

    const datasetColIndex = await findColumnIndexByName('datafiles.name');

    const row = await findRowAt(0);
    const datasetLinkCell = await findCellInRow(row, {
      columnIndex: datasetColIndex,
    });

    await waitFor(() => {
      expect(
        within(datasetLinkCell).queryByRole('link', {
          name: 'Datafile test name',
        })
      ).toBeNull();
    });

    expect(
      within(datasetLinkCell).getByText('Datafile test name')
    ).toBeInTheDocument();
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

    const datasetColIndex = await findColumnIndexByName('datafiles.name');

    const row = await findRowAt(0);
    const datasetLinkCell = await findCellInRow(row, {
      columnIndex: datasetColIndex,
    });

    await waitFor(() => {
      expect(
        within(datasetLinkCell).queryByRole('link', {
          name: 'Datafile test name',
        })
      ).toBeNull();
    });

    expect(
      within(datasetLinkCell).getByText('Datafile test name')
    ).toBeInTheDocument();
  });

  it('displays only the datafile name when there is no generic dataset to link to', async () => {
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

    renderComponent('data');

    const datasetColIndex = await findColumnIndexByName('datafiles.name');

    const row = await findRowAt(0);
    const datasetLinkCell = await findCellInRow(row, {
      columnIndex: datasetColIndex,
    });

    await waitFor(() => {
      expect(
        within(datasetLinkCell).queryByRole('link', {
          name: 'Datafile test name',
        })
      ).toBeNull();
    });

    expect(
      within(datasetLinkCell).getByText('Datafile test name')
    ).toBeInTheDocument();
  });

  it('displays only the datafile name when there is no DLS dataset to link to', async () => {
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

    renderComponent('dls');

    const datasetColIndex = await findColumnIndexByName('datafiles.name');

    const row = await findRowAt(0);
    const datasetLinkCell = await findCellInRow(row, {
      columnIndex: datasetColIndex,
    });

    await waitFor(() => {
      expect(
        within(datasetLinkCell).queryByRole('link', {
          name: 'Datafile test name',
        })
      ).toBeNull();
    });

    expect(
      within(datasetLinkCell).getByText('Datafile test name')
    ).toBeInTheDocument();
  });

  it('displays only the datafile name when there is no ISIS investigation to link to', async () => {
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

    renderComponent('isis');

    const datasetColIndex = await findColumnIndexByName('datafiles.name');

    const row = await findRowAt(0);
    const datasetLinkCell = await findCellInRow(row, {
      columnIndex: datasetColIndex,
    });

    await waitFor(() => {
      expect(
        within(datasetLinkCell).queryByRole('link', {
          name: 'Datafile test name',
        })
      ).toBeNull();
    });

    expect(
      within(datasetLinkCell).getByText('Datafile test name')
    ).toBeInTheDocument();
  });
});
