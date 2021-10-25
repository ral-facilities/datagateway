import React from 'react';
import { ReactWrapper } from 'enzyme';

import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { StateType } from './state/app.types';
import { initialState as dgSearchInitialState } from './state/reducers/dgsearch.reducer';
import {
  dGCommonInitialState,
  parseSearchToQuery,
  QueryParams,
  useCart,
} from 'datagateway-common';
import { createMemoryHistory } from 'history';
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

  const createWrapper = (path = '/search/data'): ReactWrapper => {
    const mockStore = configureStore([thunk]);
    return mount(
      <Provider store={mockStore(state)}>
        <MemoryRouter initialEntries={[{ key: 'testKey', pathname: path }]}>
          <QueryClientProvider client={new QueryClient()}>
            <SearchPageContainer />
          </QueryClientProvider>
        </MemoryRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    mount = createMount();

    const dGSearchInitialState = {
      searchText: '',
      selectDate: {
        startDate: null,
        endDate: null,
      },
      checkBox: {
        dataset: false,
        datafile: true,
        investigation: false,
      },
      tabs: {
        datasetTab: true,
        datafileTab: true,
        investigationTab: true,
        currentTab: 'investigation',
      },
      sideLayout: false,
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

  it('renders searchPageContainer correctly', () => {
    const wrapper = createWrapper('/');

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
    state.dgsearch = {
      ...state.dgsearch,
      searchText: 'hello',
      selectDate: {
        startDate: new Date('2013-11-11'),
        endDate: new Date('2016-11-11'),
      },
    };

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
    state.dgsearch = {
      ...state.dgsearch,
      searchText: 'hello',
      selectDate: {
        startDate: new Date('2013-11-11'),
        endDate: new Date('2016-11-11'),
      },
      checkBox: {
        ...state.dgsearch.checkBox,
        dataset: true,
        datafile: false,
        investigation: false,
      },
    };

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
    state.dgsearch = {
      ...state.dgsearch,
      searchText: 'hello',
      selectDate: {
        startDate: new Date('2013-11-11'),
        endDate: new Date('2016-11-11'),
      },
      checkBox: {
        ...state.dgsearch.checkBox,
        dataset: false,
        datafile: false,
        investigation: true,
      },
    };

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
    state.dgsearch = {
      ...state.dgsearch,
      selectDate: {
        ...state.dgsearch.selectDate,
        startDate: new Date('2013-11-11'),
      },
    };

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
    state.dgsearch = {
      ...state.dgsearch,
      selectDate: {
        ...state.dgsearch.selectDate,
        startDate: new Date('2013-11-11'),
      },
      checkBox: {
        ...state.dgsearch.checkBox,
        dataset: true,
        datafile: false,
        investigation: false,
      },
    };

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
    state.dgsearch = {
      ...state.dgsearch,
      selectDate: {
        ...state.dgsearch.selectDate,
        startDate: new Date('2013-11-11'),
      },
      checkBox: {
        ...state.dgsearch.checkBox,
        dataset: false,
        datafile: false,
        investigation: true,
      },
    };

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
    state.dgsearch = {
      ...state.dgsearch,
      selectDate: {
        ...state.dgsearch.selectDate,
        endDate: new Date('2016-11-11'),
      },
    };

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
    state.dgsearch = {
      ...state.dgsearch,
      selectDate: {
        ...state.dgsearch.selectDate,
        endDate: new Date('2016-11-11'),
      },
      checkBox: {
        ...state.dgsearch.checkBox,
        dataset: true,
        datafile: false,
        investigation: false,
      },
    };

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
    state.dgsearch = {
      ...state.dgsearch,
      selectDate: {
        ...state.dgsearch.selectDate,
        endDate: new Date('2016-11-11'),
      },
      checkBox: {
        ...state.dgsearch.checkBox,
        dataset: false,
        datafile: false,
        investigation: true,
      },
    };

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
            upper: '9000012312359',
          },
          sessionId: null,
        },
      }
    );
  });

  it('builds correct parameters for dataset request if date and search text properties are not in use', () => {
    state.dgsearch = {
      ...state.dgsearch,
      checkBox: {
        ...state.dgsearch.checkBox,
        dataset: true,
        datafile: false,
        investigation: false,
      },
    };

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
            upper: '9000012312359',
          },
          sessionId: null,
        },
      }
    );
  });

  it('builds correct parameters for investigation request if date and search text properties are not in use', () => {
    state.dgsearch = {
      ...state.dgsearch,
      checkBox: {
        ...state.dgsearch.checkBox,
        dataset: false,
        datafile: false,
        investigation: true,
      },
    };

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
            upper: '9000012312359',
          },
          sessionId: null,
        },
      }
    );
  });

  it('sends actions to update tabs when user clicks search button', async () => {
    state.dgsearch = {
      ...state.dgsearch,
      checkBox: {
        ...state.dgsearch.checkBox,
        dataset: false,
        datafile: false,
        investigation: true,
      },
    };

    const mockStore = configureStore([thunk]);
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter
          initialEntries={[{ key: 'testKey', pathname: '/search/data' }]}
        >
          <QueryClientProvider client={new QueryClient()}>
            <SearchPageContainer />
          </QueryClientProvider>
        </MemoryRouter>
      </Provider>
    );
    testStore.clearActions();

    wrapper
      .find('button[aria-label="searchBox.search_button_arialabel"]')
      .simulate('click');

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(testStore.getActions()[0]).toEqual(setDatafileTab(false));
    expect(testStore.getActions()[1]).toEqual(setDatasetTab(false));
    expect(testStore.getActions()[2]).toEqual(setInvestigationTab(true));
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

  it('generates correct url on search', async () => {
    const history = createMemoryHistory();
    history.push('/search/data');
    const pushSpy = jest.spyOn(history, 'push');

    state.dgsearch = {
      ...state.dgsearch,
      searchText: 'hello',
      selectDate: {
        startDate: new Date('2013-11-11'),
        endDate: new Date('2016-11-11'),
      },
      checkBox: {
        ...state.dgsearch.checkBox,
        dataset: false,
        datafile: false,
        investigation: true,
      },
    };

    const createWrapperNew = (): ReactWrapper => {
      const mockStore = configureStore([thunk]);
      return mount(
        <Provider store={mockStore(state)}>
          <Router history={history}>
            <QueryClientProvider client={new QueryClient()}>
              <SearchPageContainer />
            </QueryClientProvider>
          </Router>
        </Provider>
      );
    };

    const wrapper = createWrapperNew();

    wrapper
      .find('button[aria-label="searchBox.search_button_arialabel"]')
      .simulate('click');

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });
    expect(pushSpy).toHaveBeenCalledWith(
      '?searchText=hello&dataset=false&datafile=false&investigation=true'
    );
    expect(pushSpy).toHaveBeenCalledWith(
      expect.stringContaining('?startDate=2013-11-11')
    );
    expect(pushSpy).toHaveBeenCalledWith(
      expect.stringContaining('?endDate=2016-11-11')
    );
  });

  it('initiates search when url contains the required parameters', async () => {
    const returnParams: QueryParams = {
      view: 'card',
      search: null,
      page: null,
      results: null,
      filters: {},
      sort: {},
      searchText: 'test',
      dataset: false,
      datafile: true,
      investigation: false,
      startDate: new Date('2021-10-23T00:00:00Z'),
      endDate: new Date('2021-10-25T00:00:00Z'),
    };

    const dGSearchInitialState = {
      searchText: returnParams.searchText,
      selectDate: {
        startDate: returnParams.startDate,
        endDate: returnParams.endDate,
      },
      checkBox: {
        dataset: returnParams.dataset,
        datafile: returnParams.datafile,
        investigation: returnParams.investigation,
      },
      tabs: {
        datasetTab: true,
        datafileTab: true,
        investigationTab: true,
        currentTab: 'investigation',
      },
      sideLayout: false,
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
    (parseSearchToQuery as jest.Mock).mockReturnValue(returnParams);

    const wrapper = createWrapper();

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
            target: 'Datafile',
            lower: '202110230000',
            text: 'test',
            upper: '202110252359',
          },
          sessionId: null,
        },
      }
    );
  });
});
