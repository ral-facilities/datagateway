import {
  fireEvent,
  render,
  RenderResult,
  screen,
} from '@testing-library/react';
import { createMemoryHistory, History } from 'history';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { StateType } from '../state/app.types';
import { initialState } from '../state/reducers/dgsearch.reducer';
import SearchTextBox from './searchTextBox.component';

vi.mock('loglevel');

describe('Search text box component tests', () => {
  let state: StateType;
  const mockStore = configureStore([thunk]);
  let testStore: ReturnType<typeof mockStore>;
  let history: History;

  const testInitiateSearch = vi.fn();
  const handleChange = vi.fn();

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
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    const view = createWrapper();
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('initiates search when user presses enter key', async () => {
    createWrapper();
    const input = await screen.findByLabelText(
      'searchBox.search_text_arialabel'
    );
    fireEvent.change(input, { target: { value: 'test' } });
    expect(handleChange).toHaveBeenCalled();
    expect(testInitiateSearch).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(testInitiateSearch).toHaveBeenCalled();
  });
});
