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
  within,
} from '@testing-library/react';
import axios, { AxiosRequestConfig, type AxiosResponse } from 'axios';
import { mockDataset } from '../testData';
import type { UserEvent } from '@testing-library/user-event/dist/types/setup';
import userEvent from '@testing-library/user-event';
import {
  findAllRows,
  findCellInRow,
  findColumnHeaderByName,
  findColumnIndexByName,
  queryAllRows,
} from '../setupTests';

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
  const mockAxiosGet = (
    url: string,
    config: AxiosRequestConfig
  ): Promise<Partial<AxiosResponse>> => {
    if (/.*\/user\/cart\/.*$/.test(url)) {
      // fetchDownloadCart
      return Promise.resolve({ data: { cartItems } });
    }
    if (/.*\/search\/documents$/.test(url)) {
      // fetchLuceneData

      if (config.params.query.filter) {
        // filter is applied
        return Promise.resolve<Partial<AxiosResponse<Partial<SearchResponse>>>>(
          {
            data: {
              dimensions: {
                'dataset.name': {
                  asd: 1,
                },
              },
              results: [],
            },
          }
        );
      }

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
      dimensions: {
        'dataset.name': {
          asd: 1,
        },
      },
      results: mockSearchResults,
    };

    axios.get = jest.fn().mockImplementation(mockAxiosGet);
    axios.post = jest.fn().mockImplementation((url: string) => {
      if (/.*\/user\/cart\/.*\/cartItems$/.test(url)) {
        return Promise.resolve({ data: { cartItems } });
      }
      return Promise.reject();
    });

    const searchParams = new URLSearchParams();
    searchParams.append('searchText', 'test search');
    history.replace({
      search: `?${searchParams.toString()}`,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing if no search text is present', async () => {
    history.replace({ search: '' });

    renderComponent();

    // check that column headers are shown correctly.
    expect(await findColumnHeaderByName('datasets.name')).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('datasets.datafile_count')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('datasets.investigation')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('datasets.create_time')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('datasets.modified_time')
    ).toBeInTheDocument();

    // wait for queries to finish fetching
    await waitFor(() => !queryClient.isFetching());

    expect(queryAllRows()).toHaveLength(0);
  });

  it('renders search results correctly', async () => {
    renderComponent();

    // check that column headers are shown correctly.
    expect(await findColumnHeaderByName('datasets.name')).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('datasets.datafile_count')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('datasets.investigation')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('datasets.create_time')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('datasets.modified_time')
    ).toBeInTheDocument();

    const rows = await findAllRows();
    expect(rows).toHaveLength(1);

    // check that facet filter panel is present
    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument();

    const accordion = screen.getByRole('button', {
      name: 'Toggle facetDimensionLabel.dataset.name filter panel',
    });

    expect(accordion).toBeInTheDocument();

    await user.click(accordion);

    const filterPanel = await screen.getByLabelText(
      'facetDimensionLabel.dataset.name filter panel'
    );

    expect(filterPanel).toBeInTheDocument();

    const asdFilter = within(filterPanel).getByRole('button', {
      name: 'Add asd filter',
    });

    expect(asdFilter).toBeInTheDocument();
    expect(within(asdFilter).getByText('asd')).toBeInTheDocument();
    expect(within(asdFilter).getByText('1')).toBeInTheDocument();

    const row = rows[0];

    // each cell in the row should contain the correct value
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('datasets.name'),
        })
      ).getByText('Dataset test name')
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
          columnIndex: await findColumnIndexByName('datasets.investigation'),
        })
      ).getByText('Investigation test title')
    ).toBeInTheDocument();
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('datasets.create_time'),
        })
      ).getByText('24/07/2019')
    ).toBeInTheDocument();
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('datasets.modified_time'),
        })
      ).getByText('25/07/2019')
    ).toBeInTheDocument();
  });

  it('renders search results in isis correctly', async () => {
    renderComponent('isis');

    const rows = await findAllRows();
    expect(rows).toHaveLength(1);

    // check that column headers are shown correctly.
    expect(await findColumnHeaderByName('datasets.name')).toBeInTheDocument();
    expect(await findColumnHeaderByName('datasets.size')).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('datasets.investigation')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('datasets.create_time')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('datasets.modified_time')
    ).toBeInTheDocument();

    const row = rows[0];

    // each cell in the row should contain the correct value
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('datasets.name'),
        })
      ).getByText('Dataset test name')
    ).toBeInTheDocument();
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('datasets.size'),
        })
      ).getByText('1 B')
    ).toBeInTheDocument();
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('datasets.investigation'),
        })
      ).getByText('Investigation test title')
    ).toBeInTheDocument();
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('datasets.create_time'),
        })
      ).getByText('24/07/2019')
    ).toBeInTheDocument();
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('datasets.modified_time'),
        })
      ).getByText('25/07/2019')
    ).toBeInTheDocument();
  });

  it('applies selected filters correctly', async () => {
    renderComponent();

    // check that no filter chip is visible initially
    const selectedFilters = await screen.findByLabelText('selectedFilters');
    expect(
      within(selectedFilters).queryAllByText(/^facetDimensionLabel.*/)
    ).toHaveLength(0);

    // expand accordion
    await user.click(
      await screen.findByRole('button', {
        name: 'Toggle facetDimensionLabel.dataset.name filter panel',
      })
    );
    // select the filter
    await user.click(
      await screen.findByRole('button', {
        name: 'Add asd filter',
      })
    );
    // apply the filter
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    // when filter is applied, the fake axios get will return nothing
    // so we should expect no rows in the table
    await waitFor(() => {
      expect(queryAllRows()).toHaveLength(0);
    });

    // expand accordion
    await user.click(
      await screen.findByRole('button', {
        name: 'Toggle facetDimensionLabel.dataset.name filter panel',
      })
    );

    const selectedFilterItem = await screen.findByRole('button', {
      name: 'Remove asd filter',
    });

    expect(selectedFilterItem).toBeInTheDocument();
    expect(selectedFilterItem).toHaveAttribute('aria-selected', 'true');
    expect(within(selectedFilterItem).getByRole('checkbox')).toBeChecked();

    // the selected filters should be displayed
    expect(selectedFilters).toBeInTheDocument();
    expect(
      within(selectedFilters).getByText('facetDimensionLabel.dataset.name: asd')
    ).toBeInTheDocument();
  });

  it('applies filters already present in the URL on first render', async () => {
    const searchParams = new URLSearchParams(history.location.search);
    searchParams.append(
      'filters',
      JSON.stringify({
        'dataset.name': ['asd'],
      })
    );
    history.replace({ search: `?${searchParams.toString()}` });

    renderComponent();

    // when filters are applied
    // the fake axios.get returns no search results
    // so we should expect no rows in the table
    await waitFor(() => {
      expect(queryAllRows()).toHaveLength(0);
    });

    // expand accordion
    await user.click(
      await screen.findByRole('button', {
        name: 'Toggle facetDimensionLabel.dataset.name filter panel',
      })
    );

    // filter should be selected
    const filterItem = await screen.findByRole('button', {
      name: 'Remove asd filter',
    });
    expect(filterItem).toBeInTheDocument();
    expect(filterItem).toHaveAttribute('aria-selected', 'true');
    expect(within(filterItem).getByRole('checkbox')).toBeChecked();
  });

  it('allows filters to be removed through the facet filter panel', async () => {
    const searchParams = new URLSearchParams(history.location.search);
    searchParams.append(
      'filters',
      JSON.stringify({
        'dataset.name': ['asd'],
      })
    );
    history.replace({ search: `?${searchParams.toString()}` });

    renderComponent();

    const selectedFilterChips = await screen.findByLabelText('selectedFilters');

    expect(
      within(selectedFilterChips).getByRole('button', {
        name: 'facetDimensionLabel.dataset.name: asd',
      })
    ).toBeInTheDocument();

    // when filters are applied
    // the fake axios.get returns no search results
    // so we should expect no rows in the table
    await waitFor(() => {
      expect(queryAllRows()).toHaveLength(0);
    });

    // expand accordion
    await user.click(
      await screen.findByRole('button', {
        name: 'Toggle facetDimensionLabel.dataset.name filter panel',
      })
    );

    await user.click(
      await screen.findByRole('button', {
        name: 'Remove asd filter',
      })
    );

    // apply the changes
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(await findAllRows()).toHaveLength(1);

    // check that the filter chip is removed
    expect(
      within(selectedFilterChips).queryByRole('button', {
        name: 'facetDimensionLabel.dataset.name: paper',
      })
    ).toBeNull();

    // expand accordion
    await user.click(
      await screen.findByRole('button', {
        name: 'Toggle facetDimensionLabel.dataset.name filter panel',
      })
    );

    // filter item should not be selected anymore
    const filterItem = await screen.findByRole('button', {
      name: 'Add asd filter',
    });
    expect(filterItem).toBeInTheDocument();
    expect(filterItem).toHaveAttribute('aria-selected', 'false');
    expect(within(filterItem).getByRole('checkbox')).not.toBeChecked();
  });

  it('allows filters to be removed by removing filter chips', async () => {
    const searchParams = new URLSearchParams(history.location.search);
    searchParams.append(
      'filters',
      JSON.stringify({
        'dataset.name': ['asd'],
      })
    );
    history.replace({ search: `?${searchParams.toString()}` });

    renderComponent();

    // when filters are applied
    // the fake axios.get returns no search results
    // so we should expect no rows in the table
    await waitFor(() => {
      expect(queryAllRows()).toHaveLength(0);
    });

    const selectedFilterChips = screen.getByLabelText('selectedFilters');
    const chip = within(selectedFilterChips).getByRole('button', {
      name: 'facetDimensionLabel.dataset.name: asd',
    });

    await user.click(within(chip).getByTestId('CancelIcon'));

    expect(await findAllRows()).toHaveLength(1);

    // check that the filter chip is removed
    expect(
      within(selectedFilterChips).queryByRole('button', {
        name: 'facetDimensionLabel.dataset.name: asd',
      })
    ).toBeNull();

    // expand accordion
    await user.click(
      await screen.findByRole('button', {
        name: 'Toggle facetDimensionLabel.dataset.name filter panel',
      })
    );

    // filter item should not be selected anymore
    const filterItem = await screen.findByRole('button', {
      name: 'Add asd filter',
    });
    expect(filterItem).toBeInTheDocument();
    expect(filterItem).toHaveAttribute('aria-selected', 'false');
    expect(within(filterItem).getByRole('checkbox')).not.toBeChecked();
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

    // the checkbox should not be checked
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
    (axios.get as jest.Mock).mockImplementation((url: string, config) => {
      if (/.*\/datafiles\/count$/.test(url)) {
        return new Promise((_) => {
          // never resolve the promise to pretend it is loading
        });
      }
      return mockAxiosGet(url, config);
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
    (axios.get as jest.Mock).mockImplementation((url: string, config) => {
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
      return mockAxiosGet(url, config);
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
    axios.get = jest.fn().mockImplementation((url: string, config) => {
      if (/.*\/facilitycycles$/.test(url)) {
        // fetchAllFacilityCycles
        return Promise.resolve({
          data: [
            {
              id: 4,
              name: 'facility cycle name',
              startDate: '2024-06-10',
              endDate: '2025-06-11',
            },
          ],
        });
      }
      return mockAxiosGet(url, config);
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

  it('does not render ISIS link when facilityCycleId has incompatible dates', async () => {
    (axios.get as jest.Mock).mockImplementation((url: string, config) => {
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
