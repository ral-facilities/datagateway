import * as React from 'react';
import ISISInvestigationsTable from './isisInvestigationsTable.component';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import configureStore from 'redux-mock-store';
import type { StateType } from '../../../state/app.types';
import {
  dGCommonInitialState,
  type Investigation,
  useAddToCart,
  useCart,
  useInvestigationDetails,
  useInvestigationSizes,
  useISISInvestigationCount,
  useISISInvestigationIds,
  useISISInvestigationsInfinite,
  useRemoveFromCart,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createMemoryHistory, type History } from 'history';
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
  waitFor,
  within,
} from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event/setup/setup';
import userEvent from '@testing-library/user-event';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useISISInvestigationCount: jest.fn(),
    useISISInvestigationsInfinite: jest.fn(),
    useInvestigationSizes: jest.fn(),
    useISISInvestigationIds: jest.fn(),
    useCart: jest.fn(),
    useAddToCart: jest.fn(),
    useRemoveFromCart: jest.fn(),
    useInvestigationDetails: jest.fn(),
  };
});

describe('ISIS Investigations table component', () => {
  let mockStore;
  let state: StateType;
  let rowData: Investigation[];
  let history: History;
  let replaceSpy: jest.SpyInstance;
  let user: UserEvent;

  const renderComponent = (studyHierarchy = false): RenderResult => {
    const store = mockStore(state);
    return render(
      <Provider store={store}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <ISISInvestigationsTable
              studyHierarchy={studyHierarchy}
              instrumentId="4"
              instrumentChildId="5"
            />
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
        investigationUsers: [
          {
            id: 2,
            role: 'experimenter',
            user: { id: 2, name: 'test', fullName: 'Test experimenter' },
          },
          {
            id: 3,
            role: 'principal_experimenter',
            user: { id: 3, name: 'testpi', fullName: 'Test PI' },
          },
        ],
        studyInvestigations: [
          {
            id: 6,
            study: {
              id: 7,
              pid: 'study pid',
            },
          },
        ],
        startDate: '2019-06-10',
        endDate: '2019-06-11',
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

    (useCart as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });
    (useISISInvestigationCount as jest.Mock).mockReturnValue({
      data: 0,
    });
    (useISISInvestigationsInfinite as jest.Mock).mockReturnValue({
      data: { pages: [rowData] },
      fetchNextPage: jest.fn(),
    });
    (useInvestigationSizes as jest.Mock).mockReturnValue([
      {
        data: 1,
      },
    ]);
    (useISISInvestigationIds as jest.Mock).mockReturnValue({
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
    (useInvestigationDetails as jest.Mock).mockReturnValue({
      data: [],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('displays DOI and renders the expected Link ', async () => {
    renderComponent();
    expect(
      await screen.findByRole('link', { name: 'study pid' })
    ).toHaveAttribute('href', 'https://doi.org/study pid');
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
    (useCart as jest.Mock).mockReturnValueOnce({
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
        screen.queryByRole('button', { name: 'select all rows' })
      ).toBeNull();
    });
  });

  it('displays details panel when expanded', async () => {
    renderComponent();
    await user.click(
      await screen.findByRole('button', { name: 'Show details' })
    );
    expect(
      await screen.findByTestId('investigation-details-panel')
    ).toBeTruthy();
  });

  it('renders details panel with datasets link and can navigate', async () => {
    renderComponent();

    await user.click(
      await screen.findByRole('button', { name: 'Show details' })
    );

    await user.click(
      await screen.findByRole('tab', {
        name: 'investigations.details.datasets',
      })
    );

    expect(history.location.pathname).toBe(
      '/browse/instrument/4/facilityCycle/5/investigation/1/dataset'
    );
  });

  it('renders title and DOI as links', async () => {
    renderComponent();
    expect(await screen.findByRole('link', { name: 'Test 1' })).toHaveAttribute(
      'href',
      '/browse/instrument/4/facilityCycle/5/investigation/1'
    );
    expect(
      await screen.findByRole('link', { name: 'study pid' })
    ).toHaveAttribute('href', 'https://doi.org/study pid');
  });

  it('renders title and DOI as links in StudyHierarchy', async () => {
    renderComponent(true);
    expect(await screen.findByRole('link', { name: 'Test 1' })).toHaveAttribute(
      'href',
      '/browseStudyHierarchy/instrument/4/study/5/investigation/1'
    );
    expect(
      await screen.findByRole('link', { name: 'study pid' })
    ).toHaveAttribute('href', 'https://doi.org/study pid');
  });

  it('displays the correct user as the PI ', async () => {
    renderComponent();

    const piColumnIndex = await findColumnIndexByName(
      'investigations.principal_investigators'
    );

    const row = await findRowAt(0);

    expect(
      await findCellInRow(row, { columnIndex: piColumnIndex })
    ).toHaveTextContent('Test PI');
  });

  it('gracefully handles empty Study Investigation and investigationUsers', async () => {
    (useISISInvestigationsInfinite as jest.Mock).mockReturnValue({
      data: {
        pages: [
          {
            ...rowData[0],
            investigationUsers: [],
            studyInvestigations: [],
          },
        ],
      },
      fetchNextPage: jest.fn(),
    });

    renderComponent();

    const rows = await screen.findAllByRole('row');
    // 2 rows expected, 1 for the header row, and 1 for the items in rowData.
    expect(rows).toHaveLength(2);
  });

  it('gracefully handles missing Study from Study Investigation object and missing User from investigationUsers object', async () => {
    (useISISInvestigationsInfinite as jest.Mock).mockClear();
    (useISISInvestigationsInfinite as jest.Mock).mockReturnValue({
      data: {
        pages: [
          {
            ...rowData[0],
            investigationUsers: [
              {
                id: 1,
              },
            ],
            studyInvestigations: [
              {
                id: 6,
              },
            ],
          },
        ],
      },
      fetchNextPage: jest.fn(),
    });

    renderComponent();

    const doiColumnIndex = await findColumnIndexByName('investigations.doi');
    const piColumnIndex = await findColumnIndexByName(
      'investigations.principal_investigators'
    );

    // verify that the doi cell and the principal investigator cell in the row are empty
    const row = await findRowAt(0);

    expect(
      await findCellInRow(row, { columnIndex: doiColumnIndex })
    ).toHaveTextContent('');
    expect(
      await findCellInRow(row, { columnIndex: piColumnIndex })
    ).toHaveTextContent('');
  });

  it('renders actions correctly', async () => {
    renderComponent();

    // find the action column
    const actionsColumnIndex = await findColumnIndexByName('Actions');

    // make sure all rows have the download button
    const rows = await findAllRows();
    for (const row of rows) {
      const actionCell = await findCellInRow(row, {
        columnIndex: actionsColumnIndex,
      });
      expect(
        await within(actionCell).findByRole('button', {
          name: 'buttons.download',
        })
      ).toBeInTheDocument();
    }
  });
});
