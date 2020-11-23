import React from 'react';
import { StateType } from '../state/app.types';
import { Provider } from 'react-redux';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import configureStore from 'redux-mock-store';
import SearchButton from './searchButton.component';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router';
import { initialState } from '../state/reducers/dgsearch.reducer';
import axios from 'axios';
import {
  setInvestigationTab,
  setDatasetTab,
  setDatafileTab,
} from '../state/actions/actions';
import { act } from 'react-dom/test-utils';
import { flushPromises } from '../setupTests';

jest.mock('loglevel');

describe('Search Button component tests', () => {
  let shallow;
  let state: StateType;
  let mockStore;
  let mount;
  (axios.get as jest.Mock).mockImplementation(() =>
    Promise.resolve({ data: [] })
  );

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });
    mount = createMount();

    state = JSON.parse(JSON.stringify({ dgsearch: initialState }));

    state.dgcommon = {
      urls: {
        downloadApiUrl: 'https://scigateway-preprod.esc.rl.ac.uk:8181/topcat',
      },
    };

    state.dgsearch = {
      searchText: '',
      text: '',
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
      },
      requestReceived: false,
      searchData: {
        dataset: [],
        datafile: [],
        investigation: [],
      },
      settingsLoaded: true,
    };

    mockStore = configureStore([thunk]);
  });

  it('renders correctly', () => {
    const wrapper = shallow(
      <div>
        <SearchButton store={mockStore(state)} />
      </div>
    );
    expect(wrapper).toMatchSnapshot();
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

    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <SearchButton />
        </MemoryRouter>
      </Provider>
    );

    wrapper
      .find('button[aria-label="searchBox.search_button_arialabel"]')
      .simulate('click');
    expect(axios.get).toHaveBeenCalledWith(
      'https://scigateway-preprod.esc.rl.ac.uk:8181/icat/lucene/data',
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

    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <SearchButton />
        </MemoryRouter>
      </Provider>
    );

    wrapper
      .find('button[aria-label="searchBox.search_button_arialabel"]')
      .simulate('click');
    expect(axios.get).toHaveBeenCalledWith(
      'https://scigateway-preprod.esc.rl.ac.uk:8181/icat/lucene/data',
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

    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <SearchButton />
        </MemoryRouter>
      </Provider>
    );

    wrapper
      .find('button[aria-label="searchBox.search_button_arialabel"]')
      .simulate('click');
    expect(axios.get).toHaveBeenCalledWith(
      'https://scigateway-preprod.esc.rl.ac.uk:8181/icat/lucene/data',
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

    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <SearchButton />
        </MemoryRouter>
      </Provider>
    );

    wrapper
      .find('button[aria-label="searchBox.search_button_arialabel"]')
      .simulate('click');
    expect(axios.get).toHaveBeenCalledWith(
      'https://scigateway-preprod.esc.rl.ac.uk:8181/icat/lucene/data',
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

    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <SearchButton />
        </MemoryRouter>
      </Provider>
    );

    wrapper
      .find('button[aria-label="searchBox.search_button_arialabel"]')
      .simulate('click');
    expect(axios.get).toHaveBeenCalledWith(
      'https://scigateway-preprod.esc.rl.ac.uk:8181/icat/lucene/data',
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

    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <SearchButton />
        </MemoryRouter>
      </Provider>
    );

    wrapper
      .find('button[aria-label="searchBox.search_button_arialabel"]')
      .simulate('click');
    expect(axios.get).toHaveBeenCalledWith(
      'https://scigateway-preprod.esc.rl.ac.uk:8181/icat/lucene/data',
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

    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <SearchButton />
        </MemoryRouter>
      </Provider>
    );

    wrapper
      .find('button[aria-label="searchBox.search_button_arialabel"]')
      .simulate('click');
    expect(axios.get).toHaveBeenCalledWith(
      'https://scigateway-preprod.esc.rl.ac.uk:8181/icat/lucene/data',
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

    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <SearchButton />
        </MemoryRouter>
      </Provider>
    );

    wrapper
      .find('button[aria-label="searchBox.search_button_arialabel"]')
      .simulate('click');
    expect(axios.get).toHaveBeenCalledWith(
      'https://scigateway-preprod.esc.rl.ac.uk:8181/icat/lucene/data',
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

    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <SearchButton />
        </MemoryRouter>
      </Provider>
    );

    wrapper
      .find('button[aria-label="searchBox.search_button_arialabel"]')
      .simulate('click');
    expect(axios.get).toHaveBeenCalledWith(
      'https://scigateway-preprod.esc.rl.ac.uk:8181/icat/lucene/data',
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
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <SearchButton />
        </MemoryRouter>
      </Provider>
    );

    wrapper
      .find('button[aria-label="searchBox.search_button_arialabel"]')
      .simulate('click');
    expect(axios.get).toHaveBeenCalledWith(
      'https://scigateway-preprod.esc.rl.ac.uk:8181/icat/lucene/data',
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

    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <SearchButton />
        </MemoryRouter>
      </Provider>
    );

    wrapper
      .find('button[aria-label="searchBox.search_button_arialabel"]')
      .simulate('click');
    expect(axios.get).toHaveBeenCalledWith(
      'https://scigateway-preprod.esc.rl.ac.uk:8181/icat/lucene/data',
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

    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <SearchButton />
        </MemoryRouter>
      </Provider>
    );

    wrapper
      .find('button[aria-label="searchBox.search_button_arialabel"]')
      .simulate('click');
    expect(axios.get).toHaveBeenCalledWith(
      'https://scigateway-preprod.esc.rl.ac.uk:8181/icat/lucene/data',
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
        investigation: false,
      },
    };

    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <SearchButton />
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

    expect(testStore.getActions()[0]).toEqual(setDatasetTab(false));
    expect(testStore.getActions()[1]).toEqual(setDatafileTab(false));
    expect(testStore.getActions()[2]).toEqual(setInvestigationTab(false));
  });
});
