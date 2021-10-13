import { createMount } from '@material-ui/core/test-utils';
import {
  dGCommonInitialState,
  useDatafileCount,
  useIds,
  useCart,
  useAddToCart,
  useRemoveFromCart,
  useDatafilesInfinite,
  Datafile,
} from 'datagateway-common';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { StateType } from '../../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import DLSDatafilesTable from './dlsDatafilesTable.component';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactWrapper } from 'enzyme';
import { createMemoryHistory, History } from 'history';

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

describe('DLS datafiles table component', () => {
  let mount;
  let mockStore;
  let state: StateType;
  let rowData: Datafile[];
  let history: History;

  const createWrapper = (): ReactWrapper => {
    const store = mockStore(state);
    return mount(
      <Provider store={store}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <DLSDatafilesTable datasetId="1" investigationId="2" />
          </QueryClientProvider>
        </Router>
      </Provider>
    );
  };

  beforeEach(() => {
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
    history = createMemoryHistory();

    mockStore = configureStore([thunk]);
    state = JSON.parse(
      JSON.stringify({
        dgdataview: dgDataViewInitialState,
        dgcommon: dGCommonInitialState,
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
    expect(wrapper.find('VirtualizedTable').props()).toMatchSnapshot();
  });

  it('calls the correct data fetching hooks on load', () => {
    const datasetId = '1';
    const investigationId = '2';
    createWrapper();
    expect(useDatafileCount).toHaveBeenCalledWith([
      {
        filterType: 'where',
        filterValue: JSON.stringify({ 'dataset.id': { eq: datasetId } }),
      },
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          'dataset.investigation.id': { eq: investigationId },
        }),
      },
    ]);
    expect(useDatafilesInfinite).toHaveBeenCalledWith([
      {
        filterType: 'where',
        filterValue: JSON.stringify({ 'dataset.id': { eq: datasetId } }),
      },
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          'dataset.investigation.id': { eq: investigationId },
        }),
      },
    ]);
    expect(useIds).toHaveBeenCalledWith('datafile', [
      {
        filterType: 'where',
        filterValue: JSON.stringify({ 'dataset.id': { eq: datasetId } }),
      },
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          'dataset.investigation.id': { eq: investigationId },
        }),
      },
    ]);
    expect(useCart).toHaveBeenCalled();
    expect(useAddToCart).toHaveBeenCalledWith('datafile');
    expect(useRemoveFromCart).toHaveBeenCalledWith('datafile');
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

  it('updates filter query params on text filter', () => {
    const wrapper = createWrapper();

    const filterInput = wrapper
      .find('[aria-label="Filter by datafiles.name"]')
      .first();
    filterInput.instance().value = 'test';
    filterInput.simulate('change');

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent(
        '{"name":{"value":"test","type":"include"}}'
      )}`
    );

    filterInput.instance().value = '';
    filterInput.simulate('change');

    expect(history.length).toBe(3);
    expect(history.location.search).toBe('?');
  });

  it('updates filter query params on date filter', () => {
    const wrapper = createWrapper();

    const filterInput = wrapper.find(
      'input[id="datafiles.create_time filter to"]'
    );
    filterInput.instance().value = '2019-08-06';
    filterInput.simulate('change');

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent(
        '{"createTime":{"endDate":"2019-08-06"}}'
      )}`
    );

    filterInput.instance().value = '';
    filterInput.simulate('change');

    expect(history.length).toBe(3);
    expect(history.location.search).toBe('?');
  });

  it('updates sort query params on sort', () => {
    const wrapper = createWrapper();

    wrapper
      .find('[role="columnheader"] span[role="button"]')
      .first()
      .simulate('click');

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"name":"asc"}')}`
    );
  });

  it('calls addToCart mutate function on unchecked checkbox click', () => {
    const addToCart = jest.fn();
    (useAddToCart as jest.Mock).mockReturnValue({
      mutate: addToCart,
      loading: false,
    });
    const wrapper = createWrapper();

    wrapper.find('[aria-label="select row 0"]').first().simulate('click');

    expect(addToCart).toHaveBeenCalledWith([1]);
  });

  it('calls removeFromCart mutate function on checked checkbox click', () => {
    (useCart as jest.Mock).mockReturnValue({
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

    const removeFromCart = jest.fn();
    (useRemoveFromCart as jest.Mock).mockReturnValue({
      mutate: removeFromCart,
      loading: false,
    });

    const wrapper = createWrapper();

    wrapper.find('[aria-label="select row 0"]').first().simulate('click');

    expect(removeFromCart).toHaveBeenCalledWith([1]);
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
});
