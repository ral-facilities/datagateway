import React from 'react';
import { ReactWrapper } from 'enzyme';

import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { StateType } from './state/app.types';
import { initialState as dgSearchInitialState } from './state/reducers/dgsearch.reducer';
import { dGCommonInitialState, useCart } from 'datagateway-common';
import { createMemoryHistory, History } from 'history';
import { createMount } from '@material-ui/core/test-utils';
import { MemoryRouter, Router } from 'react-router-dom';
import SearchPageContainer from './searchPageContainer.component';
import { LinearProgress } from '@material-ui/core';
import { Provider } from 'react-redux';
import axios from 'axios';
import { act } from 'react-dom/test-utils';
import { flushPromises } from './setupTests';
import {
  setInvestigationTab,
  setDatasetTab,
  setDatafileTab,
} from './state/actions/actions';
import { QueryClient, QueryClientProvider } from 'react-query';

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
  let mount;
  let queryClient: QueryClient;
  let history: History;
  let pushSpy;

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

  beforeEach(() => {
    mount = createMount();
    queryClient = new QueryClient();
    history = createMemoryHistory({
      initialEntries: ['/search/data'],
    });
    pushSpy = jest.spyOn(history, 'push');

    const dGSearchInitialState = {
      tabs: {
        datasetTab: true,
        datafileTab: true,
        investigationTab: true,
        currentTab: 'investigation',
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
    const wrapper = mount(
      <Provider store={mockStore(state)}>
        <MemoryRouter initialEntries={[{ key: 'testKey', pathname: '/' }]}>
          <QueryClientProvider client={queryClient}>
            <SearchPageContainer />
          </QueryClientProvider>
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly at /search/data route', () => {
    const wrapper = createWrapper();

    expect(wrapper.exists('SearchBoxContainer')).toBeTruthy();
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

    const wrapper = createWrapper();

    expect(wrapper.exists('SearchBoxContainerSide')).toBeTruthy();
  });

  it('display search table container when search request sent', async () => {
    const wrapper = createWrapper();

    wrapper
      .find('button[aria-label="searchBox.search_button_arialabel"]')
      .simulate('click');

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.exists('#container-search-table')).toBeTruthy();
    expect(wrapper.exists(LinearProgress)).toBeFalsy();
  });

  it('display loading bar when loading true', async () => {
    (axios.get as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve, reject) => {
          // do nothing, simulating pending promise
          // to test loading state
        })
    );

    const wrapper = createWrapper();
    wrapper
      .find('button[aria-label="searchBox.search_button_arialabel"]')
      .simulate('click');

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.exists(LinearProgress)).toBeTruthy();
  });

  it('builds correct parameters for datafile request if date and search text properties are in use', () => {
    history.replace(
      '/search/data?searchText=hello&startDate=2013-11-11&endDate=2016-11-11'
    );

    const wrapper = createWrapper();

    wrapper
      .find('button[aria-label="searchBox.search_button_arialabel"]')
      .simulate('click');
    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/lucene/data',
      {
        params: {
          maxCount: 300,
          query: {
            target: 'Datafile',
            lower: '201311110000',
            text: 'hello',
            upper: '201611112359',
          },
          sessionId: null,
        },
      }
    );
  });

  it('builds correct parameters for dataset request if date and search text properties are in use', () => {
    history.replace(
      '/search/data?searchText=hello&datafile=false&investigation=false&startDate=2013-11-11&endDate=2016-11-11'
    );

    const wrapper = createWrapper();

    wrapper
      .find('button[aria-label="searchBox.search_button_arialabel"]')
      .simulate('click');
    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/lucene/data',
      {
        params: {
          maxCount: 300,
          query: {
            target: 'Dataset',
            lower: '201311110000',
            text: 'hello',
            upper: '201611112359',
          },
          sessionId: null,
        },
      }
    );
  });

  it('builds correct parameters for investigation request if date and search text properties are in use', () => {
    history.replace(
      '/search/data?searchText=hello&dataset=false&datafile=false&startDate=2013-11-11&endDate=2016-11-11'
    );

    const wrapper = createWrapper();

    wrapper
      .find('button[aria-label="searchBox.search_button_arialabel"]')
      .simulate('click');
    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/lucene/data',
      {
        params: {
          maxCount: 300,
          query: {
            target: 'Investigation',
            lower: '201311110000',
            text: 'hello',
            upper: '201611112359',
          },
          sessionId: null,
        },
      }
    );
  });

  it('builds correct parameters for datafile request if only start date is in use', () => {
    history.replace(
      '/search/data?dataset=false&investigation=false&startDate=2013-11-11'
    );

    const wrapper = createWrapper();

    wrapper
      .find('button[aria-label="searchBox.search_button_arialabel"]')
      .simulate('click');
    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/lucene/data',
      {
        params: {
          maxCount: 300,
          query: {
            target: 'Datafile',
            lower: '201311110000',
            upper: '9000012312359',
          },
          sessionId: null,
        },
      }
    );
  });

  it('builds correct parameters for dataset request if only start date is in use', () => {
    history.replace(
      '/search/data?datafile=false&investigation=false&startDate=2013-11-11'
    );

    const wrapper = createWrapper();

    wrapper
      .find('button[aria-label="searchBox.search_button_arialabel"]')
      .simulate('click');
    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/lucene/data',
      {
        params: {
          maxCount: 300,
          query: {
            target: 'Dataset',
            lower: '201311110000',
            upper: '9000012312359',
          },
          sessionId: null,
        },
      }
    );
  });

  it('builds correct parameters for investigation request if only start date is in use', () => {
    history.replace(
      '/search/data?dataset=false&datafile=false&startDate=2013-11-11'
    );

    const wrapper = createWrapper();

    wrapper
      .find('button[aria-label="searchBox.search_button_arialabel"]')
      .simulate('click');
    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/lucene/data',
      {
        params: {
          maxCount: 300,
          query: {
            target: 'Investigation',
            lower: '201311110000',
            upper: '9000012312359',
          },
          sessionId: null,
        },
      }
    );
  });

  it('builds correct parameters for datafile request if only end date is in use', () => {
    history.replace(
      '/search/data?dataset=false&investigation=false&endDate=2016-11-11'
    );

    const wrapper = createWrapper();

    wrapper
      .find('button[aria-label="searchBox.search_button_arialabel"]')
      .simulate('click');
    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/lucene/data',
      {
        params: {
          maxCount: 300,
          query: {
            target: 'Datafile',
            lower: '0000001010000',
            upper: '201611112359',
          },
          sessionId: null,
        },
      }
    );
  });

  it('builds correct parameters for dataset request if only end date is in use', () => {
    history.replace(
      '/search/data?datafile=false&investigation=false&endDate=2016-11-11'
    );

    const wrapper = createWrapper();

    wrapper
      .find('button[aria-label="searchBox.search_button_arialabel"]')
      .simulate('click');
    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/lucene/data',
      {
        params: {
          maxCount: 300,
          query: {
            target: 'Dataset',
            lower: '0000001010000',
            upper: '201611112359',
          },
          sessionId: null,
        },
      }
    );
  });

  it('builds correct parameters for investigation request if only end date is in use', () => {
    history.replace(
      '/search/data?dataset=false&datafile=false&endDate=2016-11-11'
    );

    const wrapper = createWrapper();

    wrapper
      .find('button[aria-label="searchBox.search_button_arialabel"]')
      .simulate('click');
    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/lucene/data',
      {
        params: {
          maxCount: 300,
          query: {
            target: 'Investigation',
            lower: '0000001010000',
            upper: '201611112359',
          },
          sessionId: null,
        },
      }
    );
  });

  it('builds correct parameters for datafile request if date and search text properties are not in use', () => {
    history.replace('/search/data?dataset=false&investigation=false');

    const wrapper = createWrapper();

    wrapper
      .find('button[aria-label="searchBox.search_button_arialabel"]')
      .simulate('click');
    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/lucene/data',
      {
        params: {
          maxCount: 300,
          query: {
            target: 'Datafile',
          },
          sessionId: null,
        },
      }
    );
  });

  it('builds correct parameters for dataset request if date and search text properties are not in use', () => {
    history.replace('/search/data?datafile=false&investigation=false');

    const wrapper = createWrapper();

    wrapper
      .find('button[aria-label="searchBox.search_button_arialabel"]')
      .simulate('click');
    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/lucene/data',
      {
        params: {
          maxCount: 300,
          query: {
            target: 'Dataset',
          },
          sessionId: null,
        },
      }
    );
  });

  it('builds correct parameters for investigation request if date and search text properties are not in use', () => {
    history.replace('/search/data?dataset=false&datafile=false');

    const wrapper = createWrapper();

    wrapper
      .find('button[aria-label="searchBox.search_button_arialabel"]')
      .simulate('click');
    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/lucene/data',
      {
        params: {
          maxCount: 300,
          query: {
            target: 'Investigation',
          },
          sessionId: null,
        },
      }
    );
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

    expect(pushSpy).toHaveBeenCalledWith('?searchText=test');
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

    const wrapper = createWrapper();
    wrapper.update();

    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/lucene/data',
      {
        params: {
          maxCount: 300,
          query: {
            target: 'Datafile',
            lower: '201311110000',
            text: 'hello',
            upper: '201611112359',
          },
          sessionId: null,
        },
      }
    );
  });

  it('initiates search when visiting a direct url with empty search text', async () => {
    history.replace('/search/data?searchText=');

    const wrapper = createWrapper();
    wrapper.update();

    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/lucene/data',
      {
        params: {
          maxCount: 300,
          query: {
            target: 'Datafile',
          },
          sessionId: null,
        },
      }
    );
  });

  it('does not search for non-searchable entities when visiting a direct url', async () => {
    state.dgsearch.searchableEntities = ['investigation', 'dataset'];

    history.replace('/search/data?searchText=hello&datafiles=true');

    const wrapper = createWrapper();
    wrapper.update();

    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/lucene/data',
      {
        params: {
          maxCount: 300,
          query: {
            target: 'Investigation',
            text: 'hello',
          },
          sessionId: null,
        },
      }
    );

    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/lucene/data',
      {
        params: {
          maxCount: 300,
          query: {
            target: 'Dataset',
            text: 'hello',
          },
          sessionId: null,
        },
      }
    );

    expect(axios.get).not.toHaveBeenCalledWith(
      'https://example.com/icat/lucene/data',
      {
        params: {
          maxCount: 300,
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
    const wrapper = createWrapper();
    wrapper.update();
    (axios.get as jest.Mock).mockClear();

    history.push('?searchText=neutron+AND+scattering');
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(axios.get).toHaveBeenCalledWith(
      'https://example.com/icat/lucene/data',
      {
        params: {
          maxCount: 300,
          query: {
            target: 'Investigation',
            text: 'neutron AND scattering',
          },
          sessionId: null,
        },
      }
    );
  });

  it('switches view button display name when clicked', async () => {
    const wrapper = createWrapper();

    wrapper
      .find('button[aria-label="searchBox.search_button_arialabel"]')
      .simulate('click');

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(
      wrapper.find('[aria-label="container-view-button"]').exists()
    ).toBeTruthy();
    expect(
      wrapper.find('[aria-label="container-view-button"]').first().text()
    ).toEqual('app.view_cards');

    // Click view button
    wrapper
      .find('[aria-label="container-view-button"]')
      .first()
      .simulate('click');
    wrapper.update();

    // Check that the text on the button has changed
    expect(
      wrapper.find('[aria-label="container-view-button"]').first().text()
    ).toEqual('app.view_table');
  });

  it('does not search when there are no searchable entities', async () => {
    state.dgsearch.searchableEntities = [];

    const wrapper = createWrapper();
    wrapper
      .find('button[aria-label="searchBox.search_button_arialabel"]')
      .simulate('click');

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect((axios.get as jest.Mock).mock.calls.length).toBe(0);
  });
});
