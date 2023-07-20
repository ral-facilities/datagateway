import {
  type Datafile,
  type DownloadCartItem,
  dGCommonInitialState,
  Investigation,
  Dataset,
} from 'datagateway-common';
import * as React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import type { StateType } from '../../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import DLSDataPublicationContentTable from './dlsDataPublicationContentTable.component';
import { QueryClient, QueryClientProvider } from 'react-query';
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
  let cartItems: DownloadCartItem[];
  let history: History;
  let user: UserEvent;
  let holder: HTMLElement;
  let investigations: Investigation[];
  let datasets: Dataset[];
  let datafiles: Datafile[];

  const renderComponent = (): RenderResult =>
    render(
      <Provider store={mockStore(state)}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <DLSDataPublicationContentTable dataPublicationId="1" />
          </QueryClientProvider>
        </Router>
      </Provider>
    );

  beforeEach(() => {
    user = userEvent.setup();
    cartItems = [];
    history = createMemoryHistory();

    investigations = [
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
            id: 4,
            instrument: {
              id: 5,
              name: 'LARMOR',
            },
          },
        ],
        startDate: '2019-06-10',
        endDate: '2019-06-11',
      },
    ];
    datasets = [
      {
        id: 2,
        name: 'Test 2',
        size: 1,
        modTime: '2019-07-23',
        createTime: '2019-07-23',
      },
    ];
    datafiles = [
      {
        id: 3,
        name: 'Test 3',
        location: '/test3',
        fileSize: 1,
        modTime: '2019-07-23',
        createTime: '2019-07-23',
      },
    ];

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
            data: datafiles.length,
          });
        }

        if (/\/datafiles$/.test(url)) {
          // datafiles infinite
          return Promise.resolve({
            data: datafiles,
          });
        }

        if (/\/datasets\/count$/.test(url)) {
          // fetch dataset count
          return Promise.resolve({
            data: datasets.length,
          });
        }

        if (/\/datasets$/.test(url)) {
          // datasets infinite
          return Promise.resolve({
            data: datasets,
          });
        }

        if (/\/investigations\/count$/.test(url)) {
          // fetch investigation count
          return Promise.resolve({
            data: investigations.length,
          });
        }

        if (/\/investigations$/.test(url)) {
          // investigations infinite
          return Promise.resolve({
            data: investigations,
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
                entityId: 3,
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

  it('renders investigations correctly', async () => {
    renderComponent();

    let rows: HTMLElement[] = [];
    await waitFor(async () => {
      rows = await findAllRows();
      // should have 1 row in the table
      expect(rows).toHaveLength(1);
    });

    const row = rows[0];

    expect(
      await findColumnHeaderByName('investigations.visit_id')
    ).toBeInTheDocument();
    // TODO: test for this once DLS decides what they want
    // expect(
    //   await findColumnHeaderByName('investigations.dataset_count')
    // ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('investigations.instrument')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('investigations.start_date')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('investigations.end_date')
    ).toBeInTheDocument();

    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('investigations.visit_id'),
        })
      ).getByText('1')
    ).toBeInTheDocument();
    // TODO: test for this once DLS decides what they want
    // expect(
    //   within(
    //     findCellInRow(row, {
    //       columnIndex: await findColumnIndexByName(
    //         'investigations.dataset_count'
    //       ),
    //     })
    //   ).getByText('1')
    // ).toBeInTheDocument();
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

  it('renders datasets correctly', async () => {
    renderComponent();

    await user.click(
      screen.getByRole('tab', { name: 'breadcrumbs.dataset_other' })
    );

    let rows: HTMLElement[] = [];
    await waitFor(async () => {
      rows = await findAllRows();
      // should have 1 row in the table
      expect(rows).toHaveLength(1);
    });

    const row = rows[0];

    expect(await findColumnHeaderByName('datasets.name')).toBeInTheDocument();
    // TODO: test for this once DLS decides what they want
    // expect(
    //   await findColumnHeaderByName('datasets.datafile_count')
    // ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('datasets.create_time')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('datasets.modified_time')
    ).toBeInTheDocument();

    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('datasets.name'),
        })
      ).getByText('Test 2')
    ).toBeInTheDocument();
    // TODO: test for this once DLS decides what they want
    // expect(
    //   within(
    //     findCellInRow(row, {
    //       columnIndex: await findColumnIndexByName('datasets.datafile_count'),
    //     })
    //   ).getByText('1')
    // ).toBeInTheDocument();
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('datasets.create_time'),
        })
      ).getByText('2019-07-23')
    ).toBeInTheDocument();
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('datasets.modified_time'),
        })
      ).getByText('2019-07-23')
    ).toBeInTheDocument();
  });

  it('renders datafiles correctly', async () => {
    renderComponent();

    await user.click(
      screen.getByRole('tab', { name: 'breadcrumbs.datafile_other' })
    );

    let rows: HTMLElement[] = [];
    await waitFor(async () => {
      rows = await findAllRows();
      // should have 1 row in the table
      expect(rows).toHaveLength(1);
    });

    const row = rows[0];

    expect(await findColumnHeaderByName('datafiles.name')).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('datafiles.location')
    ).toBeInTheDocument();
    expect(await findColumnHeaderByName('datafiles.size')).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('datafiles.create_time')
    ).toBeInTheDocument();

    // check that every cell contains the correct values
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('datafiles.name'),
        })
      ).getByText('Test 3')
    ).toBeInTheDocument();
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('datafiles.location'),
        })
      ).getByText('/test3')
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
          columnIndex: await findColumnIndexByName('datafiles.create_time'),
        })
      ).getByText('2019-07-23')
    ).toBeInTheDocument();
  });

  it('updates filter query params on text filter', async () => {
    renderComponent();

    const filterInput = await screen.findByRole('textbox', {
      name: 'Filter by investigations.visit_id',
      hidden: true,
    });

    await user.type(filterInput, '1');

    // user.type inputs the given string character by character to simulate user typing
    // each keystroke of user.type creates a new entry in the history stack
    // so the initial entry + 1 characters in "1" = 2 entries
    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent(
        '{"visitId":{"value":"1","type":"include"}}'
      )}`
    );

    await user.clear(filterInput);

    expect(history.length).toBe(3);
    expect(history.location.search).toBe('?');
  });

  it('updates filter query params on date filter', async () => {
    applyDatePickerWorkaround();

    renderComponent();

    const filterInput = await screen.findByRole('textbox', {
      name: 'investigations.start_date filter to',
    });

    await user.type(filterInput, '2019-08-06');

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent('{"startDate":{"endDate":"2019-08-06"}}')}`
    );

    await user.clear(filterInput);

    expect(history.length).toBe(3);
    expect(history.location.search).toBe('?');

    cleanupDatePickerWorkaround();
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

  it('adds selected row to cart if unselected; removes it from cart otherwise', async () => {
    renderComponent();

    await user.click(
      screen.getByRole('tab', { name: 'breadcrumbs.datafile_other' })
    );

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

  it('displays details panel when expanded', async () => {
    renderComponent();

    let rows: HTMLElement[] = [];
    await waitFor(async () => {
      rows = await findAllRows();
      // should have 1 row in the table
      expect(rows).toHaveLength(1);
    });

    const row = rows[0];

    await user.click(within(row).getByRole('button', { name: 'Show details' }));

    expect(await screen.findByTestId('visit-details-panel')).toBeTruthy();
  });
});
