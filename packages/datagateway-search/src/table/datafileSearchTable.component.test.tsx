import * as React from 'react';
import DatafileSearchTable from './datafileSearchTable.component';
import { initialState as dgSearchInitialState } from '../state/reducers/dgsearch.reducer';
import configureStore from 'redux-mock-store';
import { StateType } from '../state/app.types';
import {
  dGCommonInitialState,
  DownloadCartItem,
  SearchResponse,
  SearchResult,
  SearchResultSource,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { Router } from 'react-router-dom';
import { createMemoryHistory, History } from 'history';
import { QueryClient, QueryClientProvider } from 'react-query';
import {
  findAllRows,
  findCellInRow,
  findColumnHeaderByName,
  findColumnIndexByName,
  findRowAt,
  queryAllRows,
} from '../setupTests';
import {
  render,
  type RenderResult,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

describe('Datafile search table component', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let history: History;
  let queryClient: QueryClient;
  let user: ReturnType<typeof userEvent.setup>;
  let cartItems: DownloadCartItem[];
  let rowData: SearchResultSource;
  let searchResult: SearchResult;
  let holder: HTMLElement;

  const renderComponent = (hierarchy?: string): RenderResult =>
    render(
      <Provider store={mockStore(state)}>
        <Router history={history}>
          <QueryClientProvider client={queryClient}>
            <DatafileSearchTable hierarchy={hierarchy ?? ''} />
          </QueryClientProvider>
        </Router>
      </Provider>
    );

  function mockAxiosGet(
    url: string,
    config: AxiosRequestConfig
  ): Promise<Partial<AxiosResponse>> {
    if (/\/user\/cart\/$/.test(url)) {
      // fetch download cart
      return Promise.resolve({
        data: { cartItems: [] },
      });
    }

    if (/\/search\/documents$/.test(url)) {
      if (config.params.query.filter) {
        // filter is applied
        return Promise.resolve<Partial<AxiosResponse<Partial<SearchResponse>>>>(
          {
            data: {
              dimensions: {
                'Datafile.datafileFormat.name': {
                  txt: 1,
                },
              },
              results: [],
            },
          }
        );
      }

      // query lucene data
      return Promise.resolve<Partial<AxiosResponse<Partial<SearchResponse>>>>({
        data: {
          dimensions: {
            'Datafile.datafileFormat.name': {
              txt: 1,
            },
          },
          results: [searchResult],
        },
      });
    }

    if (/\/datafiles$/.test(url)) {
      return Promise.resolve({
        data: [
          {
            id: 1,
            name: 'Datafile test name',
            description: 'Test datafile description',
            location: '/datafiletest',
            fileSize: 1,
          },
        ],
      });
    }

    return Promise.reject(`endpoint not mocked: ${url}`);
  }

  beforeEach(() => {
    history = createMemoryHistory();
    user = userEvent.setup();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    holder = document.createElement('div');
    holder.setAttribute('id', 'datagateway-dataview');
    document.body.appendChild(holder);

    state = JSON.parse(
      JSON.stringify({
        dgcommon: dGCommonInitialState,
        dgsearch: dgSearchInitialState,
      })
    );

    cartItems = [];
    rowData = {
      id: 1,
      name: 'Datafile test name',
      location: '/datafiletest',
      fileSize: 1,
      date: 1563854400000,
      'dataset.id': 2,
      'dataset.name': 'Dataset test name',
      'investigation.id': 3,
      'investigation.title': 'Investigation test title',
      'investigation.name': 'Investigation test name',
      'investigation.startDate': 1560139200000,
      investigationinstrument: [
        {
          'instrument.id': 5,
          'instrument.name': 'LARMOR',
        },
      ],
      investigationfacilitycycle: [
        {
          'facilityCycle.id': 6,
        },
      ],
    };
    searchResult = {
      score: 1,
      id: 1,
      source: rowData,
    };

    axios.get = jest.fn().mockImplementation(mockAxiosGet);

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
                  cardItems: [],
                },
              });
            }

            cartItems = [
              ...cartItems,
              {
                id: 1,
                entityId: 1,
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

    const searchParams = new URLSearchParams();
    searchParams.append('searchText', 'test search');
    history.replace({
      search: `?${searchParams.toString()}`,
    });
  });

  afterEach(() => {
    document.body.removeChild(holder);
    jest.clearAllMocks();
  });

  it('renders nothing if datafile search is disabled', async () => {
    history.replace({ search: 'datafile=false' });

    renderComponent();

    // check that column headers are shown correctly.
    expect(await findColumnHeaderByName('datafiles.name')).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('datafiles.location')
    ).toBeInTheDocument();
    expect(await findColumnHeaderByName('datafiles.size')).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('datafiles.dataset')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('datafiles.modified_time')
    ).toBeInTheDocument();

    // wait for queries to finish fetching
    await waitFor(() => !queryClient.isFetching());

    expect(queryAllRows()).toHaveLength(0);
  });

  it('renders search results correctly', async () => {
    renderComponent();

    // check that column headers are shown correctly.
    expect(await findColumnHeaderByName('datafiles.name')).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('datafiles.location')
    ).toBeInTheDocument();
    expect(await findColumnHeaderByName('datafiles.size')).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('datafiles.dataset')
    ).toBeInTheDocument();
    expect(
      await findColumnHeaderByName('datafiles.modified_time')
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
      name: 'Toggle facetDimensionLabel.Datafile.datafileFormat.name filter panel',
    });

    expect(accordion).toBeInTheDocument();

    await user.click(accordion);

    const filterPanel = await screen.findByLabelText(
      'facetDimensionLabel.Datafile.datafileFormat.name filter panel'
    );

    expect(filterPanel).toBeInTheDocument();
    expect(
      within(filterPanel).getByRole('button', { name: 'Add txt filter' })
    ).toBeInTheDocument();

    const row = rows[0];

    // each cell in the row should contain the correct value
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('datafiles.name'),
        })
      ).getByText('Datafile test name')
    ).toBeInTheDocument();
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('datafiles.location'),
        })
      ).getByText('/datafiletest')
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
          columnIndex: await findColumnIndexByName('datafiles.dataset'),
        })
      ).getByText('Dataset test name')
    ).toBeInTheDocument();
    expect(
      within(
        findCellInRow(row, {
          columnIndex: await findColumnIndexByName('datafiles.modified_time'),
        })
      ).getByText('23/07/2019')
    ).toBeInTheDocument();
  });

  it('applies selected facet filters correctly', async () => {
    renderComponent();

    // check that no filter chip is visible initially
    const selectedFilters = await screen.findByLabelText('selectedFilters');
    expect(
      within(selectedFilters).queryAllByText(/^facetDimensionLabel.*/)
    ).toHaveLength(0);

    // expand accordion
    await user.click(
      await screen.findByRole('button', {
        name: 'Toggle facetDimensionLabel.Datafile.datafileFormat.name filter panel',
      })
    );
    // select the filter
    await user.click(
      await screen.findByRole('button', {
        name: 'Add txt filter',
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
        name: 'Toggle facetDimensionLabel.Datafile.datafileFormat.name filter panel',
      })
    );

    const selectedFilterItem = await screen.findByRole('button', {
      name: 'Remove txt filter',
    });

    expect(selectedFilterItem).toBeInTheDocument();
    expect(within(selectedFilterItem).getByRole('checkbox')).toBeChecked();

    // the selected filters should be displayed
    expect(selectedFilters).toBeInTheDocument();
    expect(
      within(selectedFilters).getByText(
        'facetDimensionLabel.Datafile.datafileFormat.name: txt'
      )
    ).toBeInTheDocument();
  });

  it('applies filters already present in the URL on first render', async () => {
    const searchParams = new URLSearchParams(history.location.search);
    searchParams.append(
      'filters',
      JSON.stringify({
        'Datafile.datafileFormat.name': ['txt'],
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
        name: 'Toggle facetDimensionLabel.Datafile.datafileFormat.name filter panel',
      })
    );

    // filter should be selected
    const filterItem = await screen.findByRole('button', {
      name: 'Remove txt filter',
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
        'Datafile.datafileFormat.name': ['txt'],
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
        name: 'Toggle facetDimensionLabel.Datafile.datafileFormat.name filter panel',
      })
    );

    await user.click(
      await screen.findByRole('button', {
        name: 'Remove txt filter',
      })
    );

    // apply the changes
    await user.click(screen.getByRole('button', { name: 'facetPanel.apply' }));

    expect(await findAllRows()).toHaveLength(1);

    const selectedFilterChips = screen.getByLabelText('selectedFilters');
    // check that the filter chip is removed
    expect(
      within(selectedFilterChips).queryByRole('button', {
        name: 'facetDimensionLabel.Datafile.datafileFormat.name: txt',
      })
    ).toBeNull();

    // expand accordion
    await user.click(
      await screen.findByRole('button', {
        name: 'Toggle facetDimensionLabel.Datafile.datafileFormat.name filter panel',
      })
    );

    // filter item should not be selected anymore
    const filterItem = await screen.findByRole('button', {
      name: 'Add txt filter',
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
        'Datafile.datafileFormat.name': ['txt'],
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
      name: 'facetDimensionLabel.Datafile.datafileFormat.name: txt',
    });

    await user.click(within(chip).getByTestId('CancelIcon'));

    expect(await findAllRows()).toHaveLength(1);

    // check that the filter chip is removed
    expect(
      within(selectedFilterChips).queryByRole('button', {
        name: 'facetDimensionLabel.Datafile.datafileFormat.name: txt',
      })
    ).toBeNull();

    // expand accordion
    await user.click(
      await screen.findByRole('button', {
        name: 'Toggle facetDimensionLabel.Datafile.datafileFormat.name filter panel',
      })
    );

    // filter item should not be selected anymore
    const filterItem = await screen.findByRole('button', {
      name: 'Add txt filter',
    });

    expect(filterItem).toBeInTheDocument();
    expect(filterItem).toHaveAttribute('aria-selected', 'false');
    expect(within(filterItem).getByRole('checkbox')).not.toBeChecked();
  });

  it('adds/removes rows to/from download cart', async () => {
    const searchParams = new URLSearchParams();
    searchParams.append('searchText', 'test search');

    history.push({
      search: `?${searchParams.toString()}`,
    });

    renderComponent();

    const checkbox = await screen.findByRole('checkbox', {
      name: 'select row 0',
    });

    expect(checkbox).not.toBeChecked();
    expect(cartItems).toHaveLength(0);

    await user.click(checkbox);

    await waitFor(() => {
      expect(checkbox).toBeChecked();
      expect(cartItems).toHaveLength(1);
    });

    await user.click(checkbox);

    await waitFor(() => {
      expect(checkbox).not.toBeChecked();
      expect(cartItems).toHaveLength(0);
    });
  });

  it('selected rows only considers relevant cart items', async () => {
    cartItems = [
      {
        entityId: 1,
        entityType: 'dataset',
        id: 1,
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
    ];

    renderComponent();

    const selectAllCheckbox = await screen.findByRole('checkbox', {
      name: 'select all rows',
    });

    expect(selectAllCheckbox).not.toBeChecked();
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

    let rows: HTMLElement[];
    await waitFor(async () => {
      rows = await findAllRows();
      expect(rows).toHaveLength(1);
    });

    const row = rows[0];
    await user.click(within(row).getByRole('button', { name: 'Show details' }));

    const detailsPanel = await screen.findByTestId('datafile-details-panel');

    expect(detailsPanel).toBeInTheDocument();
    expect(
      within(detailsPanel).getByText('Datafile test name')
    ).toBeInTheDocument();
    expect(within(detailsPanel).getByText('1 B')).toBeInTheDocument();
    expect(within(detailsPanel).getByText('/datafiletest')).toBeInTheDocument();
  });

  it('displays correct details panel for ISIS when expanded', async () => {
    renderComponent('isis');

    let rows: HTMLElement[];
    await waitFor(async () => {
      rows = await findAllRows();
      expect(rows).toHaveLength(1);
    });

    const row = rows[0];
    await user.click(within(row).getByRole('button', { name: 'Show details' }));

    const detailsPanel = await screen.findByTestId(
      'isis-datafile-details-panel'
    );

    expect(detailsPanel).toBeInTheDocument();
    expect(
      within(detailsPanel).getByText('Datafile test name')
    ).toBeInTheDocument();
    expect(
      within(detailsPanel).getByText('Test datafile description')
    ).toBeInTheDocument();
    expect(within(detailsPanel).getByText('/datafiletest')).toBeInTheDocument();
    expect(
      within(detailsPanel).getByRole('tab', { name: 'datafiles.details.label' })
    ).toBeInTheDocument();
    expect(
      within(detailsPanel).queryByRole('tab', {
        name: 'datafiles.details.parameters.label',
      })
    ).toBeNull();
  });

  it('displays correct details panel for DLS when expanded', async () => {
    renderComponent('dls');

    let rows: HTMLElement[];
    await waitFor(async () => {
      rows = await findAllRows();
      expect(rows).toHaveLength(1);
    });

    const row = rows[0];
    await user.click(within(row).getByRole('button', { name: 'Show details' }));

    const detailsPanel = await screen.findByTestId(
      'dls-datafile-details-panel'
    );

    expect(detailsPanel).toBeInTheDocument();
    expect(
      within(detailsPanel).getByText('Datafile test name')
    ).toBeInTheDocument();
    expect(within(detailsPanel).getByText('1 B')).toBeInTheDocument();
    expect(within(detailsPanel).getByText('/datafiletest')).toBeInTheDocument();
  });

  it('renders generic link correctly', async () => {
    renderComponent('data');

    const datasetColIndex = await findColumnIndexByName('datafiles.dataset');

    const row = await findRowAt(0);
    const datasetLinkCell = await findCellInRow(row, {
      columnIndex: datasetColIndex,
    });

    expect(
      within(datasetLinkCell).getByRole('link', { name: 'Dataset test name' })
    ).toHaveAttribute('href', '/browse/investigation/3/dataset/2/datafile');
  });

  it('renders DLS link correctly', async () => {
    renderComponent('dls');

    expect(
      await screen.findByRole('link', { name: 'Datafile test name' })
    ).toHaveAttribute(
      'href',
      '/browse/proposal/Investigation test name/investigation/3/dataset/2/datafile'
    );
    const datasetColIndex = await findColumnIndexByName('datafiles.name');

    const row = await findRowAt(0);
    const datasetLinkCell = await findCellInRow(row, {
      columnIndex: datasetColIndex,
    });

    expect(
      within(datasetLinkCell).getByRole('link', { name: 'Datafile test name' })
    ).toHaveAttribute(
      'href',
      '/browse/proposal/Investigation test name/investigation/3/dataset/2/datafile'
    );
  });

  it('renders ISIS link correctly', async () => {
    renderComponent('isis');

    const datasetColIndex = await findColumnIndexByName('datafiles.name');

    const row = await findRowAt(0);
    const datasetLinkCell = await findCellInRow(row, {
      columnIndex: datasetColIndex,
    });

    expect(
      within(datasetLinkCell).getByRole('link', { name: 'Datafile test name' })
    ).toHaveAttribute(
      'href',
      '/browse/instrument/5/facilityCycle/6/investigation/3/dataset/2/datafile'
    );
  });

  it('does not render ISIS link when instrumentId cannot be found', async () => {
    delete rowData.investigationinstrument;

    renderComponent('isis');

    const datasetColIndex = await findColumnIndexByName('datafiles.name');

    const row = await findRowAt(0);
    const datasetLinkCell = await findCellInRow(row, {
      columnIndex: datasetColIndex,
    });

    await waitFor(() => {
      expect(
        within(datasetLinkCell).queryByRole('link', {
          name: 'Datafile test name',
        })
      ).toBeNull();
    });

    expect(
      within(datasetLinkCell).getByText('Datafile test name')
    ).toBeInTheDocument();
  });

  it('does not render ISIS link when facilityCycleId cannot be found', async () => {
    delete rowData.investigationfacilitycycle;

    renderComponent('isis');

    const datasetColIndex = await findColumnIndexByName('datafiles.name');

    const row = await findRowAt(0);
    const datasetLinkCell = await findCellInRow(row, {
      columnIndex: datasetColIndex,
    });

    await waitFor(() => {
      expect(
        within(datasetLinkCell).queryByRole('link', {
          name: 'Datafile test name',
        })
      ).toBeNull();
    });

    expect(
      within(datasetLinkCell).getByText('Datafile test name')
    ).toBeInTheDocument();
  });

  it('displays only the datafile name when there is no generic dataset to link to', async () => {
    rowData = {
      id: 1,
      name: 'Datafile test name',
      location: '/datafiletest',
      fileSize: 1,
      date: 1563836400000,
      'investigation.title': 'Investigation test title',
      'investigation.name': 'Investigation test name',
      'investigation.startDate': 1560121200000,
      investigationinstrument: [
        {
          'instrument.id': 5,
          'instrument.name': 'LARMOR',
        },
      ],
      investigationfacilitycycle: [
        {
          'facilityCycle.id': 6,
        },
      ],
    };
    searchResult = {
      score: 1,
      id: 1,
      source: rowData,
    };

    renderComponent('data');

    const datasetColIndex = await findColumnIndexByName('datafiles.name');

    const row = await findRowAt(0);
    const datasetLinkCell = await findCellInRow(row, {
      columnIndex: datasetColIndex,
    });

    await waitFor(() => {
      expect(
        within(datasetLinkCell).queryByRole('link', {
          name: 'Datafile test name',
        })
      ).toBeNull();
    });

    expect(
      within(datasetLinkCell).getByText('Datafile test name')
    ).toBeInTheDocument();
  });

  it('displays only the datafile name when there is no DLS dataset to link to', async () => {
    rowData = {
      id: 1,
      name: 'Datafile test name',
      location: '/datafiletest',
      fileSize: 1,
      date: 1563836400000,
      'investigation.title': 'Investigation test title',
      'investigation.startDate': 1560121200000,
      investigationinstrument: [
        {
          'instrument.id': 5,
          'instrument.name': 'LARMOR',
        },
      ],
      investigationfacilitycycle: [
        {
          'facilityCycle.id': 6,
        },
      ],
    };
    searchResult = {
      score: 1,
      id: 1,
      source: rowData,
    };

    renderComponent('dls');

    const datasetColIndex = await findColumnIndexByName('datafiles.name');

    const row = await findRowAt(0);
    const datasetLinkCell = await findCellInRow(row, {
      columnIndex: datasetColIndex,
    });

    await waitFor(() => {
      expect(
        within(datasetLinkCell).queryByRole('link', {
          name: 'Datafile test name',
        })
      ).toBeNull();
    });

    expect(
      within(datasetLinkCell).getByText('Datafile test name')
    ).toBeInTheDocument();
  });

  it('displays only the datafile name when there is no ISIS investigation to link to', async () => {
    rowData = {
      id: 1,
      name: 'Datafile test name',
      location: '/datafiletest',
      fileSize: 1,
      date: 1563836400000,
      'dataset.id': 2,
      'dataset.name': 'Dataset test name',
      'investigation.id': 3,
      'investigation.title': 'Investigation test title',
      'investigation.name': 'Investigation test name',
      'investigation.startDate': 1560121200000,
    };
    searchResult = {
      score: 1,
      id: 1,
      source: rowData,
    };

    renderComponent('isis');

    const datasetColIndex = await findColumnIndexByName('datafiles.name');

    const row = await findRowAt(0);
    const datasetLinkCell = await findCellInRow(row, {
      columnIndex: datasetColIndex,
    });

    await waitFor(() => {
      expect(
        within(datasetLinkCell).queryByRole('link', {
          name: 'Datafile test name',
        })
      ).toBeNull();
    });

    expect(
      within(datasetLinkCell).getByText('Datafile test name')
    ).toBeInTheDocument();
  });
});
