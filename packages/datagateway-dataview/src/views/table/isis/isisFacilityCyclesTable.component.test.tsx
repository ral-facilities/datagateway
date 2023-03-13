import * as React from 'react';
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
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { Router } from 'react-router-dom';
import { createMemoryHistory, type History } from 'history';
import {
  applyDatePickerWorkaround,
  cleanupDatePickerWorkaround,
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
import { UserEvent } from '@testing-library/user-event/setup/setup';
import userEvent from '@testing-library/user-event';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useFacilityCycleCount: jest.fn(),
    useFacilityCyclesInfinite: jest.fn(),
  };
});

describe('ISIS FacilityCycles table component', () => {
  let mockStore;
  let state: StateType;
  let rowData: FacilityCycle[];
  let history: History;
  let replaceSpy: jest.SpyInstance;
  let user: UserEvent;

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
    replaceSpy = jest.spyOn(history, 'replace');
    user = userEvent.setup();

    mockStore = configureStore([thunk]);
    state = JSON.parse(
      JSON.stringify({
        dgdataview: dgDataViewInitialState,
        dgcommon: dGCommonInitialState,
      })
    );

    (useFacilityCycleCount as jest.Mock).mockReturnValue({
      data: 1,
      isLoading: false,
    });
    (useFacilityCyclesInfinite as jest.Mock).mockReturnValue({
      data: { pages: [rowData] },
      fetchNextPage: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
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
    applyDatePickerWorkaround();

    renderComponent();

    const filterInput = await screen.findByRole('textbox', {
      name: 'facilitycycles.end_date filter to',
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

  it('uses default sort', () => {
    renderComponent();
    expect(history.length).toBe(1);
    expect(replaceSpy).toHaveBeenCalledWith({
      search: `?sort=${encodeURIComponent('{"startDate":"desc"}')}`,
    });
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
    (useFacilityCycleCount as jest.Mock).mockReturnValueOnce({});
    (useFacilityCyclesInfinite as jest.Mock).mockReturnValueOnce({});

    expect(() => renderComponent()).not.toThrowError();
  });
});
