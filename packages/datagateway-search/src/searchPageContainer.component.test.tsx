import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';

import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { StateType } from './state/app.types';
import { initialState as dgSearchInitialState } from './state/reducers/dgsearch.reducer';
import { dGCommonInitialState, useCart } from 'datagateway-common';
import { createMemoryHistory, History } from 'history';
import { MemoryRouter, Router } from 'react-router-dom';
import SearchPageContainer, {
  getFilters,
  getPage,
  getResults,
  getSorts,
  storeFilters,
  storePage,
  storeResults,
  storeSort,
} from './searchPageContainer.component';
import { Provider } from 'react-redux';
import axios from 'axios';
import { act } from 'react-dom/test-utils';
import { flushPromises } from './setupTests';
import {
  setDatafileTab,
  setDatasetTab,
  setInvestigationTab,
} from './state/actions/actions';
import { QueryClient, QueryClientProvider } from 'react-query';
import type { RenderResult } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event/dist/types/setup';
import type { DeepPartial } from 'redux';
import userEvent from '@testing-library/user-event';

jest.mock('loglevel');

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    parseSearchToQuery: jest.fn((queryParams: string) =>
      originalModule.parseSearchToQuery(queryParams)
    ),
    useCart: jest.fn(() => originalModule.useCart()),
  };
});

