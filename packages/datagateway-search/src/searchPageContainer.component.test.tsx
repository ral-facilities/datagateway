import React from 'react';
import { ReactWrapper } from 'enzyme';

import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { StateType } from './state/app.types';
import { initialState as dgSearchInitialState } from './state/reducers/dgsearch.reducer';
import { dGCommonInitialState } from 'datagateway-common';

import { createMount } from '@material-ui/core/test-utils';
import { MemoryRouter } from 'react-router';
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
    expect(axios.get).toHaveBeenLastCalledWith(
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
    expect(axios.get).toHaveBeenLastCalledWith(
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
    expect(axios.get).toHaveBeenLastCalledWith(
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
    expect(axios.get).toHaveBeenLastCalledWith(
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
    expect(axios.get).toHaveBeenLastCalledWith(
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
    expect(axios.get).toHaveBeenLastCalledWith(
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
    expect(axios.get).toHaveBeenLastCalledWith(
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
    expect(axios.get).toHaveBeenLastCalledWith(
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
    expect(axios.get).toHaveBeenLastCalledWith(
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
    expect(axios.get).toHaveBeenLastCalledWith(
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
    expect(axios.get).toHaveBeenLastCalledWith(
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
    expect(axios.get).toHaveBeenLastCalledWith(
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
});
