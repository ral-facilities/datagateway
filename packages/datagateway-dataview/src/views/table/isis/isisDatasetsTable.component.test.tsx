import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  render,
  screen,
  waitFor,
  type RenderResult,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios, { AxiosResponse } from 'axios';
import {
  dGCommonInitialState,
  useAddToCart,
  useCart,
  useDatasetCount,
  useDatasetsInfinite,
  useIds,
  useRemoveFromCart,
  type Dataset,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes, generatePath } from 'react-router';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { paths } from '../../../page/pageContainer.component';
import { flushPromises } from '../../../setupTests';
import type { StateType } from '../../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import ISISDatasetsTable from './isisDatasetsTable.component';

vi.mock('../../../page/idCheckFunctions', () => ({
  checkInstrumentId: vi.fn().mockResolvedValue(true),
  checkStudyDataPublicationId: vi.fn().mockResolvedValue(true),
  checkInstrumentAndFacilityCycleId: vi.fn().mockResolvedValue(true),
}));

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
  let user: ReturnType<typeof userEvent.setup>;

  const renderComponent = (): RenderResult => {
    const store = mockStore(state);
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <QueryClientProvider client={new QueryClient()}>
            <Routes>
              <Route
                path={paths.toggle.isisDataset}
                element={<ISISDatasetsTable dataPublication={false} />}
              />
              <Route
                path={paths.dataPublications.toggle.isisDataset}
                element={<ISISDatasetsTable dataPublication={true} />}
              />
              <Route path={paths.standard.isisDatafile} element={null} />
            </Routes>
          </QueryClientProvider>
        </BrowserRouter>
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
    window.history.replaceState(
      {},
      '',
      generatePath(paths.toggle.isisDataset, {
        instrumentId: '1',
        facilityCycleId: '2',
        investigationId: '3',
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
    vi.mocked(useDatasetCount, { partial: true }).mockReturnValue({
      data: 0,
    });
    vi.mocked(useDatasetsInfinite, { partial: true }).mockReturnValue({
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
        if (/\/datasets$/.test(url)) {
          return Promise.resolve({
            data: rowData,
          });
        }

        if (/\/datapublications$/.test(url)) {
          return Promise.resolve({
            data: {
              id: 1,
              content: {
                dataCollectionInvestigations: [{ investigation: { id: 5 } }],
              },
            },
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
      name: 'datasets.modified_time filter to',
    });

    await user.type(filterInput, '2019-08-06');

    expect(window.location.search).toContain(
      `?filters=${encodeURIComponent('{"modTime":{"endDate":"2019-08-06"}}')}`
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
        .mocked(useDatasetsInfinite)
        .mock.calls.filter((call) => call[1] === true)
    ).toHaveLength(1);
  });

  it('updates sort query params on sort', async () => {
    renderComponent();

    await user.click(await screen.findByText('datasets.name'));

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
          entityType: 'dataset',
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

    expect(window.location.pathname).toBe(
      '/browse/instrument/1/facilityCycle/2/investigation/3/dataset/1/datafile'
    );
  });

  it('renders dataset name as a link', async () => {
    renderComponent();
    expect(await screen.findByText('Test 1')).toMatchSnapshot();
  });

  it('renders dataset name as a link in data publication hierarchy', async () => {
    window.history.replaceState(
      {},
      '',
      generatePath(paths.dataPublications.toggle.isisDataset, {
        instrumentId: '1',
        investigationId: '3',
        dataPublicationId: '2',
      })
    );
    renderComponent();

    expect(await screen.findByText('Test 1')).toMatchSnapshot();
  });

  it('renders actions correctly', async () => {
    renderComponent();
    expect(
      await screen.findByRole('button', { name: 'buttons.download' })
    ).toBeInTheDocument();
  });
});
