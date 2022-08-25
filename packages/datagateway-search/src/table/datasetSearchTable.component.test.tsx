import * as React from 'react';
import DatasetSearchTable from './datasetSearchTable.component';
import { initialState } from '../state/reducers/dgsearch.reducer';
import configureStore from 'redux-mock-store';
import type { StateType } from '../state/app.types';
import {
  dGCommonInitialState,
  type DownloadCartItem,
  type LuceneSearchParams,
  type SearchResponse,
  type SearchResult,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createMemoryHistory, type History } from 'history';
import { Router } from 'react-router-dom';
import {
  render,
  type RenderResult,
  screen,
  waitFor,
} from '@testing-library/react';
import axios, { type AxiosResponse } from 'axios';
import { mockDataset } from '../testData';
import type { UserEvent } from '@testing-library/user-event/dist/types/setup';
import userEvent from '@testing-library/user-event';

// ====================== FIXTURES ======================

const mockSearchResults: SearchResult[] = [
  {
    score: 1,
    id: 1,
    source: {
      id: 1,
      name: 'Dataset test name',
      startDate: 1563922800000,
      endDate: 1564009200000,
      investigationinstrument: [
        {
          'instrument.id': 4,
          'instrument.name': 'LARMOR',
        },
      ],
      'investigation.id': 2,
      'investigation.title': 'Investigation test title',
      'investigation.name': 'Investigation test name',
      'investigation.startDate': 1560121200000,
    },
  },
];

const mockLuceneSearchParams: LuceneSearchParams = {
  searchText: '',
  startDate: null,
  endDate: null,
  sort: {},
  minCount: 10,
  maxCount: 100,
  restrict: true,
  facets: [{ target: 'Dataset' }],
  filters: {},
};

// ====================== END FIXTURE ======================

