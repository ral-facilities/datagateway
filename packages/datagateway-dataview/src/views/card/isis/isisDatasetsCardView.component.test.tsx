import { Card, Link, ListItemText } from '@material-ui/core';
import { createMount, createShallow } from '@material-ui/core/test-utils';
import { push } from 'connected-react-router';
import {
  AdvancedFilter,
  addToCartRequest,
  dGCommonInitialState,
  downloadDatasetRequest,
  fetchDatasetDetailsRequest,
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
import { StateType } from '../../../state/app.types';
import { initialState } from '../../../state/reducers/dgdataview.reducer';
import axios from 'axios';
import ISISDatasetsCardView from './isisDatasetsCardView.component';

describe('ISIS Datasets - Card View', () => {
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
          <ISISDatasetsCardView investigationId="1" />
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
            name: 'Test 1',
            size: 1,
            modTime: '2019-07-23',
            createTime: '2019-07-23',
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
    const wrapper = shallow(
      <ISISDatasetsCardView store={mockStore(state)} investigationId="1" />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('correct link used when NOT in studyHierarchy', () => {
    store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <ISISDatasetsCardView
            studyHierarchy={false}
            instrumentId="1"
            instrumentChildId="1"
            investigationId="1"
          />
        </MemoryRouter>
      </Provider>
    );
    expect(
      wrapper.find('[aria-label="card-title"]').childAt(0).prop('to')
    ).toEqual(
      '/browse/instrument/1/facilityCycle/1/investigation/1/dataset/1/datafile'
    );
  });

  it('correct link used for studyHierarchy', () => {
    store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <ISISDatasetsCardView
            studyHierarchy={true}
            instrumentId="1"
            instrumentChildId="1"
            investigationId="1"
          />
        </MemoryRouter>
      </Provider>
    );
    expect(
      wrapper.find('[aria-label="card-title"]').childAt(0).prop('to')
    ).toEqual(
      '/browseStudyHierarchy/instrument/1/study/1/investigation/1/dataset/1/datafile'
    );
  });

  it('addToCart dispatched on button click', () => {
    const wrapper = createWrapper();
    wrapper.find(Card).find('button').first().simulate('click');

    expect(store.getActions().length).toEqual(3);
    expect(store.getActions()[2]).toEqual(addToCartRequest());
  });

  it('removeFromCart dispatched on button click', () => {
    state.dgcommon.cartItems = [
      {
        entityId: 1,
        entityType: 'dataset',
        id: 1,
        name: 'Test 1',
        parentEntities: [],
      },
    ];
    const wrapper = createWrapper();
    wrapper.find(Card).find('button').first().simulate('click');

    expect(store.getActions().length).toEqual(3);
    expect(store.getActions()[2]).toEqual(removeFromCartRequest());
  });

  it('pushFilters dispatched by date filter', () => {
    const wrapper = createWrapper();
    const advancedFilter = wrapper.find(AdvancedFilter);
    advancedFilter.find(Link).simulate('click');
    advancedFilter
      .find('input')
      .last()
      .simulate('change', { target: { value: '2019-08-06' } });
    expect(store.getActions().length).toEqual(4);
    expect(store.getActions()[2]).toEqual(
      filterTable('modTime', { endDate: '2019-08-06' })
    );
    expect(store.getActions()[3]).toEqual(push('?'));

    advancedFilter
      .find('input')
      .last()
      .simulate('change', { target: { value: '' } });
    expect(store.getActions().length).toEqual(6);
    expect(store.getActions()[4]).toEqual(filterTable('modTime', null));
    expect(store.getActions()[5]).toEqual(push('?'));
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
      filterTable('name', { value: 'test', type: 'include' })
    );
    expect(store.getActions()[3]).toEqual(push('?'));

    advancedFilter
      .find('input')
      .first()
      .simulate('change', { target: { value: '' } });
    expect(store.getActions().length).toEqual(6);
    expect(store.getActions()[4]).toEqual(filterTable('name', null));
    expect(store.getActions()[5]).toEqual(push('?'));
  });

  it('pushSort dispatched when sort button clicked', () => {
    const wrapper = createWrapper();
    const button = wrapper.find(ListItemText).first();
    expect(button.text()).toEqual('datasets.name');
    button.simulate('click');

    // The push has outdated query?
    expect(store.getActions().length).toEqual(4);
    expect(store.getActions()[2]).toEqual(
      updateQueryParams({
        ...dGCommonInitialState.query,
        sort: { name: 'asc' },
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

  it('fetchDetails dispatched when details panel expanded', () => {
    const wrapper = createWrapper();
    wrapper
      .find('[aria-label="card-more-info-expand"]')
      .first()
      .simulate('click');

    expect(store.getActions().length).toEqual(3);
    expect(store.getActions()[2]).toEqual(fetchDatasetDetailsRequest());
  });

  it('downloadDataset dispatched on button click', () => {
    const wrapper = createWrapper();
    wrapper.find(Card).find('button').last().simulate('click');

    expect(store.getActions().length).toEqual(3);
    expect(store.getActions()[2]).toEqual(downloadDatasetRequest(1));
  });
});
