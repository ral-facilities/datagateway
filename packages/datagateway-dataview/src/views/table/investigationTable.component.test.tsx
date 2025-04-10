import {
  dGCommonInitialState,
  type DownloadCartItem,
  type Investigation,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import type { StateType } from '../../state/app.types';
import { initialState } from '../../state/reducers/dgdataview.reducer';
import InvestigationTable from './investigationTable.component';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryHistory, type History } from 'history';
import {
  render,
  type RenderResult,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { findAllRows, findColumnHeaderByName } from '../../setupTests';
import userEvent from '@testing-library/user-event';
import {
  findCellInRow,
  findColumnIndexByName,
} from 'datagateway-search/src/setupTests';
import axios, { type AxiosResponse } from 'axios';

describe('Investigation table component', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let rowData: Investigation[];
  let cartItems: DownloadCartItem[];
  let history: History;
  let user: ReturnType<typeof userEvent.setup>;
  let holder: HTMLElement;

  const renderComponent = (): RenderResult => {
    const store = mockStore(state);
    return render(
      <Provider store={store}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <InvestigationTable />
          </QueryClientProvider>
        </Router>
      </Provider>
    );
  };

  beforeEach(() => {
    user = userEvent.setup();
    cartItems = [];
    rowData = [
      {
        id: 1,
        fileSize: 1,
        fileCount: 1,
        title: 'Test title 1',
        name: 'Test 1',
        visitId: 'visit id 1',
        doi: 'doi 1',
        investigationInstruments: [
          {
            id: 3,
            instrument: {
              id: 4,
              name: 'LARMOR',
            },
          },
        ],
        startDate: '2019-07-23',
        endDate: '2019-07-24',
      },
    ];
    history = createMemoryHistory();

    holder = document.createElement('div');
    holder.setAttribute('id', 'datagateway-dataview');
    document.body.appendChild(holder);

    state = JSON.parse(
      JSON.stringify({
        dgcommon: dGCommonInitialState,
        dgdataview: initialState,
      })
    );

    axios.get = vi
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

        if (/\/investigations\/count$/.test(url)) {
          // fetch investigations count
          return Promise.resolve({
            data: rowData.length,
          });
        }

        if (/\/investigations$/.test(url)) {
          return Promise.resolve({
            data: rowData,
          });
        }

        return Promise.reject(`Endpoint not mocked: ${url}`);
      });

    axios.post = vi
      .fn()
      .mockImplementation(
        (url: string, data: unknown): Promise<Partial<AxiosResponse>> => {
          if (/\/user\/cart\/\/cartItems$/.test(url)) {
            const isRemove: boolean = JSON.parse(
              (data as URLSearchParams).get('remove') ?? 'false'
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
    vi.clearAllMocks();
  });

  it('renders correctly', async () => {
    renderComponent();

    let rows: HTMLElement[] = [];
    await waitFor(async () => {
      rows = await findAllRows();
      // should have 1 row in the table
      expect(rows).toHaveLength(1);
    });

    const row = rows[0];

    // check that column headers are shown correctly.
    expect(
      await findColumnHeaderByName('investigations.title')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('investigations.visit_id')
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
      await findColumnHeaderByName('investigations.instrument')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('investigations.start_date')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('investigations.end_date')
    ).toBeInTheDocument();

    // check that each cell contains the correct value
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('investigations.title'),
        })
      ).getByRole('link', { name: 'Test title 1' })
    ).toHaveAttribute('href', '/browse/investigation/1/dataset');
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('investigations.visit_id'),
        })
      ).getByText('visit id 1')
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
      ).getByRole('link', { name: 'doi 1' })
    ).toHaveAttribute('href', 'https://doi.org/doi 1');
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
      ).getByText('2019-07-23')
    ).toBeInTheDocument();
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('investigations.end_date'),
        })
      ).getByText('2019-07-24')
    ).toBeInTheDocument();
  });

  it('updates filter query params on text filter', async () => {
    renderComponent();

    const filterInput = await screen.findByRole('textbox', {
      name: 'Filter by investigations.name',
      hidden: true,
    });

    await user.type(filterInput, 'test');

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
      name: 'investigations.start_date filter from',
    });

    await user.type(filterInput, '2019-08-06');

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent(
        '{"startDate":{"startDate":"2019-08-06"}}'
      )}`
    );

    // await user.clear(filterInput);
    await user.click(filterInput);
    await user.keyboard('{Control}a{/Control}');
    await user.keyboard('{Delete}');

    expect(history.length).toBe(3);
    expect(history.location.search).toBe('?');
  });

  it('updates sort query params on sort', async () => {
    renderComponent();

    await user.click(screen.getByText('investigations.title'));

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

    // wait for rows to show up
    await waitFor(async () => {
      expect(await findAllRows()).toHaveLength(1);
    });

    const selectAllCheckbox = await screen.findByRole('checkbox', {
      name: 'select all rows',
    });

    expect(selectAllCheckbox).not.toBeChecked();
    expect(selectAllCheckbox).toHaveAttribute('data-indeterminate', 'false');
  });

  it('no select all checkbox appears and no fetchAllIds sent if selectAllSetting is false', async () => {
    state.dgdataview.selectAllSetting = false;
    renderComponent();

    // wait for rows to show up
    await waitFor(async () => {
      expect(await findAllRows()).toHaveLength(1);
    });

    expect(
      screen.queryByRole('checkbox', { name: 'select all rows' })
    ).toBeNull();
  });

  it('renders fine with incomplete data', async () => {
    // this can happen when navigating between tables and the previous table's state still exists
    rowData = [
      {
        id: 1,
        name: 'test',
        title: 'test',
        doi: 'Test 1',
        visitId: '1',
      },
    ];

    expect(() => renderComponent()).not.toThrowError();
    await waitFor(async () => {
      expect(await findAllRows()).toHaveLength(1);
    });
  });

  it('displays details panel when expanded', async () => {
    renderComponent();

    let rows: HTMLElement[] = [];
    await waitFor(async () => {
      rows = await findAllRows();
      // should have 1 row in the table
      expect(rows).toHaveLength(1);
    });

    expect(screen.queryByTestId('investigation-details-panel')).toBeNull();

    await user.click(
      within(rows[0]).getByRole('button', { name: 'Show details' })
    );

    expect(
      await screen.findByTestId('investigation-details-panel')
    ).toBeInTheDocument();
  });
});
