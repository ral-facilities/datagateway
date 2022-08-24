import * as React from 'react';
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
import InvestigationSearchTable from './investigationSearchTable.component';
import userEvent from '@testing-library/user-event';
import {
  render,
  type RenderResult,
  screen,
  waitFor,
} from '@testing-library/react';
import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';
import type { UserEvent } from '@testing-library/user-event/dist/types/setup';
import { mockInvestigation } from '../testData';

// ====================== FIXTURES ======================

const mockSearchResults: SearchResult[] = [
  {
    score: 1,
    id: 1,
    source: {
      id: 1,
      title: 'Test title 1',
      name: 'Test name 1',
      summary: 'foo bar',
      visitId: '1',
      doi: 'doi 1',
      investigationinstrument: [
        {
          'instrument.id': 3,
          'instrument.name': 'LARMOR',
        },
      ],
      startDate: 1560121200000,
      endDate: 1560207600000,
      'facility.name': 'facility name',
      'facility.id': 2,
    },
  },
];

const mockLuceneSearchParams: LuceneSearchParams = {
  searchText: '',
  startDate: null,
  endDate: null,
  sort: {},
  filters: {},
  minCount: 10,
  maxCount: 100,
  restrict: true,
  facets: [
    { target: 'Investigation' },
    {
      target: 'InvestigationParameter',
      dimensions: [{ dimension: 'type.name' }],
    },
    {
      target: 'Sample',
      dimensions: [{ dimension: 'type.name' }],
    },
  ],
};

// ====================== END FIXTURE ======================

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    // fetchDownloadCart: jest.fn(),
    // addOrRemoveFromCart: jest.fn(),
    handleICATError: jest.fn(),
  };
});

