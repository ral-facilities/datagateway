import { createMount } from '@material-ui/core/test-utils';
// import axios from 'axios';
import {
  dGCommonInitialState,
  useDatafileCount,
  useIds,
  useCart,
  useAddToCart,
  useRemoveFromCart,
  useDatafilesInfinite,
  useTextFilter,
  useDateFilter,
  usePushSort,
  downloadDatafile,
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

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useDatafileCount: jest.fn().mockReturnValue({
      data: 1,
      isLoading: 0,
    }),
    useDatafilesInfinite: jest.fn().mockReturnValue({
      data: [
        {
          id: 1,
          name: 'Test 1',
          location: '/test1',
          fileSize: 1,
          modTime: '2019-07-23',
          createTime: '2019-07-23',
        },
      ],
    }),
    useIds: jest.fn().mockReturnValue([1]),
    useCart: jest.fn().mockReturnValue({ data: [] }),
    useAddToCart: jest.fn().mockReturnValue({
      mutate: jest.fn(),
      isLoading: 0,
    }),
    useRemoveFromCart: jest.fn().mockReturnValue({
      mutate: jest.fn(),
      isLoading: 0,
    }),
    usePushSort: jest.fn(),
    useTextFilter: jest.fn(),
    useDateFilter: jest.fn(),
    downloadDatafile: jest.fn(),
  };
});

describe('Datafile table component', () => {
  let mount;
  let mockStore;
  let state: StateType;
  let queryClient: QueryClient;

  const createWrapper = (testStore?): ReactWrapper => {
    const store = testStore ?? mockStore(state);
    return mount(
      <Provider store={store}>
        <MemoryRouter>
          <QueryClientProvider client={queryClient}>
            <DatafileTable datasetId="1" investigationId="2" />
          </QueryClientProvider>
        </MemoryRouter>
      </Provider>
    );
  };

  beforeEach(() => {
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
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists(DatafileTable)).toBeTruthy();
  });

  it('calls required query, filter and sort functions on page load', () => {
    createWrapper();
    expect(useDatafileCount).toHaveBeenCalled();
    expect(useDatafilesInfinite).toHaveBeenCalled();
    expect(useIds).toHaveBeenCalled();
    expect(useCart).toHaveBeenCalled();
    expect(useAddToCart).toHaveBeenCalled();
    expect(useRemoveFromCart).toHaveBeenCalled();
    expect(usePushSort).toHaveBeenCalled();
  });

  it('calls useDatafileCount, useDatafilesInfinite and useIds when store values change', () => {
    const wrapper = createWrapper();
    expect(useDatafileCount).toHaveBeenCalledTimes(1);
    expect(useDatafilesInfinite).toHaveBeenCalledTimes(1);
    expect(useIds).toHaveBeenCalledTimes(1);

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

  // TODO - needs to be adapted
  it.skip('calls useDatafilesInfinite when loadMoreRows is called', () => {
    const wrapper = createWrapper();
    expect(useDatafilesInfinite).toHaveBeenCalledTimes(1);
    wrapper.find(DatafileTable).simulate('scroll', { deltaY: 500 });
    // wrapper.instance.loadMoreRows({ startIndex: 50, stopIndex: 74 });
    expect(useDatafilesInfinite).toHaveBeenCalledTimes(2);
  });

  // TODO - Lots of these base functionality are tested in table.component so may not be needed
  it.skip('useTextFilter dispatched on text filter', () => {
    const wrapper = createWrapper();
    expect(useTextFilter).toBeCalledTimes(1);
    const filterInput = wrapper
      .find('[aria-label="Filter by datafiles.name"] input')
      .first();
    filterInput.instance().value = 'test';
    filterInput.simulate('change');

    expect(useTextFilter).toBeCalledTimes(2);

    filterInput.instance().value = '';
    filterInput.simulate('change');

    expect(useTextFilter).toBeCalledTimes(3);
  });

  it.skip('useDateFilter dispatched on date filter', () => {
    const wrapper = createWrapper();
    expect(useDateFilter).toBeCalledTimes(1);

    const filterInput = wrapper.find(
      '[aria-label="datafiles.modified_time date filter to"]'
    );
    filterInput.instance().value = '2019-08-06';
    filterInput.simulate('change');

    expect(useDateFilter).toBeCalledTimes(2);

    filterInput.instance().value = '';
    filterInput.simulate('change');

    expect(useDateFilter).toBeCalledTimes(3);
  });

  it.skip('useAddToCart dispatched on unchecked checkbox click', () => {
    const wrapper = createWrapper();
    expect(useAddToCart).toBeCalledTimes(1);

    wrapper.find('[aria-label="select row 0"]').first().simulate('click');

    expect(useAddToCart).toBeCalledTimes(2);
  });

  it.skip('useRemoveFromCart dispatched on checked checkbox click', () => {
    (useCart as jest.Mock).mockReturnValueOnce({
      data: [
        {
          entityId: 1,
          entityType: 'datafile',
          id: 1,
          name: 'test',
          parentEntities: [],
        },
      ],
    });

    const wrapper = createWrapper();
    expect(useRemoveFromCart).toBeCalledTimes(1);

    wrapper.find('[aria-label="select row 0"]').first().simulate('click');

    expect(useRemoveFromCart).toBeCalledTimes(2);
  });

  it('selected rows only considers relevant cart items', () => {
    (useCart as jest.Mock).mockReturnValueOnce({
      data: [
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
      ],
    });

    const wrapper = createWrapper();

    const selectAllCheckbox = wrapper
      .find('[aria-label="select all rows"]')
      .first();

    expect(selectAllCheckbox.prop('checked')).toEqual(false);
    expect(selectAllCheckbox.prop('data-indeterminate')).toEqual(false);
  });

  it('downloadDatafile dispatched on click of download button', () => {
    const wrapper = createWrapper();

    wrapper.find('button[aria-label="datafiles.download"]').simulate('click');

    expect(downloadDatafile).toBeCalledTimes(1);
  });

  it("doesn't display download button for datafiles with no location", () => {
    (useDatafilesInfinite as jest.Mock).mockReturnValueOnce([
      {
        id: 1,
        name: 'Test 1',
        fileSize: 1,
        modTime: '2019-07-23',
        createTime: '2019-07-23',
      },
    ]);

    const wrapper = createWrapper();

    expect(
      wrapper.find('button[aria-label="datafiles.download"]')
    ).toHaveLength(0);
  });

  // TODO - should this be a snapshot test?
  it('renders details panel correctly', () => {
    const wrapper = mount(
      <DatafileDetailsPanel
        rowData={state.dgcommon.data[0]}
        detailsPanelResize={jest.fn()}
      />
    );
    expect(wrapper.exists(DatafileDetailsPanel)).toBeTruthy();
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
