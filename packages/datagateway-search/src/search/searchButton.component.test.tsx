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
      searchText: 'hello',
      text: '',
      selectDate: {
        startDate: new Date('2013-11-11'),
        endDate: new Date('2016-11-11'),
      },
      checkBox: {
        dataset: true,
        datafile: true,
        investigation: true,
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

  it('builds correct parameters for request if date and search text properties are in use', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <SearchButton />
        </MemoryRouter>
      </Provider>
    );

    wrapper.find('button[aria-label="submit search button"]').simulate('click');
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
});
