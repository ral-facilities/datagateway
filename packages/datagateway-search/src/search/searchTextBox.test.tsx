import React from 'react';
import { StateType } from '../state/app.types';
import { Provider } from 'react-redux';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import configureStore from 'redux-mock-store';
import SearchTextBox from './searchTextBox.component';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router';
import { initialState } from '../state/reducers/dgsearch.reducer';
import { submitSearchText } from '../state/actions/actions';

jest.mock('loglevel');

describe('Search text box component tests', () => {
  let shallow;
  let state: StateType;
  let mockStore;
  let mount;

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });
    mount = createMount();

    state = JSON.parse(JSON.stringify({ dgsearch: initialState }));

    state.dgsearch = {
      searchText: '',
      text: '',
      selectDate: {
        startDate: null,
        endDate: null,
      },
      checkBox: {
        dataset: true,
        datafile: true,
        investigation: false,
      },
    };

    mockStore = configureStore([thunk]);
  });

  it('renders correctly', () => {
    const wrapper = shallow(<SearchTextBox store={mockStore(state)} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('sends selectStartDate action when user types number into Start Date input', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <SearchTextBox />
        </MemoryRouter>
      </Provider>
    );

    wrapper
      .find('[aria-label="search text input"]')
      .simulate('change', { target: { value: 'test' } });

    expect(testStore.getActions()[0]).toEqual(submitSearchText('test'));
  });
});
