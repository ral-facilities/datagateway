import * as React from 'react';
import type { StateType } from '../state/app.types';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Router } from 'react-router-dom';
import {
  type DatasearchType,
  dGCommonInitialState,
  type SearchResponse,
} from 'datagateway-common';
import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { createMemoryHistory, type History } from 'history';
import { render, screen, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';

import SearchTabs from './searchTabs.component';
import { initialState } from '../state/reducers/dgsearch.reducer';
import userEvent from '@testing-library/user-event';
import { queryAllRows } from '../setupTests';
import { act } from 'react-dom/test-utils';

describe('SearchTabs', () => {
  let state: StateType;
  let history: History;
  let user: ReturnType<typeof userEvent.setup>;
  const mockStore = configureStore([thunk]);
  let searchParams: URLSearchParams;

  const mockAxiosGet = (
    url: string,
    config: AxiosRequestConfig
  ): Promise<Partial<AxiosResponse>> => {
    if (/\/search\/documents$/.test(url)) {
      const query = JSON.parse(
        (config.params as URLSearchParams).get('query') ?? '{}'
      );
      const searchType: DatasearchType = query?.target;
      let searchResponse: SearchResponse;
      switch (searchType) {
        case 'Investigation':
          searchResponse = {
            dimensions: {
              'Investigation.type.name': {
                experiment: 10,
              },
            },
            results: [
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
                  fileSize: 10,
                  fileCount: 9,
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
            ],
          };
          break;

        case 'Dataset':
          searchResponse = {
            results: [
              {
                score: 1,
                id: 1,
                source: {
                  id: 1,
                  name: 'Dataset test name',
                  startDate: 1563922800000,
                  endDate: 1564009200000,
                  fileSize: 10,
                  fileCount: 9,
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
            ],
          };
          break;

        case 'Datafile':
          searchResponse = {
            results: [
              {
                score: 1,
                id: 1,
                source: {
                  id: 1,
                  name: 'Datafile test name',
                  location: '/datafiletest',
                  fileSize: 1,
                  fileCount: 1,
                  date: 1563836400000,
                  'dataset.id': 2,
                  'dataset.name': 'Dataset test name',
                  'investigation.id': 3,
                  'investigation.title': 'Investigation test title',
                  'investigation.name': 'Investigation test name',
                  'investigation.startDate': 1560121200000,
                  investigationinstrument: [
                    {
                      'instrument.id': 5,
                      'instrument.name': 'LARMOR',
                    },
                  ],
                },
              },
            ],
          };
          break;
      }

      return Promise.resolve({
        data: searchResponse,
      });
    }

    return Promise.reject(`Endpoint not mocked: ${url}`);
  };

  const Wrapper = ({
    children,
  }: {
    children: React.ReactNode;
  }): JSX.Element => (
    <Provider store={mockStore(state)}>
      <Router history={history}>
        <QueryClientProvider client={new QueryClient()}>
          {children}
        </QueryClientProvider>
      </Router>
    </Provider>
  );

  beforeEach(() => {
    searchParams = new URLSearchParams();
    searchParams.append('searchText', 'test');
    history = createMemoryHistory({
      initialEntries: [
        {
          pathname: '/search/data',
          search: searchParams.toString(),
        },
      ],
    });
    user = userEvent.setup();

    state = JSON.parse(
      JSON.stringify({ dgsearch: initialState, dgcommon: dGCommonInitialState })
    );

    axios.get = jest.fn().mockImplementation(mockAxiosGet);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('renders tabs and empty tables when loading search query', async () => {
    axios.get = jest.fn().mockImplementation(
      () =>
        new Promise((_) => {
          // never resolve the promise to pretend the search query is loading
        })
    );

    state.dgsearch = {
      ...state.dgsearch,
      tabs: {
        datasetTab: true,
        datafileTab: true,
        investigationTab: true,
      },
    };

    render(
      <SearchTabs
        view="table"
        containerHeight="100"
        hierarchy="data"
        onTabChange={jest.fn()}
        currentTab="investigation"
        cartItems={[]}
        navigateToDownload={jest.fn()}
      />,
      { wrapper: Wrapper }
    );

    const investigationTab = await screen.findByRole('tab', {
      name: 'tabs.investigation',
    });
    const datasetTab = screen.getByRole('tab', { name: 'tabs.dataset' });
    const datafileTab = screen.getByRole('tab', { name: 'tabs.datafile' });

    expect(investigationTab).toBeInTheDocument();
    expect(investigationTab).toHaveAttribute('aria-selected', 'true');
    expect(within(investigationTab).getByText('?')).toBeInTheDocument();

    expect(datasetTab).toBeInTheDocument();
    expect(datasetTab).toHaveAttribute('aria-selected', 'false');
    expect(within(datasetTab).getByText('?')).toBeInTheDocument();

    expect(datafileTab).toBeInTheDocument();
    expect(datafileTab).toHaveAttribute('aria-selected', 'false');
    expect(within(datafileTab).getByText('?')).toBeInTheDocument();

    expect(screen.getByTestId('investigation-search-table')).toBeVisible();
    expect(
      screen.queryByTestId('dataset-search-table')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('datafile-search-table')
    ).not.toBeInTheDocument();

    expect(queryAllRows()).toHaveLength(0);
  });

  it('renders search tables under their corresponding tabs', async () => {
    state.dgsearch = {
      ...state.dgsearch,
      tabs: {
        datasetTab: true,
        datafileTab: true,
        investigationTab: true,
      },
    };

    const { rerender } = render(
      <SearchTabs
        view="table"
        containerHeight="100"
        hierarchy="data"
        onTabChange={jest.fn()}
        currentTab="investigation"
        cartItems={[]}
        navigateToDownload={jest.fn()}
      />,
      { wrapper: Wrapper }
    );

    const investigationTab = await screen.findByRole('tab', {
      name: 'tabs.investigation',
    });
    const datasetTab = screen.getByRole('tab', { name: 'tabs.dataset' });
    const datafileTab = screen.getByRole('tab', { name: 'tabs.datafile' });

    expect(investigationTab).toBeInTheDocument();
    expect(investigationTab).toHaveAttribute('aria-selected', 'true');
    expect(await within(investigationTab).findByText('1')).toBeInTheDocument();

    expect(datasetTab).toBeInTheDocument();
    expect(datasetTab).toHaveAttribute('aria-selected', 'false');
    expect(await within(datasetTab).findByText('1')).toBeInTheDocument();

    expect(datafileTab).toBeInTheDocument();
    expect(datafileTab).toHaveAttribute('aria-selected', 'false');
    expect(await within(datafileTab).findByText('1')).toBeInTheDocument();

    expect(screen.getByTestId('investigation-search-table')).toBeVisible();
    expect(
      screen.queryByTestId('dataset-search-table')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('datafile-search-table')
    ).not.toBeInTheDocument();

    rerender(
      <SearchTabs
        view="table"
        containerHeight="100"
        hierarchy="data"
        onTabChange={jest.fn()}
        currentTab="dataset"
        cartItems={[]}
        navigateToDownload={jest.fn()}
      />
    );
    searchParams.set('currentTab', 'dataset');

    act(() => {
      history.replace({ search: searchParams.toString() });
    });

    expect(
      screen.queryByTestId('investigation-search-table')
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('dataset-search-table')).toBeVisible();
    expect(
      screen.queryByTestId('datafile-search-table')
    ).not.toBeInTheDocument();

    rerender(
      <SearchTabs
        view="table"
        containerHeight="100"
        hierarchy="data"
        onTabChange={jest.fn()}
        currentTab="datafile"
        cartItems={[]}
        navigateToDownload={jest.fn()}
      />
    );
    searchParams.set('currentTab', 'datafile');

    act(() => {
      history.replace({ search: searchParams.toString() });
    });

    expect(
      screen.queryByTestId('investigation-search-table')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('dataset-search-table')
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('datafile-search-table')).toBeVisible();
  });

  it('renders search card views under investigation & dataset tab but not datafile tab', async () => {
    state.dgsearch = {
      ...state.dgsearch,
      tabs: {
        datasetTab: true,
        datafileTab: true,
        investigationTab: true,
      },
    };

    const { rerender } = render(
      <SearchTabs
        view="card"
        containerHeight="100"
        hierarchy="data"
        onTabChange={jest.fn()}
        currentTab="investigation"
        cartItems={[]}
        navigateToDownload={jest.fn()}
      />,
      { wrapper: Wrapper }
    );

    const investigationTab = await screen.findByRole('tab', {
      name: 'tabs.investigation',
    });
    const datasetTab = screen.getByRole('tab', { name: 'tabs.dataset' });
    const datafileTab = screen.getByRole('tab', { name: 'tabs.datafile' });

    expect(investigationTab).toBeInTheDocument();
    expect(investigationTab).toHaveAttribute('aria-selected', 'true');
    // check that search result count is displayed correctly
    expect(await within(investigationTab).findByText('1')).toBeInTheDocument();

    expect(datasetTab).toBeInTheDocument();
    expect(datasetTab).toHaveAttribute('aria-selected', 'false');
    // check that search result count is displayed correctly
    expect(await within(datasetTab).findByText('1')).toBeInTheDocument();

    expect(datafileTab).toBeInTheDocument();
    expect(datafileTab).toHaveAttribute('aria-selected', 'false');
    // check that search result count is displayed correctly
    expect(await within(datafileTab).findByText('1')).toBeInTheDocument();

    expect(screen.getByTestId('investigation-search-card-view')).toBeVisible();
    expect(
      screen.queryByTestId('dataset-search-card-view')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('datafile-search-table')
    ).not.toBeInTheDocument();

    rerender(
      <SearchTabs
        view="card"
        containerHeight="100"
        hierarchy="data"
        onTabChange={jest.fn()}
        currentTab="dataset"
        cartItems={[]}
        navigateToDownload={jest.fn()}
      />
    );
    searchParams.set('currentTab', 'dataset');
    act(() => {
      history.replace({ search: searchParams.toString() });
    });

    expect(
      screen.queryByTestId('investigation-search-card-view')
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('dataset-search-card-view')).toBeVisible();
    expect(
      screen.queryByTestId('datafile-search-table')
    ).not.toBeInTheDocument();

    rerender(
      <SearchTabs
        view="card"
        containerHeight="100"
        hierarchy="data"
        onTabChange={jest.fn()}
        currentTab="datafile"
        cartItems={[]}
        navigateToDownload={jest.fn()}
      />
    );
    searchParams.set('currentTab', 'datafile');
    act(() => {
      history.replace({ search: searchParams.toString() });
    });

    expect(
      screen.queryByTestId('investigation-search-card-view')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('dataset-search-card-view')
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('datafile-search-table')).toBeVisible();
  });

  it('changes selected tab value on click of a new tab', async () => {
    state.dgsearch = {
      ...state.dgsearch,
      tabs: {
        datasetTab: true,
        datafileTab: true,
        investigationTab: true,
      },
    };

    const onTabChange = jest.fn((newTab) => {
      searchParams.set('currentTab', newTab);
      history.replace({ search: searchParams.toString() });
    });

    const { rerender } = render(
      <SearchTabs
        view="table"
        containerHeight="100"
        hierarchy="data"
        onTabChange={onTabChange}
        currentTab="investigation"
        cartItems={[]}
        navigateToDownload={jest.fn()}
      />,
      { wrapper: Wrapper }
    );

    const investigationTab = await screen.findByRole('tab', {
      name: 'tabs.investigation',
    });
    const datasetTab = screen.getByRole('tab', { name: 'tabs.dataset' });
    const datafileTab = screen.getByRole('tab', { name: 'tabs.datafile' });

    expect(investigationTab).toBeInTheDocument();
    expect(investigationTab).toHaveAttribute('aria-selected', 'true');
    expect(await within(investigationTab).findByText('1')).toBeInTheDocument();

    expect(datasetTab).toBeInTheDocument();
    expect(datasetTab).toHaveAttribute('aria-selected', 'false');
    expect(await within(datasetTab).findByText('1')).toBeInTheDocument();

    expect(datafileTab).toBeInTheDocument();
    expect(datafileTab).toHaveAttribute('aria-selected', 'false');
    expect(await within(datafileTab).findByText('1')).toBeInTheDocument();

    await user.click(datasetTab);
    expect(onTabChange).toHaveBeenCalledWith('dataset');

    rerender(
      <SearchTabs
        view="table"
        containerHeight="100"
        hierarchy="data"
        onTabChange={onTabChange}
        currentTab="dataset"
        cartItems={[]}
        navigateToDownload={jest.fn()}
      />
    );

    expect(
      screen.queryByTestId('investigation-search-table')
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('dataset-search-table')).toBeVisible();
    expect(
      screen.queryByTestId('datafile-search-table')
    ).not.toBeInTheDocument();
  });

  it('resets search result count when filters are applied', async () => {
    let isFilterApplied = false;

    axios.get = jest.fn().mockImplementation((url, config) => {
      if (isFilterApplied) {
        return new Promise((_) => {
          // never resolve the promise to pretend it is loading
        });
      }
      return mockAxiosGet(url, config);
    });

    state.dgsearch = {
      ...state.dgsearch,
      tabs: {
        datasetTab: true,
        datafileTab: true,
        investigationTab: true,
      },
    };

    render(
      <SearchTabs
        view="card"
        containerHeight="100"
        hierarchy="data"
        onTabChange={jest.fn()}
        currentTab="investigation"
        cartItems={[]}
        navigateToDownload={jest.fn()}
      />,
      { wrapper: Wrapper }
    );

    const investigationTab = await screen.findByRole('tab', {
      name: 'tabs.investigation',
    });
    const datasetTab = screen.getByRole('tab', { name: 'tabs.dataset' });
    const datafileTab = screen.getByRole('tab', { name: 'tabs.datafile' });

    // initial search count should be visible
    expect(await within(investigationTab).findByText('1')).toBeInTheDocument();
    expect(within(datasetTab).getByText('1')).toBeInTheDocument();
    expect(within(datafileTab).getByText('1')).toBeInTheDocument();

    // apply some filters
    await user.click(
      screen.getByRole('button', {
        name: 'Toggle facetDimensionLabel.Investigation.type.name filter panel',
      })
    );
    await user.click(
      screen.getByRole('button', { name: 'Add experiment filter' })
    );

    isFilterApplied = true;
    await user.click(screen.getByRole('button', { name: 'facetPanel.apply' }));

    expect(await within(investigationTab).findByText('?')).toBeInTheDocument();
  });

  it('redirects to download cart page when view card button is clicked', async () => {
    const navigateToDownload = jest.fn();

    render(
      <SearchTabs
        view="card"
        containerHeight="100"
        hierarchy="data"
        onTabChange={jest.fn()}
        currentTab="investigation"
        cartItems={[]}
        navigateToDownload={navigateToDownload}
      />,
      { wrapper: Wrapper }
    );

    expect(navigateToDownload).not.toBeCalled();

    await user.click(
      screen.getByRole('button', { name: 'app.cart_arialabel' })
    );

    expect(navigateToDownload).toHaveBeenCalledTimes(1);
  });

  it('does not render disabled tabs', async () => {
    state.dgsearch = {
      ...state.dgsearch,
      tabs: {
        datasetTab: false,
        datafileTab: true,
        investigationTab: true,
      },
    };

    render(
      <SearchTabs
        view="card"
        containerHeight="100"
        hierarchy="data"
        onTabChange={jest.fn()}
        currentTab="investigation"
        cartItems={[]}
        navigateToDownload={jest.fn()}
      />,
      { wrapper: Wrapper }
    );

    expect(
      await screen.findByRole('tab', { name: 'tabs.investigation' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'tabs.dataset' })).toBeNull();
    expect(
      screen.getByRole('tab', { name: 'tabs.datafile' })
    ).toBeInTheDocument();
  });
});
