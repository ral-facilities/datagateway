import * as React from 'react';
import DLSVisitsTable from './dlsVisitsTable.component';
import { StateType } from '../../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import {
  dGCommonInitialState,
  Investigation,
  useInvestigationCount,
  useInvestigationsDatasetCount,
  useInvestigationsInfinite,
} from 'datagateway-common';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Router } from 'react-router-dom';
import { createMemoryHistory, History } from 'history';
import {
  applyDatePickerWorkaround,
  cleanupDatePickerWorkaround,
  findAllRows,
  findCellInRow,
  findColumnIndexByName,
  findRowAt,
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
    useInvestigationCount: jest.fn(),
    useInvestigationsInfinite: jest.fn(),
    useInvestigationsDatasetCount: jest.fn(),
  };
});

describe('DLS Visits table component', () => {
  let mockStore;
  let state: StateType;
  let rowData: Investigation[];
  let history: History;
  let user: UserEvent;

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
        startDate: '2019-06-10',
        endDate: '2019-06-11',
      },
    ];
    history = createMemoryHistory();
    user = userEvent.setup();

    mockStore = configureStore([thunk]);
    state = JSON.parse(
      JSON.stringify({
        dgdataview: dgDataViewInitialState,
        dgcommon: dGCommonInitialState,
      })
    );

    (useInvestigationCount as jest.Mock).mockReturnValue({
      data: 1,
      isLoading: false,
    });
    (useInvestigationsInfinite as jest.Mock).mockReturnValue({
      data: rowData,
      isLoading: false,
    });
    (useInvestigationsDatasetCount as jest.Mock).mockReturnValue([1]);
  });

  afterEach(() => {
    jest.clearAllMocks();
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

  it('uses default sort', () => {
    renderComponent();
    expect(history.length).toBe(1);
    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"startDate":"desc"}')}`
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

    expect(await screen.findByTestId('visit-details-panel')).toBeTruthy();
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
    (useInvestigationCount as jest.Mock).mockReturnValueOnce({});
    (useInvestigationsInfinite as jest.Mock).mockReturnValueOnce({});
    (useInvestigationsDatasetCount as jest.Mock).mockReturnValueOnce([]);

    (useInvestigationsInfinite as jest.Mock).mockReturnValueOnce({
      data: [
        {
          ...rowData[0],
          investigationInstruments: [
            {
              id: 1,
            },
          ],
        },
      ],
      isLoading: false,
    });

    renderComponent();

    expect(await findAllRows()).toHaveLength(1);
  });

  it('renders fine if no investigation instrument is returned', async () => {
    (useInvestigationCount as jest.Mock).mockReturnValue({
      data: 1,
      isLoading: false,
    });
    (useInvestigationsInfinite as jest.Mock).mockReturnValue({
      data: [
        {
          ...rowData[0],
          investigationInstruments: [],
        },
      ],
      isLoading: false,
    });
    (useInvestigationsDatasetCount as jest.Mock).mockReturnValue([1]);

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
