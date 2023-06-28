import * as React from 'react';
import ISISInvestigationsTable from './isisInvestigationsTable.component';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import configureStore from 'redux-mock-store';
import type { StateType } from '../../../state/app.types';
import {
  dGCommonInitialState,
  DownloadCartItem,
  type Investigation,
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
  findColumnHeaderByName,
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
import axios, { AxiosResponse } from 'axios';

describe('ISIS Investigations table component', () => {
  let mockStore;
  let state: StateType;
  let rowData: Investigation[];
  let history: History;
  let replaceSpy: jest.SpyInstance;
  let user: UserEvent;
  let cartItems: DownloadCartItem[];
  let holder: HTMLElement;

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
    cartItems = [];
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

    holder = document.createElement('div');
    holder.setAttribute('id', 'datagateway-dataview');
    document.body.appendChild(holder);

    mockStore = configureStore([thunk]);
    state = JSON.parse(
      JSON.stringify({
        dgdataview: dgDataViewInitialState,
        dgcommon: dGCommonInitialState,
      })
    );

    axios.get = jest
      .fn()
      .mockImplementation((url: string): Promise<Partial<AxiosResponse>> => {
        if (/\/user\/cart\/$/.test(url)) {
          // fetch download cart
          return Promise.resolve({
            data: { cartItems },
          });
        }

        if (/\/user\/getSize$/.test(url)) {
          // fetch investigation size
          return Promise.resolve({
            data: 1,
          });
        }

        if (
          /\/instruments\/4\/facilitycycles\/5\/investigations\/count$/.test(
            url
          )
        ) {
          // fetch investigations count
          return Promise.resolve({
            data: rowData.length,
          });
        }

        if (/\/instruments\/4\/facilitycycles\/5\/investigations$/.test(url)) {
          // investigations infinite
          return Promise.resolve({
            data: rowData,
          });
        }

        if (/\/investigations$/.test(url)) {
          return Promise.resolve({
            data: rowData,
          });
        }

        if (/\/investigations\/count$/.test(url)) {
          return Promise.resolve({
            data: rowData.length,
          });
        }

        return Promise.reject(`Endpoint not mocked: ${url}`);
      });

    axios.post = jest
      .fn()
      .mockImplementation(
        (url: string, data: unknown): Promise<Partial<AxiosResponse>> => {
          if (/\/user\/cart\/\/cartItems$/.test(url)) {
            const isRemove: boolean = JSON.parse(
              (data as URLSearchParams).get('remove')
            );

            if (isRemove) {
              cartItems = [];

              return Promise.resolve({
                data: {
                  cartItems: [],
                },
              });
            }

            cartItems = [
              ...cartItems,
              {
                id: 123,
                entityId: 1,
                entityType: 'investigation',
                name: 'download cart item name',
                parentEntities: [],
              },
            ];

            return Promise.resolve({
              data: { cartItems },
            });
          }

          return Promise.reject(`Endpoint not mocked: ${url}`);
        }
      );
  });

  afterEach(() => {
    document.body.removeChild(holder);
    jest.clearAllMocks();
  });

  it('renders correctly', async () => {
    renderComponent();

    let rows: HTMLElement[] = [];
    await waitFor(async () => {
      rows = await findAllRows();
      // should have 1 row in the table
      expect(rows).toHaveLength(1);
    });

    // check that column headers are shown correctly.
    expect(
      await findColumnHeaderByName('investigations.title')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('investigations.name')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('investigations.doi')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('investigations.size')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('investigations.principal_investigators')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('investigations.start_date')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('investigations.end_date')
    ).toBeInTheDocument();

    const row = rows[0];

    // check that every cell contains the correct value
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
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('investigations.doi'),
        })
      ).getByText('study pid')
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
          columnIndex: await findColumnIndexByName(
            'investigations.principal_investigators'
          ),
        })
      ).getByText('Test PI')
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

  it('adds selected row to cart if unselected; removes it from cart otherwise', async () => {
    renderComponent();

    // wait for rows to show up
    await waitFor(async () => {
      expect(await findAllRows()).toHaveLength(1);
    });

    // row should not be selected initially as the cart is empty
    expect(
      await screen.findByRole('checkbox', { name: 'select row 0' })
    ).not.toBeChecked();

    // select the row
    await user.click(
      await screen.findByRole('checkbox', { name: 'select row 0' })
    );

    // investigation should be added to the cart
    expect(
      await screen.findByRole('checkbox', { name: 'select row 0' })
    ).toBeChecked();

    // unselect the row
    await user.click(screen.getByRole('checkbox', { name: 'select row 0' }));

    // investigation should be removed from the cart
    expect(
      await screen.findByRole('checkbox', { name: 'select row 0' })
    ).not.toBeChecked();
  });

  it('selected rows only considers relevant cart items', async () => {
    cartItems = [
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
    ];

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
      await screen.findByTestId('isis-investigation-details-panel')
    ).toBeTruthy();
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
    rowData = [
      {
        ...rowData[0],
        investigationUsers: [],
        studyInvestigations: [],
      },
    ];

    renderComponent();

    await waitFor(async () => {
      expect(await findAllRows()).toHaveLength(1);
    });
  });

  it('gracefully handles missing Study from Study Investigation object and missing User from investigationUsers object', async () => {
    rowData = [
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
    ];

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
