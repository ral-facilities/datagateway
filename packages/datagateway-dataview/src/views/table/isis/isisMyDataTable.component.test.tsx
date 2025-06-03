import {
  render,
  type RenderResult,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import {
  dGCommonInitialState,
  type Investigation,
  readSciGatewayToken,
  useAddToCart,
  useAllFacilityCycles,
  useCart,
  useIds,
  useInvestigationCount,
  useInvestigationsInfinite,
  useRemoveFromCart,
} from 'datagateway-common';
import { createMemoryHistory, type History } from 'history';
import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
  applyDatePickerWorkaround,
  cleanupDatePickerWorkaround,
  findAllRows,
  findCellInRow,
  findColumnHeaderByName,
  findColumnIndexByName,
  findRowAt,
} from '../../../setupTests';
import type { StateType } from '../../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import ISISMyDataTable from './isisMyDataTable.component';
import userEvent from '@testing-library/user-event';
import axios, { AxiosResponse } from 'axios';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useInvestigationCount: jest.fn(),
    useInvestigationsInfinite: jest.fn(),
    useInvestigationSizes: jest.fn(),
    useIds: jest.fn(),
    useCart: jest.fn(),
    useAddToCart: jest.fn(),
    useRemoveFromCart: jest.fn(),
    useAllFacilityCycles: jest.fn(),
    readSciGatewayToken: jest.fn(),
  };
});

