import {
  Dataset,
  dGCommonInitialState,
  useAddToCart,
  useCart,
  useDatasetCount,
  useDatasetsInfinite,
  useIds,
  useRemoveFromCart,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { StateType } from '../../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import DLSDatasetsTable from './dlsDatasetsTable.component';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryHistory, History } from 'history';
import {
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
import userEvent from '@testing-library/user-event';
import axios, { AxiosResponse } from 'axios';

vi.mock('datagateway-common', async () => {
  const originalModule = await vi.importActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useDatasetCount: vi.fn(),
    useDatasetsInfinite: vi.fn(),
    useDatasetsDatafileCount: vi.fn(),
    useIds: vi.fn(),
    useCart: vi.fn(),
    useAddToCart: vi.fn(),
    useRemoveFromCart: vi.fn(),
    useDatasetDatafileCount: vi.fn(),
    downloadDataset: vi.fn(),
  };
});

describe('DLS Dataset table component', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let rowData: Dataset[];
  let history: History;
  let user: ReturnType<typeof userEvent.setup>;

  const renderComponent = (): RenderResult => {
    const store = mockStore(state);
    return render(
      <Provider store={store}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <DLSDatasetsTable proposalName="Proposal 1" investigationId="1" />
          </QueryClientProvider>
        </Router>
      </Provider>
    );
  };

  beforeEach(() => {
    rowData = [
      {
        id: 1,
        fileSize: 1,
        fileCount: 1,
        name: 'Test 1',
        modTime: '2019-07-23',
        createTime: '2019-07-23',
      },
    ];
    history = createMemoryHistory();
    user = userEvent.setup();

    state = JSON.parse(
      JSON.stringify({
        dgdataview: dgDataViewInitialState,
        dgcommon: dGCommonInitialState,
      })
    );

    vi.mocked(useCart, { partial: true }).mockReturnValue({
      data: [],
      isLoading: false,
    });
    vi.mocked(useDatasetCount, { partial: true }).mockReturnValue({
      data: 0,
      isSuccess: true,
    });
    vi.mocked(useDatasetsInfinite, { partial: true }).mockReturnValue({
      data: { pages: [rowData], pageParams: [] },
      fetchNextPage: vi.fn(),
    });
    vi.mocked(useIds, { partial: true }).mockReturnValue({
      data: [1],
      isLoading: false,
    });
    vi.mocked(useAddToCart, { partial: true }).mockReturnValue({
      mutate: vi.fn(),
      isLoading: false,
    });
    vi.mocked(useRemoveFromCart, { partial: true }).mockReturnValue({
      mutate: vi.fn(),
      isLoading: false,
    });

    axios.get = vi
      .fn()
      .mockImplementation((url: string): Promise<Partial<AxiosResponse>> => {
        if (/\/datasets$/.test(url)) {
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

    const rows = await findAllRows();
    expect(rows).toHaveLength(1);

    expect(await findColumnHeaderByName('datasets.name')).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('datasets.datafile_count')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('datasets.create_time')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('datasets.modified_time')
    ).toBeInTheDocument();

    const row = rows[0];
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('datasets.name'),
        })
      ).getByText('Test 1')
    ).toBeInTheDocument();
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('datasets.datafile_count'),
        })
      ).getByText('1')
    ).toBeInTheDocument();
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

  it('updates filter query params on text filter', async () => {
    renderComponent();

    const filterInput = await screen.findByRole('textbox', {
      name: 'Filter by datasets.name',
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
      name: 'datasets.modified_time filter to',
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
  });

  it('uses default sort', async () => {
    renderComponent();

    expect(await screen.findAllByRole('gridcell')).toBeTruthy();

    expect(history.length).toBe(1);
    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"name":"asc"}')}`
    );

    // check that the data request is sent only once after mounting
    expect(useDatasetsInfinite).toHaveBeenCalledTimes(2);
    expect(useDatasetsInfinite).toHaveBeenCalledWith(expect.anything(), false);
    expect(useDatasetsInfinite).toHaveBeenLastCalledWith(
      expect.anything(),
      true
    );
  });

  it('updates sort query params on sort', async () => {
    renderComponent();

    await user.click(
      await screen.findByRole('button', { name: 'datasets.name' })
    );

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"name":"desc"}')}`
    );
  });

  it('calls addToCart mutate function on unchecked checkbox click', async () => {
    const addToCart = vi.fn();
    vi.mocked(useAddToCart, { partial: true }).mockReturnValue({
      mutate: addToCart,
      isLoading: false,
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
          entityType: 'dataset',
          id: 1,
          name: 'test',
          parentEntities: [],
        },
      ],
      isLoading: false,
    });

    const removeFromCart = vi.fn();
    vi.mocked(useRemoveFromCart, { partial: true }).mockReturnValue({
      mutate: removeFromCart,
      isLoading: false,
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
          entityId: 1,
          entityType: 'investigation',
          id: 1,
          name: 'test',
          parentEntities: [],
        },
        {
          entityId: 2,
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
        screen.queryByRole('checkbox', { name: 'select all rows' })
      ).toBeNull();
    });
  });

  it('renders Dataset title as a link', async () => {
    renderComponent();
    expect(await screen.findByRole('link', { name: 'Test 1' })).toHaveAttribute(
      'href',
      '/browse/proposal/Proposal 1/investigation/1/dataset/1/datafile'
    );
  });

  it('displays details panel when expanded', async () => {
    renderComponent();

    const row = await findRowAt(0);

    await user.click(
      await within(row).findByRole('button', { name: 'Show details' })
    );

    expect(await screen.findByTestId('dls-dataset-details-panel')).toBeTruthy();
  });
});
