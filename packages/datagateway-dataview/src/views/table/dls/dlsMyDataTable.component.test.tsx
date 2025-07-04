import {
  render,
  type RenderResult,
  screen,
  within,
} from '@testing-library/react';
import {
  dGCommonInitialState,
  type Investigation,
  readSciGatewayToken,
  useInvestigationCount,
  useInvestigationsInfinite,
} from 'datagateway-common';
import { createMemoryHistory, type MemoryHistory } from 'history';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
  findAllRows,
  findCellInRow,
  findColumnHeaderByName,
  findColumnIndexByName,
  findRowAt,
} from '../../../setupTests';
import type { StateType } from '../../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import DLSMyDataTable from './dlsMyDataTable.component';
import userEvent from '@testing-library/user-event';
import axios, { AxiosResponse } from 'axios';

vi.mock('datagateway-common', async () => {
  const originalModule = await vi.importActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useInvestigationCount: vi.fn(),
    useInvestigationsInfinite: vi.fn(),
    readSciGatewayToken: vi.fn(),
  };
});

describe('DLS MyData table component', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let rowData: Investigation[];
  let history: MemoryHistory;
  let user: ReturnType<typeof userEvent.setup>;

  const renderComponent = (): RenderResult => {
    const store = mockStore(state);
    return render(
      <Provider store={store}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <DLSMyDataTable />
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
        dgcommon: { ...dGCommonInitialState, accessMethods: {} },
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
        fileSize: 1,
        fileCount: 1,
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
        startDate: '2019-06-10',
        endDate: '2019-06-11',
      },
    ];

    vi.mocked(useInvestigationCount, { partial: true }).mockReturnValue({
      data: 0,
    });
    vi.mocked(useInvestigationsInfinite, { partial: true }).mockReturnValue({
      data: { pages: [rowData], pageParams: [] },
      fetchNextPage: vi.fn(),
    });
    vi.mocked(readSciGatewayToken, { partial: true }).mockReturnValue({
      username: 'testUser',
    });
    global.Date.now = vi.fn(() => 1);
    axios.get = vi
      .fn()
      .mockImplementation((url: string): Promise<Partial<AxiosResponse>> => {
        if (/\/investigations$/.test(url)) {
          return Promise.resolve({
            data: rowData,
          });
        }

        if (/\/allowed$/.test(url)) {
          return Promise.resolve({ data: true });
        }

        return Promise.reject(`Endpoint not mocked: ${url}`);
      });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', async () => {
    renderComponent();

    const rows = await findAllRows();
    expect(rows).toHaveLength(1);

    expect(
      await findColumnHeaderByName('investigations.title')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('investigations.visit_id')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('investigations.size')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('investigations.instrument')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('investigations.start_date')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('investigations.end_date')
    ).toBeInTheDocument();

    const row = rows[0];

    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('investigations.title'),
        })
      ).getByText('Test 1')
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
          columnIndex: await findColumnIndexByName('investigations.size'),
        })
      ).getByText('1 B')
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

  it('sorts by startDate desc and filters startDate to be before the current date on load', async () => {
    const replaceSpy = vi.spyOn(history, 'replace');
    renderComponent();

    expect(
      await screen.findByRole('textbox', {
        name: 'investigations.start_date filter to',
      })
    ).toHaveValue('1970-01-01');

    expect(replaceSpy).toHaveBeenCalledTimes(2);
    expect(replaceSpy).toHaveBeenCalledWith({
      search: `?filters=${encodeURIComponent(
        JSON.stringify({ startDate: { endDate: '1970-01-01' } })
      )}`,
    });
    expect(replaceSpy).toHaveBeenCalledWith({
      search: `?sort=${encodeURIComponent(
        JSON.stringify({ startDate: 'desc' })
      )}`,
    });
  });

  it('updates filter query params on text filter', async () => {
    renderComponent();

    const filterInput = await screen.findByRole('textbox', {
      name: 'Filter by investigations.visit_id',
      hidden: true,
    });

    await user.type(filterInput, 'test');

    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent(
        '{"visitId":{"value":"test","type":"include"}}'
      )}`
    );

    await user.clear(filterInput);

    expect(history.location.search).toBe('?');
  });

  it('updates filter query params on date filter', async () => {
    renderComponent();

    const filterInput = await screen.findByRole('textbox', {
      name: 'investigations.end_date filter to',
    });

    await user.type(filterInput, '2019-08-06');

    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent('{"endDate":{"endDate":"2019-08-06"}}')}`
    );

    // await user.clear(filterInput);
    await user.click(filterInput);
    await user.keyboard('{Control}a{/Control}');
    await user.keyboard('{Delete}');

    expect(history.location.search).toBe('?');
  });

  it('updates sort query params on sort', async () => {
    renderComponent();

    await user.click(
      await screen.findByRole('button', { name: 'investigations.title' })
    );

    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"title":"asc"}')}`
    );
  });

  it('renders title and visit ID as a links', async () => {
    renderComponent();

    const row = await findRowAt(0);

    expect(
      await within(row).findByRole('link', { name: 'Test 1' })
    ).toHaveAttribute(
      'href',
      '/browse/proposal/Test 1/investigation/1/dataset'
    );
    expect(await within(row).findByRole('link', { name: '1' })).toHaveAttribute(
      'href',
      '/browse/proposal/Test 1/investigation/1/dataset'
    );
  });

  it('gracefully handles empty InvestigationInstrument', async () => {
    rowData[0] = {
      ...rowData[0],
      investigationInstruments: [],
    };
    vi.mocked(useInvestigationsInfinite, { partial: true }).mockReturnValue({
      data: { pages: [rowData], pageParams: [] },
      fetchNextPage: vi.fn(),
    });

    renderComponent();

    expect(await findAllRows()).toHaveLength(1);
  });

  it('gracefully handles missing Instrument from InvestigationInstrument object', async () => {
    rowData[0] = {
      ...rowData[0],
      investigationInstruments: [
        {
          id: 1,
        },
      ],
    };
    vi.mocked(useInvestigationsInfinite, { partial: true }).mockReturnValue({
      data: { pages: [rowData], pageParams: [] },
      fetchNextPage: vi.fn(),
    });

    renderComponent();

    const investigationInstrumentColIndex = await findColumnIndexByName(
      'investigations.instrument'
    );

    const row = await findRowAt(0);

    expect(
      await findCellInRow(row, { columnIndex: investigationInstrumentColIndex })
    ).toHaveTextContent('');
  });

  it('displays details panel when expanded', async () => {
    renderComponent();

    const row = await findRowAt(0);

    await user.click(
      await within(row).findByRole('button', { name: 'Show details' })
    );

    expect(
      await screen.findByTestId('dls-visit-details-panel')
    ).toBeInTheDocument();
  });
});
