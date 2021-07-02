import { Link, ListItemText } from '@material-ui/core';
import { createMount, createShallow } from '@material-ui/core/test-utils';
import { push } from 'connected-react-router';
import {
  AdvancedFilter,
  dGCommonInitialState,
  filterTable,
  updatePage,
  updateQueryParams,
} from 'datagateway-common';
import { ReactWrapper } from 'enzyme';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { StateType } from '../../../state/app.types';
import { initialState } from '../../../state/reducers/dgdataview.reducer';
import axios from 'axios';
import DLSProposalsCardView from './dlsProposalsCardView.component';

describe('DLS Proposals - Card View', () => {
  let mount;
  let shallow;
  let mockStore;
  let store;
  let state: StateType;

  const createWrapper = (): ReactWrapper => {
    store = mockStore(state);
    return mount(
      <Provider store={store}>
        <MemoryRouter>
          <DLSProposalsCardView />
        </MemoryRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    mount = createMount();
    shallow = createShallow();
    mockStore = configureStore([thunk]);
    state = {
      dgcommon: {
        ...dGCommonInitialState,
        loadedCount: true,
        loadedData: true,
        totalDataCount: 1,
        data: [
          {
            id: 1,
            title: 'Test 1',
            name: 'Test 1',
            visitId: '1',
          },
        ],
        allIds: [1],
      },
      dgdataview: initialState,
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

    (axios.get as jest.Mock).mockImplementation(() =>
      Promise.resolve({ data: [] })
    );
    global.Date.now = jest.fn(() => 1);
    // Prevent error logging
    window.scrollTo = jest.fn();
  });

  afterEach(() => {
    mount.cleanUp();
  });

  it('renders correctly', () => {
    const wrapper = shallow(<DLSProposalsCardView store={mockStore(state)} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('pushFilters dispatched by text filter', () => {
    const wrapper = createWrapper();
    const advancedFilter = wrapper.find(AdvancedFilter);
    advancedFilter.find(Link).simulate('click');
    advancedFilter
      .find('input')
      .first()
      .simulate('change', { target: { value: 'test' } });
    expect(store.getActions().length).toEqual(4);
    expect(store.getActions()[2]).toEqual(
      filterTable('title', { value: 'test', type: 'include' })
    );
    expect(store.getActions()[3]).toEqual(push('?'));

    advancedFilter
      .find('input')
      .first()
      .simulate('change', { target: { value: '' } });
    expect(store.getActions().length).toEqual(6);
    expect(store.getActions()[4]).toEqual(filterTable('title', null));
    expect(store.getActions()[5]).toEqual(push('?'));
  });

  it('pushSort dispatched when sort button clicked', () => {
    const wrapper = createWrapper();
    const button = wrapper.find(ListItemText).first();
    expect(button.text()).toEqual('investigations.title');
    button.simulate('click');

    // The push has outdated query?
    expect(store.getActions().length).toEqual(4);
    expect(store.getActions()[2]).toEqual(
      updateQueryParams({
        ...dGCommonInitialState.query,
        sort: { title: 'asc' },
        page: 1,
      })
    );
    expect(store.getActions()[3]).toEqual(push('?'));
  });

  it('pushPage dispatched when page number is no longer valid', () => {
    const wrapper = createWrapper();
    store = mockStore({
      ...state,
      dgcommon: {
        ...state.dgcommon,
        totalDataCount: 1,
        query: {
          view: null,
          search: null,
          page: 2,
          results: null,
          filters: {},
          sort: {},
        },
      },
    });
    wrapper.setProps({ store: store });

    // The push has outdated query?
    expect(store.getActions().length).toEqual(3);
    expect(store.getActions()[1]).toEqual(updatePage(1));
    expect(store.getActions()[2]).toEqual(push('?page=2'));
  });

  // TODO: Can't trigger onChange for the Select element.
  // Had a similar issue in DG download with the new version of M-UI.
  it.todo('pushResults dispatched onChange');
});
