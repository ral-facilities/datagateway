import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import ISISDatasetsTable from './isisDatasetsTable.component';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import configureStore from 'redux-mock-store';
import { StateType } from '../../../state/app.types';
import {
  dGCommonInitialState,
  useDatasetCount,
  useIds,
  useCart,
  useAddToCart,
  useRemoveFromCart,
  useDatasetsInfinite,
  Dataset,
  useDatasetSizes,
  DownloadButton,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactWrapper } from 'enzyme';
import { createMemoryHistory, History } from 'history';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useDatasetCount: jest.fn(),
    useDatasetsInfinite: jest.fn(),
    useIds: jest.fn(),
    useCart: jest.fn(),
    useAddToCart: jest.fn(),
    useRemoveFromCart: jest.fn(),
    useDatasetSizes: jest.fn(),
  };
});

describe('ISIS Dataset table component', () => {
  let mount;
  let mockStore;
  let state: StateType;
  let rowData: Dataset[];
  let history: History;

  const createWrapper = (): ReactWrapper => {
    const store = mockStore(state);
    return mount(
      <Provider store={store}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <ISISDatasetsTable
              studyHierarchy={false}
              instrumentId="1"
              instrumentChildId="2"
              investigationId="3"
            />
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
        size: 1,
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
    (useDatasetCount as jest.Mock).mockReturnValue({
      data: 0,
    });
    (useDatasetsInfinite as jest.Mock).mockReturnValue({
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
    (useDatasetSizes as jest.Mock).mockReturnValue({ data: 1 });
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
    const investigationId = '3';
    createWrapper();
    expect(useDatasetCount).toHaveBeenCalledWith([
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          'investigation.id': { eq: investigationId },
        }),
      },
      {
        filterType: 'include',
        filterValue: JSON.stringify('investigation'),
      },
    ]);
    expect(useDatasetsInfinite).toHaveBeenCalledWith([
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          'investigation.id': { eq: investigationId },
        }),
      },
      {
        filterType: 'include',
        filterValue: JSON.stringify('investigation'),
      },
    ]);
    expect(useDatasetSizes).toHaveBeenCalledWith({
      pages: [rowData],
    });
    expect(useIds).toHaveBeenCalledWith('dataset', [
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          'investigation.id': { eq: parseInt(investigationId) },
        }),
      },
    ]);
    expect(useCart).toHaveBeenCalled();
    expect(useAddToCart).toHaveBeenCalledWith('dataset');
    expect(useRemoveFromCart).toHaveBeenCalledWith('dataset');
  });

  it('calls useDatasetsInfinite when loadMoreRows is called', () => {
    const fetchNextPage = jest.fn();
    (useDatasetsInfinite as jest.Mock).mockReturnValue({
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
      .find('[aria-label="Filter by datasets.name"]')
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
      'input[id="datasets.modified_time filter to"]'
    );
    filterInput.instance().value = '2019-08-06';
    filterInput.simulate('change');

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent('{"modTime":{"endDate":"2019-08-06"}}')}`
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
          entityType: 'dataset',
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
      ],
    });

    const wrapper = createWrapper();

    const selectAllCheckbox = wrapper
      .find('[aria-label="select all rows"]')
      .first();

    expect(selectAllCheckbox.prop('checked')).toEqual(false);
    expect(selectAllCheckbox.prop('data-indeterminate')).toEqual(false);
  });

  it('renders dataset name as a link', () => {
    const wrapper = createWrapper();

    expect(
      wrapper.find('[aria-colindex=3]').find('p').children()
    ).toMatchSnapshot();
  });

  it('renders dataset name as a link in StudyHierarchy', () => {
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <ISISDatasetsTable
              studyHierarchy={true}
              instrumentId="1"
              instrumentChildId="2"
              investigationId="3"
            />
          </QueryClientProvider>
        </Router>
      </Provider>
    );

    expect(
      wrapper.find('[aria-colindex=3]').find('p').children()
    ).toMatchSnapshot();
  });

  it('renders actions correctly', () => {
    const wrapper = createWrapper();

    expect(wrapper.find(DownloadButton).exists()).toBeTruthy();
  });
});
