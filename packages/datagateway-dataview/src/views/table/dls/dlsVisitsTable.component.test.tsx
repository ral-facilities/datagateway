import DLSVisitsTable from './dlsVisitsTable.component';
import { StateType } from '../../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import {
  dGCommonInitialState,
  Investigation,
  useInvestigationCount,
  useInvestigationsInfinite,
} from 'datagateway-common';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router } from 'react-router-dom';
import { createMemoryHistory, History } from 'history';
import {
  findAllRows,
  findCellInRow,
  findColumnHeaderByName,
  findColumnIndexByName,
  findRowAt,
} from '../../../setupTests';
import {
  render,
  type RenderResult,
  screen,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios, { AxiosResponse } from 'axios';

vi.mock('datagateway-common', async () => {
  const originalModule = await vi.importActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useInvestigationCount: vi.fn(),
    useInvestigationsInfinite: vi.fn(),
  };
});

describe('DLS Visits table component', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let rowData: Investigation[];
  let history: History;
  let user: ReturnType<typeof userEvent.setup>;

  const renderComponent = (): RenderResult => {
    const store = mockStore(state);
    return render(
      <Provider store={store}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <DLSVisitsTable proposalName="Test 1" />
          </QueryClientProvider>
        </Router>
      </Provider>
    );
  };

  beforeEach(() => {
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
            },
          },
        ],
        startDate: '2019-06-10',
        endDate: '2019-06-11',
      },
    ];
    history = createMemoryHistory();
    user = userEvent.setup();

    state = JSON.parse(
      JSON.stringify({
        dgdataview: dgDataViewInitialState,
        dgcommon: dGCommonInitialState,
      })
    );

    vi.mocked(useInvestigationCount, { partial: true }).mockReturnValue({
      data: 1,
      isLoading: false,
    });
    vi.mocked(useInvestigationsInfinite, { partial: true }).mockReturnValue({
      data: { pages: [rowData], pageParams: [] },
      isLoading: false,
    });

    axios.get = vi
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
    vi.clearAllMocks();
  });

  it('renders correctly', async () => {
    renderComponent();

    const rows = await findAllRows();
    expect(rows).toHaveLength(1);

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
      ).getByText('LARMOR')
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

  it('updates filter query params on text filter', async () => {
    renderComponent();

    const filterInput = await screen.findByRole('textbox', {
      name: 'Filter by investigations.visit_id',
      hidden: true,
    });

    await user.type(filterInput, 'test');

    // user.type inputs the given string character by character to simulate user typing
    // each keystroke of user.type creates a new entry in the history stack
    // so the initial entry + 4 characters in "test" = 5 entries
    expect(history.length).toBe(5);
    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent(
        '{"visitId":{"value":"test","type":"include"}}'
      )}`
    );

    await user.clear(filterInput);

    expect(history.length).toBe(6);
    expect(history.location.search).toBe('?');
  });

  it('updates filter query params on date filter', async () => {
    renderComponent();

    const filterInput = await screen.findByRole('textbox', {
      name: 'investigations.end_date filter to',
    });

    await user.type(filterInput, '2019-08-06');

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent('{"endDate":{"endDate":"2019-08-06"}}')}`
    );

    // await user.clear(filterInput);
    await user.click(filterInput);
    await user.keyboard('{Control}a{/Control}');
    await user.keyboard('{Delete}');

    expect(history.length).toBe(3);
    expect(history.location.search).toBe('?');
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
      await screen.findByRole('button', { name: 'investigations.visit_id' })
    );

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"visitId":"asc"}')}`
    );
  });

  it('renders details panel correctly and it sends off an FetchInvestigationDetails action', async () => {
    renderComponent();

    const row = await findRowAt(0);

    await user.click(within(row).getByRole('button', { name: 'Show details' }));

    expect(await screen.findByTestId('dls-visit-details-panel')).toBeTruthy();
  });

  it('renders visit ID as links', async () => {
    renderComponent();

    const visitIdColIndex = await findColumnIndexByName(
      'investigations.visit_id'
    );

    const row = await findRowAt(0);
    const visitIdCell = await findCellInRow(row, {
      columnIndex: visitIdColIndex,
    });

    expect(
      within(visitIdCell).getByRole('link', { name: '1' })
    ).toHaveAttribute(
      'href',
      '/browse/proposal/Test 1/investigation/1/dataset'
    );
  });

  it('renders fine with incomplete data', async () => {
    vi.mocked(useInvestigationCount, { partial: true }).mockReturnValueOnce({});
    vi.mocked(useInvestigationsInfinite, { partial: true }).mockReturnValueOnce(
      {}
    );

    vi.mocked(useInvestigationsInfinite, { partial: true }).mockReturnValueOnce(
      {
        data: {
          pages: [
            [
              {
                ...rowData[0],
                investigationInstruments: [
                  {
                    id: 1,
                  },
                ],
              },
            ],
          ],
          pageParams: [],
        },
        isLoading: false,
      }
    );

    renderComponent();

    expect(await findAllRows()).toHaveLength(1);
  });

  it('renders fine if no investigation instrument is returned', async () => {
    vi.mocked(useInvestigationCount, { partial: true }).mockReturnValue({
      data: 1,
      isLoading: false,
    });
    vi.mocked(useInvestigationsInfinite, { partial: true }).mockReturnValue({
      data: {
        pages: [
          [
            {
              ...rowData[0],
              investigationInstruments: [],
            },
          ],
        ],
        pageParams: [],
      },
      isLoading: false,
    });

    renderComponent();

    expect(await findAllRows()).toHaveLength(1);

    const instrumentNameColIndex = await findColumnIndexByName(
      'investigations.instrument'
    );

    const row = await findRowAt(0);
    const instrumentNameCell = await findCellInRow(row, {
      columnIndex: instrumentNameColIndex,
    });

    expect(instrumentNameCell).toHaveTextContent('');
  });
});
