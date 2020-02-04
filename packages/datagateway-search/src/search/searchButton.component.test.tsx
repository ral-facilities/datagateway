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
    const wrapper = shallow(
      <div>
        <SearchButton store={mockStore(state)} />
      </div>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('sends submitSearchText action when user clicks checkbox', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <SearchButton />
        </MemoryRouter>
      </Provider>
    );

    wrapper.find('button[aria-label="submit search button"]').simulate('click');
    expect(axios.get).toBeCalledTimes(2);
    expect(axios.get).toHaveBeenCalledWith(
      'https://scigateway-preprod.esc.rl.ac.uk:8181/icat/lucene/data',
      {
        params: {
          maxCount: 300,
          query: { target: 'Datafile' },
          sessionId: 'ac7382f9-daa2-46f4-96f3-524f2342b074',
        },
      }
    );

    //   test that correct params are generated
  });
});
