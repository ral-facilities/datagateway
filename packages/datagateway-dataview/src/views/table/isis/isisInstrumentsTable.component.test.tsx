import ISISInstrumentsTable from './isisInstrumentsTable.component';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import { StateType } from '../../../state/app.types';
import {
  dGCommonInitialState,
  Instrument,
  useInstrumentCount,
  useInstrumentsInfinite,
} from 'datagateway-common';
import configureStore from 'redux-mock-store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { Router } from 'react-router-dom';
import { createMemoryHistory, History } from 'history';
import {
  render,
  type RenderResult,
  screen,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  findAllRows,
  findCellInRow,
  findColumnHeaderByName,
  findColumnIndexByName,
} from '../../../setupTests';
import axios, { AxiosResponse } from 'axios';

vi.mock('datagateway-common', async () => {
  const originalModule = await vi.importActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useInstrumentCount: vi.fn(),
    useInstrumentsInfinite: vi.fn(),
  };
});

describe('ISIS Instruments table component', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let rowData: Instrument[];
  let history: History;
  let user: ReturnType<typeof userEvent.setup>;

  const renderComponent = (dataPublication = false): RenderResult => {
    const store = mockStore(state);
    return render(
      <Provider store={store}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <ISISInstrumentsTable dataPublication={dataPublication} />
          </QueryClientProvider>
        </Router>
      </Provider>
    );
  };

  beforeEach(() => {
    rowData = [
      {
        id: 1,
        name: 'Test 1',
        fullName: 'Test instrument 1',
        description: 'foo bar',
        url: 'test url',
        type: 'type1',
      },
      {
        id: 2,
        name: 'Test 2',
        description: 'foo bar',
        url: 'test url',
        type: 'type2',
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

    vi.mocked(useInstrumentCount).mockReturnValue({
      data: 1,
      isLoading: false,
    });
    vi.mocked(useInstrumentsInfinite).mockReturnValue({
      data: { pages: [rowData] },
      fetchNextPage: vi.fn(),
    });

    axios.get = vi
      .fn()
      .mockImplementation((url: string): Promise<Partial<AxiosResponse>> => {
        if (/\/instruments$/.test(url)) {
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
    // should have 2 rows in the table
    expect(rows).toHaveLength(2);

    // check that column headers are shown correctly.
    expect(
      await findColumnHeaderByName('instruments.name')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('instruments.type')
    ).toBeInTheDocument();

    // check that every cell contains the correct value
    const firstRow = rows[0];
    expect(
      within(
        findCellInRow(firstRow, {
          columnIndex: await findColumnIndexByName('instruments.name'),
        })
      ).getByText('Test instrument 1')
    ).toBeInTheDocument();
    expect(
      within(
        findCellInRow(firstRow, {
          columnIndex: await findColumnIndexByName('instruments.type'),
        })
      ).getByText('type1')
    ).toBeInTheDocument();

    const secondRow = rows[1];
    expect(
      within(
        findCellInRow(secondRow, {
          columnIndex: await findColumnIndexByName('instruments.name'),
        })
      ).getByText('Test 2')
    ).toBeInTheDocument();
    expect(
      within(
        findCellInRow(secondRow, {
          columnIndex: await findColumnIndexByName('instruments.type'),
        })
      ).getByText('type2')
    ).toBeInTheDocument();
  });

  it('updates filter query params on text filter', async () => {
    renderComponent();

    const filterInput = await screen.findByRole('textbox', {
      name: 'Filter by instruments.name',
      hidden: true,
    });

    await user.type(filterInput, 'test');

    // user.type inputs the given string character by character to simulate user typing
    // each keystroke of user.type creates a new entry in the history stack
    // so the initial entry + 4 characters in "test" = 5 entries
    expect(history.length).toBe(5);
    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent(
        '{"fullName":{"value":"test","type":"include"}}'
      )}`
    );

    await user.clear(filterInput);

    expect(history.length).toBe(6);
    expect(history.location.search).toBe('?');
  });

  it('uses default sort', async () => {
    renderComponent();

    expect(await screen.findAllByRole('gridcell')).toBeTruthy();

    expect(history.length).toBe(1);
    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"fullName":"asc"}')}`
    );

    // check that the data request is sent only once after mounting
    expect(useInstrumentsInfinite).toHaveBeenCalledTimes(2);
    expect(useInstrumentsInfinite).toHaveBeenCalledWith(undefined, false);
    expect(useInstrumentsInfinite).toHaveBeenLastCalledWith(undefined, true);
  });

  it('updates sort query params on sort', async () => {
    renderComponent();

    await user.click(await screen.findByText('instruments.name'));

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"fullName":"desc"}')}`
    );
  });

  it('displays details panel when expanded', async () => {
    renderComponent();

    await user.click(
      (
        await screen.findAllByRole('button', { name: 'Show details' })
      )[0]
    );

    expect(
      await screen.findByTestId('instrument-details-panel')
    ).toBeInTheDocument();
  });

  it('renders names as links when NOT in studyHierarchy', async () => {
    renderComponent();
    expect(
      await screen.findByRole('link', { name: 'Test instrument 1' })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('link', { name: 'Test 2' })
    ).toBeInTheDocument();
  });

  it('renders names as links in StudyHierarchy', async () => {
    renderComponent(true);
    expect(
      await screen.findByRole('link', { name: 'Test instrument 1' })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('link', { name: 'Test 2' })
    ).toBeInTheDocument();
  });

  it('renders fine with incomplete data', () => {
    vi.mocked(useInstrumentCount).mockReturnValueOnce({});
    vi.mocked(useInstrumentsInfinite).mockReturnValueOnce({});

    expect(() => renderComponent()).not.toThrowError();
  });
});
