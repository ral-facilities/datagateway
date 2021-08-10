import { Card, Link, ListItemText } from '@material-ui/core';
import { createMount, createShallow } from '@material-ui/core/test-utils';
import {
  AdvancedFilter,
  dGCommonInitialState,
  useDatasetsPaginated,
  useDatasetCount,
  usePushFilters,
  usePushSort,
  usePushPage,
  usePushResults,
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
import ISISDatasetsCardView from './isisDatasetsCardView.component';
import { QueryClient, QueryClientProvider } from 'react-query';
import AddToCartButton from '../../addToCartButton.component';
import DatasetDetailsPanel from '../../detailsPanels/isis/datasetDetailsPanel.component';
import DownloadButton from '../../downloadButton.component';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useDatasetCount: jest.fn().mockReturnValue({
      data: 1,
      isLoading: 0,
    }),
    useDatasetsPaginated: jest.fn().mockReturnValue({
      data: [
        {
          id: 1,
          title: 'Test 1',
          name: 'Test 1',
          visitId: '1',
        },
      ],
    }),
    usePushFilters: jest.fn(),
    usePushSort: jest.fn(),
    usePushPage: jest.fn(),
    usePushResults: jest.fn(),
  };
});

describe('ISIS Datasets - Card View', () => {
  let mount;
  let shallow;
  let mockStore;
  let state: StateType;
  let queryClient: QueryClient;

  const createWrapper = (): ReactWrapper => {
    return shallow(
      <QueryClientProvider client={queryClient}>
        <ISISDatasetsCardView
          instrumentId="1"
          instrumentChildId="1"
          investigationId="1"
          studyHierarchy={false}
        />
      </QueryClientProvider>
    );
  };

  const createMountedWrapper = (testStore?): ReactWrapper => {
    const store = testStore ?? mockStore(state);
    return mount(
      <Provider store={store}>
        <MemoryRouter>
          <QueryClientProvider client={queryClient}>
            <ISISDatasetsCardView
              instrumentId="1"
              instrumentChildId="1"
              investigationId="1"
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
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();
    expect(wrapper).toMatchSnapshot();
  });

  it('calls required query, filter and sort functions on page load', () => {
    createMountedWrapper();
    expect(useDatasetCount).toHaveBeenCalled();
    expect(useDatasetsPaginated).toHaveBeenCalled();
    expect(usePushFilters).toHaveBeenCalled();
    expect(usePushSort).toHaveBeenCalled();
    expect(usePushPage).toHaveBeenCalled();
    expect(usePushResults).toHaveBeenCalled();
  });

  it('correct link used when NOT in studyHierarchy', () => {
    const wrapper = createMountedWrapper();
    expect(
      wrapper.find('[aria-label="card-title"]').childAt(0).prop('to')
    ).toEqual('/browse/instrument/1/facilityCycle/1/investigation/1/dataset/1');
  });

  it('correct link used for studyHierarchy', () => {
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <QueryClientProvider client={queryClient}>
            <ISISDatasetsCardView
              studyHierarchy={true}
              instrumentId="1"
              instrumentChildId="1"
              investigationId="1"
            />
          </QueryClientProvider>
        </MemoryRouter>
      </Provider>
    );
    expect(
      wrapper.find('[aria-label="card-title"]').childAt(0).prop('to')
    ).toEqual(
      '/browseStudyHierarchy/instrument/1/study/1/investigation/1/dataset/1'
    );
  });

  it('addToCart button displays', () => {
    const wrapper = createMountedWrapper();
    expect(wrapper.find(AddToCartButton).exists()).toBeTruthy();
    expect(wrapper.find(AddToCartButton).text()).toEqual('buttons.add_to_cart');
  });

  // TODO - This displays add to cart instead. Investigate why
  it.skip('removeFromCart button displays', () => {
    state.dgcommon.cartItems = [
      {
        entityId: 1,
        entityType: 'dataset',
        id: 1,
        name: 'Test 1',
        parentEntities: [],
      },
    ];
    const wrapper = createMountedWrapper();
    expect(wrapper.find(AddToCartButton).exists()).toBeTruthy();
    expect(wrapper.find(AddToCartButton).text()).toEqual(
      'buttons.remove_from_cart'
    );
  });

  it('download button displays', () => {
    const wrapper = createMountedWrapper();
    expect(wrapper.find(DownloadButton).exists()).toBeTruthy();
    expect(wrapper.find(DownloadButton).text()).toEqual('buttons.download');
  });

  it('displays details panel when more information is expanded', () => {
    const wrapper = createMountedWrapper();
    expect(wrapper.find(DatasetDetailsPanel).exists()).toBeFalsy();
    wrapper
      .find('[aria-label="card-more-info-expand"]')
      .first()
      .simulate('click');

    expect(wrapper.find(DatasetDetailsPanel).exists()).toBeTruthy();
  });

  // TODO -  tests below probably aren't necessary and can instead be used as tests for their individual functions
  // in common/src/api/index.test.tsx or for the cardView component itself

  it('usePushFilters dispatched by date filter', () => {
    const wrapper = createMountedWrapper();
    expect(usePushFilters).toHaveBeenCalledTimes(2);

    const advancedFilter = wrapper.find(AdvancedFilter);
    advancedFilter.find(Link).simulate('click');
    advancedFilter
      .find('input')
      .last()
      .simulate('change', { target: { value: '2019-08-06' } });
    expect(usePushFilters).toHaveBeenCalledTimes(3);

    advancedFilter
      .find('input')
      .last()
      .simulate('change', { target: { value: '' } });
    expect(usePushFilters).toHaveBeenCalledTimes(4);
  });

  it('usePushFilters dispatched by text filter', () => {
    const wrapper = createMountedWrapper();
    expect(usePushFilters).toHaveBeenCalledTimes(2);

    const advancedFilter = wrapper.find(AdvancedFilter);
    advancedFilter.find(Link).simulate('click');
    advancedFilter
      .find('input')
      .first()
      .simulate('change', { target: { value: 'test' } });
    expect(usePushFilters).toHaveBeenCalledTimes(3);

    advancedFilter
      .find('input')
      .first()
      .simulate('change', { target: { value: '' } });
    expect(usePushFilters).toHaveBeenCalledTimes(4);
  });

  it.todo('constructs more information details panel #185-188');

  it.todo('displays dataset sizes #132-136');

  // TODO - TypeError: onSort is not a function
  it.skip('usePushSort dispatched when sort button clicked', () => {
    const wrapper = createMountedWrapper();
    expect(usePushSort).toHaveBeenCalledTimes(2);

    const button = wrapper.find(ListItemText).first();
    expect(button.text()).toEqual('investigations.title');
    button.simulate('click');
    expect(usePushSort).toHaveBeenCalledTimes(3);

    // The push has outdated query?
    // expect(store.getActions().length).toEqual(4);
    // expect(store.getActions()[2]).toEqual(
    //   updateQueryParams({
    //     ...dGCommonInitialState.query,
    //     sort: { title: 'asc' },
    //     page: 1,
    //   })
    // );
    // expect(store.getActions()[3]).toEqual(push('?'));
  });

  it('usePushPage dispatched when page number is no longer valid', () => {
    const wrapper = createMountedWrapper();
    expect(usePushPage).toHaveBeenCalledTimes(2);

    const store = mockStore({
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
    expect(usePushPage).toHaveBeenCalledTimes(3);
  });

  it('usePushResults dispatched onChange', () => {
    const wrapper = createMountedWrapper();
    expect(usePushResults).toHaveBeenCalledTimes(2);

    const testStore = mockStore({
      ...state,
      dgcommon: {
        ...state.dgcommon,
        data: [
          {
            id: 2,
            title: 'Test 2',
            name: 'Test 2',
            visitId: '2',
          },
        ],
        allIds: [2],
      },
    });
    wrapper.setProps({ store: testStore });
    expect(usePushResults).toHaveBeenCalledTimes(3);
  });

  it.skip('downloadDataset dispatched on button click', () => {
    const wrapper = createMountedWrapper();
    wrapper.find(Card).find('button').last().simulate('click');

    expect(store.getActions().length).toEqual(3);
    expect(store.getActions()[2]).toEqual(downloadDatasetRequest(1));
  });
});