describe('Dataset table component', () => {
  const mockStore = configureStore([thunk]);
  let container: HTMLDivElement;
  let state: StateType;
  let history: History;
  let queryClient: QueryClient;
  let user: UserEvent;
  let cartItems: DownloadCartItem[];

  let searchResponse: SearchResponse;

  const renderComponent = (hierarchy?: string): RenderResult => {
    return render(
      <Provider store={mockStore(state)}>
        <Router history={history}>
          <QueryClientProvider client={queryClient}>
            <DatasetSearchTable hierarchy={hierarchy ?? ''} />
          </QueryClientProvider>
        </Router>
      </Provider>,
      { container: document.body.appendChild(container) }
    );
  };

  /**
   * Mock implementation of axios.get
   */
  const mockAxiosGet = (url: string): Promise<Partial<AxiosResponse>> => {
    console.log('url', url);
    if (/.*\/user\/cart\/.*$/.test(url)) {
      // fetchDownloadCart
      return Promise.resolve({ data: { cartItems } });
    }
    if (/.*\/search\/documents$/.test(url)) {
      // fetchLuceneData
      return Promise.resolve<Partial<AxiosResponse<SearchResponse>>>({
        data: searchResponse,
      });
    }
    if (/.*\/facilitycycles$/.test(url)) {
      // fetchAllFacilityCycles
      return Promise.resolve({
        data: [
          {
            id: 4,
            name: 'facility cycle name',
            startDate: '2000-06-10',
            endDate: '2020-06-11',
          },
        ],
      });
    }
    if (/.*\/datafiles\/count$/.test(url)) {
      // fetchDatafileCountQuery
      return Promise.resolve({
        data: 1,
      });
    }
    if (/.*\/datasets$/.test(url)) {
      return Promise.resolve({
        data: [mockDataset],
      });
    }
    if (/.*\/user\/getSize$/.test(url)) {
      // fetchDatasetSizes
      return Promise.resolve({
        data: 1,
      });
    }
    return Promise.reject();
  };

  beforeEach(() => {
    user = userEvent.setup();
    history = createMemoryHistory();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    container = document.createElement('div');
    container.id = 'datagateway-search';

    state = JSON.parse(
      JSON.stringify({ dgcommon: dGCommonInitialState, dgsearch: initialState })
    );
    cartItems = [];
    searchResponse = {
      results: mockSearchResults,
    };

    queryClient.setQueryData(
      ['search', 'Dataset', mockLuceneSearchParams],
      () => ({
        pages: [searchResponse],
      })
    );

    axios.get = jest.fn().mockImplementation(mockAxiosGet);
    axios.post = jest.fn().mockImplementation((url: string) => {
      if (/.*\/user\/cart\/.*\/cartItems$/.test(url)) {
        return Promise.resolve({ data: { cartItems } });
      }
      return Promise.reject();
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', async () => {
    const { asFragment } = renderComponent();
    // wait for data to finish loading
    expect(await screen.findByText('Dataset test name')).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });

  it('should add the selected row to cart', async () => {
    const addedCartItem: DownloadCartItem = {
      entityId: 1,
      entityType: 'dataset',
      id: 1,
      name: 'Test 1',
      parentEntities: [],
    };

    renderComponent();

    // wait for data to finish loading
    expect(await screen.findByText('Dataset test name')).toBeInTheDocument();

    // pretend the server has added the row to the cart
    // create a new array to trigger useMemo update
    cartItems = [...cartItems, addedCartItem];

    // clicks on the row checkbox
    await user.click(screen.getByRole('checkbox', { name: 'select row 0' }));

    // the checkbox should be checked
    expect(
      await screen.findByRole('checkbox', { name: 'select row 0' })
    ).toBeChecked();
  });

  it('should remove the selected row from cart if it is in the cart', async () => {
    const addedCartItem: DownloadCartItem = {
      entityId: 1,
      entityType: 'dataset',
      id: 1,
      name: 'Test 1',
      parentEntities: [],
    };

    cartItems.push(addedCartItem);

    renderComponent();

    // wait for data to finish loading
    expect(await screen.findByText('Dataset test name')).toBeInTheDocument();

    // pretend the server has removed the item from the cart
    // create a new array to trigger useMemo update
    cartItems = [];

    // clicks on the row checkbox
    await user.click(screen.getByRole('checkbox', { name: 'select row 0' }));

    // the checkbox should be checked
    expect(
      await screen.findByRole('checkbox', { name: 'select row 0' })
    ).not.toBeChecked();
  });

  it('selected rows only considers relevant cart items', async () => {
    cartItems = [
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
    ];

    renderComponent();

    const selectAllCheckbox = await screen.findByRole('checkbox', {
      name: 'select all rows',
    });

    expect(selectAllCheckbox).not.toBeChecked();
    expect(selectAllCheckbox).toHaveAttribute('data-indeterminate', 'false');
  });

  it('no select all checkbox appears and no fetchAllIds sent if selectAllSetting is false', async () => {
    state.dgsearch.selectAllSetting = false;

    renderComponent();

    await waitFor(() => {
      expect(
        screen.queryByRole('checkbox', { name: 'select all rows' })
      ).toBeNull();
    });
  });

  it('displays generic details panel when expanded', async () => {
    renderComponent();

    await user.click(
      await screen.findByRole('button', { name: 'Show details' })
    );

    expect(
      await screen.findByTestId('dataset-details-panel')
    ).toBeInTheDocument();
  });

  it('displays correct details panel for ISIS when expanded', async () => {
    renderComponent('isis');

    await user.click(
      await screen.findByRole('button', { name: 'Show details' })
    );

    expect(
      await screen.findByTestId('isis-dataset-details-panel')
    ).toBeInTheDocument();
  });

  it('can navigate using the details panel for ISIS when there are facility cycles', async () => {
    renderComponent('isis');

    await user.click(
      await screen.findByRole('button', { name: 'Show details' })
    );

    await user.click(
      await screen.findByRole('tab', {
        name: 'datasets.details.datafiles',
      })
    );

    expect(history.location.pathname).toBe(
      '/browse/instrument/4/facilityCycle/4/investigation/2/dataset/1'
    );
  });

  it('displays correct details panel for DLS when expanded', async () => {
    renderComponent('dls');

    await user.click(
      await screen.findByRole('button', { name: 'Show details' })
    );

    expect(
      await screen.findByTestId('dls-dataset-details-panel')
    ).toBeInTheDocument();
  });

  it('renders Dataset title as a link', async () => {
    renderComponent();

    expect(
      await screen.findByRole('link', { name: 'Dataset test name' })
    ).toBeInTheDocument();
  });

  it('renders fine with incomplete data', () => {
    // this can happen when navigating between tables and the previous table's state still exists
    searchResponse = {
      results: [
        {
          ...mockSearchResults[0],
          source: {
            id: 1,
            name: 'test',
          },
        },
      ],
    };

    expect(() => renderComponent()).not.toThrowError();
  });

  it('renders generic link & pending count correctly', async () => {
    (axios.get as jest.Mock).mockImplementation((url: string) => {
      if (/.*\/datafiles\/count$/.test(url)) {
        return new Promise((_) => {
          // never resolve the promise to pretend it is loading
        });
      }
      return mockAxiosGet(url);
    });

    renderComponent('data');

    expect(
      await screen.findByRole('link', { name: 'Dataset test name' })
    ).toHaveAttribute('href', '/browse/investigation/2/dataset/1/datafile');
    expect(await screen.findByText('Calculating...')).toBeInTheDocument();
  });

  it('renders DLS link correctly', async () => {
    renderComponent('dls');

    expect(
      await screen.findByRole('link', { name: 'Dataset test name' })
    ).toHaveAttribute(
      'href',
      '/browse/proposal/Investigation test name/investigation/2/dataset/1/datafile'
    );
  });

  it('renders ISIS link & file sizes correctly', async () => {
    (axios.get as jest.Mock).mockImplementation((url: string) => {
      if (/.*\/facilitycycles$/.test(url)) {
        return Promise.resolve({
          data: [
            {
              id: 6,
              name: 'facility cycle name',
              startDate: '2000-06-10',
              endDate: '2020-06-11',
            },
          ],
        });
      }
      return mockAxiosGet(url);
    });

    renderComponent('isis');

    expect(
      await screen.findByRole('link', { name: 'Dataset test name' })
    ).toBeInTheDocument();
    expect(await screen.findByText('1 B')).toBeInTheDocument();
  });

  it('does not render ISIS link when instrumentId cannot be found', async () => {
    const { investigationinstrument, ...data } = mockSearchResults[0].source;
    searchResponse = {
      results: [
        {
          ...mockSearchResults[0],
          source: data,
        },
      ],
    };

    renderComponent('isis');

    await waitFor(async () => {
      // the title should not be rendered as a link...
      expect(
        screen.queryByRole('link', { name: 'Dataset test name' })
      ).toBeNull();
      // ...but it should still be rendered as a normal text
      expect(screen.getByText('Dataset test name')).toBeInTheDocument();
    });
    expect(await screen.findByText('1 B')).toBeInTheDocument();
  });

  it('does not render ISIS link when facilityCycleId cannot be found', async () => {
    renderComponent('isis');

    await waitFor(async () => {
      // the title should not be rendered as a link...
      expect(
        screen.queryByRole('link', { name: 'Dataset test name' })
      ).toBeNull();
      // ...but it should still be rendered as a normal text
      expect(screen.getByText('Dataset test name')).toBeInTheDocument();
    });
  });

  it('does not render ISIS link when facilityCycleId has incompatible dates', async () => {
    (axios.get as jest.Mock).mockImplementation((url: string) => {
      if (/.*\/facilitycycles$/.test(url)) {
        return Promise.resolve({
          data: [
            {
              id: 2,
              name: 'facility cycle name',
              startDate: '2020-06-11',
              endDate: '2000-06-10',
            },
          ],
        });
      }
      return mockAxiosGet(url);
    });

    renderComponent('isis');

    await waitFor(async () => {
      // the title should not be rendered as a link...
      expect(
        screen.queryByRole('link', { name: 'Dataset test name' })
      ).toBeNull();
      // ...but it should still be rendered as a normal text
      expect(screen.getByText('Dataset test name')).toBeInTheDocument();
    });
  });

  it('displays only the dataset name when there is no generic investigation to link to', async () => {
    const data = { ...mockSearchResults[0].source };
    delete data['investigation.id'];
    delete data['investigation.name'];
    delete data['investigation.title'];
    delete data['investigation.startDate'];
    searchResponse = {
      results: [
        {
          ...mockSearchResults[0],
          source: data,
        },
      ],
    };
    queryClient.setQueryData(
      ['search', 'Dataset', mockLuceneSearchParams],
      () => ({
        pages: [searchResponse],
      })
    );

    renderComponent('data');

    await waitFor(async () => {
      // the title should not be rendered as a link...
      expect(
        screen.queryByRole('link', { name: 'Dataset test name' })
      ).toBeNull();
      // ...but it should still be rendered as a normal text
      expect(screen.getByText('Dataset test name')).toBeInTheDocument();
    });
  });

  it('displays only the dataset name when there is no DLS investigation to link to', async () => {
    const data = { ...mockSearchResults[0].source };
    delete data['investigation.id'];
    delete data['investigation.name'];
    delete data['investigation.title'];
    delete data['investigation.startDate'];
    searchResponse = {
      results: [
        {
          ...mockSearchResults[0],
          source: data,
        },
      ],
    };
    queryClient.setQueryData(
      ['search', 'Dataset', mockLuceneSearchParams],
      () => ({
        pages: [searchResponse],
      })
    );
    renderComponent('dls');

    await waitFor(async () => {
      // the title should not be rendered as a link...
      expect(
        screen.queryByRole('link', { name: 'Dataset test name' })
      ).toBeNull();
      // ...but it should still be rendered as a normal text
      expect(screen.getByText('Dataset test name')).toBeInTheDocument();
    });
  });

  it('displays only the dataset name when there is no ISIS investigation to link to', async () => {
    const data = { ...mockSearchResults[0].source };
    delete data['investigation.id'];
    delete data['investigation.name'];
    delete data['investigation.title'];
    delete data['investigation.startDate'];
    searchResponse = {
      results: [
        {
          ...mockSearchResults[0],
          source: data,
        },
      ],
    };
    queryClient.setQueryData(
      ['search', 'Dataset', mockLuceneSearchParams],
      () => ({
        pages: [searchResponse],
      })
    );
    renderComponent('isis');

    await waitFor(async () => {
      // the title should not be rendered as a link...
      expect(
        screen.queryByRole('link', { name: 'Dataset test name' })
      ).toBeNull();
      // ...but it should still be rendered as a normal text
      expect(screen.getByText('Dataset test name')).toBeInTheDocument();
    });
  });
});
