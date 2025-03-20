import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { StateType } from './state/app.types';
import { initialState as dgSearchInitialState } from './state/reducers/dgsearch.reducer';
import {
  dGCommonInitialState,
  readSciGatewayToken,
  type DownloadCartItem,
} from 'datagateway-common';
import { createMemoryHistory, createPath, type History } from 'history';
import { Router } from 'react-router-dom';
import SearchPageContainer, {
  usePushCurrentTab,
} from './searchPageContainer.component';
import { Provider } from 'react-redux';
import axios from 'axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderResult, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { DeepPartial } from 'redux';
import { applyMiddleware, compose, createStore } from 'redux';
import AppReducer from './state/reducers/app.reducer';
import { renderHook } from '@testing-library/react';

jest.mock('loglevel');

jest.mock('datagateway-common', () => {
  const originalModule = vi.importActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    parseSearchToQuery: jest.fn((queryParams: string) =>
      originalModule.parseSearchToQuery(queryParams)
    ),
    useCart: jest.fn(() => originalModule.useCart()),
    readSciGatewayToken: jest.fn(),
  };
});

function generateURLSearchParams({
  sessionId = '',
  query = {},
  minCount = '10',
  maxCount = '100',
  restrict = 'false',
}): URLSearchParams {
  const params = new URLSearchParams();
  params.append('sessionId', sessionId);
  params.append('query', JSON.stringify(query));
  params.append('minCount', minCount);
  params.append('maxCount', maxCount);
  params.append('restrict', restrict);
  return params;
}

describe('usePushCurrentTab', () => {
  let localStorageSetItemMock: jest.SpyInstance;
  let localStorageGetItemMock: jest.SpyInstance;
  beforeEach(() => {
    localStorageSetItemMock = jest.spyOn(
      window.localStorage.__proto__,
      'setItem'
    );
    localStorageGetItemMock = jest.spyOn(
      window.localStorage.__proto__,
      'getItem'
    );
  });

  afterEach(() => {
    localStorageSetItemMock.mockRestore();
    localStorageGetItemMock.mockRestore();
  });

  it('returns callback that when called pushes a new tab to the url query', () => {
    const history = createMemoryHistory();

    const { result } = renderHook(() => usePushCurrentTab(), {
      wrapper: ({ children }) => <Router history={history}>{children}</Router>,
    });

    act(() => {
      result.current('dataset');
    });

    expect(history.location.search).toEqual('?currentTab=dataset');
  });

  it('returns callback that when called pushes a new tab to the url query, and stores and restores any stored search query params', () => {
    const history = createMemoryHistory({
      initialEntries: [
        '/search/data?currentTab=investigation&filters={"title":{"value":"test","type":"include"}}&page=2&results=30',
      ],
    });

    const { result } = renderHook(() => usePushCurrentTab(), {
      wrapper: ({ children }) => <Router history={history}>{children}</Router>,
    });

    localStorageGetItemMock.mockImplementation((name) => {
      if (name === 'datasetResults') return '20';
      if (name === 'datasetPage') return '3';
      if (name === 'datasetFilters')
        return '{"name":{"value":"test2","type":"include"}}';
    });

    act(() => {
      result.current('dataset');
    });

    expect(localStorageSetItemMock).toBeCalledWith(
      'investigationFilters',
      '{"title":{"value":"test","type":"include"}}'
    );
    expect(localStorageSetItemMock).toBeCalledWith('investigationPage', '2');
    expect(localStorageSetItemMock).toBeCalledWith(
      'investigationResults',
      '30'
    );

    expect(history.location.search).toEqual(
      '?page=3&results=20&currentTab=dataset&filters=%7B%22name%22%3A%7B%22value%22%3A%22test2%22%2C%22type%22%3A%22include%22%7D%7D'
    );
  });
});

