import ISISDatasetsTable from './isisDatasetsTable.component';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import configureStore from 'redux-mock-store';
import type { StateType } from '../../../state/app.types';
import {
  type Dataset,
  dGCommonInitialState,
  useAddToCart,
  useCart,
  useDatasetCount,
  useDatasetsInfinite,
  useIds,
  useRemoveFromCart,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { generatePath, Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  render,
  type RenderResult,
  screen,
  waitFor,
} from '@testing-library/react';
import { createMemoryHistory, type History } from 'history';
import {
  applyDatePickerWorkaround,
  cleanupDatePickerWorkaround,
} from '../../../setupTests';
import userEvent from '@testing-library/user-event';
import { paths } from '../../../page/pageContainer.component';
import axios, { AxiosResponse } from 'axios';

vi.mock('datagateway-common', async () => {
  const originalModule = await vi.importActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useDatasetCount: vi.fn(),
    useDatasetsInfinite: vi.fn(),
    useIds: vi.fn(),
    useCart: vi.fn(),
    useAddToCart: vi.fn(),
    useRemoveFromCart: vi.fn(),
  };
});

describe('ISIS Dataset table component', () => {
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
            <ISISDatasetsTable investigationId="3" />
          </QueryClientProvider>
        </Router>
      </Provider>
    );
  };

  beforeEach(() => {
    rowData = [
      {
        id: 1,
        name: 'Test 1',
        modTime: '2019-07-23',
        createTime: '2019-07-23',
      },
    ];
    history = createMemoryHistory({
      initialEntries: [
        generatePath(paths.toggle.isisDataset, {
          instrumentId: '1',
          investigationId: '3',
          facilityCycleId: '2',
        }),
      ],
    });
    user = userEvent.setup();

    state = JSON.parse(
      JSON.stringify({
        dgdataview: dgDataViewInitialState,
        dgcommon: dGCommonInitialState,
      })
    );

    vi.mocked(useCart).mockReturnValue({
      data: [],
      isLoading: false,
    });
    vi.mocked(useDatasetCount).mockReturnValue({
      data: 0,
    });
    vi.mocked(useDatasetsInfinite).mockReturnValue({
      data: { pages: [rowData] },
      fetchNextPage: vi.fn(),
    });
    vi.mocked(useIds).mockReturnValue({
      data: [1],
      isLoading: false,
    });
    vi.mocked(useAddToCart).mockReturnValue({
      mutate: vi.fn(),
      isLoading: false,
    });
    vi.mocked(useRemoveFromCart).mockReturnValue({
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
    applyDatePickerWorkaround();

    renderComponent();

    const filterInput = await screen.findByRole('textbox', {
      name: 'datasets.modified_time filter to',
    });

    await user.type(filterInput, '2019-08-06');

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

    await user.click(await screen.findByText('datasets.name'));

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"name":"desc"}')}`
    );
  });

  it('calls addToCart mutate function on unchecked checkbox click', async () => {
    const addToCart = vi.fn();
    vi.mocked(useAddToCart).mockReturnValue({
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
    vi.mocked(useCart).mockReturnValue({
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
    vi.mocked(useRemoveFromCart).mockReturnValue({
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
    vi.mocked(useCart).mockReturnValueOnce({
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

  it('displays details panel when expanded', async () => {
    renderComponent();

    await user.click(
      await screen.findByRole('button', { name: 'Show details' })
    );

    expect(
      await screen.findByTestId('isis-dataset-details-panel')
    ).toBeInTheDocument();
  });

  it('renders details panel with datasets link and can navigate', async () => {
    renderComponent();

    await user.click(
      await screen.findByRole('button', { name: 'Show details' })
    );

    await user.click(
      await screen.findByRole('tab', { name: 'datasets.details.datafiles' })
    );

    expect(history.location.pathname).toBe(
      '/browse/instrument/1/facilityCycle/2/investigation/3/dataset/1/datafile'
    );
  });

  it('renders dataset name as a link', () => {
    renderComponent();
    expect(screen.getByText('Test 1')).toMatchSnapshot();
  });

  it('renders dataset name as a link in data publication hierarchy', () => {
    history.replace(
      generatePath(paths.dataPublications.toggle.isisDataset, {
        instrumentId: '1',
        investigationId: '3',
        dataPublicationId: '2',
      })
    );
    renderComponent();

    expect(screen.getByText('Test 1')).toMatchSnapshot();
  });

  it('renders actions correctly', async () => {
    renderComponent();
    expect(
      await screen.findByRole('button', { name: 'buttons.download' })
    ).toBeInTheDocument();
  });
});
