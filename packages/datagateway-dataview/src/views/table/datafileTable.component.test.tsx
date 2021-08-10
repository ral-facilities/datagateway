import { createMount, createShallow } from '@material-ui/core/test-utils';
// import axios from 'axios';
import {
  addToCartRequest,
  Datafile,
  dGCommonInitialState,
  downloadDatafileRequest,
  fetchDatafilesRequest,
  filterTable,
  removeFromCartRequest,
  sortTable,
  useDatafileCount,
  parseSearchToQuery,
  useIds,
  useCart,
  useAddToCart,
  useRemoveFromCart,
  useDatafilesInfinite,
  useTextFilter,
  formatBytes,
} from 'datagateway-common';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { StateType } from '../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../state/reducers/dgdataview.reducer';
import DatafileTable, { DatafileDetailsPanel } from './datafileTable.component';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactWrapper } from 'enzyme';

jest.mock('datagateway-common');

describe('Datafile table component', () => {
  let shallow;
  let mount;
  let mockStore;
  let state: StateType;
  let queryClient: QueryClient;

  const createWrapper = (): ReactWrapper => {
    return shallow(
      <QueryClientProvider client={queryClient}>
        <DatafileTable datasetId="1" investigationId="2" />
      </QueryClientProvider>
    );
  };

  const createMountedWrapper = (testStore?): ReactWrapper => {
    const store = testStore ?? mockStore(state);
    return mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']}>
          <QueryClientProvider client={queryClient}>
            <DatafileTable datasetId="1" investigationId="2" />
          </QueryClientProvider>
        </MemoryRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'DatafileTable' });
    mount = createMount();
    queryClient = new QueryClient();

    mockStore = configureStore([thunk]);
    state = JSON.parse(
      JSON.stringify({
        dgcommon: dGCommonInitialState,
        dgdataview: dgDataViewInitialState,
      })
    );
    state.dgcommon.data = [
      {
        id: 1,
        name: 'Test 1',
        location: '/test1',
        fileSize: 1,
        modTime: '2019-07-23',
        createTime: '2019-07-23',
      },
    ];
    state.dgcommon.allIds = [1];

    (useDatafileCount as jest.Mock).mockImplementation(() => 1);

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
    (useDatafilesInfinite as jest.Mock).mockImplementation(
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
    (useDatafileCount as jest.Mock).mockRestore();
    (parseSearchToQuery as jest.Mock).mockRestore();
    (useIds as jest.Mock).mockRestore();
    (useCart as jest.Mock).mockRestore();
    (useAddToCart as jest.Mock).mockRestore();
    (useRemoveFromCart as jest.Mock).mockRestore();
    (formatBytes as jest.Mock).mockRestore();
    (useDatafilesInfinite as jest.Mock).mockRestore();
    (useTextFilter as jest.Mock).mockRestore();
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();
    expect(wrapper).toMatchSnapshot();
  });

  it('calls useDatafileCount, useDatafilesInfinite and useIds on page load and when store values change', () => {
    const wrapper = createMountedWrapper();

    // simulate clearTable action
    const testStore = mockStore({
      ...state,
      dgdataview: {
        ...state.dgdataview,
        sort: {},
        filters: {},
      },
    });
    wrapper.setProps({ store: testStore });

    expect(useDatafileCount).toHaveBeenCalledTimes(2);
    expect(useDatafilesInfinite).toHaveBeenCalledTimes(2);
    expect(useIds).toHaveBeenCalledTimes(2);
  });

  // needs to be adapted
  it('sends fetchDatafiles action when loadMoreRows is called', () => {
    const testStore = mockStore(state);
    const wrapper = shallow(<DatafileTable store={testStore} />);

    wrapper.prop('loadMoreRows')({ startIndex: 50, stopIndex: 74 });

    expect(testStore.getActions()[0]).toEqual(fetchDatafilesRequest(1));
  });

  // Lots of these base functionality are tested in table.component so may not be needed
  it('sends filterTable action on text filter', () => {
    // const testStore = mockStore(state);
    // const wrapper = mount(
    //   <Provider store={testStore}>
    //     <MemoryRouter>
    //       <DatafileTable datasetId="1" />
    //     </MemoryRouter>
    //   </Provider>
    // );

    const wrapper = createMountedWrapper();
    wrapper.update();
    const filterInput = wrapper
      .find('[aria-label="Filter by datafiles.name"] input')
      .first();
    filterInput.instance().value = 'test';
    filterInput.simulate('change');

    // expect(testStore.getActions()[3]).toEqual(
    //   filterTable('name', { value: 'test', type: 'include' })
    // );

    filterInput.instance().value = '';
    filterInput.simulate('change');

    expect(useTextFilter).toBeCalledTimes(3);

    // expect(testStore.getActions()[5]).toEqual(filterTable('name', null));
  });

  it('sends filterTable action on date filter', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <DatafileTable datasetId="1" />
        </MemoryRouter>
      </Provider>
    );

    const filterInput = wrapper.find(
      '[aria-label="datafiles.modified_time date filter to"]'
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
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <DatafileTable datasetId="1" />
        </MemoryRouter>
      </Provider>
    );

    wrapper
      .find('[role="columnheader"] span[role="button"]')
      .first()
      .simulate('click');

    expect(testStore.getActions()[3]).toEqual(sortTable('name', 'asc'));
  });

  it('sends addToCart action on unchecked checkbox click', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <DatafileTable datasetId="1" />
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
        entityType: 'datafile',
        id: 1,
        name: 'test',
        parentEntities: [],
      },
    ];

    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <DatafileTable datasetId="1" />
        </MemoryRouter>
      </Provider>
    );

    wrapper.find('[aria-label="select row 0"]').first().simulate('click');

    expect(testStore.getActions()[3]).toEqual(removeFromCartRequest());
  });

  it('selected rows only considers relevant cart items', () => {
    state.dgcommon.cartItems = [
      {
        entityId: 1,
        entityType: 'dataset',
        id: 1,
        name: 'test',
        parentEntities: [],
      },
      {
        entityId: 2,
        entityType: 'datafile',
        id: 2,
        name: 'test',
        parentEntities: [],
      },
    ];

    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <DatafileTable datasetId="1" />
        </MemoryRouter>
      </Provider>
    );

    const selectAllCheckbox = wrapper
      .find('[aria-label="select all rows"]')
      .first();

    expect(selectAllCheckbox.prop('checked')).toEqual(false);
    expect(selectAllCheckbox.prop('data-indeterminate')).toEqual(false);
  });

  it('sends downloadData action on click of download button', () => {
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter>
          <DatafileTable datasetId="1" />
        </MemoryRouter>
      </Provider>
    );

    wrapper.find('button[aria-label="datafiles.download"]').simulate('click');

    expect(testStore.getActions()[3]).toEqual(downloadDatafileRequest(1));
  });

  // passes but only because mount is still not returning all DOM elements
  it("doesn't display download button for datafiles with no location", () => {
    const datafile = state.dgcommon.data[0] as Datafile;
    const { location, ...datafileWithoutLocation } = datafile;
    state.dgcommon.data = [datafileWithoutLocation];

    const testStore = mockStore(state);
    const wrapper = createMountedWrapper(testStore);

    expect(
      wrapper.find('button[aria-label="datafiles.download"]')
    ).toHaveLength(0);
  });

  it('renders details panel correctly', () => {
    const wrapper = shallow(
      <DatafileDetailsPanel
        rowData={state.dgcommon.data[0]}
        detailsPanelResize={jest.fn()}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  // Not necessary as this should be a test of the formatBytes function
  // it('renders file size as bytes', () => {
  //   const wrapper = mount(
  //     <Provider store={mockStore(state)}>
  //       <MemoryRouter>
  //         <DatafileTable datasetId="1" />
  //       </MemoryRouter>
  //     </Provider>
  //   );

  //   expect(wrapper.find('[aria-colindex=5]').find('p').text()).toEqual('1 B');
  // });
});
