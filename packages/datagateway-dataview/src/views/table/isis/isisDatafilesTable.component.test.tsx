import ISISDatafilesTable from './isisDatafilesTable.component';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import configureStore from 'redux-mock-store';
import type { StateType } from '../../../state/app.types';
import {
  type Datafile,
  dGCommonInitialState,
  DownloadCartItem,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryHistory, type History } from 'history';
import {
  applyDatePickerWorkaround,
  cleanupDatePickerWorkaround,
  findAllRows,
  findColumnHeaderByName,
} from '../../../setupTests';
import {
  render,
  type RenderResult,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  findCellInRow,
  findColumnIndexByName,
} from 'datagateway-search/src/setupTests';
import axios, { AxiosResponse } from 'axios';

describe('ISIS datafiles table component', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let rowData: Datafile[];
  let cartItems: DownloadCartItem[];
  let history: History;
  let user: ReturnType<typeof userEvent.setup>;
  let holder: HTMLElement;

  const renderComponent = (): RenderResult =>
    render(
      <Provider store={mockStore(state)}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <ISISDatafilesTable datasetId="1" investigationId="2" />
          </QueryClientProvider>
        </Router>
      </Provider>
    );

  beforeEach(() => {
    rowData = [
      {
        id: 1,
        name: 'Test 1',
        location: '/test1',
        fileSize: 1,
        modTime: '2019-07-23',
        createTime: '2019-07-23',
        datafileModTime: '2019-01-02',
        datafileCreateTime: '2019-01-01',
      },
    ];
    cartItems = [];
    history = createMemoryHistory();
    user = userEvent.setup();

    holder = document.createElement('div');
    holder.setAttribute('id', 'datagateway-dataview');
    document.body.appendChild(holder);

    state = JSON.parse(
      JSON.stringify({
        dgdataview: dgDataViewInitialState,
        dgcommon: dGCommonInitialState,
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

        if (/\/datafiles\/count$/.test(url)) {
          // fetch datafile count
          return Promise.resolve({
            data: rowData.length,
          });
        }

        if (/\/datafiles$/.test(url)) {
          // datafiles infinite
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
                entityType: 'datafile',
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

    // check that column headers are shown correctly
    expect(await findColumnHeaderByName('datafiles.name')).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('datafiles.location')
    ).toBeInTheDocument();
    expect(await findColumnHeaderByName('datafiles.size')).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('datafiles.modified_time')
    ).toBeInTheDocument();

    const row = rows[0];

    // check that every cell contains the correct values
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('datafiles.name'),
        })
      ).getByText('Test 1')
    ).toBeInTheDocument();
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('datafiles.location'),
        })
      ).getByText('/test1')
    ).toBeInTheDocument();
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('datafiles.size'),
        })
      ).getByText('1 B')
    ).toBeInTheDocument();
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('datafiles.modified_time'),
        })
      ).getByText('2019-01-02')
    ).toBeInTheDocument();
  });

  it('updates filter query params on text filter', async () => {
    renderComponent();

    const filterInput = await screen.findByRole('textbox', {
      name: 'Filter by datafiles.name',
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
      name: 'datafiles.modified_time filter to',
    });

    await user.type(filterInput, '2019-08-06');

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent(
        '{"datafileModTime":{"endDate":"2019-08-06"}}'
      )}`
    );

    // await user.clear(filterInput);
    await user.click(filterInput);
    await user.keyboard('{Control}a{/Control}');
    await user.keyboard('{Delete}');

    expect(history.length).toBe(3);
    expect(history.location.search).toBe('?');

    cleanupDatePickerWorkaround();
  });

  it('uses default sort', async () => {
    renderComponent();

    expect(await screen.findAllByRole('gridcell')).toBeTruthy();

    expect(history.length).toBe(1);
    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"name":"asc"}')}`
    );

    // check that the data request is sent only once after mounting
    const datafilesCalls = vi
      .mocked(axios.get)
      .mock.calls.filter((call) => call[0] === '/datafiles');
    // 2 becasue there is also a call for ids
    expect(datafilesCalls).toHaveLength(2);
  });

  it('updates sort query params on sort', async () => {
    renderComponent();

    // click on the datafiles.name column header
    await user.click(await screen.findByText('datafiles.name'));

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"name":"desc"}')}`
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
    await user.click(screen.getByRole('checkbox', { name: 'select row 0' }));

    // datafile should be added to the cart
    expect(
      await screen.findByRole('checkbox', { name: 'select row 0' })
    ).toBeChecked();

    // unselect the row
    await user.click(screen.getByRole('checkbox', { name: 'select row 0' }));

    // datafile should be removed from the cart
    expect(
      await screen.findByRole('checkbox', { name: 'select row 0' })
    ).not.toBeChecked();
  });

  it('selected rows only considers relevant cart items', async () => {
    cartItems = [
      {
        entityId: 5,
        entityType: 'dataset',
        id: 5,
        name: 'test',
        parentEntities: [],
      },
      {
        entityId: 2,
        entityType: 'datafile',
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
        screen.queryByRole('checkbox', { name: 'select all rows' })
      ).toBeNull();
    });
  });

  it('renders actions correctly', async () => {
    renderComponent();
    expect(
      await screen.findByRole('button', { name: 'buttons.download' })
    ).toBeTruthy();
  });

  it('displays details panel when expanded', async () => {
    renderComponent();
    await user.click(
      await screen.findByRole('button', { name: 'Show details' })
    );
    expect(
      await screen.findByTestId('isis-datafile-details-panel')
    ).toBeInTheDocument();
  });
});