describe('SearchPageContainer - Tests', () => {
  let state: DeepPartial<StateType>;
  let queryClient: QueryClient;
  let history: History;
  let holder: HTMLElement;
  let cartItems: DownloadCartItem[];

  function renderComponent(): RenderResult {
    return render(
      <Provider store={configureStore([thunk])(state)}>
        <Router history={history}>
          <QueryClientProvider client={queryClient}>
            <SearchPageContainer />
          </QueryClientProvider>
        </Router>
      </Provider>
    );
  }

  beforeEach(() => {
    cartItems = [];
    queryClient = new QueryClient();
    history = createMemoryHistory({
      initialEntries: ['/search/data'],
    });
    // @ts-expect-error we need it this way
    delete window.location;
    // @ts-expect-error we need it this way
    window.location = new URL(`http://localhost/search/data`);

    // below code keeps window.location in sync with history changes
    // (needed because useUpdateQueryParam uses window.location not history)
    const historyReplace = history.replace;
    const historyReplaceSpy = jest.spyOn(history, 'replace');
    historyReplaceSpy.mockImplementation((args) => {
      historyReplace(args);
      if (typeof args === 'string') {
        // @ts-expect-error we need it this way
        window.location = new URL(`http://localhost${args}`);
      } else {
        // @ts-expect-error we need it this way
        window.location = new URL(`http://localhost${createPath(args)}`);
      }
    });
    const historyPush = history.push;
    const historyPushSpy = jest.spyOn(history, 'push');
    historyPushSpy.mockImplementation((args) => {
      historyPush(args);
      if (typeof args === 'string') {
        // @ts-expect-error we need it this way
        window.location = new URL(`http://localhost${args}`);
      } else {
        // @ts-expect-error we need it this way
        window.location = new URL(`http://localhost${createPath(args)}`);
      }
    });

    window.localStorage.clear();

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
    };

    holder = document.createElement('div');
    holder.setAttribute('id', 'datagateway-search');
    document.body.appendChild(holder);

    (axios.get as jest.Mock).mockImplementation((url) => {
      if (url.includes('/user/cart')) {
        return Promise.resolve({ data: { cartItems } });
      }

      if (url.includes('count')) {
        return Promise.resolve({ data: 0 });
      }

      return Promise.resolve({ data: [] });
    });

    (
      readSciGatewayToken as jest.MockedFn<typeof readSciGatewayToken>
    ).mockReturnValue({
      sessionId: null,
      username: 'test',
    });
  });

  afterEach(() => {
    document.body.removeChild(holder);
    jest.clearAllMocks();
  });

  it('renders searchPageContainer correctly', async () => {
    const localStorageRemoveItemMock = jest.spyOn(
      window.localStorage.__proto__,
      'removeItem'
    );
    history.replace({ key: 'testKey', pathname: '/' });

    renderComponent();

    expect(
      await screen.findByRole('link', { name: 'Search data' })
    ).toHaveAttribute('href', '/search/data');

    // check it clears all the localstorage stuff
    expect(localStorageRemoveItemMock).toHaveBeenCalledWith(
      'investigationFilters'
    );
    expect(localStorageRemoveItemMock).toHaveBeenCalledWith('datasetFilters');
    expect(localStorageRemoveItemMock).toHaveBeenCalledWith('datafileFilters');
    expect(localStorageRemoveItemMock).toHaveBeenCalledWith(
      'investigationPage'
    );
    expect(localStorageRemoveItemMock).toHaveBeenCalledWith('datasetPage');
    expect(localStorageRemoveItemMock).toHaveBeenCalledWith(
      'investigationResults'
    );
    expect(localStorageRemoveItemMock).toHaveBeenCalledWith('datasetResults');
  });

  it('renders initial layout at /search/data route', async () => {
    renderComponent();

    expect(
      await screen.findByTestId('search-box-container')
    ).toBeInTheDocument();

    // logged in, so my_data checkbox should be visible & checked by default
    expect(
      screen.getByRole('checkbox', { name: 'check_boxes.my_data' })
    ).toBeChecked();

    // no search results yet, so view button, clear filter button and tabs should be hidden
    expect(
      screen.queryByRole('button', { name: 'page view app.view_cards' })
    ).toBeNull();
    expect(
      screen.queryByRole('button', { name: 'app.clear_filters' })
    ).toBeNull();
    expect(
      screen.queryByRole('tablist', { name: 'searchPageTable.tabs_arialabel' })
    ).toBeNull();
  });

  it('renders side layout correctly', async () => {
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

    expect(
      await screen.findByTestId('search-box-container-side')
    ).toBeInTheDocument();
    // no search results yet, so view button, clear filter button and tabs should be hidden
    expect(
      screen.queryByRole('button', { name: 'page view app.view_cards' })
    ).toBeNull();
    expect(
      screen.queryByRole('button', { name: 'app.clear_filters' })
    ).toBeNull();
    expect(
      screen.queryByRole('tablist', { name: 'searchPageTable.tabs_arialabel' })
    ).toBeNull();
  });

  it('display search table container when search request sent', async () => {
    const user = userEvent.setup();

    renderComponent();

    await user.click(
      screen.getByRole('button', { name: 'searchBox.search_button_arialabel' })
    );

    expect(
      await screen.findByRole('tablist', {
        name: 'searchPageTable.tabs_arialabel',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'page view app.view_cards' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'app.clear_filters' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'tabs.investigation' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'tabs.dataset' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'tabs.datafile' })
    ).toBeInTheDocument();
  });

  it('display loading bar when loading true', async () => {
    const user = userEvent.setup();
    (axios.get as jest.Mock).mockImplementation(
      () =>
        new Promise((_) => {
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
      '/search/data?searchText=hello&dataset=false&investigation=false&startDate=2013-11-11&endDate=2016-11-11'
    );

    renderComponent();

    expect(
      await screen.findByTestId('search-box-container')
    ).toBeInTheDocument();

    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/search/documents',
      {
        params: generateURLSearchParams({
          query: {
            target: 'Datafile',
            lower: '201311110000',
            upper: '201611112359',
            text: 'hello',
            facets: [
              { target: 'Datafile' },
              {
                target: 'DatafileParameter',
                dimensions: [{ dimension: 'type.name' }],
              },
              {
                target: 'InvestigationInstrument',
                dimensions: [{ dimension: 'instrument.name' }],
              },
            ],
          },
        }),
      }
    );
  });

  it('builds correct parameters for dataset request if date and search text properties are in use', async () => {
    history.replace(
      '/search/data?searchText=hello&datafile=false&investigation=false&startDate=2013-11-11&endDate=2016-11-11'
    );

    renderComponent();

    expect(
      await screen.findByTestId('search-box-container')
    ).toBeInTheDocument();

    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/search/documents',
      {
        params: generateURLSearchParams({
          query: {
            target: 'Dataset',
            lower: '201311110000',
            upper: '201611112359',
            text: 'hello',
            facets: [
              {
                target: 'Dataset',
              },
              {
                target: 'DatasetParameter',
                dimensions: [{ dimension: 'type.name' }],
              },
              {
                target: 'InvestigationInstrument',
                dimensions: [{ dimension: 'instrument.name' }],
              },
            ],
          },
        }),
      }
    );
  });

  it('builds correct parameters for investigation request if date and search text properties are in use', async () => {
    history.replace(
      '/search/data?searchText=hello&dataset=false&datafile=false&startDate=2013-11-11&endDate=2016-11-11'
    );

    renderComponent();

    expect(
      await screen.findByTestId('search-box-container')
    ).toBeInTheDocument();

    expect(axios.get).toHaveBeenNthCalledWith(
      1,
      'https://example.com/icat/search/documents',
      {
        params: generateURLSearchParams({
          query: {
            target: 'Investigation',
            lower: '201311110000',
            upper: '201611112359',
            text: 'hello',
            facets: [
              { target: 'Investigation' },
              {
                target: 'InvestigationParameter',
                dimensions: [{ dimension: 'type.name' }],
              },
              {
                target: 'Sample',
                dimensions: [{ dimension: 'sample.type.name' }],
              },
              {
                target: 'InvestigationInstrument',
                dimensions: [{ dimension: 'instrument.name' }],
              },
            ],
          },
        }),
      }
    );
  });

  it('builds correct parameters for datafile request if only start date is in use', async () => {
    history.replace(
      '/search/data?searchText=&dataset=false&investigation=false&startDate=2013-11-11'
    );

    renderComponent();

    expect(
      await screen.findByTestId('search-box-container')
    ).toBeInTheDocument();

    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/search/documents',
      {
        params: generateURLSearchParams({
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
              {
                target: 'InvestigationInstrument',
                dimensions: [{ dimension: 'instrument.name' }],
              },
            ],
          },
        }),
      }
    );
  });

  it('builds correct parameters for dataset request if only start date is in use', async () => {
    history.replace(
      '/search/data?searchText=test&datafile=false&investigation=false&startDate=2013-11-11'
    );

    renderComponent();

    expect(
      await screen.findByTestId('search-box-container')
    ).toBeInTheDocument();

    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/search/documents',
      {
        params: generateURLSearchParams({
          query: {
            target: 'Dataset',
            lower: '201311110000',
            upper: '9000012312359',
            text: 'test',
            facets: [
              {
                target: 'Dataset',
              },
              {
                target: 'DatasetParameter',
                dimensions: [{ dimension: 'type.name' }],
              },
              {
                target: 'InvestigationInstrument',
                dimensions: [{ dimension: 'instrument.name' }],
              },
            ],
          },
        }),
      }
    );
  });

  it('builds correct parameters for investigation request if only start date is in use', async () => {
    history.replace(
      '/search/data?searchText=test&dataset=false&datafile=false&startDate=2013-11-11'
    );

    renderComponent();

    expect(
      await screen.findByTestId('search-box-container')
    ).toBeInTheDocument();

    expect(axios.get).toHaveBeenNthCalledWith(
      1,
      'https://example.com/icat/search/documents',
      {
        params: generateURLSearchParams({
          query: {
            target: 'Investigation',
            lower: '201311110000',
            upper: '9000012312359',
            text: 'test',
            facets: [
              { target: 'Investigation' },
              {
                target: 'InvestigationParameter',
                dimensions: [{ dimension: 'type.name' }],
              },
              {
                target: 'Sample',
                dimensions: [{ dimension: 'sample.type.name' }],
              },
              {
                target: 'InvestigationInstrument',
                dimensions: [{ dimension: 'instrument.name' }],
              },
            ],
          },
        }),
      }
    );
  });

  it('builds correct parameters for datafile request if only end date is in use', async () => {
    const user = userEvent.setup();

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
      2,
      'https://example.com/icat/search/documents',
      {
        params: generateURLSearchParams({
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
              {
                target: 'InvestigationInstrument',
                dimensions: [{ dimension: 'instrument.name' }],
              },
            ],
          },
        }),
      }
    );
  });

  it('builds correct parameters for dataset request if only end date is in use', async () => {
    history.replace(
      '/search/data?searchText=test&datafile=false&investigation=false&endDate=2016-11-11'
    );

    renderComponent();

    expect(
      await screen.findByTestId('search-box-container')
    ).toBeInTheDocument();

    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/search/documents',
      {
        params: generateURLSearchParams({
          query: {
            target: 'Dataset',
            lower: '0000001010000',
            upper: '201611112359',
            text: 'test',
            facets: [
              {
                target: 'Dataset',
              },
              {
                target: 'DatasetParameter',
                dimensions: [{ dimension: 'type.name' }],
              },
              {
                target: 'InvestigationInstrument',
                dimensions: [{ dimension: 'instrument.name' }],
              },
            ],
          },
        }),
      }
    );
  });

  it('builds correct parameters for investigation request if only end date is in use', async () => {
    history.replace(
      '/search/data?searchText=test&dataset=false&datafile=false&endDate=2016-11-11'
    );

    renderComponent();

    expect(
      await screen.findByTestId('search-box-container')
    ).toBeInTheDocument();

    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/search/documents',
      {
        params: generateURLSearchParams({
          query: {
            target: 'Investigation',
            lower: '0000001010000',
            upper: '201611112359',
            text: 'test',
            facets: [
              { target: 'Investigation' },
              {
                target: 'InvestigationParameter',
                dimensions: [{ dimension: 'type.name' }],
              },
              {
                target: 'Sample',
                dimensions: [{ dimension: 'sample.type.name' }],
              },
              {
                target: 'InvestigationInstrument',
                dimensions: [{ dimension: 'instrument.name' }],
              },
            ],
          },
        }),
      }
    );
  });

  it('builds correct parameters for datafile request if date and search text properties are not in use', async () => {
    const user = userEvent.setup();

    history.replace('/search/data?dataset=false&investigation=false');

    renderComponent();

    await user.click(
      await screen.findByRole('button', {
        name: 'searchBox.search_button_arialabel',
      })
    );

    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/search/documents',
      {
        params: generateURLSearchParams({
          query: {
            target: 'Datafile',
            facets: [
              {
                target: 'Datafile',
              },
              {
                target: 'DatafileParameter',
                dimensions: [{ dimension: 'type.name' }],
              },
              {
                target: 'InvestigationInstrument',
                dimensions: [{ dimension: 'instrument.name' }],
              },
            ],
          },
          restrict: 'true',
        }),
      }
    );
  });

  it('builds correct parameters for dataset request if date and search text properties are not in use', async () => {
    const user = userEvent.setup();

    history.replace('/search/data?datafile=false&investigation=false');

    renderComponent();

    await user.click(
      screen.getByRole('button', { name: 'searchBox.search_button_arialabel' })
    );

    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/search/documents',
      {
        params: generateURLSearchParams({
          query: {
            target: 'Dataset',
            facets: [
              {
                target: 'Dataset',
              },
              {
                target: 'DatasetParameter',
                dimensions: [{ dimension: 'type.name' }],
              },
              {
                target: 'InvestigationInstrument',
                dimensions: [{ dimension: 'instrument.name' }],
              },
            ],
          },
          restrict: 'true',
        }),
      }
    );
  });

  it('builds correct parameters for investigation request if date and search text properties are not in use', async () => {
    const user = userEvent.setup();

    history.replace('/search/data?dataset=false&datafile=false');

    renderComponent();

    await user.click(
      screen.getByRole('button', { name: 'searchBox.search_button_arialabel' })
    );

    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/search/documents',
      {
        params: generateURLSearchParams({
          query: {
            target: 'Investigation',
            facets: [
              { target: 'Investigation' },
              {
                target: 'InvestigationParameter',
                dimensions: [{ dimension: 'type.name' }],
              },
              {
                target: 'Sample',
                dimensions: [{ dimension: 'sample.type.name' }],
              },
              {
                target: 'InvestigationInstrument',
                dimensions: [{ dimension: 'instrument.name' }],
              },
            ],
          },
          restrict: 'true',
        }),
      }
    );
  });

  it('display clear filters button and clear for filters onClick', async () => {
    const user = userEvent.setup();

    renderComponent();

    await user.click(
      screen.getByRole('button', { name: 'searchBox.search_button_arialabel' })
    );

    act(() => {
      history.replace(
        `/search/data?filters=%7B"title"%3A%7B"value"%3A"spend"%2C"type"%3A"include"%7D%7D`
      );
    });

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
    const user = userEvent.setup();

    renderComponent();

    await user.click(
      screen.getByRole('button', { name: 'searchBox.search_button_arialabel' })
    );

    expect(
      await screen.findByRole('button', { name: 'app.clear_filters' })
    ).toBeDisabled();
  });

  it('should hide tabs when the corresponding search type is disabled', async () => {
    // need real store so so that the tab values actually update in the store
    // after we dispatch the relevant actions
    function renderComponentWithRealStore(): RenderResult {
      return render(
        <Provider
          store={createStore(AppReducer(), compose(applyMiddleware(thunk)))}
        >
          <Router history={history}>
            <QueryClientProvider client={queryClient}>
              <SearchPageContainer />
            </QueryClientProvider>
          </Router>
        </Provider>
      );
    }

    const user = userEvent.setup();

    // test it works with loading from URL params
    act(() => {
      history.replace(
        '/search/data?searchText=test&dataset=false&datafile=false'
      );
    });

    renderComponentWithRealStore();

    expect(
      screen.getByRole('tab', { name: 'tabs.investigation' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'tabs.dataset' })).toBeNull();
    expect(screen.queryByRole('tab', { name: 'tabs.datafile' })).toBeNull();

    // also test it works on initiateSearch
    act(() => {
      history.replace('/search/data?searchText=test&datafile=false');
    });

    await user.click(
      screen.getByRole('button', { name: 'searchBox.search_button_arialabel' })
    );

    expect(
      screen.getByRole('tab', { name: 'tabs.investigation' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'tabs.dataset' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'tabs.datafile' })).toBeNull();
  });

  it('search is not initiated when no search types are enabled', async () => {
    const user = userEvent.setup();

    history.replace(
      '/search/data?searchText=test&investigation=false&dataset=false&datafile=false'
    );

    renderComponent();

    expect(
      screen.queryByRole('tablist', {
        name: 'searchPageTable.tabs_arialabel',
      })
    ).toBeNull();

    await user.click(
      screen.getByRole('button', { name: 'searchBox.search_button_arialabel' })
    );

    expect(
      screen.queryByRole('tablist', {
        name: 'searchPageTable.tabs_arialabel',
      })
    ).toBeNull();
  });

  it('search text state is updated when text is changed and pushes when search initiated', async () => {
    const user = userEvent.setup();

    renderComponent();

    await user.type(
      screen.getByRole('searchbox', {
        name: 'searchBox.search_text_arialabel',
      }),
      'test'
    );
    await user.click(
      screen.getByRole('button', { name: 'searchBox.search_button_arialabel' })
    );

    expect(history.location.search).toEqual('?searchText=test&restrict=true');
  });

  it('shows SelectionAlert banner when item selected', async () => {
    cartItems = [
      {
        entityId: 1,
        entityType: 'dataset',
        id: 1,
        name: 'Test 1',
        parentEntities: [],
      },
    ];
    const user = userEvent.setup();

    renderComponent();

    await user.click(
      screen.getByRole('button', { name: 'searchBox.search_button_arialabel' })
    );

    expect(await screen.findByLabelText('selection-alert')).toBeInTheDocument();
  });

  it('initiates search when visiting a direct url', async () => {
    history.replace(
      '/search/data?searchText=hello&restrict=true&startDate=2013-11-11&endDate=2016-11-11'
    );

    renderComponent();

    expect(
      await screen.findByRole('tablist', {
        name: 'searchPageTable.tabs_arialabel',
      })
    ).toBeInTheDocument();

    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/search/documents',
      {
        params: generateURLSearchParams({
          query: {
            target: 'Datafile',
            lower: '201311110000',
            upper: '201611112359',
            text: 'hello',
            facets: [
              { target: 'Datafile' },
              {
                target: 'DatafileParameter',
                dimensions: [{ dimension: 'type.name' }],
              },
              {
                target: 'InvestigationInstrument',
                dimensions: [{ dimension: 'instrument.name' }],
              },
            ],
          },
          restrict: 'true',
        }),
      }
    );
  });

  it('initiates search when visiting a direct url with empty search text', async () => {
    history.replace('/search/data?searchText=');

    renderComponent();

    expect(
      await screen.findByRole('tablist', {
        name: 'searchPageTable.tabs_arialabel',
      })
    ).toBeInTheDocument();

    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/search/documents',
      {
        params: generateURLSearchParams({
          query: {
            target: 'Datafile',
            facets: [
              { target: 'Datafile' },
              {
                target: 'DatafileParameter',
                dimensions: [{ dimension: 'type.name' }],
              },
              {
                target: 'InvestigationInstrument',
                dimensions: [{ dimension: 'instrument.name' }],
              },
            ],
          },
        }),
      }
    );
  });

  it('does not search for non-searchable entities when visiting a direct url', async () => {
    if (state.dgsearch)
      state.dgsearch.searchableEntities = ['investigation', 'dataset'];

    history.replace('/search/data?searchText=hello&datafiles=true');

    renderComponent();

    expect(
      await screen.findByRole('tablist', {
        name: 'searchPageTable.tabs_arialabel',
      })
    ).toBeInTheDocument();

    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/search/documents',
      {
        params: generateURLSearchParams({
          query: {
            target: 'Investigation',
            text: 'hello',
            facets: [
              { target: 'Investigation' },
              {
                target: 'InvestigationParameter',
                dimensions: [{ dimension: 'type.name' }],
              },
              {
                target: 'Sample',
                dimensions: [{ dimension: 'sample.type.name' }],
              },
              {
                target: 'InvestigationInstrument',
                dimensions: [{ dimension: 'instrument.name' }],
              },
            ],
          },
        }),
      }
    );

    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/search/documents',
      {
        params: generateURLSearchParams({
          query: {
            target: 'Dataset',
            text: 'hello',
            facets: [
              {
                target: 'Dataset',
              },
              {
                target: 'DatasetParameter',
                dimensions: [{ dimension: 'type.name' }],
              },
              {
                target: 'InvestigationInstrument',
                dimensions: [{ dimension: 'instrument.name' }],
              },
            ],
          },
        }),
      }
    );

    expect(axios.get).not.toHaveBeenCalledWith(
      'https://example.com/icat/search/documents',
      {
        params: generateURLSearchParams({
          query: {
            target: 'Datafile',
            text: 'hello',
          },
        }),
      }
    );
  });

  it('initiates search when the URL is changed', async () => {
    const user = userEvent.setup();

    renderComponent();

    (axios.get as jest.Mock).mockClear();

    await user.type(
      await screen.findByRole('searchbox', {
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
        params: generateURLSearchParams({
          query: {
            target: 'Investigation',
            text: 'neutron AND scattering',
            facets: [
              { target: 'Investigation' },
              {
                target: 'InvestigationParameter',
                dimensions: [{ dimension: 'type.name' }],
              },
              {
                target: 'Sample',
                dimensions: [{ dimension: 'sample.type.name' }],
              },
              {
                target: 'InvestigationInstrument',
                dimensions: [{ dimension: 'instrument.name' }],
              },
            ],
          },
          restrict: 'true',
        }),
      }
    );
  });

  it('switches view button display name when clicked', async () => {
    const user = userEvent.setup();

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

    expect(
      await screen.findByTestId('search-box-container')
    ).toBeInTheDocument();

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

    expect(
      await screen.findByTestId('search-box-container')
    ).toBeInTheDocument();

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

    expect(
      await screen.findByTestId('search-box-container')
    ).toBeInTheDocument();

    // i.e default value is investigation it set in the searchPageContainer
    expect(history.location.search).toEqual('');
  });

  it('handles anonymous users correctly', async () => {
    (
      readSciGatewayToken as jest.MockedFn<typeof readSciGatewayToken>
    ).mockReturnValue({
      sessionId: null,
      username: 'anon/anon',
    });

    const user = userEvent.setup();

    renderComponent();

    await user.click(
      screen.getByRole('button', { name: 'searchBox.search_button_arialabel' })
    );

    expect(
      screen.queryByRole('checkbox', { name: 'check_boxes.my_data' })
    ).not.toBeInTheDocument();

    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/search/documents',
      {
        params: generateURLSearchParams({
          query: {
            target: 'Investigation',
            facets: [
              { target: 'Investigation' },
              {
                target: 'InvestigationParameter',
                dimensions: [{ dimension: 'type.name' }],
              },
              {
                target: 'Sample',
                dimensions: [{ dimension: 'sample.type.name' }],
              },
              {
                target: 'InvestigationInstrument',
                dimensions: [{ dimension: 'instrument.name' }],
              },
            ],
          },
          restrict: 'false',
        }),
      }
    );
  });
});
