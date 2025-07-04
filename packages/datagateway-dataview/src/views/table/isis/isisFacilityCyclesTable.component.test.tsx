import ISISFacilityCyclesTable from './isisFacilityCyclesTable.component';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import type { StateType } from '../../../state/app.types';
import {
  dGCommonInitialState,
  type FacilityCycle,
  useFacilityCycleCount,
  useFacilityCyclesInfinite,
} from 'datagateway-common';
import configureStore from 'redux-mock-store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { Router } from 'react-router-dom';
import { createMemoryHistory, type History } from 'history';
import {
  findAllRows,
  findCellInRow,
  findColumnHeaderByName,
  findColumnIndexByName,
} from '../../../setupTests';
import {
  render,
  type RenderResult,
  screen,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { MockInstance } from 'vitest';

vi.mock('datagateway-common', async () => {
  const originalModule = await vi.importActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useFacilityCycleCount: vi.fn(),
    useFacilityCyclesInfinite: vi.fn(),
  };
});

describe('ISIS FacilityCycles table component', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let rowData: FacilityCycle[];
  let history: History;
  let replaceSpy: MockInstance;
  let user: ReturnType<typeof userEvent.setup>;

  const renderComponent = (): RenderResult => {
    const store = mockStore(state);
    return render(
      <Provider store={store}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <ISISFacilityCyclesTable instrumentId="1" />
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
        description: 'Test 1',
        startDate: '2019-07-03',
        endDate: '2019-07-04',
      },
    ];
    history = createMemoryHistory();
    replaceSpy = vi.spyOn(history, 'replace');
    user = userEvent.setup();

    state = JSON.parse(
      JSON.stringify({
        dgdataview: dgDataViewInitialState,
        dgcommon: dGCommonInitialState,
      })
    );

    vi.mocked(useFacilityCycleCount, { partial: true }).mockReturnValue({
      data: 1,
      isLoading: false,
    });
    vi.mocked(useFacilityCyclesInfinite, { partial: true }).mockReturnValue({
      data: { pages: [rowData], pageParams: [] },
      fetchNextPage: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', async () => {
    renderComponent();

    const rows = await findAllRows();
    // should have 1 row in the table
    expect(rows).toHaveLength(1);

    // check that column headers are shown correctly.
    expect(
      await findColumnHeaderByName('facilitycycles.name')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('facilitycycles.start_date')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('facilitycycles.end_date')
    ).toBeInTheDocument();

    const row = rows[0];

    // check that every cell contains the correct value
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('facilitycycles.name'),
        })
      ).getByText('Test 1')
    ).toBeInTheDocument();
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('facilitycycles.start_date'),
        })
      ).getByText('2019-07-03')
    ).toBeInTheDocument();
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('facilitycycles.end_date'),
        })
      ).getByText('2019-07-04')
    ).toBeInTheDocument();
  });

  it('sends filterTable action on text filter', async () => {
    renderComponent();

    const filterInput = await screen.findByRole('textbox', {
      name: 'Filter by facilitycycles.name',
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
    renderComponent();

    const filterInput = await screen.findByRole('textbox', {
      name: 'facilitycycles.end_date filter to',
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
    expect(replaceSpy).toHaveBeenCalledWith({
      search: `?sort=${encodeURIComponent('{"startDate":"desc"}')}`,
    });

    // check that the data request is sent only once after mounting
    expect(useFacilityCyclesInfinite).toHaveBeenCalledTimes(2);
    expect(useFacilityCyclesInfinite).toHaveBeenCalledWith(
      expect.anything(),
      false
    );
    expect(useFacilityCyclesInfinite).toHaveBeenLastCalledWith(
      expect.anything(),
      true
    );
  });

  it('updates sort query params on sort', async () => {
    renderComponent();

    await user.click(await screen.findByText('facilitycycles.name'));

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"name":"asc"}')}`
    );
  });

  it('renders facilitycycle name as a link', async () => {
    renderComponent();
    expect(await screen.findByText('Test 1')).toMatchSnapshot();
  });

  it('renders fine with incomplete data', () => {
    vi.mocked(useFacilityCycleCount, { partial: true }).mockReturnValueOnce({});
    vi.mocked(useFacilityCyclesInfinite, { partial: true }).mockReturnValueOnce(
      {}
    );

    expect(() => renderComponent()).not.toThrowError();
  });
});
