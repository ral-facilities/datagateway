import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  render,
  screen,
  waitFor,
  within,
  type RenderResult,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios, { AxiosResponse } from 'axios';
import {
  Datafile,
  dGCommonInitialState,
  useAddToCart,
  useCart,
  useDatafileCount,
  useDatafilesInfinite,
  useIds,
  useRemoveFromCart,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes, generatePath } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { paths } from '../../../page/pageContainer.component';
import {
  findAllRows,
  findCellInRow,
  findColumnHeaderByName,
  findColumnIndexByName,
  findRowAt,
  flushPromises,
} from '../../../setupTests';
import { StateType } from '../../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import DLSDatafilesTable from './dlsDatafilesTable.component';

vi.mock('../../../page/idCheckFunctions', () => ({
  checkProposalName: vi.fn().mockResolvedValue(true),
  checkInvestigationId: vi.fn().mockResolvedValue(true),
}));

vi.mock('datagateway-common', async () => {
  const originalModule = await vi.importActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useDatafileCount: vi.fn(),
    useDatafilesInfinite: vi.fn(),
    useIds: vi.fn(),
    useCart: vi.fn(),
    useAddToCart: vi.fn(),
    useRemoveFromCart: vi.fn(),
    downloadDatafile: vi.fn(),
  };
});

