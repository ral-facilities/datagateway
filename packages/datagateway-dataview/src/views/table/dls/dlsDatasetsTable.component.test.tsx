import { createMount, createShallow } from '@material-ui/core/test-utils';
// import axios from 'axios';
import {
  dGCommonInitialState,
  useDatasetCount,
  parseSearchToQuery,
  useIds,
  useCart,
  useAddToCart,
  useRemoveFromCart,
  useDatasetsInfinite,
  useTextFilter,
  formatBytes,
  Table,
} from 'datagateway-common';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { StateType } from '../../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import DLSDatasetsTable from './dlsDatasetsTable.component';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactWrapper } from 'enzyme';

jest.mock('datagateway-common');

describe('DLS Dataset table component', () => {
  let shallow;
  let mount;
  let mockStore;
  let state: StateType;
  let queryClient: QueryClient;

  const createWrapper = (): ReactWrapper => {
    return shallow(
      <QueryClientProvider client={queryClient}>
        <DLSDatasetsTable proposalName="Proposal 1" investigationId="1" />
      </QueryClientProvider>
    );
  };

  const createMountedWrapper = (testStore?): ReactWrapper => {
    const store = testStore ?? mockStore(state);
    return mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']}>
          <QueryClientProvider client={queryClient}>
            <DLSDatasetsTable proposalName="Proposal 1" investigationId="1" />
          </QueryClientProvider>
        </MemoryRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'DLSDatasetsTable' });
    mount = createMount();
    queryClient = new QueryClient();

    mockStore = configureStore([thunk]);
    state = JSON.parse(
      JSON.stringify({
        dgdataview: dgDataViewInitialState,
        dgcommon: dGCommonInitialState,
      })
    );
    state.dgcommon.data = [
      {
        id: 1,
        name: 'Test 1',
        size: 1,
        modTime: '2019-07-23',
        createTime: '2019-07-23',
      },
    ];
    state.dgcommon.allIds = [1];

    (useDatasetCount as jest.Mock).mockImplementation(() => 1);

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
    (useDatasetsInfinite as jest.Mock).mockImplementation(
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
    global.Date.now = jest.fn(() => 1);
  });

  afterEach(() => {
    mount.cleanUp();
    (useDatasetCount as jest.Mock).mockRestore();
    (parseSearchToQuery as jest.Mock).mockRestore();
    (useIds as jest.Mock).mockRestore();
    (useCart as jest.Mock).mockRestore();
    (useAddToCart as jest.Mock).mockRestore();
    (useRemoveFromCart as jest.Mock).mockRestore();
    (formatBytes as jest.Mock).mockRestore();
    (useDatasetsInfinite as jest.Mock).mockRestore();
    (useTextFilter as jest.Mock).mockRestore();
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();
    expect(wrapper).toMatchSnapshot();
  });

  it('calls useDatasetCount, useDatasetsInfinite and useIds on page load and when store values change', () => {
    const wrapper = createMountedWrapper();

    // simulate clearTable action
    const testStore = mockStore({
      ...state,
      dgdataview: { ...state.dgdataview, sort: {}, filters: {} },
    });
    wrapper.setProps({ store: testStore });

    expect(useDatasetCount).toHaveBeenCalledTimes(2);
    expect(useDatasetsInfinite).toHaveBeenCalledTimes(2);
    expect(useIds).toHaveBeenCalledTimes(2);
  });

  it('sends fetchDatasets action when loadMoreRows is called', () => {
    const testStore = mockStore(state);
    const wrapper = shallow(
      <DLSDatasetsTable
        proposalName="Proposal 1"
        investigationId="1"
        store={testStore}
      />
    );

    wrapper.prop('loadMoreRows')({ startIndex: 50, stopIndex: 74 });

    expect(testStore.getActions()[0]).toEqual(fetchDatasetsRequest(1));
  });

  it('sends filterTable action on text filter', () => {
    const testStore = mockStore(state);
    const wrapper = createMountedWrapper();

    const filterInput = wrapper
      .find('[aria-label="Filter by datasets.name"] input')
      .first();
    filterInput.instance().value = 'test';
    filterInput.simulate('change');

    expect(testStore.getActions()[3]).toEqual(
      filterTable('name', { value: 'test', type: 'include' })
    );

    filterInput.instance().value = '';
    filterInput.simulate('change');

    expect(testStore.getActions()[5]).toEqual(filterTable('name', null));
  });

  it('sends filterTable action on date filter', () => {
    const testStore = mockStore(state);
    const wrapper = createMountedWrapper();

    const filterInput = wrapper.find(
      '[aria-label="datasets.modified_time date filter to"]'
    );
    filterInput.instance().value = '2019-08-06';
    filterInput.simulate('change');

    expect(testStore.getActions()[3]).toEqual(
      filterTable('modTime', { endDate: '2019-08-06' })
    );

    filterInput.instance().value = '';
    filterInput.simulate('change');

    expect(testStore.getActions()[5]).toEqual(filterTable('modTime', null));
  });

  it('sends sortTable action on sort', () => {
    const testStore = mockStore(state);
    const wrapper = createMountedWrapper();

    wrapper
      .find('[role="columnheader"] span[role="button"]')
      .first()
      .simulate('click');

    expect(testStore.getActions()[3]).toEqual(sortTable('name', 'asc'));
  });

  it('sends addToCart action on unchecked checkbox click', () => {
    const testStore = mockStore(state);
    const wrapper = createMountedWrapper();

    wrapper.find('[aria-label="select row 0"]').first().simulate('click');

    expect(testStore.getActions()[3]).toEqual(addToCartRequest());
  });

  it('sends removeFromCart action on checked checkbox click', () => {
    state.dgcommon.cartItems = [
      {
        entityId: 1,
        entityType: 'dataset',
        id: 1,
        name: 'test',
        parentEntities: [],
      },
    ];

    const testStore = mockStore(state);
    const wrapper = createMountedWrapper();

    wrapper.find('[aria-label="select row 0"]').first().simulate('click');

    expect(testStore.getActions()[3]).toEqual(removeFromCartRequest());
  });

  it('selected rows only considers relevant cart items', () => {
    state.dgcommon.cartItems = [
      {
        entityId: 1,
        entityType: 'investigation',
        id: 1,
        name: 'test',
        parentEntities: [],
      },
      {
        entityId: 2,
        entityType: 'dataset',
        id: 2,
        name: 'test',
        parentEntities: [],
      },
    ];

    const wrapper = createMountedWrapper();

    const selectAllCheckbox = wrapper
      .find('[aria-label="select all rows"]')
      .first();

    expect(selectAllCheckbox.prop('checked')).toEqual(false);
    expect(selectAllCheckbox.prop('data-indeterminate')).toEqual(false);
  });

  it.skip('renders details panel correctly and it sends off an FetchDatasetDetails action', () => {
    const testStore = mockStore(state);
    const wrapper = createMountedWrapper();

    const detailsPanelWrapper = shallow(
      wrapper.find(Table).prop('detailsPanel')({
        rowData: state.dgcommon.data[0],
      })
    );
    expect(detailsPanelWrapper).toMatchSnapshot();

    mount(
      wrapper.find(Table).prop('detailsPanel')({
        rowData: state.dgcommon.data[0],
        detailsPanelResize: jest.fn(),
      })
    );

    expect(testStore.getActions()[3]).toEqual(fetchDatasetDetailsRequest());
  });

  it('sends off an FetchDatasetSize action when Calculate button is clicked', () => {
    const { size, ...rowDataWithoutSize } = state.dgcommon.data[0];
    const newState = state;
    newState.dgcommon.data[0] = rowDataWithoutSize;
    const testStore = mockStore(newState);

    const wrapper = createMountedWrapper(testStore);

    wrapper.find('[aria-label="Show details"]').first().simulate('click');

    wrapper.find('#calculate-size-btn').first().simulate('click');

    expect(testStore.getActions()[4]).toEqual(fetchDatasetSizeRequest());
  });

  it('renders Dataset title as a link', () => {
    const wrapper = createMountedWrapper();

    expect(
      wrapper.find('[aria-colindex=3]').find('p').children()
    ).toMatchSnapshot();
  });
});
