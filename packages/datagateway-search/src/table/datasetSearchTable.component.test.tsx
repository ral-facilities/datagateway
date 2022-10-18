import * as React from 'react';
import DatasetSearchTable from './datasetSearchTable.component';
import { initialState } from '../state/reducers/dgsearch.reducer';
import configureStore from 'redux-mock-store';
import { StateType } from '../state/app.types';
import {
  Dataset,
  dGCommonInitialState,
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
import { QueryClient, QueryClientProvider } from 'react-query';
import { createMemoryHistory, History } from 'history';
import { Router } from 'react-router-dom';
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
import { UserEvent } from '@testing-library/user-event/setup/setup';
import userEvent from '@testing-library/user-event';
import {
  findAllRows,
  findCellInRow,
  findColumnHeaderByName,
  findColumnIndexByName,
  findRowAt,
} from 'datagateway-dataview/src/setupTests';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
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
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let history: History;
  let user: UserEvent;

  let rowData: Dataset[] = [];

  const renderComponent = (hierarchy?: string): RenderResult => {
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
    user = userEvent.setup();

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
      isLoading: false,
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

  it('renders correctly', async () => {
    renderComponent();

    const rows = await findAllRows();
    // should have 1 row in the table
    expect(rows).toHaveLength(1);

    const row = rows[0];

    // check that column headers are shown correctly
    expect(await findColumnHeaderByName('datasets.name')).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('datasets.datafile_count')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('datasets.investigation')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('datasets.create_time')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('datasets.modified_time')
    ).toBeInTheDocument();

    // each cell in the row should contain the correct value
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('datasets.name'),
        })
      ).getByText('Dataset test name')
    ).toBeInTheDocument();
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('datasets.datafile_count'),
        })
      ).getByText('1')
    ).toBeInTheDocument();
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('datasets.investigation'),
        })
      ).getByText('Investigation test title')
    ).toBeInTheDocument();
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('datasets.create_time'),
        })
      ).getByText('2019-07-23')
    ).toBeInTheDocument();
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('datasets.modified_time'),
        })
      ).getByText('2019-07-23')
    ).toBeInTheDocument();
  });

  it('renders correctly for isis', async () => {
    renderComponent('isis');

    const rows = await findAllRows();
    // should have 1 row in the table
    expect(rows).toHaveLength(1);

    const row = rows[0];

    // check that column headers are shown correctly
    expect(await findColumnHeaderByName('datasets.name')).toBeInTheDocument();
    expect(await findColumnHeaderByName('datasets.size')).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('datasets.investigation')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('datasets.create_time')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('datasets.modified_time')
    ).toBeInTheDocument();

    // each cell in the row should contain the correct value
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('datasets.name'),
        })
      ).getByText('Dataset test name')
    ).toBeInTheDocument();
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('datasets.size'),
        })
      ).getByText('1 B')
    ).toBeInTheDocument();
    expect(
      findCellInRow(row, {
        columnIndex: await findColumnIndexByName('datasets.investigation'),
      })
    ).toHaveTextContent(''); // expect empty text content because facility cycle is not provided
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('datasets.create_time'),
        })
      ).getByText('2019-07-23')
    ).toBeInTheDocument();
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('datasets.modified_time'),
        })
      ).getByText('2019-07-23')
    ).toBeInTheDocument();
  });

  it('updates filter query params on text filter', async () => {
    renderComponent();

    const filterInput = await screen.findByRole('textbox', {
      name: 'Filter by datasets.name',
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
      name: 'datasets.modified_time filter to',
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
      await screen.findByRole('button', { name: 'datasets.name' })
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
      await screen.findByTestId('dataset-details-panel')
    ).toBeInTheDocument();
  });

  it('displays correct details panel for ISIS when expanded', async () => {
    renderComponent('isis');

    const row = await findRowAt(0);

    await user.click(within(row).getByRole('button', { name: 'Show details' }));

    expect(
      await screen.findByTestId('dataset-details-panel')
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

    expect(
      await screen.findByTestId('dataset-details-panel')
    ).toBeInTheDocument();

    await user.click(
      await screen.findByRole('tab', { name: 'datasets.details.datafiles' })
    );

    expect(history.location.pathname).toBe(
      '/browse/instrument/4/facilityCycle/4/investigation/2/dataset/1'
    );
  });

  it('displays correct details panel for DLS when expanded', async () => {
    renderComponent('dls');

    const row = await findRowAt(0);

    await user.click(within(row).getByRole('button', { name: 'Show details' }));

    expect(
      await screen.findByTestId('dataset-details-panel')
    ).toBeInTheDocument();
  });

  it('renders Dataset title as a link', async () => {
    renderComponent();

    // find the title cell

    const datasetNameColIndex = await findColumnIndexByName('datasets.name');
    const row = await findRowAt(0);
    const titleCell = await findCellInRow(row, {
      columnIndex: datasetNameColIndex,
    });

    expect(
      within(titleCell).getByRole('link', { name: 'Dataset test name' })
    ).toHaveAttribute('href', '/browse/investigation/2/dataset/1/datafile');
  });

  it('renders fine with incomplete data', async () => {
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

    renderComponent();

    expect(await findAllRows()).toHaveLength(1);
  });

  it('renders generic link & pending count correctly', async () => {
    (useDatasetsDatafileCount as jest.Mock).mockImplementation(() => [
      {
        isFetching: true,
      },
    ]);
    renderComponent('data');

    const datasetNameColIndex = await findColumnIndexByName('datasets.name');
    const datasetSizeColIndex = await findColumnIndexByName(
      'datasets.datafile_count'
    );
    const row = await findRowAt(0);
    const titleCell = await findCellInRow(row, {
      columnIndex: datasetNameColIndex,
    });
    const fileCountCell = await findCellInRow(row, {
      columnIndex: datasetSizeColIndex,
    });

    expect(
      within(titleCell).getByRole('link', { name: 'Dataset test name' })
    ).toHaveAttribute('href', '/browse/investigation/2/dataset/1/datafile');
    expect(
      within(fileCountCell).getByText('Calculating...')
    ).toBeInTheDocument();
  });

  it('renders DLS link correctly', async () => {
    renderComponent('dls');

    const datasetNameColIndex = await findColumnIndexByName('datasets.name');
    const row = await findRowAt(0);
    const titleCell = await findCellInRow(row, {
      columnIndex: datasetNameColIndex,
    });

    expect(
      within(titleCell).getByRole('link', { name: 'Dataset test name' })
    ).toHaveAttribute(
      'href',
      '/browse/proposal/Investigation test name/investigation/2/dataset/1/datafile'
    );
  });

  it('renders ISIS link & file sizes correctly', async () => {
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

    renderComponent('isis');

    const datasetNameColIndex = await findColumnIndexByName('datasets.name');
    const datasetSizeColIndex = await findColumnIndexByName('datasets.size');
    const row = await findRowAt(0);
    const titleCell = await findCellInRow(row, {
      columnIndex: datasetNameColIndex,
    });
    const sizeCell = await findCellInRow(row, {
      columnIndex: datasetSizeColIndex,
    });

    expect(
      within(titleCell).getByRole('link', { name: 'Dataset test name' })
    ).toHaveAttribute(
      'href',
      '/browse/instrument/4/facilityCycle/6/investigation/2/dataset/1'
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
    delete rowData[0].investigation?.investigationInstruments;

    (useDatasetsInfinite as jest.Mock).mockReturnValue({
      data: { pages: [rowData] },
      fetchNextPage: jest.fn(),
    });
    renderComponent('isis');

    const datasetNameColIndex = await findColumnIndexByName('datasets.name');
    const row = await findRowAt(0);
    const titleCell = await findCellInRow(row, {
      columnIndex: datasetNameColIndex,
    });

    expect(
      within(titleCell).queryByRole('link', { name: 'Dataset test name' })
    ).toBeNull();
    expect(
      within(titleCell).getByText('Dataset test name')
    ).toBeInTheDocument();
  });

  it('does not render ISIS link when facilityCycleId cannot be found', async () => {
    renderComponent('isis');

    const datasetNameColIndex = await findColumnIndexByName('datasets.name');
    const row = await findRowAt(0);
    const titleCell = await findCellInRow(row, {
      columnIndex: datasetNameColIndex,
    });

    expect(
      within(titleCell).queryByRole('link', { name: 'Dataset test name' })
    ).toBeNull();
    expect(
      within(titleCell).getByText('Dataset test name')
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

    const datasetNameColIndex = await findColumnIndexByName('datasets.name');
    const row = await findRowAt(0);
    const titleCell = await findCellInRow(row, {
      columnIndex: datasetNameColIndex,
    });

    expect(
      within(titleCell).queryByRole('link', { name: 'Dataset test name' })
    ).toBeNull();
    expect(
      within(titleCell).getByText('Dataset test name')
    ).toBeInTheDocument();
  });

  it('displays only the dataset name when there is no generic investigation to link to', async () => {
    delete rowData[0].investigation;
    (useDatasetsInfinite as jest.Mock).mockReturnValue({
      data: { pages: [rowData] },
      fetchNextPage: jest.fn(),
    });

    renderComponent('data');

    const datasetNameColIndex = await findColumnIndexByName('datasets.name');
    const row = await findRowAt(0);
    const titleCell = await findCellInRow(row, {
      columnIndex: datasetNameColIndex,
    });

    expect(
      within(titleCell).queryByRole('link', { name: 'Dataset test name' })
    ).toBeNull();
    expect(
      within(titleCell).getByText('Dataset test name')
    ).toBeInTheDocument();
  });

  it('displays only the dataset name when there is no DLS investigation to link to', async () => {
    delete rowData[0].investigation;
    (useDatasetsInfinite as jest.Mock).mockReturnValue({
      data: { pages: [rowData] },
      fetchNextPage: jest.fn(),
    });

    renderComponent('dls');

    const datasetNameColIndex = await findColumnIndexByName('datasets.name');
    const row = await findRowAt(0);
    const titleCell = await findCellInRow(row, {
      columnIndex: datasetNameColIndex,
    });

    expect(
      within(titleCell).queryByRole('link', { name: 'Dataset test name' })
    ).toBeNull();
    expect(
      within(titleCell).getByText('Dataset test name')
    ).toBeInTheDocument();
  });

  it('displays only the dataset name when there is no ISIS investigation to link to', async () => {
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

    renderComponent('isis');

    const datasetNameColIndex = await findColumnIndexByName('datasets.name');
    const row = await findRowAt(0);
    const titleCell = await findCellInRow(row, {
      columnIndex: datasetNameColIndex,
    });

    expect(
      within(titleCell).queryByRole('link', { name: 'Dataset test name' })
    ).toBeNull();
    expect(
      within(titleCell).getByText('Dataset test name')
    ).toBeInTheDocument();
  });
});
