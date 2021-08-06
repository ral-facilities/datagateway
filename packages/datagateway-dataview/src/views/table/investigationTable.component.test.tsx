import { createMount, createShallow } from '@material-ui/core/test-utils';
// import axios from 'axios';
import {
  addToCartRequest,
  dGCommonInitialState,
  fetchInvestigationsRequest,
  filterTable,
  removeFromCartRequest,
  sortTable,
  useInvestigationCount,
  parseSearchToQuery,
  useIds,
  useCart,
  useAddToCart,
  useRemoveFromCart,
  useInvestigationsInfinite,
  useTextFilter,
  formatBytes,
} from 'datagateway-common';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { StateType } from '../../state/app.types';
import { initialState } from '../../state/reducers/dgdataview.reducer';
import InvestigationTable, {
  InvestigationDetailsPanel,
} from './investigationTable.component';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactWrapper } from 'enzyme';

jest.mock('datagateway-common');

describe('Investigation table component', () => {
  let shallow;
  let mount;
  let mockStore;
  let state: StateType;
  let queryClient: QueryClient;

  const createWrapper = (): ReactWrapper => {
    return shallow(
      <QueryClientProvider client={queryClient}>
        <InvestigationTable />
      </QueryClientProvider>
    );
  };

  const createMountedWrapper = (testStore?): ReactWrapper => {
    const store = testStore ?? mockStore(state);
    return mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']}>
          <QueryClientProvider client={queryClient}>
            <InvestigationTable />
          </QueryClientProvider>
        </MemoryRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'InvestigationTable' });
    mount = createMount();
    queryClient = new QueryClient();

    mockStore = configureStore([thunk]);
    state = JSON.parse(
      JSON.stringify({
        dgcommon: dGCommonInitialState,
        dgdataview: initialState,
      })
    );
    state.dgcommon.data = [
      {
        id: 1,
        title: 'Test 1',
        name: 'Test 1',
        visitId: '1',
        doi: 'doi 1',
        size: 1,
        investigationInstruments: [
          {
            id: 3,
            instrument: {
              id: 4,
              name: 'LARMOR',
            },
          },
        ],
        startDate: '2019-07-23',
        endDate: '2019-07-24',
      },
    ];
    state.dgcommon.allIds = [1];

    (useInvestigationCount as jest.Mock).mockImplementation(() => 1);

    // no need to mock?
    (parseSearchToQuery as jest.Mock).mockImplementation(() => {
      return {
        view: 'table',
        filters: {},
        sort: {},
      };
    });
    (useIds as jest.Mock).mockImplementation(() => [1]);
    (useCart as jest.Mock).mockImplementation(() => []);
    (useAddToCart as jest.Mock).mockImplementation(() => true);
    (useRemoveFromCart as jest.Mock).mockImplementation(() => true);
    (formatBytes as jest.Mock).mockImplementation(() => '1 B');
    (useInvestigationsInfinite as jest.Mock).mockImplementation(
      () => state.dgcommon.data[0]
    );
    // could just spy on this
    (useTextFilter as jest.Mock).mockImplementation(() => true);

    // (axios.get as jest.Mock).mockImplementation(() =>
    //   Promise.resolve({ data: [] })
    // );
    // (axios.post as jest.Mock).mockImplementation(() =>
    //   Promise.resolve({ data: {} })
    // );
    // (axios.delete as jest.Mock).mockImplementation(() =>
    //   Promise.resolve({ data: {} })
    // );
    // global.Date.now = jest.fn(() => 1);
  });

  afterEach(() => {
    mount.cleanUp();
    (useInvestigationCount as jest.Mock).mockRestore();
    (parseSearchToQuery as jest.Mock).mockRestore();
    (useIds as jest.Mock).mockRestore();
    (useCart as jest.Mock).mockRestore();
    (useAddToCart as jest.Mock).mockRestore();
    (useRemoveFromCart as jest.Mock).mockRestore();
    (formatBytes as jest.Mock).mockRestore();
    (useInvestigationsInfinite as jest.Mock).mockRestore();
    (useTextFilter as jest.Mock).mockRestore();
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();
    expect(wrapper).toMatchSnapshot();
  });

  it('calls useInvestigationCount, useInvestigationsInfinite and useIds on page load and when store values change', () => {
    const wrapper = createMountedWrapper();

    // simulate clearTable action
    const testStore = mockStore({
      ...state,
      dgdataview: { ...state.dgdataview, sort: {}, filters: {} },
    });
    wrapper.setProps({ store: testStore });

    expect(useInvestigationCount).toHaveBeenCalledTimes(2);
    expect(useInvestigationsInfinite).toHaveBeenCalledTimes(2);
    expect(useIds).toHaveBeenCalledTimes(2);
  });

  it('sends fetchInvestigations action when loadMoreRows is called', () => {
    // const testStore = mockStore(state);
    // const wrapper = shallow(<InvestigationTable store={testStore} />);
    const wrapper = createMountedWrapper();

    wrapper.prop('loadMoreRows')({ startIndex: 50, stopIndex: 74 });

    expect(testStore.getActions()[0]).toEqual(fetchInvestigationsRequest(1));
  });

  it('sends filterTable action on text filter', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <InvestigationTable />
        </MemoryRouter>
      </Provider>
    );

    const filterInput = wrapper
      .find('[aria-label="Filter by investigations.title"] input')
      .first();
    filterInput.instance().value = 'test';
    filterInput.simulate('change');

    expect(testStore.getActions()[3]).toEqual(
      filterTable('title', { value: 'test', type: 'include' })
    );

    filterInput.instance().value = '';
    filterInput.simulate('change');

    expect(testStore.getActions()[5]).toEqual(filterTable('title', null));
  });

  it('sends filterTable action on date filter', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <InvestigationTable />
        </MemoryRouter>
      </Provider>
    );

    const filterInput = wrapper.find(
      '[aria-label="investigations.end_date date filter to"]'
    );
    filterInput.instance().value = '2019-08-06';
    filterInput.simulate('change');

    expect(testStore.getActions()[3]).toEqual(
      filterTable('endDate', { endDate: '2019-08-06' })
    );

    filterInput.instance().value = '';
    filterInput.simulate('change');

    expect(testStore.getActions()[5]).toEqual(filterTable('endDate', null));
  });

  it('sends sortTable action on sort', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <InvestigationTable />
        </MemoryRouter>
      </Provider>
    );

    wrapper
      .find('[role="columnheader"] span[role="button"]')
      .first()
      .simulate('click');

    expect(testStore.getActions()[3]).toEqual(sortTable('title', 'asc'));
  });

  it('sends addToCart action on unchecked checkbox click', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <InvestigationTable />
        </MemoryRouter>
      </Provider>
    );

    wrapper.find('[aria-label="select row 0"]').first().simulate('click');

    expect(testStore.getActions()[3]).toEqual(addToCartRequest());
  });

  it('sends removeFromCart action on checked checkbox click', () => {
    state.dgcommon.cartItems = [
      {
        entityId: 1,
        entityType: 'investigation',
        id: 1,
        name: 'test',
        parentEntities: [],
      },
    ];

    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <InvestigationTable />
        </MemoryRouter>
      </Provider>
    );

    wrapper.find('[aria-label="select row 0"]').first().simulate('click');

    expect(testStore.getActions()[3]).toEqual(removeFromCartRequest());
  });

  it('selected rows only considers relevant cart items', () => {
    state.dgcommon.cartItems = [
      {
        entityId: 2,
        entityType: 'investigation',
        id: 1,
        name: 'test',
        parentEntities: [],
      },
      {
        entityId: 1,
        entityType: 'dataset',
        id: 2,
        name: 'test',
        parentEntities: [],
      },
    ];

    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <InvestigationTable />
        </MemoryRouter>
      </Provider>
    );

    const selectAllCheckbox = wrapper
      .find('[aria-label="select all rows"]')
      .first();

    expect(selectAllCheckbox.prop('checked')).toEqual(false);
    expect(selectAllCheckbox.prop('data-indeterminate')).toEqual(false);
  });

  it('renders details panel correctly', () => {
    const wrapper = shallow(
      <InvestigationDetailsPanel
        rowData={state.dgcommon.data[0]}
        detailsPanelResize={jest.fn()}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders investigation title as a link', () => {
    const wrapper = mount(
      <Provider store={mockStore(state)}>
        <MemoryRouter>
          <InvestigationTable />
        </MemoryRouter>
      </Provider>
    );

    expect(
      wrapper.find('[aria-colindex=3]').find('p').children()
    ).toMatchSnapshot();
  });

  it('renders date objects as just the date', () => {
    const wrapper = mount(
      <Provider store={mockStore(state)}>
        <MemoryRouter>
          <InvestigationTable />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find('[aria-colindex=9]').find('p').text()).toEqual(
      '2019-07-23'
    );

    expect(wrapper.find('[aria-colindex=10]').find('p').text()).toEqual(
      '2019-07-24'
    );
  });

  it('renders fine with incomplete data', () => {
    // this can happen when navigating between tables and the previous table's state still exists
    state.dgcommon.data = [
      {
        id: 1,
        name: 'test',
        title: 'test',
      },
    ];

    expect(() => createMountedWrapper()).not.toThrowError();
  });
});
