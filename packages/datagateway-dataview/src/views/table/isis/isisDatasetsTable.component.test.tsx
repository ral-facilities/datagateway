import * as React from 'react';
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
  useDatasetSizes,
  useIds,
  useRemoveFromCart,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
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
import type { UserEvent } from '@testing-library/user-event/setup/setup';
import userEvent from '@testing-library/user-event';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useDatasetCount: jest.fn(),
    useDatasetsInfinite: jest.fn(),
    useIds: jest.fn(),
    useCart: jest.fn(),
    useAddToCart: jest.fn(),
    useRemoveFromCart: jest.fn(),
    useDatasetSizes: jest.fn(),
  };
});

describe('ISIS Dataset table component', () => {
  let mockStore;
  let state: StateType;
  let rowData: Dataset[];
  let history: History;
  let user: UserEvent;

  const renderComponent = (): RenderResult => {
    const store = mockStore(state);
    return render(
      <Provider store={store}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <ISISDatasetsTable
              studyHierarchy={false}
              instrumentId="1"
              instrumentChildId="2"
              investigationId="3"
            />
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
        size: 1,
        modTime: '2019-07-23',
        createTime: '2019-07-23',
      },
    ];
    history = createMemoryHistory();
    user = userEvent.setup();

    mockStore = configureStore([thunk]);
    state = JSON.parse(
      JSON.stringify({
        dgdataview: dgDataViewInitialState,
        dgcommon: dGCommonInitialState,
      })
    );

    (useCart as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });
    (useDatasetCount as jest.Mock).mockReturnValue({
      data: 0,
    });
    (useDatasetsInfinite as jest.Mock).mockReturnValue({
      data: { pages: [rowData] },
      fetchNextPage: jest.fn(),
    });
    (useIds as jest.Mock).mockReturnValue({
      data: [1],
      isLoading: false,
    });
    (useAddToCart as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isLoading: false,
    });
    (useRemoveFromCart as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isLoading: false,
    });
    (useDatasetSizes as jest.Mock).mockReturnValue({ data: 1 });
  });

  afterEach(() => {
    jest.clearAllMocks();
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

    await user.clear(filterInput);

    expect(history.length).toBe(3);
    expect(history.location.search).toBe('?');

    cleanupDatePickerWorkaround();
  });

  it('uses default sort', () => {
    renderComponent();
    expect(history.length).toBe(1);
    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"createTime":"desc"}')}`
    );
  });

  it('updates sort query params on sort', async () => {
    renderComponent();

    await user.click(await screen.findByText('datasets.name'));

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"name":"asc"}')}`
    );
  });

  it('calls addToCart mutate function on unchecked checkbox click', async () => {
    const addToCart = jest.fn();
    (useAddToCart as jest.Mock).mockReturnValue({
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
    (useCart as jest.Mock).mockReturnValue({
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

    const removeFromCart = jest.fn();
    (useRemoveFromCart as jest.Mock).mockReturnValue({
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
    (useCart as jest.Mock).mockReturnValueOnce({
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
      await screen.findByTestId('dataset-details-panel')
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

  it('renders dataset name as a link in StudyHierarchy', () => {
    const store = mockStore(state);
    render(
      <Provider store={store}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <ISISDatasetsTable
              studyHierarchy={true}
              instrumentId="1"
              instrumentChildId="2"
              investigationId="3"
            />
          </QueryClientProvider>
        </Router>
      </Provider>
    );

    expect(screen.getByText('Test 1')).toMatchSnapshot();
  });

  it('renders actions correctly', async () => {
    renderComponent();
    expect(
      await screen.findByRole('button', { name: 'buttons.download' })
    ).toBeInTheDocument();
  });
});
