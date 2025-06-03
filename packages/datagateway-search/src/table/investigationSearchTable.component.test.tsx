import { initialState } from '../state/reducers/dgsearch.reducer';
import configureStore from 'redux-mock-store';
import type { StateType } from '../state/app.types';
import {
  dGCommonInitialState,
  type DownloadCartItem,
  type SearchResponse,
  type SearchResult,
  FACILITY_NAME,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryHistory, type History } from 'history';
import { Router } from 'react-router-dom';
import InvestigationSearchTable from './investigationSearchTable.component';
import userEvent from '@testing-library/user-event';
import {
  render,
  type RenderResult,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import axios, { AxiosRequestConfig, type AxiosResponse } from 'axios';
import { mockInvestigation } from '../testData';
import {
  findAllRows,
  findCellInRow,
  findColumnHeaderByName,
  findColumnIndexByName,
  queryAllRows,
} from '../setupTests';

vi.mock('datagateway-common', async () => {
  const originalModule = await vi.importActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    handleICATError: vi.fn(),
  };
});

describe('Investigation Search Table component', () => {
  const mockStore = configureStore([thunk]);
  let container: HTMLDivElement;
  let state: StateType;
  let history: History;
  let user: ReturnType<typeof userEvent.setup>;
  let queryClient: QueryClient;

  let cartItems: DownloadCartItem[];
  let searchResponse: SearchResponse;
  let searchResult: SearchResult;

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
  const mockAxiosGet = (
    url: string,
    config: AxiosRequestConfig
  ): Promise<Partial<AxiosResponse>> => {
    if (/.*\/user\/cart\/.*$/.test(url)) {
      // fetchDownloadCart
      return Promise.resolve({ data: { cartItems } });
    }

    if (/.*\/user\/queue\/allowed$/.test(url)) {
      // fetchDownloadCart
      return Promise.resolve({ data: { cartItems } });
    }

    if (/.*\/search\/documents$/.test(url)) {
      // fetchLuceneData

      if ((config.params as URLSearchParams).get('query')?.includes('filter')) {
        // filter is applied
        return Promise.resolve<Partial<AxiosResponse<Partial<SearchResponse>>>>(
          {
            data: {
              dimensions: {
                'Investigation.type.name': {
                  experiment: 10,
                  calibration: 20,
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

    if (/.*\/investigations$/.test(url)) {
      return Promise.resolve({
        data: [mockInvestigation],
      });
    }

    return Promise.reject();
  };

  beforeEach(() => {
    user = userEvent.setup();

    history = createMemoryHistory({
      initialEntries: [
        { search: 'searchText=test search&currentTab=investigation' },
      ],
    });
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
    searchResult = {
      score: 1,
      id: 1,
      source: {
        id: 1,
        title: 'Test title 1',
        name: 'Test name 1',
        fileSize: 1,
        fileCount: 1,
        summary: 'foo bar',
        visitId: '1',
        doi: 'doi 1',
        investigationinstrument: [
          {
            'instrument.id': 3,
            'instrument.name': 'LARMOR',
          },
        ],
        investigationfacilitycycle: [
          {
            'facilityCycle.id': 5,
          },
        ],
        startDate: 1560139200000,
        endDate: 1560225600000,
        'facility.name': 'facility name',
        'facility.id': 2,
      },
    };

    searchResponse = {
      dimensions: {
        'Investigation.type.name': {
          experiment: 10,
          calibration: 20,
        },
      },
      results: [searchResult],
    };

    axios.get = vi.fn().mockImplementation(mockAxiosGet);

    axios.post = vi.fn().mockImplementation((url: string) => {
      if (/.*\/user\/cart\/.*\/cartItems$/.test(url)) {
        return Promise.resolve({ data: { cartItems } });
      }
      return Promise.reject();
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('disables the search query if investigation search is disabled', async () => {
    const searchParams = new URLSearchParams(history.location.search);
    searchParams.append('investigation', 'false');
    history.replace({ search: `?${searchParams.toString()}` });

    renderComponent();

    // check that column headers are shown correctly.
    expect(
      await findColumnHeaderByName('investigations.title')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('investigations.visit_id')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('investigations.name')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('investigations.doi')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('investigations.size')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('investigations.instrument')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('investigations.start_date')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('investigations.end_date')
    ).toBeInTheDocument();

    // wait for queries to finish fetching
    await waitFor(() => !queryClient.isFetching());

    expect(
      queryClient.getQueryState(['search', 'Investigation'], { exact: false })
        ?.status
    ).toBe('loading');
    expect(
      queryClient.getQueryState(['search', 'Investigation'], { exact: false })
        ?.fetchStatus
    ).toBe('idle');

    expect(queryAllRows()).toHaveLength(0);
  });

  it('renders search results correctly', async () => {
    renderComponent();

    // check that column headers are shown correctly.
    expect(
      await findColumnHeaderByName('investigations.title')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('investigations.visit_id')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('investigations.name')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('investigations.doi')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('investigations.size')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('investigations.instrument')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('investigations.start_date')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('investigations.end_date')
    ).toBeInTheDocument();

    const rows = await findAllRows();
    expect(rows).toHaveLength(1);

    // check that facet filter panel is present
    expect(screen.getByText('facetPanel.title')).toBeInTheDocument();
    // apply filter button should be invisible initially
    expect(
      screen.queryByRole('button', { name: 'facetPanel.apply' })
    ).toBeNull();

    const accordion = screen.getByRole('button', {
      name: 'Toggle facetDimensionLabel.Investigation.type.name filter panel',
    });

    expect(accordion).toBeInTheDocument();

    await user.click(accordion);

    const filterPanel = await screen.getByLabelText(
      'facetDimensionLabel.Investigation.type.name filter panel'
    );

    expect(filterPanel).toBeInTheDocument();

    const experimentFilter = within(filterPanel).getByRole('button', {
      name: 'Add experiment filter',
    });
    const calibrationFilter = within(filterPanel).getByRole('button', {
      name: 'Add calibration filter',
    });

    // check that filter items are present and that they show the correct value and count
    expect(experimentFilter).toBeInTheDocument();
    expect(calibrationFilter).toBeInTheDocument();
    expect(
      within(experimentFilter).getByText('experiment')
    ).toBeInTheDocument();
    expect(within(experimentFilter).getByText('10')).toBeInTheDocument();
    expect(
      within(calibrationFilter).getByText('calibration')
    ).toBeInTheDocument();
    expect(within(calibrationFilter).getByText('20')).toBeInTheDocument();

    const row = rows[0];

    // each cell in the row should contain the correct value
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('investigations.title'),
        })
      ).getByText('Test title 1')
    ).toBeInTheDocument();
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('investigations.visit_id'),
        })
      ).getByText('1')
    ).toBeInTheDocument();

    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('investigations.name'),
        })
      ).getByText('Test name 1')
    ).toBeInTheDocument();
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('investigations.doi'),
        })
      ).getByRole('link', { name: 'doi 1' })
    ).toHaveAttribute('href', 'https://doi.org/doi 1');
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('investigations.size'),
        })
      ).getByText('1 B')
    ).toBeInTheDocument();
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
      ).getByText('10/06/2019')
    ).toBeInTheDocument();
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('investigations.end_date'),
        })
      ).getByText('11/06/2019')
    ).toBeInTheDocument();
  });

  it('displays investigation size for isis', async () => {
    renderComponent('isis');

    // check that column headers are shown correctly.
    expect(
      await findColumnHeaderByName('investigations.title')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('investigations.visit_id')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('investigations.name')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('investigations.doi')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('investigations.size')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('investigations.instrument')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('investigations.start_date')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('investigations.end_date')
    ).toBeInTheDocument();

    const rows = await findAllRows();
    expect(rows).toHaveLength(1);

    const row = rows[0];

    // each cell in the row should contain the correct value
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('investigations.title'),
        })
      ).getByText('Test title 1')
    ).toBeInTheDocument();
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('investigations.visit_id'),
        })
      ).getByText('1')
    ).toBeInTheDocument();

    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('investigations.name'),
        })
      ).getByText('Test name 1')
    ).toBeInTheDocument();
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('investigations.doi'),
        })
      ).getByRole('link', { name: 'doi 1' })
    ).toHaveAttribute('href', 'https://doi.org/doi 1');
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('investigations.size'),
        })
      ).getByText('1 B')
    ).toBeInTheDocument();
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
      ).getByText('10/06/2019')
    ).toBeInTheDocument();
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('investigations.end_date'),
        })
      ).getByText('11/06/2019')
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
        name: 'Toggle facetDimensionLabel.Investigation.type.name filter panel',
      })
    );
    // select the filter
    await user.click(
      await screen.findByRole('button', {
        name: 'Add calibration filter',
      })
    );
    // apply the filter
    await user.click(screen.getByRole('button', { name: 'facetPanel.apply' }));

    // when filter is applied, the fake axios get will return nothing
    // so we should expect no rows in the table
    await waitFor(() => {
      expect(queryAllRows()).toHaveLength(0);
    });

    // expand accordion
    await user.click(
      await screen.findByRole('button', {
        name: 'Toggle facetDimensionLabel.Investigation.type.name filter panel',
      })
    );

    const selectedFilterItem = await screen.findByRole('button', {
      name: 'Remove calibration filter',
    });

    expect(selectedFilterItem).toBeInTheDocument();
    expect(selectedFilterItem).toHaveAttribute('aria-selected', 'true');
    expect(within(selectedFilterItem).getByRole('checkbox')).toBeChecked();

    // the selected filters should be displayed
    expect(selectedFilters).toBeInTheDocument();
    expect(
      within(selectedFilters).getByText(
        'facetDimensionLabel.Investigation.type.name: calibration'
      )
    ).toBeInTheDocument();

    // the rest of the filters should also be displayed but they should not be selected
    const experimentFilter = screen.getByRole('button', {
      name: 'Add experiment filter',
    });
    expect(experimentFilter).toBeInTheDocument();
    expect(experimentFilter).toHaveAttribute('aria-selected', 'false');
    expect(within(experimentFilter).getByRole('checkbox')).not.toBeChecked();
  });

  it('applies filters already present in the URL on first render', async () => {
    const searchParams = new URLSearchParams(history.location.search);
    searchParams.append(
      'filters',
      JSON.stringify({
        'Investigation.type.name': ['experiment'],
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
        name: 'Toggle facetDimensionLabel.Investigation.type.name filter panel',
      })
    );

    // filter should be selected
    const filterItem = await screen.findByRole('button', {
      name: 'Remove experiment filter',
    });
    expect(filterItem).toBeInTheDocument();
    expect(filterItem).toHaveAttribute('aria-selected', 'true');
    expect(within(filterItem).getByRole('checkbox')).toBeChecked();

    // the rest of the filters should also be displayed but they should not be selected
    const calibrationFilter = screen.getByRole('button', {
      name: 'Add calibration filter',
    });
    expect(calibrationFilter).toBeInTheDocument();
    expect(calibrationFilter).toHaveAttribute('aria-selected', 'false');
    expect(within(calibrationFilter).getByRole('checkbox')).not.toBeChecked();
  });

  it('allows filters to be removed through the facet filter panel', async () => {
    const searchParams = new URLSearchParams(history.location.search);
    searchParams.append(
      'filters',
      JSON.stringify({
        'Investigation.type.name': ['experiment'],
      })
    );
    history.replace({ search: `?${searchParams.toString()}` });

    renderComponent();

    const selectedFilterChips = await screen.findByLabelText('selectedFilters');

    expect(
      within(selectedFilterChips).getByRole('button', {
        name: 'facetDimensionLabel.Investigation.type.name: experiment',
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
        name: 'Toggle facetDimensionLabel.Investigation.type.name filter panel',
      })
    );

    await user.click(
      await screen.findByRole('button', {
        name: 'Remove experiment filter',
      })
    );

    // apply the changes
    await user.click(screen.getByRole('button', { name: 'facetPanel.apply' }));

    expect(await findAllRows()).toHaveLength(1);

    // check that the filter chip is removed
    expect(
      within(selectedFilterChips).queryByRole('button', {
        name: 'facetDimensionLabel.Investigation.type.name: experiment',
      })
    ).toBeNull();

    // expand accordion
    await user.click(
      await screen.findByRole('button', {
        name: 'Toggle facetDimensionLabel.Investigation.type.name filter panel',
      })
    );

    // filter item should not be selected anymore
    const filterItem = await screen.findByRole('button', {
      name: 'Add experiment filter',
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
        'Investigation.type.name': ['calibration'],
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
      name: 'facetDimensionLabel.Investigation.type.name: calibration',
    });

    await user.click(within(chip).getByTestId('CancelIcon'));

    expect(await findAllRows()).toHaveLength(1);

    // check that the filter chip is removed
    expect(
      within(selectedFilterChips).queryByRole('button', {
        name: 'facetDimensionLabel.Investigation.type.name: calibration',
      })
    ).toBeNull();

    // expand accordion
    await user.click(
      await screen.findByRole('button', {
        name: 'Toggle facetDimensionLabel.Investigation.type.name filter panel',
      })
    );

    // filter item should not be selected anymore
    const filterItem = await screen.findByRole('button', {
      name: 'Add calibration filter',
    });
    expect(filterItem).toBeInTheDocument();
    expect(filterItem).toHaveAttribute('aria-selected', 'false');
    expect(within(filterItem).getByRole('checkbox')).not.toBeChecked();
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

    // the checkbox should not be checked
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
    renderComponent(FACILITY_NAME.isis);

    await user.click(
      await screen.findByRole('button', { name: 'Show details' })
    );

    expect(
      await screen.findByTestId('isis-investigation-details-panel')
    ).toBeInTheDocument();
  });

  it('can navigate using the details panel for ISIS when there are facility cycles', async () => {
    renderComponent(FACILITY_NAME.isis);

    await user.click(
      await screen.findByRole('button', { name: 'Show details' })
    );

    await user.click(
      await screen.findByRole('tab', {
        name: 'investigations.details.datasets',
      })
    );

    expect(history.location.pathname).toBe(
      '/browse/instrument/3/facilityCycle/5/investigation/1/dataset'
    );
  });

  it('displays correct details panel for DLS when expanded', async () => {
    state.dgcommon.accessMethods = {};
    renderComponent(FACILITY_NAME.dls);

    await user.click(
      await screen.findByRole('button', { name: 'Show details' })
    );

    expect(
      await screen.findByTestId('dls-visit-details-panel')
    ).toBeInTheDocument();
  });

  it('renders fine with incomplete data', async () => {
    // this can happen when navigating between tables and the previous table's state still exists
    // also tests that empty arrays are fine for investigationInstruments & investigationFacilityCycles
    searchResponse = {
      results: [
        {
          ...searchResult,
          source: {
            id: 1,
            name: 'test',
            title: 'test',
            visitId: '1',
            doi: 'Test 1',
            investigationinstrument: [],
            investigationfacilitycycle: [],
          },
        },
      ],
    };

    renderComponent(FACILITY_NAME.isis);

    await user.click(
      await screen.findByRole('button', { name: 'Show details' })
    );

    expect(
      await screen.findByTestId('isis-investigation-details-panel')
    ).toBeInTheDocument();
  });

  it('renders generic link correctly correctly', async () => {
    renderComponent('data');

    expect(await screen.findByText('Test title 1')).toHaveAttribute(
      'href',
      '/browse/investigation/1/dataset'
    );
  });

  it("renders DLS link correctly and doesn't allow for cart selection or DOI column", async () => {
    renderComponent(FACILITY_NAME.dls);

    expect(await screen.findByText('Test title 1')).toHaveAttribute(
      'href',
      '/browse/proposal/Test name 1/investigation/1/dataset'
    );
    expect(screen.queryByRole('checkbox', { name: 'select row 0' })).toBeNull();
    expect(screen.queryByRole('columnheader', { name: 'DOI' })).toBeNull();
  });

  it('renders ISIS link & file sizes correctly', async () => {
    renderComponent(FACILITY_NAME.isis);

    expect(
      await screen.findByRole('link', { name: 'Test title 1' })
    ).toHaveAttribute(
      'href',
      '/browse/instrument/3/facilityCycle/5/investigation/1/dataset'
    );
    expect(await screen.findByText('1 B')).toBeInTheDocument();
  });

  it('does not render ISIS link when instrumentId cannot be found', async () => {
    delete searchResult.source.investigationinstrument;

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
    delete searchResult.source.investigationfacilitycycle;

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
