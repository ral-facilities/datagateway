import { createMount, createShallow } from '@material-ui/core/test-utils';
import {
  Datafile,
  dGCommonInitialState,
  useDatafileCount,
  useIds,
  useCart,
  useAddToCart,
  useRemoveFromCart,
  useDatafilesInfinite,
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
    useDatafileCount: jest.fn(),
    useDatafilesInfinite: jest.fn(),
    useIds: jest.fn(),
    useCart: jest.fn(),
    useAddToCart: jest.fn(),
    useRemoveFromCart: jest.fn(),
    downloadDatafile: jest.fn(),
  };
});

describe('Datafile table component', () => {
  let shallow;
  let mount;
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let rowData: Datafile[];

  const createWrapper = (): ReactWrapper => {
    const store = mockStore(state);
    return mount(
      <Provider store={store}>
        <MemoryRouter>
          <QueryClientProvider client={new QueryClient()}>
            <DatafileTable datasetId="1" investigationId="2" />
          </QueryClientProvider>
        </MemoryRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    shallow = createShallow();
    mount = createMount();
    rowData = [
      {
        id: 1,
        name: 'Test 1',
        location: '/test1',
        fileSize: 1,
        modTime: '2019-07-23',
        createTime: '2019-07-23',
      },
    ];

    state = JSON.parse(
      JSON.stringify({
        dgcommon: dGCommonInitialState,
        dgdataview: dgDataViewInitialState,
      })
    );

    (useCart as jest.Mock).mockReturnValue({
      data: [],
    });
    (useDatafileCount as jest.Mock).mockReturnValue({
      data: 0,
    });
    (useDatafilesInfinite as jest.Mock).mockReturnValue({
      data: { pages: [rowData] },
      fetchNextPage: jest.fn(),
    });
    (useIds as jest.Mock).mockReturnValue({
      data: [1],
    });
    (useAddToCart as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isLoading: false,
    });
    (useRemoveFromCart as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isLoading: false,
    });
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

  it('calls useDatafilesInfinite when loadMoreRows is called', () => {
    const fetchNextPage = jest.fn();
    (useDatafilesInfinite as jest.Mock).mockReturnValue({
      data: { pages: [rowData] },
      fetchNextPage,
    });
    const wrapper = createWrapper();

    wrapper.find('VirtualizedTable').prop('loadMoreRows')({
      startIndex: 50,
      stopIndex: 74,
    });

    expect(fetchNextPage).toHaveBeenCalledWith({
      pageParam: { startIndex: 50, stopIndex: 74 },
    });
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

    expect(downloadDatafile).toHaveBeenCalled();
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

  it('renders details panel correctly', () => {
    const wrapper = shallow(
      <DatafileDetailsPanel
        rowData={rowData[0]}
        detailsPanelResize={jest.fn()}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
