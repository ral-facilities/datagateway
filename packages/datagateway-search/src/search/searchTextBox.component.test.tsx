import { StateType } from '../state/app.types';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import SearchTextBox from './searchTextBox.component';
import thunk from 'redux-thunk';
import { initialState } from '../state/reducers/dgsearch.reducer';
import { createMemoryHistory, History } from 'history';
import { Router } from 'react-router-dom';
import { fireEvent, render, RenderResult } from '@testing-library/react';

jest.mock('loglevel');

describe('Search text box component tests', () => {
  let state: StateType;
  const mockStore = configureStore([thunk]);
  let testStore: ReturnType<typeof mockStore>;
  let history: History;

  const testInitiateSearch = jest.fn();
  const handleChange = jest.fn();

  const createWrapper = (h: History = history): RenderResult => {
    return render(
      <Provider store={testStore}>
        <Router history={h}>
          <SearchTextBox
            searchText=""
            initiateSearch={testInitiateSearch}
            onChange={handleChange}
          />
        </Router>
      </Provider>
    );
  };

  beforeEach(() => {
    history = createMemoryHistory();

    state = JSON.parse(JSON.stringify({ dgsearch: initialState }));

    state.dgsearch = {
      ...state.dgsearch,
      tabs: {
        datasetTab: true,
        datafileTab: true,
        investigationTab: true,
      },
      settingsLoaded: true,
    };

    testStore = mockStore(state);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();
    expect(wrapper.asFragment()).toMatchSnapshot();
  });

  it('initiates search when user presses enter key', async () => {
    const wrapper = createWrapper();
    const input = await wrapper.findByLabelText(
      'searchBox.search_text_arialabel'
    );
    fireEvent.change(input, { target: { value: 'test' } });
    expect(handleChange).toHaveBeenCalled();
    expect(testInitiateSearch).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(testInitiateSearch).toHaveBeenCalled();
  });
});
