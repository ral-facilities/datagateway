import React from 'react';
import { StateType } from '../state/app.types';
import { Provider } from 'react-redux';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import configureStore from 'redux-mock-store';
import SearchTextBox from './searchTextBox.component';
import thunk from 'redux-thunk';
import { initialState } from '../state/reducers/dgsearch.reducer';
import { createMemoryHistory, History } from 'history';
import { Router } from 'react-router-dom';

jest.mock('loglevel');

describe('Search text box component tests', () => {
  let shallow;
  let mount;
  let state: StateType;
  let mockStore;
  let testStore;
  let history: History;

  const testInitiateSearch = jest.fn();
  const handleChange = jest.fn();

  const createWrapper = (h: History = history): ReactWrapper => {
    return mount(
      <Provider store={testStore}>
        <Router history={h}>
          <SearchTextBox
            store={testStore}
            searchText=""
            initiateSearch={testInitiateSearch}
            onChange={handleChange}
          />
        </Router>
      </Provider>
    );
  };

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });
    mount = createMount();
    history = createMemoryHistory();

    state = JSON.parse(JSON.stringify({ dgsearch: initialState }));

    state.dgsearch = {
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
    testStore = mockStore(state);
  });

  afterEach(() => {
    testInitiateSearch.mockClear();
  });

  it('renders correctly', () => {
    const wrapper = shallow(
      <SearchTextBox
        store={testStore}
        searchText="test"
        initiateSearch={testInitiateSearch}
        onChange={handleChange}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('initiates search when user presses enter key', () => {
    const wrapper = createWrapper();
    wrapper
      .find('[aria-label="searchBox.search_text_arialabel"] input')
      .simulate('change', { target: { value: 'test' } });
    wrapper
      .find('[aria-label="searchBox.search_text_arialabel"] input')
      .simulate('keydown', { key: 'Enter' });
    expect(testInitiateSearch).toHaveBeenCalled();
  });
});
