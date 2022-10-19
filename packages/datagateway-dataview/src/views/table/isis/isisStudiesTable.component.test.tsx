import * as React from 'react';
import ISISStudiesTable from './isisStudiesTable.component';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';

import type { StateType } from '../../../state/app.types';
import {
  dGCommonInitialState,
  type Study,
  useStudiesInfinite,
  useStudyCount,
} from 'datagateway-common';
import configureStore from 'redux-mock-store';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { Router } from 'react-router-dom';
import { createMemoryHistory, type History } from 'history';
import { parse } from 'date-fns';
import {
  applyDatePickerWorkaround,
  cleanupDatePickerWorkaround,
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
import { UserEvent } from '@testing-library/user-event/setup/setup';
import userEvent from '@testing-library/user-event';

jest
  .useFakeTimers('modern')
  .setSystemTime(parse('2021-10-27', 'yyyy-MM-dd', 0));

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useStudyCount: jest.fn(),
    useStudiesInfinite: jest.fn(),
  };
});

describe('ISIS Studies table component', () => {
  let mockStore;
  let state: StateType;
  let rowData: Study[];
  let history: History;
  let user: UserEvent;

  const renderComponent = (): RenderResult => {
    const store = mockStore(state);
    return render(
      <Provider store={store}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <ISISStudiesTable instrumentId="1" />
          </QueryClientProvider>
        </Router>
      </Provider>
    );
  };

  beforeEach(() => {
    rowData = [
      {
        id: 1,
        pid: 'doi',
        name: 'Test 1',
        modTime: '2000-01-01',
        createTime: '2000-01-01',
        studyInvestigations: [
          {
            id: 636,
            investigation: {
              id: 357,
              title: 'all might urgent',
              name: 'peculiar crowd',
              visitId: 'Y2D8y7v',
            },
          },
        ],
      },
    ];
    history = createMemoryHistory();
    user = userEvent.setup({
      delay: null,
    });

    mockStore = configureStore([thunk]);
    state = JSON.parse(
      JSON.stringify({
        dgdataview: dgDataViewInitialState,
        dgcommon: dGCommonInitialState,
      })
    );

    (useStudyCount as jest.Mock).mockReturnValue({
      data: 1,
      isLoading: false,
    });

    (useStudiesInfinite as jest.Mock).mockReturnValue({
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

    expect(await findColumnHeaderByName('studies.name')).toBeInTheDocument();
    expect(await findColumnHeaderByName('studies.title')).toBeInTheDocument();
    expect(await findColumnHeaderByName('studies.pid')).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('studies.start_date')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('studies.end_date')
    ).toBeInTheDocument();

    const row = rows[0];

    // check that every cell contains the correct values
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('studies.name'),
        })
      ).getByText('Test 1')
    ).toBeInTheDocument();
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('studies.title'),
        })
      ).getByText('all might urgent')
    ).toBeInTheDocument();
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('studies.pid'),
        })
      ).getByText('doi')
    ).toBeInTheDocument();
  });

  it('updates filter query params on text filter', async () => {
    renderComponent();

    const filterInput = await screen.findByRole('textbox', {
      name: 'Filter by studies.name',
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
      name: 'studies.end_date filter to',
    });

    await user.type(filterInput, '2019-08-06');

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent(
        '{"studyInvestigations.investigation.endDate":{"endDate":"2019-08-06"}}'
      )}`
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
      `?sort=${encodeURIComponent(
        '{"studyInvestigations.investigation.startDate":"desc"}'
      )}`
    );
  });

  it('updates sort query params on sort', async () => {
    renderComponent();

    await user.click(
      await screen.findByRole('button', { name: 'studies.name' })
    );

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"name":"asc"}')}`
    );
  });

  it('renders studies name as a link', async () => {
    renderComponent();

    const studyNameColIndex = await findColumnIndexByName('studies.name');
    const row = await findRowAt(0);
    const studyNameCell = findCellInRow(row, {
      columnIndex: studyNameColIndex,
    });

    expect(
      within(studyNameCell).getByRole('link', { name: 'Test 1' })
    ).toHaveAttribute('href', '/browseStudyHierarchy/instrument/1/study/1');
  });

  it('displays Experiment DOI (PID) and renders the expected Link ', async () => {
    rowData = [
      {
        ...rowData[0],
        studyInvestigations: [
          {
            id: 2,
            study: {
              ...rowData[0],
            },
            investigation: {
              id: 3,
              name: 'Test',
              title: 'Test investigation',
              visitId: '3',
              startDate: '2021-08-19',
              endDate: '2021-08-20',
            },
          },
        ],
      },
    ];
    (useStudiesInfinite as jest.Mock).mockReturnValue({
      data: { pages: [rowData] },
      fetchNextPage: jest.fn(),
    });

    renderComponent();

    const pidColIndex = await findColumnIndexByName('studies.pid');
    const row = await findRowAt(0);
    const pidCell = findCellInRow(row, { columnIndex: pidColIndex });

    expect(within(pidCell).getByRole('link', { name: 'doi' })).toHaveAttribute(
      'href',
      'https://doi.org/doi'
    );
  });

  it('displays information from investigation when investigation present', async () => {
    rowData = [
      {
        ...rowData[0],
        studyInvestigations: [
          {
            id: 2,
            study: {
              ...rowData[0],
            },
            investigation: {
              id: 3,
              name: 'Test',
              title: 'Test investigation',
              visitId: '3',
              startDate: '2021-08-19',
              endDate: '2021-08-20',
            },
          },
        ],
      },
    ];
    (useStudiesInfinite as jest.Mock).mockReturnValue({
      data: { pages: [rowData] },
      fetchNextPage: jest.fn(),
    });

    renderComponent();

    const studyTitleColIndex = await findColumnIndexByName('studies.title');
    const studyTitleCell = findCellInRow(await findRowAt(0), {
      columnIndex: studyTitleColIndex,
    });

    expect(
      within(studyTitleCell).getByText('Test investigation')
    ).toBeInTheDocument();
  });

  it('renders fine when investigation is undefined', async () => {
    rowData = [
      {
        ...rowData[0],
        studyInvestigations: [
          {
            id: 2,
            study: {
              ...rowData[0],
            },
          },
        ],
      },
    ];
    (useStudiesInfinite as jest.Mock).mockReturnValue({
      data: { pages: [rowData] },
      fetchNextPage: jest.fn(),
    });

    renderComponent();

    expect(await findAllRows()).toHaveLength(1);
  });
});