describe('Investigation Search Table component', () => {
  const mockStore = configureStore([thunk]);
  let container: HTMLDivElement;
  let state: StateType;
  let history: History;
  let user: UserEvent;
  let queryClient: QueryClient;

  let cartItems: DownloadCartItem[];
  let searchResponse: SearchResponse;

  const renderComponent = (hierarchy?: string): RenderResult => {
    return render(
      <Provider store={mockStore(state)}>
        <Router history={history}>
          <QueryClientProvider client={queryClient}>
            <InvestigationSearchTable hierarchy={hierarchy ?? ''} />
          </QueryClientProvider>
        </Router>
      </Provider>,
      {
        container: document.body.appendChild(container),
      }
    );
  };

  /**
   * Mock implementation of axios.get
   */
  const mockAxiosGet = (url: string): Promise<Partial<AxiosResponse>> => {
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
    if (/.*\/datasets\/count$/.test(url)) {
      // fetchDatasetCountQuery
      return Promise.resolve({
        data: 1,
      });
    }
    if (/.*\/investigations$/.test(url)) {
      return Promise.resolve({
        data: [mockInvestigation],
      });
    }
    if (/.*\/user\/getSize$/.test(url)) {
      // fetchInvestigationSize
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
      JSON.stringify({
        dgsearch: initialState,
        dgcommon: dGCommonInitialState,
      })
    );
    cartItems = [];
    searchResponse = {
      results: [mockSearchResults[0]],
    };

    // manually set the query data
    // because the initial data fetch is not done in investigation search table
    queryClient.setQueryData(
      ['search', 'Investigation', mockLuceneSearchParams],
      () => searchResponse
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

  it('renders correctly', () => {
    const { asFragment } = renderComponent();
    expect(asFragment()).toMatchSnapshot();
  });

  it('displays DOI and renders the expected Link ', async () => {
    renderComponent();

    const link = await screen.findByText('doi 1');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://doi.org/doi 1');
  });

  it('should add the selected row to cart', async () => {
    const addedCartItem: DownloadCartItem = {
      entityId: 1,
      entityType: 'investigation',
      id: 1,
      name: 'Test 1',
      parentEntities: [],
    };

    renderComponent();

    // wait for data to finish loading
    expect(await screen.findByText('Test title 1')).toBeInTheDocument();
    expect(screen.getByText('Test name 1')).toBeInTheDocument();

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
      entityType: 'investigation',
      id: 1,
      name: 'Test 1',
      parentEntities: [],
    };

    cartItems.push(addedCartItem);

    renderComponent();

    // wait for data to finish loading
    expect(await screen.findByText('Test title 1')).toBeInTheDocument();
    expect(screen.getByText('Test name 1')).toBeInTheDocument();

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
      await screen.findByTestId('investigation-details-panel')
    ).toBeInTheDocument();
  });

  it('displays correct details panel for ISIS when expanded', async () => {
    renderComponent('isis');

    await user.click(
      await screen.findByRole('button', { name: 'Show details' })
    );

    expect(
      await screen.findByTestId('isis-investigation-details-panel')
    ).toBeInTheDocument();
  });

  it('can navigate using the details panel for ISIS when there are facility cycles', async () => {
    renderComponent('isis');

    await user.click(
      await screen.findByRole('button', { name: 'Show details' })
    );

    await user.click(
      await screen.findByRole('tab', {
        name: 'investigations.details.datasets',
      })
    );

    expect(history.location.pathname).toBe(
      '/browse/instrument/3/facilityCycle/4/investigation/1/dataset'
    );
  });

  it('displays correct details panel for DLS when expanded', async () => {
    renderComponent('dls');

    await user.click(
      await screen.findByRole('button', { name: 'Show details' })
    );

    expect(
      await screen.findByTestId('dls-visit-details-panel')
    ).toBeInTheDocument();
  });

  it('renders fine with incomplete data', () => {
    // this can happen when navigating between tables and the previous table's state still exists
    // also tests that empty arrays are fine for investigationInstruments
    searchResponse = {
      results: [
        {
          ...mockSearchResults[0],
          source: {
            id: 1,
            name: 'test',
            title: 'test',
            visitId: '1',
            doi: 'Test 1',
            investigationinstrument: [],
          },
        },
      ],
    };

    expect(() => renderComponent()).not.toThrowError();
  });

  it('renders generic link correctly & pending count correctly', async () => {
    (axios.get as jest.Mock).mockImplementation(
      (url: string, config: AxiosRequestConfig) => {
        if (/.*\/datasets\/count$/.test(url)) {
          return new Promise((_) => {
            // never resolve the promise to pretend it is loading
          });
        }
        return mockAxiosGet(url, config);
      }
    );
    renderComponent('data');

    expect(await screen.findByText('Test title 1')).toHaveAttribute(
      'href',
      '/browse/investigation/1/dataset'
    );
    expect(await screen.findByText('Calculating...')).toBeInTheDocument();
  });

  it("renders DLS link correctly and doesn't allow for cart selection", async () => {
    renderComponent('dls');

    expect(await screen.findByText('Test title 1')).toHaveAttribute(
      'href',
      '/browse/proposal/Test name 1/investigation/1/dataset'
    );
    expect(screen.queryByRole('checkbox', { name: 'select row 0' })).toBeNull();
  });

  it('renders ISIS link & file sizes correctly', async () => {
    (axios.get as jest.Mock).mockImplementation(
      (url: string, config: AxiosRequestConfig) => {
        if (/.*\/facilitycycles$/.test(url)) {
          return Promise.resolve({
            data: [
              {
                id: 2,
                name: 'facility cycle name',
                startDate: '2000-06-10',
                endDate: '2020-06-11',
              },
            ],
          });
        }
        return mockAxiosGet(url, config);
      }
    );

    renderComponent('isis');

    expect(
      await screen.findByRole('link', { name: 'Test title 1' })
    ).toHaveAttribute(
      'href',
      '/browse/instrument/3/facilityCycle/2/investigation/1/dataset'
    );
    expect(await screen.findByText('1 B')).toBeInTheDocument();
  });

  it('does not render ISIS link when instrumentId cannot be found', async () => {
    (axios.get as jest.Mock).mockImplementation(
      (url: string, config: AxiosRequestConfig) => {
        if (/.*\/facilitycycles$/.test(url)) {
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
        return mockAxiosGet(url, config);
      }
    );

    renderComponent('isis');

    await waitFor(async () => {
      // the title should not be rendered as a link...
      expect(screen.queryByRole('link', { name: 'Test title 1' })).toBeNull();
      // ...but it should still be rendered as a normal text
      expect(screen.getByText('Test title 1')).toBeInTheDocument();
      expect(await screen.findByText('1 B')).toBeInTheDocument();
    });
  });

  it('does not render ISIS link when facilityCycleId cannot be found', async () => {
    (axios.get as jest.Mock).mockImplementation(
      (url: string, config: AxiosRequestConfig) => {
        if (/.*\/facilitycycles$/.test(url)) {
          return Promise.resolve({
            data: [],
          });
        }
        return mockAxiosGet(url, config);
      }
    );

    renderComponent('isis');

    await waitFor(async () => {
      // the title should not be rendered as a link...
      expect(screen.queryByRole('link', { name: 'Test title 1' })).toBeNull();
      // ...but it should still be rendered as a normal text
      expect(screen.getByText('Test title 1')).toBeInTheDocument();
      expect(await screen.findByText('1 B')).toBeInTheDocument();
    });
  });

  it('does not render ISIS link when facilityCycleId has incompatible dates', async () => {
    (axios.get as jest.Mock).mockImplementation(
      (url: string, config: AxiosRequestConfig) => {
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
        return mockAxiosGet(url, config);
      }
    );

    renderComponent('isis');

    await waitFor(async () => {
      // the title should not be rendered as a link...
      expect(screen.queryByRole('link', { name: 'Test title 1' })).toBeNull();
      // ...but it should still be rendered as a normal text
      expect(screen.getByText('Test title 1')).toBeInTheDocument();
      expect(await screen.findByText('1 B')).toBeInTheDocument();
    });
  });
});