describe('ISIS MyData table component', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let rowData: Investigation[];
  let history: History;
  let user: ReturnType<typeof userEvent.setup>;

  const renderComponent = (
    element: React.ReactElement = <ISISMyDataTable />
  ): RenderResult => {
    const store = mockStore(state);
    return render(
      <Provider store={store}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            {element}
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
        dgdataview: dgDataViewInitialState,
        dgcommon: dGCommonInitialState,
      })
    );
    rowData = [
      {
        id: 1,
        title: 'Test 1 title',
        name: 'Test 1 name',
        summary: 'foo bar',
        fileSize: 1,
        fileCount: 1,
        visitId: '1',
        doi: 'doi 1',
        investigationInstruments: [
          {
            id: 1,
            instrument: {
              id: 3,
              name: 'LARMOR',
              fullName: 'LARMORLARMOR',
            },
          },
        ],
        investigationFacilityCycles: [
          {
            id: 192,
            facilityCycle: {
              id: 8,
              name: 'Cycle name',
              startDate: '2019-06-01',
              endDate: '2019-07-01',
            },
          },
        ],
        dataCollectionInvestigations: [
          {
            id: 6,
            investigation: {
              id: 1,
              title: 'Test 1 title',
              name: 'Test 1 name',
              visitId: '1',
            },
            dataCollection: {
              id: 11,
              dataPublications: [
                {
                  id: 12,
                  pid: 'Data Publication Pid',
                  description: 'Data Publication description',
                  title: 'Data Publication',
                },
              ],
            },
          },
        ],
        startDate: '2019-06-10',
        endDate: '2019-06-11',
      },
    ];

    (useCart as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
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
    (readSciGatewayToken as jest.Mock).mockReturnValue({
      username: 'testUser',
    });

    axios.get = jest
      .fn()
      .mockImplementation((url: string): Promise<Partial<AxiosResponse>> => {
        if (/\/investigations$/.test(url)) {
          return Promise.resolve({
            data: rowData,
          });
        }

        return Promise.reject(`Endpoint not mocked: ${url}`);
      });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', async () => {
    renderComponent();

    const rows = await findAllRows();
    expect(rows).toHaveLength(1);

    expect(
      await findColumnHeaderByName('investigations.title')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('investigations.doi')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('investigations.visit_id')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('investigations.name')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('investigations.instrument')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('investigations.size')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('investigations.start_date')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('investigations.end_date')
    ).toBeInTheDocument();

    const row = rows[0];

    // check that every cell contains the correct values
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('investigations.title'),
        })
      ).getByText('Test 1 title')
    ).toBeInTheDocument();
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('investigations.doi'),
        })
      ).getByText('Data Publication Pid')
    ).toBeInTheDocument();
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('investigations.visit_id'),
        })
      ).getByText('1')
    ).toBeInTheDocument();
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('investigations.name'),
        })
      ).getByText('Test 1 name')
    ).toBeInTheDocument();
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('investigations.instrument'),
        })
      ).getByText('LARMORLARMOR')
    ).toBeInTheDocument();
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('investigations.size'),
        })
      ).getByText('1 B')
    ).toBeInTheDocument();
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('investigations.start_date'),
        })
      ).getByText('2019-06-10')
    ).toBeInTheDocument();
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('investigations.end_date'),
        })
      ).getByText('2019-06-11')
    ).toBeInTheDocument();
  });

  it('sorts by startDate desc on load', () => {
    renderComponent();
    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent(JSON.stringify({ startDate: 'desc' }))}`
    );
  });

  it('updates filter query params on text filter', async () => {
    renderComponent();

    const filterInput = await screen.findByRole('textbox', {
      name: 'Filter by investigations.name',
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
      name: 'investigations.start_date filter from',
    });

    await user.type(filterInput, '2019-08-06');

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent(
        '{"startDate":{"startDate":"2019-08-06"}}'
      )}`
    );

    // await user.clear(filterInput);
    await user.click(filterInput);
    await user.keyboard('{Control}a{/Control}');
    await user.keyboard('{Delete}');

    expect(history.length).toBe(3);
    expect(history.location.search).toBe('?');

    cleanupDatePickerWorkaround();
  });

  it('uses default sort', async () => {
    renderComponent();

    expect(await screen.findAllByRole('gridcell')).toBeTruthy();

    expect(history.length).toBe(1);
    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"startDate":"desc"}')}`
    );

    // check that the data request is sent only once after mounting
    expect(useInvestigationsInfinite).toHaveBeenCalledTimes(2);
    expect(useInvestigationsInfinite).toHaveBeenCalledWith(
      expect.anything(),
      undefined,
      false
    );
    expect(useInvestigationsInfinite).toHaveBeenLastCalledWith(
      expect.anything(),
      undefined,
      true
    );
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
    state.dgdataview.selectAllSetting = false;

    renderComponent();

    await waitFor(() => {
      expect(
        screen.queryByRole('checkbox', { name: 'select all rows' })
      ).toBeNull();
    });
  });

  it('displays details panel when expanded', async () => {
    renderComponent();

    // find the first row
    const row = await findRowAt(0);

    await user.click(
      await within(row).findByRole('button', { name: 'Show details' })
    );

    expect(
      await screen.findByTestId('isis-investigation-details-panel')
    ).toBeInTheDocument();
  });

  it('displays details panel when more information is expanded and navigates to datasets view when tab clicked', async () => {
    renderComponent();

    // find the first row
    const row = await findRowAt(0);

    await user.click(
      await within(row).findByRole('button', { name: 'Show details' })
    );

    await user.click(
      await screen.findByRole('tab', {
        name: 'investigations.details.datasets',
      })
    );

    expect(history.location.pathname).toBe(
      '/browse/instrument/3/facilityCycle/8/investigation/1/dataset'
    );
  });

  it('displays DOI and renders the expected Link ', async () => {
    renderComponent();
    expect(
      await screen.findByRole('link', { name: 'Data Publication Pid' })
    ).toHaveAttribute('href', 'https://doi.org/Data Publication Pid');
  });

  it('renders details panel without datasets link if no facility cycles', async () => {
    (useAllFacilityCycles as jest.Mock).mockReturnValue({
      data: undefined,
    });

    renderComponent();

    await waitFor(() => {
      expect(
        screen.queryByRole('tab', {
          name: 'investigations.details.datasets',
        })
      ).toBeNull();
    });
  });

  it('renders title and name as links', async () => {
    renderComponent();
    expect(
      await screen.findByRole('link', { name: 'Test 1 title' })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('link', { name: 'Data Publication Pid' })
    ).toBeInTheDocument();
  });

  it('gracefully handles empty arrays', async () => {
    // check it doesn't error if arrays are empty
    rowData[0] = {
      ...rowData[0],
      investigationInstruments: [],
      dataCollectionInvestigations: [],
    };
    (useInvestigationsInfinite as jest.Mock).mockReturnValue({
      data: { pages: [rowData] },
      fetchNextPage: jest.fn(),
    });
    (useAllFacilityCycles as jest.Mock).mockReturnValue({
      data: [],
    });
    renderComponent();

    const rows = await screen.findAllByRole('row');
    // 2 rows expected, 1 for the header row, and 1 for the items in rowData.
    expect(rows).toHaveLength(2);
  });

  it('gracefully handles missing Study from Study Investigation object and missing Instrument from InvestigationInstrument object', async () => {
    rowData[0] = {
      ...rowData[0],
      investigationInstruments: [
        {
          id: 1,
        },
      ],
      dataCollectionInvestigations: [
        {
          id: 6,
        },
      ],
    };
    (useInvestigationsInfinite as jest.Mock).mockReturnValue({
      data: { pages: [rowData] },
      fetchNextPage: jest.fn(),
    });
    renderComponent();

    const doiColumnIndex = await findColumnIndexByName('investigations.doi');
    const instrumentColumnIndex = await findColumnIndexByName(
      'investigations.instrument'
    );

    const rows = await screen.findAllByRole('row');
    // 2 rows expected, 1 for the header row, and 1 for the items in rowData.
    expect(rows).toHaveLength(2);

    const row = await findRowAt(0);

    expect(
      findCellInRow(row, { columnIndex: doiColumnIndex })
    ).toHaveTextContent('');
    expect(
      findCellInRow(row, { columnIndex: instrumentColumnIndex })
    ).toHaveTextContent('');
  });
});
