import {
  Card,
  Chip,
  ExpansionPanel,
  Link,
  ListItemText,
  SvgIcon,
} from '@material-ui/core';
import { createMount, createShallow } from '@material-ui/core/test-utils';
import { push } from 'connected-react-router';
import {
  AdvancedFilter,
  addToCartRequest,
  dGCommonInitialState,
  fetchFilterRequest,
  filterTable,
  removeFromCartRequest,
  updatePage,
  updateQueryParams,
} from 'datagateway-common';
import { ReactWrapper } from 'enzyme';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { StateType } from '../../state/app.types';
import { initialState } from '../../state/reducers/dgdataview.reducer';
import axios from 'axios';
import InvestigationCardView from './investigationCardView.component';

describe('Investigation - Card View', () => {
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
          <InvestigationCardView />
        </MemoryRouter>
      </Provider>
    );
  };

  (axios.get as jest.Mock).mockImplementation(() =>
    Promise.resolve({ data: [] })
  );
  global.Date.now = jest.fn(() => 1);
  // Prevent error logging
  window.scrollTo = jest.fn();

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
            ID: 1,
            TITLE: 'Test 1',
            NAME: 'Test 1',
            VISIT_ID: '1',
            TYPE_ID: '2',
            FACILITY_ID: '2',
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
  });

  afterEach(() => {
    mount.cleanUp();
  });

  it('renders correctly', () => {
    const wrapper = shallow(<InvestigationCardView store={mockStore(state)} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('addToCart dispatched on button click', () => {
    const wrapper = createWrapper();
    wrapper.find(Card).find('button').simulate('click');

    expect(store.getActions().length).toEqual(5);
    expect(store.getActions()[4]).toEqual(addToCartRequest());
  });

  it('removeFromCart dispatched on button click', () => {
    state.dgcommon.cartItems = [
      {
        entityId: 1,
        entityType: 'investigation',
        id: 1,
        name: 'Test 1',
        parentEntities: [],
      },
    ];
    const wrapper = createWrapper();
    wrapper.find(Card).find('button').simulate('click');

    expect(store.getActions().length).toEqual(5);
    expect(store.getActions()[4]).toEqual(removeFromCartRequest());
  });

  it('pushFilters dispatched by date filter', () => {
    const wrapper = createWrapper();
    const advancedFilter = wrapper.find(AdvancedFilter);
    advancedFilter.find(Link).simulate('click');
    advancedFilter
      .find('input')
      .last()
      .simulate('change', { target: { value: '2019-08-06' } });
    expect(store.getActions().length).toEqual(6);
    expect(store.getActions()[4]).toEqual(
      filterTable('ENDDATE', { endDate: '2019-08-06', startDate: undefined })
    );
    expect(store.getActions()[5]).toEqual(push('?'));

    advancedFilter
      .find('input')
      .last()
      .simulate('change', { target: { value: '' } });
    expect(store.getActions().length).toEqual(8);
    expect(store.getActions()[6]).toEqual(filterTable('ENDDATE', null));
    expect(store.getActions()[7]).toEqual(push('?'));
  });

  it('pushFilters dispatched by text filter', () => {
    const wrapper = createWrapper();
    const advancedFilter = wrapper.find(AdvancedFilter);
    advancedFilter.find(Link).simulate('click');
    advancedFilter
      .find('input')
      .first()
      .simulate('change', { target: { value: 'test' } });
    expect(store.getActions().length).toEqual(6);
    expect(store.getActions()[4]).toEqual(
      filterTable('TITLE', { value: 'test', type: 'include' })
    );
    expect(store.getActions()[5]).toEqual(push('?'));

    advancedFilter
      .find('input')
      .first()
      .simulate('change', { target: { value: '' } });
    expect(store.getActions().length).toEqual(8);
    expect(store.getActions()[6]).toEqual(filterTable('TITLE', null));
    expect(store.getActions()[7]).toEqual(push('?'));
  });

  it('pushSort dispatched when sort button clicked', () => {
    const wrapper = createWrapper();
    const button = wrapper.find(ListItemText).first();
    expect(button.text()).toEqual('investigations.title');
    button.simulate('click');

    // The push has outdated query?
    expect(store.getActions().length).toEqual(6);
    expect(store.getActions()[4]).toEqual(
      updateQueryParams({
        ...dGCommonInitialState.query,
        sort: { TITLE: 'asc' },
        page: 1,
      })
    );
    expect(store.getActions()[5]).toEqual(push('?'));
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
    expect(store.getActions().length).toEqual(5);
    expect(store.getActions()[1]).toEqual(updatePage(1));
    expect(store.getActions()[2]).toEqual(push('?page=2'));
  });

  // TODO: Can't trigger onChange for the Select element.
  // Had a similar issue in DG download with the new version of M-UI.
  it.todo('pushResults dispatched onChange');

  it('pushFilters dispatched by filter panel', () => {
    state.dgcommon.filterData = {
      TYPE_ID: ['1', '2'],
      FACILITY_ID: ['1', '2'],
    };
    const wrapper = createWrapper();

    const typePanel = wrapper.find(ExpansionPanel).first();
    typePanel.simulate('click');
    expect(typePanel.find(Chip).first().text()).toEqual('1');
    expect(typePanel.find(Chip).last().text()).toEqual('2');
    typePanel.find(Chip).first().simulate('click');

    // The push has outdated query?
    expect(store.getActions().length).toEqual(8);
    expect(store.getActions()[1]).toEqual(fetchFilterRequest());
    expect(store.getActions()[2]).toEqual(fetchFilterRequest());
    expect(store.getActions()[6]).toEqual(filterTable('TYPE_ID', ['1']));
    expect(store.getActions()[7]).toEqual(push('?'));
  });

  it('pushFilters dispatched by deleting chip', () => {
    state.dgcommon.filterData = {
      TYPE_ID: ['1', '2'],
      FACILITY_ID: ['1', '2'],
    };
    state.dgcommon.query.filters = { TYPE_ID: ['1'] };
    const wrapper = createWrapper();
    wrapper.find(Chip).at(4).find(SvgIcon).simulate('click');

    // The push has outdated query?
    expect(store.getActions().length).toEqual(8);
    expect(store.getActions()[1]).toEqual(fetchFilterRequest());
    expect(store.getActions()[2]).toEqual(fetchFilterRequest());
    expect(store.getActions()[6]).toEqual(filterTable('TYPE_ID', null));
    expect(store.getActions()[7]).toEqual(push('?'));
  });
});
