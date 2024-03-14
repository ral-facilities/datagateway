import {
  render,
  type RenderResult,
  screen,
  within,
} from '@testing-library/react';
import {
  dGCommonInitialState,
  type DataPublication,
  readSciGatewayToken,
  useDataPublicationCount,
  useDataPublicationsInfinite,
  ContributorType,
  DOIRelationType,
} from 'datagateway-common';
import { createMemoryHistory, type MemoryHistory } from 'history';
import * as React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
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
import DLSMyDOIsTable from './dlsMyDOIsTable.component';
import userEvent from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event/setup/setup';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useDataPublicationCount: jest.fn(),
    useDataPublicationsInfinite: jest.fn(),
    readSciGatewayToken: jest.fn(),
  };
});

describe('DLS MyDOIs table component', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let rowData: DataPublication[];
  let history: MemoryHistory;
  let user: UserEvent;

  const renderComponent = (): RenderResult => {
    const store = mockStore(state);
    return render(
      <Provider store={store}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <DLSMyDOIsTable />
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
        id: 7,
        pid: 'doi 1',
        description: 'foo bar',
        title: 'Data Publication Title',
        publicationDate: '2023-07-21',
        users: [
          {
            id: 1,
            contributorType: ContributorType.Minter,
            fullName: 'John Smith',
          },
        ],
        content: {
          id: 7,
          dataCollectionInvestigations: [
            {
              id: 8,
              investigation: {
                id: 1,
                title: 'Title 1',
                name: 'Name 1',
                summary: 'foo bar',
                visitId: '1',
                doi: 'doi 1',
                size: 1,
                investigationInstruments: [
                  {
                    id: 1,
                    instrument: {
                      id: 3,
                      name: 'Beamline 1',
                    },
                  },
                ],
                startDate: '2023-07-21',
                endDate: '2023-07-22',
              },
              dataCollection: { id: 9 },
            },
          ],
        },
      },
    ];

    (useDataPublicationCount as jest.Mock).mockReturnValue({
      data: 0,
    });
    (useDataPublicationsInfinite as jest.Mock).mockReturnValue({
      data: { pages: [rowData] },
      fetchNextPage: jest.fn(),
    });
    (readSciGatewayToken as jest.Mock).mockReturnValue({
      username: 'testUser',
    });
    global.Date.now = jest.fn(() => 1);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', async () => {
    renderComponent();

    // test that we're calling with the "minter" string instead of the e2e testing string
    const filterParams = [
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          'users.user.name': { eq: 'testUser' },
        }),
      },
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          'users.contributorType': {
            eq: ContributorType.Minter,
          },
        }),
      },
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          'relatedItems.relationType': {
            eq: DOIRelationType.HasVersion,
          },
        }),
      },
      {
        filterType: 'distinct',
        filterValue: JSON.stringify(['id', 'title', 'pid', 'publicationDate']),
      },
    ];
    expect(useDataPublicationCount).toHaveBeenCalledWith(filterParams);
    expect(useDataPublicationsInfinite).toHaveBeenCalledWith(filterParams);

    const rows = await findAllRows();
    expect(rows).toHaveLength(1);

    expect(
      await findColumnHeaderByName('datapublications.title')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('datapublications.pid')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('datapublications.publication_date')
    ).toBeInTheDocument();

    const row = rows[0];

    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('datapublications.title'),
        })
      ).getByText('Data Publication Title')
    ).toBeInTheDocument();
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('datapublications.pid'),
        })
      ).getByText('doi 1')
    ).toBeInTheDocument();
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName(
            'datapublications.publication_date'
          ),
        })
      ).getByText('2023-07-21')
    ).toBeInTheDocument();
  });

  it('updates filter query params on text filter', async () => {
    renderComponent();

    const filterInput = await screen.findByRole('textbox', {
      name: 'Filter by datapublications.title',
      hidden: true,
    });

    await user.type(filterInput, 'test');

    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent(
        '{"title":{"value":"test","type":"include"}}'
      )}`
    );

    await user.clear(filterInput);

    expect(history.location.search).toBe('?');
  });

  it('updates filter query params on date filter', async () => {
    applyDatePickerWorkaround();

    renderComponent();

    const filterInput = await screen.findByRole('textbox', {
      name: 'datapublications.publication_date filter to',
    });

    await user.type(filterInput, '2023-07-21');

    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent(
        '{"publicationDate":{"endDate":"2023-07-21"}}'
      )}`
    );

    // await user.clear(filterInput);
    await user.click(filterInput);
    await user.keyboard('{Control}a{/Control}');
    await user.keyboard('{Delete}');

    expect(history.location.search).toBe('?');

    cleanupDatePickerWorkaround();
  });

  it('updates sort query params on sort', async () => {
    renderComponent();

    await user.click(
      await screen.findByRole('button', { name: 'datapublications.title' })
    );

    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"title":"asc"}')}`
    );
  });

  it('renders title and DOI as a links', async () => {
    renderComponent();

    const row = await findRowAt(0);

    expect(
      await within(row).findByRole('link', { name: 'Data Publication Title' })
    ).toHaveAttribute('href', '/browse/dataPublication/7');
    expect(
      await within(row).findByRole('link', { name: 'doi 1' })
    ).toHaveAttribute('href', 'https://doi.org/doi 1');
  });
});
