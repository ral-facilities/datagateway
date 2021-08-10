import { Card, Link, ListItemText } from '@material-ui/core';
import { createMount, createShallow } from '@material-ui/core/test-utils';
import { push } from 'connected-react-router';
import {
  AdvancedFilter,
  dGCommonInitialState,
  useISISInvestigationsPaginated,
  parseSearchToQuery,
  useISISInvestigationCount,
} from 'datagateway-common';
import { ReactWrapper } from 'enzyme';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { StateType } from '../../../state/app.types';
import { initialState } from '../../../state/reducers/dgdataview.reducer';
// import axios from 'axios';
import ISISInvestigationsCardView from './isisInvestigationsCardView.component';
import { QueryClient, QueryClientProvider } from 'react-query';

jest.mock('datagateway-common');

describe('ISIS Investigations - Card View', () => {
  let mount;
  let shallow;
  let mockStore;
  let state: StateType;
  let queryClient: QueryClient;

  const createWrapper = (): ReactWrapper => {
    return shallow(
      <QueryClientProvider client={queryClient}>
        <ISISInvestigationsCardView
          instrumentId="1"
          instrumentChildId="1"
          studyHierarchy={false}
        />
      </QueryClientProvider>
    );
  };

  const createMountedWrapper = (testStore?): ReactWrapper => {
    const store = testStore ?? mockStore(state);
    return mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']}>
          <QueryClientProvider client={queryClient}>
            <ISISInvestigationsCardView
              instrumentId="1"
              instrumentChildId="1"
              studyHierarchy={false}
            />
          </QueryClientProvider>
        </MemoryRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    mount = createMount();
    shallow = createShallow();
    queryClient = new QueryClient();

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

    (useISISInvestigationCount as jest.Mock).mockImplementation(() => 1);

    // no need to mock?
    (parseSearchToQuery as jest.Mock).mockImplementation(() => {
      return {
        view: 'card',
        filters: {},
        sort: {},
        page: 1,
        results: 1,
      };
    });
    (useISISInvestigationsPaginated as jest.Mock).mockImplementation(
      () => state.dgcommon.data[0]
    );

    // (axios.get as jest.Mock).mockImplementation(() =>
    //   Promise.resolve({ data: [] })
    // );
    // (axios.post as jest.Mock).mockImplementation(() =>
    //   Promise.resolve({ data: {} })
    // );
    // (axios.delete as jest.Mock).mockImplementation(() =>
    //   Promise.resolve({ data: {} })
    // );
    global.Date.now = jest.fn(() => 1);
    // Prevent error logging
    window.scrollTo = jest.fn();
  });

  afterEach(() => {
    mount.cleanUp();
    (useISISInvestigationCount as jest.Mock).mockRestore();
    (parseSearchToQuery as jest.Mock).mockRestore();
    (useISISInvestigationsPaginated as jest.Mock).mockRestore();
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();
    expect(wrapper).toMatchSnapshot();
  });

  it('fetchCount and Data dispatched on load', () => {
    createMountedWrapper();
    expect(store.getActions().length).toEqual(2);
    expect(store.getActions()[0]).toEqual(fetchInvestigationCountRequest(1));
    expect(store.getActions()[1]).toEqual(fetchInvestigationsRequest(1));
  });

  it('fetchCount and Data dispatched on load in studyHierarchy', () => {
    const store = mockStore(state);
    mount(
      <Provider store={store}>
        <MemoryRouter>
          <ISISInvestigationsCardView
            instrumentId="1"
            instrumentChildId="1"
            studyHierarchy={true}
          />
        </MemoryRouter>
      </Provider>
    );
    expect(store.getActions().length).toEqual(2);
    expect(store.getActions()[0]).toEqual(fetchInvestigationCountRequest(1));
    expect(store.getActions()[1]).toEqual(fetchInvestigationsRequest(1));
  });

  it('addToCart dispatched on button click', () => {
    const wrapper = createMountedWrapper();
    wrapper.find(Card).find('button').simulate('click');

    expect(store.getActions().length).toEqual(3);
    expect(store.getActions()[2]).toEqual(addToCartRequest());
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
    const wrapper = createMountedWrapper();
    wrapper.find(Card).find('button').simulate('click');

    expect(store.getActions().length).toEqual(3);
    expect(store.getActions()[2]).toEqual(removeFromCartRequest());
  });

  it('pushFilters dispatched by date filter', () => {
    const wrapper = createMountedWrapper();
    const advancedFilter = wrapper.find(AdvancedFilter);
    advancedFilter.find(Link).simulate('click');
    advancedFilter
      .find('input')
      .last()
      .simulate('change', { target: { value: '2019-08-06' } });
    expect(store.getActions().length).toEqual(4);
    expect(store.getActions()[2]).toEqual(
      filterTable('endDate', { endDate: '2019-08-06', startDate: undefined })
    );
    expect(store.getActions()[3]).toEqual(push('?'));

    advancedFilter
      .find('input')
      .last()
      .simulate('change', { target: { value: '' } });
    expect(store.getActions().length).toEqual(6);
    expect(store.getActions()[4]).toEqual(filterTable('endDate', null));
    expect(store.getActions()[5]).toEqual(push('?'));
  });

  it('pushFilters dispatched by text filter', () => {
    const wrapper = createMountedWrapper();
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
    const wrapper = createMountedWrapper();
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
    const wrapper = createMountedWrapper();
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
    const wrapper = createMountedWrapper();
    wrapper
      .find('[aria-label="card-more-info-expand"]')
      .first()
      .simulate('click');

    expect(store.getActions().length).toEqual(3);
    expect(store.getActions()[2]).toEqual(fetchInvestigationDetailsRequest());

    wrapper.find('#investigation-datasets-tab').first().simulate('click');
    expect(store.getActions()).toHaveLength(4);
    expect(store.getActions()[3]).toEqual(
      push('/browse/instrument/1/facilityCycle/1/investigation/1/dataset')
    );
  });
});
