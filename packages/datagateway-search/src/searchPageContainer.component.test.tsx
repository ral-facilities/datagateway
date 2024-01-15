import * as React from 'react';

import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import type { StateType } from './state/app.types';
import { initialState as dgSearchInitialState } from './state/reducers/dgsearch.reducer';
import {
  dGCommonInitialState,
  type DownloadCartItem,
} from 'datagateway-common';
import { createMemoryHistory, createPath, type History } from 'history';
import { Router } from 'react-router-dom';
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
import { QueryClient, QueryClientProvider } from 'react-query';
import { render, type RenderResult, screen } from '@testing-library/react';
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
  let state: StateType;
  let queryClient: QueryClient;
  let history: History;
  let holder: HTMLElement;
  let cartItems: DownloadCartItem[];

  const localStorageGetItemMock = jest.spyOn(
    window.localStorage.__proto__,
    'getItem'
  );

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
    delete window.location;
    window.location = new URL(`http://localhost/search/data`);

    // below code keeps window.location in sync with history changes
    // (needed because useUpdateQueryParam uses window.location not history)
    const historyReplace = history.replace;
    const historyReplaceSpy = jest.spyOn(history, 'replace');
    historyReplaceSpy.mockImplementation((args) => {
      historyReplace(args);
      if (typeof args === 'string') {
        window.location = new URL(`http://localhost${args}`);
      } else {
        window.location = new URL(`http://localhost${createPath(args)}`);
      }
    });
    const historyPush = history.push;
    const historyPushSpy = jest.spyOn(history, 'push');
    historyPushSpy.mockImplementation((args) => {
      historyPush(args);
      if (typeof args === 'string') {
        window.location = new URL(`http://localhost${args}`);
      } else {
        window.location = new URL(`http://localhost${createPath(args)}`);
      }
    });

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
  });

  afterEach(() => {
    document.body.removeChild(holder);
    jest.clearAllMocks();
  });

  it('renders searchPageContainer correctly', () => {
    history.replace({ key: 'testKey', pathname: '/' });

    renderComponent();

    expect(screen.getByRole('link', { name: 'Search data' })).toHaveAttribute(
      'href',
      '/search/data'
    );
  });

  it('renders initial layout at /search/data route', () => {
    renderComponent();

    expect(screen.getByTestId('search-box-container')).toBeInTheDocument();
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

  it('display search results when search request sent', async () => {
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
      screen.getByRole('tab', { name: 'tabs.investigation 0' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'tabs.dataset 0' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'tabs.datafile 0' })
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

  it('clears filters when clear filters button is clicked', async () => {
    const user = userEvent.setup();

    history.replace(
      '/search/data?searchText=test&filters=%7B"title"%3A%7B"value"%3A"spend"%2C"type"%3A"include"%7D%7D'
    );

    renderComponent();

    await user.click(
      await screen.findByRole('button', { name: 'app.clear_filters' })
    );

    expect(history.location.search).toEqual('?searchText=test');
  });

  it('disables clear filters button when there is no filter applied', async () => {
    const user = userEvent.setup();

    renderComponent();

    await user.click(
      screen.getByRole('button', { name: 'searchBox.search_button_arialabel' })
    );

    expect(
      screen.getByRole('button', { name: 'app.clear_filters' })
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

  it('should hide tabs when the corresponding search type is disabled', async () => {
    const user = userEvent.setup();

    history.replace(
      '/search/data?searchText=test&dataset=false&datafile=false'
    );

    renderComponent();

    await user.click(
      screen.getByRole('button', { name: 'searchBox.search_button_arialabel' })
    );

    expect(
      screen.getByRole('tab', { name: 'tabs.investigation 0' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'tabs.dataset' })).toBeNull();
    expect(screen.queryByRole('tab', { name: 'tabs.datafile' })).toBeNull();
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

    expect(history.location.search).toEqual('?searchText=test');
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
      '/search/data?searchText=hello&startDate=2013-11-11&endDate=2016-11-11'
    );

    renderComponent();

    expect(
      await screen.findByRole('button', { name: 'app.clear_filters' })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'page view app.view_cards' })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('searchbox', {
        name: 'searchBox.search_text_arialabel',
      })
    ).toHaveValue('hello');

    expect(
      screen.getByRole('tab', { name: 'tabs.investigation 0' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'tabs.dataset 0' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'tabs.datafile 0' })
    ).toBeInTheDocument();
  });

  it('initiates search when visiting a direct url with empty search text', async () => {
    history.replace('/search/data?searchText=');

    renderComponent();

    expect(
      await screen.findByRole('button', { name: 'app.clear_filters' })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'page view app.view_cards' })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('searchbox', {
        name: 'searchBox.search_text_arialabel',
      })
    ).toHaveValue('');

    expect(
      screen.getByRole('tab', { name: 'tabs.investigation 0' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'tabs.dataset 0' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'tabs.datafile 0' })
    ).toBeInTheDocument();
  });

  it('does not search for non-searchable entities when visiting a direct url', async () => {
    state.dgsearch.searchableEntities = ['investigation', 'dataset'];

    history.replace('/search/data?searchText=hello&datafiles=true');

    renderComponent();

    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/lucene/data',
      {
        params: {
          maxCount: 300,
          query: JSON.stringify({
            target: 'Investigation',
            text: 'hello',
          }),
          sessionId: null,
        },
      }
    );

    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/lucene/data',
      {
        params: {
          maxCount: 300,
          query: JSON.stringify({
            target: 'Dataset',
            text: 'hello',
          }),
          sessionId: null,
        },
      }
    );

    expect(axios.get).not.toHaveBeenCalledWith(
      'https://example.com/icat/lucene/data',
      {
        params: {
          maxCount: 300,
          query: JSON.stringify({
            target: 'Datafile',
            text: 'hello',
          }),
          sessionId: null,
        },
      }
    );
  });

  it('initiates search when the URL is changed', async () => {
    renderComponent();

    history.push('?searchText=neutron+AND+scattering');

    expect(
      await screen.findByRole('button', { name: 'app.clear_filters' })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'page view app.view_cards' })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('searchbox', {
        name: 'searchBox.search_text_arialabel',
      })
    ).toHaveValue('neutron AND scattering');

    expect(
      screen.getByRole('tab', { name: 'tabs.investigation 0' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'tabs.dataset 0' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'tabs.datafile 0' })
    ).toBeInTheDocument();
  });

  it('switches view button display name when clicked', async () => {
    const user = userEvent.setup();

    renderComponent();

    await user.click(
      screen.getByRole('button', { name: 'searchBox.search_button_arialabel' })
    );

    const viewCardsButton = await screen.findByRole('button', {
      name: 'page view app.view_cards',
    });
    expect(viewCardsButton).toBeInTheDocument();
    await user.click(viewCardsButton);

    expect(
      await screen.findByRole('button', { name: 'page view app.view_table' })
    ).toBeInTheDocument();
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

    // '' i.e default value is investigation it set in the searchPageContainer
    expect(history.location.search).toEqual('');
  });
});
