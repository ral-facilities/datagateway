import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  render,
  screen,
  within,
  type RenderResult,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  dGCommonInitialState,
  useInvestigationCount,
  useInvestigationsInfinite,
  type Investigation,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
  findAllRows,
  findCellInRow,
  findColumnHeaderByName,
  findColumnIndexByName,
  findRowAt,
  flushPromises,
} from '../../../setupTests';
import type { StateType } from '../../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import DLSProposalsTable from './dlsProposalsTable.component';

vi.mock('datagateway-common', async () => {
  const originalModule = await vi.importActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useInvestigationCount: vi.fn(),
    useInvestigationsInfinite: vi.fn(),
  };
});

describe('DLS Proposals table component', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let rowData: Investigation[];
  let user: ReturnType<typeof userEvent.setup>;

  const renderComponent = (): RenderResult => {
    const store = mockStore(state);
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <QueryClientProvider client={new QueryClient()}>
            <DLSProposalsTable />
          </QueryClientProvider>
        </BrowserRouter>
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
    window.history.replaceState({}, '', '/');
    user = userEvent.setup();

    state = JSON.parse(
      JSON.stringify({
        dgdataview: dgDataViewInitialState,
        dgcommon: dGCommonInitialState,
      })
    );

    vi.mocked(useInvestigationCount, { partial: true }).mockReturnValue({
      data: 1,
      isPending: false,
    });
    vi.mocked(useInvestigationsInfinite, { partial: true }).mockReturnValue({
      data: { pages: [rowData], pageParams: [] },
      isPending: false,
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
      await findColumnHeaderByName('investigations.name')
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
          columnIndex: await findColumnIndexByName('investigations.name'),
        })
      ).getByText('Test 1')
    ).toBeInTheDocument();
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

    expect(window.location.search).toContain(
      `?filters=${encodeURIComponent(
        '{"title":{"value":"test","type":"include"}}'
      )}`
    );

    await user.clear(filterInput);

    expect(window.location.search).not.toContain('filters=');
  });

  it('uses default sort', async () => {
    renderComponent();

    await act(async () => {
      await flushPromises();
    });

    expect(await screen.findAllByRole('gridcell')).toBeTruthy();

    expect(window.location.search).toBe(
      `?sort=${encodeURIComponent('{"title":"asc"}')}`
    );

    // check that the data hook is only called once with the query enabled
    expect(
      vi
        .mocked(useInvestigationsInfinite)
        .mock.calls.filter((call) => call[2] === true)
    ).toHaveLength(1);
  });

  it('renders title and name as links', async () => {
    renderComponent();

    const row = await findRowAt(0);

    const titleColIndex = await findColumnIndexByName('investigations.title');
    const investigationNameColIndex = await findColumnIndexByName(
      'investigations.name'
    );

    const titleCell = await findCellInRow(row, { columnIndex: titleColIndex });
    const nameCell = await findCellInRow(row, {
      columnIndex: investigationNameColIndex,
    });

    expect(
      within(titleCell).getByRole('link', { name: 'Test 1' })
    ).toHaveAttribute('href', '/browse/proposal/Test 1/investigation');

    expect(
      within(nameCell).getByRole('link', { name: 'Test 1' })
    ).toHaveAttribute('href', '/browse/proposal/Test 1/investigation');
  });
});