describe('SearchPageContainer - Tests', () => {
  let state: DeepPartial<StateType>;
  let queryClient: QueryClient;
  let history: History;
  let pushSpy;
  let user: UserEvent;

  const localStorageGetItemMock = jest.spyOn(
    window.localStorage.__proto__,
    'getItem'
  );

  const createWrapper = (
    h: History = history,
    client: QueryClient = queryClient
  ): ReactWrapper => {
    const mockStore = configureStore([thunk]);
    return mount(
      <Provider store={mockStore(state)}>
        <Router history={h}>
          <QueryClientProvider client={client}>
            <SearchPageContainer />
          </QueryClientProvider>
        </Router>
      </Provider>
    );
  };

  const renderComponent = (): RenderResult =>
    render(
      <Provider store={configureStore([thunk])(state)}>
        <Router history={history}>
          <QueryClientProvider client={queryClient}>
            <SearchPageContainer />
          </QueryClientProvider>
        </Router>
      </Provider>
    );

  beforeEach(() => {
    queryClient = new QueryClient();
    history = createMemoryHistory({
      initialEntries: ['/search/data'],
    });
    pushSpy = jest.spyOn(history, 'push');
    user = userEvent.setup();

    window.localStorage.__proto__.removeItem = jest.fn();
    window.localStorage.__proto__.setItem = jest.fn();

    const dGSearchInitialState = {
      tabs: {
        datasetTab: true,
        datafileTab: true,
        investigationTab: true,
      },
      sideLayout: false,
      searchableEntities: ['investigation', 'dataset', 'datafile'],
      settingsLoaded: true,
    };

    state = {
      dgcommon: {
        ...dGCommonInitialState,
        urls: {
          ...dGCommonInitialState.urls,
          icatUrl: 'https://example.com/icat',
        },
      },
      dgsearch: dGSearchInitialState,
      router: {
        action: 'POP',
        location: {
          hash: '',
          key: '',
          pathname: '/',
          search: '',
          state: {},
        },
      },
    };

    (axios.get as jest.Mock).mockImplementation((url) => {
      if (url.includes('count')) {
        return Promise.resolve({ data: 0 });
      } else {
        return Promise.resolve({ data: [] });
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders searchPageContainer correctly', () => {
    const mockStore = configureStore([thunk]);
    render(
      <Provider store={mockStore(state)}>
        <MemoryRouter initialEntries={[{ key: 'testKey', pathname: '/' }]}>
          <QueryClientProvider client={queryClient}>
            <SearchPageContainer />
          </QueryClientProvider>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByRole('link', { name: 'Search data' })).toHaveAttribute(
      'href',
      '/search/data'
    );
  });

  it('renders correctly at /search/data route', () => {
    renderComponent();

    expect(screen.getByTestId('search-box-container')).toBeInTheDocument();
  });

  it('renders side layout correctly', () => {
    state = JSON.parse(
      JSON.stringify({
        dgcommon: { ...dGCommonInitialState },
        dgsearch: {
          ...dgSearchInitialState,
          sideLayout: true,
        },
      })
    );

    renderComponent();

    expect(screen.getByTestId('search-box-container-side')).toBeInTheDocument();
  });

  it('display search table container when search request sent', async () => {
    renderComponent();

    user.click(
      screen.getByRole('button', { name: 'searchBox.search_button_arialabel' })
    );

    expect(
      await screen.findByTestId('container-search-table')
    ).toBeInTheDocument();
  });

  it('display loading bar when loading true', async () => {
    (axios.get as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve, reject) => {
          // do nothing, simulating pending promise
          // to test loading state
        })
    );

    renderComponent();

    await user.click(
      screen.getByRole('button', { name: 'searchBox.search_button_arialabel' })
    );

    expect(await screen.findByRole('progressbar')).toBeInTheDocument();
  });

  it('builds correct parameters for datafile request if date and search text properties are in use', async () => {
    history.replace(
      '/search/data?searchText=hello&startDate=2013-11-11&endDate=2016-11-11'
    );

    renderComponent();

    await user.click(
      await screen.findByRole('button', {
        name: 'searchBox.search_button_arialabel',
      })
    );

    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/search/documents',
      {
        params: {
          maxCount: 100,
          minCount: 10,
          restrict: true,
          search_after: '',
          sort: {},
          query: {
            target: 'Datafile',
            lower: '201311110000',
            text: 'hello',
            upper: '201611112359',
            facets: [
              { target: 'Datafile' },
              {
                target: 'DatafileParameter',
                dimensions: [{ dimension: 'type.name' }],
              },
            ],
          },
          sessionId: null,
        },
      }
    );
  });

  it('builds correct parameters for dataset request if date and search text properties are in use', async () => {
    history.replace(
      '/search/data?searchText=hello&datafile=false&investigation=false&startDate=2013-11-11&endDate=2016-11-11'
    );

    renderComponent();

    await user.click(
      screen.getByRole('button', { name: 'searchBox.search_button_arialabel' })
    );

    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/search/documents',
      {
        params: {
          maxCount: 100,
          minCount: 10,
          restrict: true,
          search_after: '',
          sort: {},
          query: {
            target: 'Dataset',
            lower: '201311110000',
            text: 'hello',
            upper: '201611112359',
            facets: [
              {
                target: 'Dataset',
              },
            ],
          },
          sessionId: null,
        },
      }
    );
  });

  it('builds correct parameters for investigation request if date and search text properties are in use', async () => {
    history.replace(
      '/search/data?searchText=hello&dataset=false&datafile=false&startDate=2013-11-11&endDate=2016-11-11'
    );

    renderComponent();

    await user.click(
      screen.getByRole('button', { name: 'searchBox.search_button_arialabel' })
    );

    expect(axios.get).toHaveBeenNthCalledWith(
      1,
      'https://example.com/icat/search/documents',
      {
        params: {
          maxCount: 100,
          minCount: 10,
          restrict: true,
          search_after: '',
          sort: {},
          query: {
            target: 'Investigation',
            lower: '201311110000',
            text: 'hello',
            upper: '201611112359',
            facets: [
              {
                target: 'Investigation',
              },
              {
                dimensions: [{ dimension: 'type.name' }],
                target: 'InvestigationParameter',
              },
              {
                dimensions: [{ dimension: 'type.name' }],
                target: 'Sample',
              },
            ],
          },
          sessionId: null,
        },
      }
    );
  });

  it('builds correct parameters for datafile request if only start date is in use', async () => {
    history.replace(
      '/search/data?searchText=&dataset=false&investigation=false&startDate=2013-11-11'
    );

    renderComponent();

    await user.click(
      await screen.findByRole('button', {
        name: 'searchBox.search_button_arialabel',
      })
    );

    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/search/documents',
      {
        params: {
          maxCount: 100,
          minCount: 10,
          restrict: true,
          search_after: '',
          sort: {},
          query: {
            target: 'Datafile',
            lower: '201311110000',
            upper: '9000012312359',
            facets: [
              { target: 'Datafile' },
              {
                target: 'DatafileParameter',
                dimensions: [{ dimension: 'type.name' }],
              },
            ],
          },
          sessionId: null,
        },
      }
    );
  });

  it('builds correct parameters for dataset request if only start date is in use', async () => {
    history.replace(
      '/search/data?searchText=test&datafile=false&investigation=false&startDate=2013-11-11'
    );

    renderComponent();

    await user.click(
      screen.getByRole('button', { name: 'searchBox.search_button_arialabel' })
    );

    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/search/documents',
      {
        params: {
          maxCount: 100,
          minCount: 10,
          restrict: true,
          search_after: '',
          sort: {},
          query: {
            target: 'Dataset',
            lower: '201311110000',
            upper: '9000012312359',
            text: 'test',
            facets: [
              {
                target: 'Dataset',
              },
            ],
          },
          sessionId: null,
        },
      }
    );
  });

  it('builds correct parameters for investigation request if only start date is in use', async () => {
    history.replace(
      '/search/data?searchText=test&dataset=false&datafile=false&startDate=2013-11-11'
    );

    renderComponent();

    await user.click(
      screen.getByRole('button', { name: 'searchBox.search_button_arialabel' })
    );

    expect(axios.get).toHaveBeenNthCalledWith(
      1,
      'https://example.com/icat/search/documents',
      {
        params: {
          maxCount: 100,
          minCount: 10,
          restrict: true,
          search_after: '',
          sort: {},
          query: {
            target: 'Investigation',
            lower: '201311110000',
            upper: '9000012312359',
            text: 'test',
            facets: [
              {
                target: 'Investigation',
              },
              {
                dimensions: [{ dimension: 'type.name' }],
                target: 'InvestigationParameter',
              },
              {
                dimensions: [{ dimension: 'type.name' }],
                target: 'Sample',
              },
            ],
          },
          sessionId: null,
        },
      }
    );
  });

  it('builds correct parameters for datafile request if only end date is in use', async () => {
    history.replace(
      '/search/data?searchText=&dataset=false&investigation=false&endDate=2016-11-11'
    );

    renderComponent();

    await user.click(
      await screen.findByRole('button', {
        name: 'searchBox.search_button_arialabel',
      })
    );

    expect(axios.get).toHaveBeenNthCalledWith(
      1,
      'https://example.com/icat/search/documents',
      {
        params: {
          maxCount: 100,
          minCount: 10,
          restrict: true,
          search_after: '',
          sort: {},
          query: {
            target: 'Datafile',
            lower: '0000001010000',
            upper: '201611112359',
            facets: [
              { target: 'Datafile' },
              {
                target: 'DatafileParameter',
                dimensions: [{ dimension: 'type.name' }],
              },
            ],
          },
          sessionId: null,
        },
      }
    );
  });

  it('builds correct parameters for dataset request if only end date is in use', async () => {
    history.replace(
      '/search/data?searchText=test&datafile=false&investigation=false&endDate=2016-11-11'
    );

    renderComponent();

    await user.click(
      screen.getByRole('button', { name: 'searchBox.search_button_arialabel' })
    );

    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/search/documents',
      {
        params: {
          maxCount: 100,
          minCount: 10,
          restrict: true,
          search_after: '',
          sort: {},
          query: {
            target: 'Dataset',
            lower: '0000001010000',
            upper: '201611112359',
            text: 'test',
            facets: [
              {
                target: 'Dataset',
              },
            ],
          },
          sessionId: null,
        },
      }
    );
  });

  it('builds correct parameters for investigation request if only end date is in use', async () => {
    history.replace(
      '/search/data?searchText=test&dataset=false&datafile=false&endDate=2016-11-11'
    );

    renderComponent();

    await user.click(
      screen.getByRole('button', { name: 'searchBox.search_button_arialabel' })
    );

    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/search/documents',
      {
        params: {
          maxCount: 100,
          minCount: 10,
          restrict: true,
          search_after: '',
          sort: {},
          query: {
            target: 'Investigation',
            lower: '0000001010000',
            upper: '201611112359',
            text: 'test',
            facets: [
              {
                target: 'Investigation',
              },
              {
                dimensions: [{ dimension: 'type.name' }],
                target: 'InvestigationParameter',
              },
              {
                dimensions: [{ dimension: 'type.name' }],
                target: 'Sample',
              },
            ],
          },
          sessionId: null,
        },
      }
    );
  });

  it('builds correct parameters for datafile request if date and search text properties are not in use', async () => {
    history.replace(
      '/search/data?searchText=test&dataset=false&investigation=false'
    );

    renderComponent();

    await user.click(
      await screen.findByRole('button', {
        name: 'searchBox.search_button_arialabel',
      })
    );

    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/search/documents',
      {
        params: {
          maxCount: 100,
          minCount: 10,
          restrict: true,
          search_after: '',
          sort: {},
          query: {
            target: 'Datafile',
            text: 'test',
            facets: [
              {
                target: 'Datafile',
              },
              {
                target: 'DatafileParameter',
                dimensions: [{ dimension: 'type.name' }],
              },
            ],
          },
          sessionId: null,
        },
      }
    );
  });

  it('builds correct parameters for dataset request if date and search text properties are not in use', async () => {
    history.replace('/search/data?datafile=false&investigation=false');

    renderComponent();

    await user.click(
      screen.getByRole('button', { name: 'searchBox.search_button_arialabel' })
    );

    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/search/documents',
      {
        params: {
          maxCount: 100,
          minCount: 10,
          restrict: true,
          search_after: '',
          sort: {},
          query: {
            target: 'Dataset',
            facets: [
              {
                target: 'Dataset',
              },
            ],
          },
          sessionId: null,
        },
      }
    );
  });

  it('builds correct parameters for investigation request if date and search text properties are not in use', async () => {
    history.replace(
      '/search/data?searchText=test&dataset=false&datafile=false'
    );

    renderComponent();

    await user.click(
      screen.getByRole('button', { name: 'searchBox.search_button_arialabel' })
    );

    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/search/documents',
      {
        params: {
          maxCount: 100,
          minCount: 10,
          restrict: true,
          search_after: '',
          sort: {},
          query: {
            target: 'Investigation',
            text: 'test',
            facets: [
              {
                target: 'Investigation',
              },
              {
                dimensions: [{ dimension: 'type.name' }],
                target: 'InvestigationParameter',
              },
              {
                dimensions: [{ dimension: 'type.name' }],
                target: 'Sample',
              },
            ],
          },
          sessionId: null,
        },
      }
    );
  });

  it('gets the filters stored in the local storage', () => {
    localStorageGetItemMock.mockImplementationOnce(
      () => '{"investigation.title":{"value":"test","type":"include"}}'
    );
    const result = getFilters('dataset');
    expect(result).toEqual({
      'investigation.title': {
        type: 'include',
        value: 'test',
      },
    });
  });

  it('gets the sorts stored in the local storage', () => {
    localStorageGetItemMock.mockImplementationOnce(() => '{"name":"asc"}');
    const result = getSorts('dataset');
    expect(result).toEqual({
      name: 'asc',
    });
  });

  it('display clear filters button and clear for filters onClick', async () => {
    renderComponent();

    await user.click(
      screen.getByRole('button', { name: 'searchBox.search_button_arialabel' })
    );

    await act(async () => {
      await flushPromises();
    });

    history.replace(
      `/search/data?filters=%7B"title"%3A%7B"value"%3A"spend"%2C"type"%3A"include"%7D%7D`
    );

    expect(
      await screen.findByRole('button', { name: 'app.clear_filters' })
    ).not.toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'app.clear_filters' }));

    expect(
      await screen.findByRole('button', { name: 'app.clear_filters' })
    ).toBeDisabled();
    expect(history.location.search).toEqual('?');
  });

  it('display disabled clear filters button', async () => {
    renderComponent();

    await user.click(
      screen.getByRole('button', { name: 'searchBox.search_button_arialabel' })
    );

    await act(async () => {
      await flushPromises();
    });

    expect(
      await screen.findByRole('button', { name: 'app.clear_filters' })
    ).toBeDisabled();
  });

  it('gets the page stored in the local storage', () => {
    localStorageGetItemMock.mockImplementationOnce(() => 2);
    const result = getPage('dataset');
    expect(result).toEqual(2);
  });

  it('gets the results stored in the local storage', () => {
    localStorageGetItemMock.mockImplementationOnce(() => 10);
    const result = getResults('dataset');
    expect(result).toEqual(10);
  });

  it('stores the previous filters in the local storage', () => {
    storeFilters(
      { title: { value: 'test', type: 'include' } },
      'investigation'
    );

    expect(localStorage.setItem).toBeCalledWith(
      'investigationFilters',
      '{"title":{"value":"test","type":"include"}}'
    );
  });

  it('stores the previous sorts in the local storage', () => {
    storeSort({ name: 'asc' }, 'investigation');

    expect(localStorage.setItem).toBeCalledWith(
      'investigationSort',
      '{"name":"asc"}'
    );
  });

  it('stores the previous page in the local storage', () => {
    storePage(4, 'investigation');

    expect(localStorage.setItem).toBeCalledWith('investigationPage', '4');
  });

  it('stores the previous results in the local storage', () => {
    storeResults(20, 'investigation');

    expect(localStorage.setItem).toBeCalledWith('investigationResults', '20');
  });

  it('sends actions to update tabs when user clicks search button', async () => {
    history.replace(
      '/search/data?searchText=test&dataset=false&datafile=false'
    );

    const mockStore = configureStore([thunk]);
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <SearchPageContainer />
          </QueryClientProvider>
        </Router>
      </Provider>
    );
    wrapper.update();

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(testStore.getActions()[0]).toEqual(setDatafileTab(false));
    expect(testStore.getActions()[1]).toEqual(setDatasetTab(false));
    expect(testStore.getActions()[2]).toEqual(setInvestigationTab(true));
  });

  it('search text state is updated when text is changed and pushes when search initiated', async () => {
    const wrapper = createWrapper();

    wrapper
      .find('[aria-label="searchBox.search_text_arialabel"] input')
      .simulate('change', { target: { value: 'test' } });

    wrapper
      .find('button[aria-label="searchBox.search_button_arialabel"]')
      .simulate('click');

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(pushSpy).toHaveBeenCalledWith({
      search: '?searchText=test',
    });
  });

  it('shows SelectionAlert banner when item selected', async () => {
    (useCart as jest.Mock).mockReturnValue({
      data: [
        {
          entityId: 1,
          entityType: 'dataset',
          id: 1,
          name: 'Test 1',
          parentEntities: [],
        },
      ],
    });
    const wrapper = createWrapper();

    wrapper
      .find('button[aria-label="searchBox.search_button_arialabel"]')
      .simulate('click');

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.exists('[aria-label="selection-alert"]')).toBeTruthy();
  });

  it('does not show SelectionAlert banner when no items are selected', async () => {
    (useCart as jest.Mock).mockReturnValue({
      data: [],
    });
    const wrapper = createWrapper();

    wrapper
      .find('button[aria-label="searchBox.search_button_arialabel"]')
      .simulate('click');

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.exists('[aria-label="selection-alert"]')).toBeFalsy();
  });

  it('initiates search when visiting a direct url', async () => {
    history.replace(
      '/search/data?searchText=hello&startDate=2013-11-11&endDate=2016-11-11'
    );

    renderComponent();

    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/search/documents',
      {
        params: {
          maxCount: 100,
          minCount: 10,
          restrict: true,
          search_after: '',
          sort: {},
          query: {
            target: 'Datafile',
            lower: '201311110000',
            text: 'hello',
            upper: '201611112359',
            facets: [
              { target: 'Datafile' },
              {
                target: 'DatafileParameter',
                dimensions: [{ dimension: 'type.name' }],
              },
            ],
          },
          sessionId: null,
        },
      }
    );
  });

  it('initiates search when visiting a direct url with empty search text', async () => {
    history.replace('/search/data?searchText=');

    renderComponent();

    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/search/documents',
      {
        params: {
          maxCount: 100,
          minCount: 10,
          restrict: true,
          search_after: '',
          sort: {},
          query: {
            target: 'Datafile',
            facets: [
              { target: 'Datafile' },
              {
                target: 'DatafileParameter',
                dimensions: [{ dimension: 'type.name' }],
              },
            ],
          },
          sessionId: null,
        },
      }
    );
  });

  it('does not search for non-searchable entities when visiting a direct url', async () => {
    state.dgsearch.searchableEntities = ['investigation', 'dataset'];

    history.replace('/search/data?searchText=hello&datafiles=true');

    renderComponent();

    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/search/documents',
      {
        params: {
          maxCount: 100,
          minCount: 10,
          restrict: true,
          search_after: '',
          sort: {},
          query: {
            target: 'Investigation',
            text: 'hello',
            facets: [
              {
                target: 'Investigation',
              },
              {
                dimensions: [{ dimension: 'type.name' }],
                target: 'InvestigationParameter',
              },
              {
                dimensions: [{ dimension: 'type.name' }],
                target: 'Sample',
              },
            ],
          },
          sessionId: null,
        },
      }
    );

    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/search/documents',
      {
        params: {
          maxCount: 100,
          minCount: 10,
          restrict: true,
          search_after: '',
          sort: {},
          query: {
            target: 'Dataset',
            text: 'hello',
            facets: [
              {
                target: 'Dataset',
              },
            ],
          },
          sessionId: null,
        },
      }
    );

    expect(axios.get).not.toHaveBeenCalledWith(
      'https://example.com/icat/search/documents',
      {
        params: {
          maxCount: 100,
          minCount: 10,
          restrict: true,
          search_after: '',
          sort: {},
          query: {
            target: 'Datafile',
            text: 'hello',
          },
          sessionId: null,
        },
      }
    );
  });

  it('initiates search when the URL is changed', async () => {
    renderComponent();

    (axios.get as jest.Mock).mockClear();

    await user.type(
      screen.getByRole('searchbox', {
        name: 'searchBox.search_text_arialabel',
      }),
      'neutron AND scattering'
    );

    await user.click(
      screen.getByRole('button', { name: 'searchBox.search_button_arialabel' })
    );

    expect(axios.get).toHaveBeenNthCalledWith(
      1,
      'https://example.com/icat/search/documents',
      {
        params: {
          maxCount: 100,
          minCount: 10,
          restrict: true,
          search_after: '',
          sort: {},
          query: {
            target: 'Investigation',
            text: 'neutron AND scattering',
            facets: [
              {
                target: 'Investigation',
              },
              {
                dimensions: [{ dimension: 'type.name' }],
                target: 'InvestigationParameter',
              },
              {
                dimensions: [{ dimension: 'type.name' }],
                target: 'Sample',
              },
            ],
          },
          sessionId: null,
        },
      }
    );
  });

  it('switches view button display name when clicked', async () => {
    renderComponent();

    await user.click(
      screen.getByRole('button', { name: 'searchBox.search_button_arialabel' })
    );

    const viewCardBtn = await screen.findByRole('button', {
      name: 'page view app.view_cards',
    });
    expect(viewCardBtn).toBeInTheDocument();
    expect(viewCardBtn).toHaveTextContent('app.view_cards');

    // Click view button
    await user.click(viewCardBtn);

    // Check that the text on the button has changed
    const viewTableBtn = await screen.findByRole('button', {
      name: 'page view app.view_table',
    });
    expect(viewTableBtn).toBeInTheDocument();
    expect(viewTableBtn).toHaveTextContent('app.view_table');
  });

  it('defaults to dataset when investigation is false ', async () => {
    state.dgsearch = {
      ...state.dgsearch,
      tabs: {
        datasetTab: true,
        datafileTab: true,
        investigationTab: false,
      },
    };

    renderComponent();

    expect(history.location.search).toEqual('?currentTab=dataset');
  });

  it('defaults to datafile if when investigation and dataset are false ', async () => {
    state.dgsearch = {
      ...state.dgsearch,
      tabs: {
        datasetTab: false,
        datafileTab: true,
        investigationTab: false,
      },
    };

    renderComponent();

    expect(history.location.search).toEqual('?currentTab=datafile');
  });

  it('defaults to investigation if when investigation ,dataset and datafile are false ', async () => {
    state.dgsearch = {
      ...state.dgsearch,
      tabs: {
        datasetTab: false,
        datafileTab: false,
        investigationTab: false,
      },
    };

    renderComponent();

    // i.e default value is investigation it set in the searchPageContainer
    expect(history.location.search).toEqual('');
  });
});