describe('DLS datafiles table component', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let rowData: Datafile[];
  let user: ReturnType<typeof userEvent.setup>;

  const renderComponent = (): RenderResult =>
    render(
      <Provider store={mockStore(state)}>
        <BrowserRouter
          future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
        >
          <QueryClientProvider client={new QueryClient()}>
            <Routes>
              <Route
                path={paths.standard.dlsDatafile}
                element={<DLSDatafilesTable />}
              />
            </Routes>
          </QueryClientProvider>
        </BrowserRouter>
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
    window.history.replaceState(
      {},
      '',
      generatePath(paths.standard.dlsDatafile, {
        datasetId: '1',
        investigationId: '2',
        proposalName: 'test',
      })
    );
    user = userEvent.setup();

    state = JSON.parse(
      JSON.stringify({
        dgdataview: dgDataViewInitialState,
        dgcommon: dGCommonInitialState,
      })
    );

    vi.mocked(useCart, { partial: true }).mockReturnValue({
      data: [],
      isPending: false,
    });
    vi.mocked(useDatafileCount, { partial: true }).mockReturnValue({
      data: 0,
    });
    vi.mocked(useDatafilesInfinite, { partial: true }).mockReturnValue({
      data: { pages: [rowData], pageParams: [] },
      fetchNextPage: vi.fn(),
    });
    vi.mocked(useIds, { partial: true }).mockReturnValue({
      data: [1],
      isPending: false,
    });
    vi.mocked(useAddToCart, { partial: true }).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });
    vi.mocked(useRemoveFromCart, { partial: true }).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });

    axios.get = vi
      .fn()
      .mockImplementation((url: string): Promise<Partial<AxiosResponse>> => {
        if (/\/datafiles$/.test(url)) {
          return Promise.resolve({
            data: rowData,
          });
        }

        return Promise.reject(`Endpoint not mocked: ${url}`);
      });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', async () => {
    renderComponent();

    let rows: HTMLElement[] = [];
    await waitFor(
      async () => {
        rows = await findAllRows();
        // should have 1 row in the table
        expect(rows).toHaveLength(1);
      },
      { timeout: 5_000 }
    );

    expect(await findColumnHeaderByName('datafiles.name')).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('datafiles.location')
    ).toBeInTheDocument();
    expect(await findColumnHeaderByName('datafiles.size')).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('datafiles.create_time')
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
          columnIndex: await findColumnIndexByName('datafiles.create_time'),
        })
      ).getByText('2019-01-01')
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

    expect(window.location.search).toContain(
      `?filters=${encodeURIComponent(
        '{"name":{"value":"test","type":"include"}}'
      )}`
    );

    await user.clear(filterInput);

    expect(window.location.search).not.toContain('filters=');
  });

  it('updates filter query params on date filter', async () => {
    renderComponent();

    const filterInput = await screen.findByRole('textbox', {
      name: 'datafiles.create_time filter to',
    });

    await user.type(filterInput, '2019-08-06');

    expect(window.location.search).toContain(
      `?filters=${encodeURIComponent(
        '{"datafileCreateTime":{"endDate":"2019-08-06"}}'
      )}`
    );

    // await user.clear(filterInput);
    await user.click(filterInput);
    await user.keyboard('{Control}a{/Control}');
    await user.keyboard('{Delete}');

    expect(window.location.search).not.toContain('filters=');
  });

  it('uses default sort', async () => {
    renderComponent();

    await act(async () => {
      await flushPromises();
    });

    expect(await screen.findAllByRole('gridcell')).toBeTruthy();

    expect(window.location.search).toBe(
      `?sort=${encodeURIComponent('{"name":"asc"}')}`
    );

    // check that the data hook is only called once with the query enabled
    expect(
      vi
        .mocked(useDatafilesInfinite)
        .mock.calls.filter((call) => call[1] === true)
    ).toHaveLength(1);
  });

  it('updates sort query params on sort', async () => {
    renderComponent();

    await user.click(
      await screen.findByRole('button', { name: 'datafiles.name' })
    );

    expect(window.location.search).toBe(
      `?sort=${encodeURIComponent('{"name":"desc"}')}`
    );
  });

  it('calls addToCart mutate function on unchecked checkbox click', async () => {
    const addToCart = vi.fn();
    vi.mocked(useAddToCart, { partial: true }).mockReturnValue({
      mutate: addToCart,
      isPending: false,
    });
    renderComponent();

    await user.click(
      await screen.findByRole('checkbox', { name: 'select row 0' })
    );

    expect(addToCart).toHaveBeenCalledWith([1]);
  });

  it('calls removeFromCart mutate function on checked checkbox click', async () => {
    vi.mocked(useCart, { partial: true }).mockReturnValue({
      data: [
        {
          entityId: 1,
          entityType: 'datafile',
          id: 1,
          name: 'test',
          parentEntities: [],
        },
      ],
      isPending: false,
    });

    const removeFromCart = vi.fn();
    vi.mocked(useRemoveFromCart, { partial: true }).mockReturnValue({
      mutate: removeFromCart,
      isPending: false,
    });

    renderComponent();

    await user.click(
      await screen.findByRole('checkbox', { name: 'select row 0' })
    );

    expect(removeFromCart).toHaveBeenCalledWith([1]);
  });

  it('selected rows only considers relevant cart items', async () => {
    vi.mocked(useCart, { partial: true }).mockReturnValueOnce({
      data: [
        {
          entityId: 3,
          entityType: 'dataset',
          id: 3,
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
      ],
      isPending: false,
    });

    renderComponent();

    const selectAllCheckbox = await screen.findByRole('checkbox', {
      name: 'select all rows',
    });

    expect(selectAllCheckbox).not.toBeChecked();
    expect(selectAllCheckbox).toHaveAttribute('data-indeterminate', 'false');
  });

  it('no select all checkbox appears and no fetchAllIds sent if disableSelectAll is true', async () => {
    state.dgcommon.features = { disableSelectAll: true };

    renderComponent();

    await waitFor(() => {
      expect(
        screen.queryByRole('checkbox', { name: 'select all rows' })
      ).toBeNull();
    });
  });

  it("doesn't display download button for datafiles with no location", async () => {
    vi.mocked(useDatafilesInfinite, { partial: true }).mockReturnValueOnce({
      data: {
        pages: [
          [
            {
              id: 1,
              name: 'Test 1',
              fileSize: 1,
              modTime: '2019-07-23',
              createTime: '2019-07-23',
            },
          ],
        ],
        pageParams: [],
      },
    });

    renderComponent();

    const row = await findRowAt(0);

    await waitFor(() => {
      expect(
        within(row).queryByRole('button', { name: 'datafiles.download' })
      ).toBeNull();
    });
  });

  it('displays details panel when expanded', async () => {
    renderComponent();

    await user.click(
      await screen.findByRole('button', { name: 'Show details' })
    );

    expect(
      await screen.findByTestId('dls-datafile-details-panel')
    ).toBeTruthy();
  });
});
