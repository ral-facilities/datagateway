import {
  type Datafile,
  type DownloadCartItem,
  dGCommonInitialState,
} from 'datagateway-common';
import * as React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import type { StateType } from '../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../state/reducers/dgdataview.reducer';
import DatafileTable from './datafileTable.component';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createMemoryHistory, type History } from 'history';
import {
  applyDatePickerWorkaround,
  cleanupDatePickerWorkaround,
  findAllRows,
  findColumnHeaderByName,
} from '../../setupTests';
import {
  render,
  type RenderResult,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event/setup/setup';
import userEvent from '@testing-library/user-event';
import {
  findCellInRow,
  findColumnIndexByName,
} from 'datagateway-search/src/setupTests';
import axios, { type AxiosResponse } from 'axios';

describe('Datafile table component', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let rowData: Datafile[];
  let cartItems: DownloadCartItem[];
  let history: History;
  let user: UserEvent;
  let holder: HTMLElement;

  const renderComponent = (): RenderResult =>
    render(
      <Provider store={mockStore(state)}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <DatafileTable datasetId="1" investigationId="2" />
          </QueryClientProvider>
        </Router>
      </Provider>
    );

  beforeEach(() => {
    user = userEvent.setup();
    cartItems = [];
    rowData = [
      {
        id: 1,
        name: 'Test 1',
        location: '/test1',
        fileSize: 1,
        modTime: '2019-07-23',
        createTime: '2019-07-23',
      },
    ];
    history = createMemoryHistory();

    holder = document.createElement('div');
    holder.setAttribute('id', 'datagateway-dataview');
    document.body.appendChild(holder);

    state = JSON.parse(
      JSON.stringify({
        dgcommon: dGCommonInitialState,
        dgdataview: dgDataViewInitialState,
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

    const row = rows[0];

    // check that column headers are shown correctly.
    expect(await findColumnHeaderByName('datafiles.name')).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('datafiles.location')
    ).toBeInTheDocument();
    expect(await findColumnHeaderByName('datafiles.size')).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('datafiles.modified_time')
    ).toBeInTheDocument();

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
      ).getByText('2019-07-23')
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
      `?filters=${encodeURIComponent('{"modTime":{"endDate":"2019-08-06"}}')}`
    );

    // await user.clear(filterInput);
    await user.click(filterInput);
    await user.keyboard('{Control}a{/Control}');
    await user.keyboard('{Delete}');

    expect(history.length).toBe(3);
    expect(history.location.search).toBe('?');

    cleanupDatePickerWorkaround();
  });

  it('updates sort query params on sort', async () => {
    renderComponent();

    await user.click(
      await screen.findByRole('button', { name: 'datafiles.name' })
    );

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"name":"asc"}')}`
    );
  });

  it('adds selected row to cart if unselected; removes it from cart otherwise', async () => {
    renderComponent();

    // row should not be selected initially as the cart is empty
    expect(
      await screen.findByRole('checkbox', { name: 'select row 0' })
    ).not.toBeChecked();

    // select the row
    await user.click(
      await screen.findByRole('checkbox', { name: 'select row 0' })
    );

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
        entityId: 1,
        entityType: 'dataset',
        id: 1,
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

  it('no select all checkbox appears if selectAllSetting is false', async () => {
    state.dgdataview.selectAllSetting = false;

    renderComponent();
    // wait for rows to show up
    await waitFor(async () => {
      expect(await findAllRows()).toHaveLength(1);
    });

    await waitFor(() => {
      expect(
        screen.queryByRole('checkbox', { name: 'select all rows' })
      ).toBeNull();
    });
  });

  it('renders actions correctly', async () => {
    renderComponent();

    // wait for rows to show up
    let rows: HTMLElement[] = [];
    await waitFor(async () => {
      rows = await findAllRows();
      expect(rows).toHaveLength(1);
    });

    expect(
      within(rows[0]).getByRole('button', { name: 'buttons.download' })
    ).toBeInTheDocument();
  });

  it('displays details panel when expanded', async () => {
    renderComponent();

    // wait for rows to show up
    let rows: HTMLElement[] = [];
    await waitFor(async () => {
      rows = await findAllRows();
      expect(rows).toHaveLength(1);
    });

    expect(screen.queryByTestId('datafile-details-panel')).toBeNull();

    await user.click(
      within(rows[0]).getByRole('button', { name: 'Show details' })
    );

    expect(
      await screen.findByTestId('datafile-details-panel')
    ).toBeInTheDocument();
  });
});
