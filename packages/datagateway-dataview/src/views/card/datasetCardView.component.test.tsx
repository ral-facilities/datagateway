import { Link, ListItemText } from '@material-ui/core';
import { createMount } from '@material-ui/core/test-utils';
import {
  AdvancedFilter,
  dGCommonInitialState,
  useDatasetsPaginated,
  useDatasetCount,
  Dataset,
  useCart,
} from 'datagateway-common';
import { ReactWrapper } from 'enzyme';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { StateType } from '../../state/app.types';
import DatasetCardView from './datasetCardView.component';
import { QueryClient, QueryClientProvider } from 'react-query';
import AddToCartButton from '../addToCartButton.component';
import { createMemoryHistory, History } from 'history';
import { initialState as dgDataViewInitialState } from '../../state/reducers/dgdataview.reducer';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useDatasetCount: jest.fn(),
    useDatasetsPaginated: jest.fn(),
    useCart: jest.fn(),
  };
});

describe('Dataset - Card View', () => {
  let mount;
  let mockStore;
  let state: StateType;
  let cardData: Dataset[];
  let history: History;

  const createWrapper = (): ReactWrapper => {
    const store = mockStore(state);
    return mount(
      <Provider store={store}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <DatasetCardView investigationId="1" />
          </QueryClientProvider>
        </Router>
      </Provider>
    );
  };

  beforeEach(() => {
    mount = createMount();
    cardData = [
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
        dgcommon: dGCommonInitialState,
        dgdataview: dgDataViewInitialState,
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
      })
    );

    (useDatasetCount as jest.Mock).mockReturnValue({
      data: 0,
    });
    (useDatasetsPaginated as jest.Mock).mockReturnValue({
      data: cardData,
      isLoading: false,
    });
    (useCart as jest.Mock).mockReturnValue({
      data: [],
    });

    window.scrollTo = jest.fn();
  });

  afterEach(() => {
    mount.cleanUp();
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('CardView').props()).toMatchSnapshot();
  });

  it('calls the correct data fetching hooks on load', () => {
    const investigationId = '1';
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
    expect(useDatasetsPaginated).toHaveBeenCalledWith([
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
  });

  it('updates filter query params on text filter', () => {
    const wrapper = createWrapper();

    const advancedFilter = wrapper.find(AdvancedFilter);
    advancedFilter.find(Link).simulate('click');
    advancedFilter
      .find('input')
      .first()
      .simulate('change', { target: { value: 'test' } });

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent(
        '{"name":{"value":"test","type":"include"}}'
      )}`
    );

    advancedFilter
      .find('input')
      .first()
      .simulate('change', { target: { value: '' } });

    expect(history.length).toBe(3);
    expect(history.location.search).toBe('?');
  });

  it('updates filter query params on date filter', () => {
    const wrapper = createWrapper();

    const advancedFilter = wrapper.find(AdvancedFilter);
    advancedFilter.find(Link).simulate('click');
    advancedFilter
      .find('input')
      .last()
      .simulate('change', { target: { value: '2019-08-06' } });

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent('{"modTime":{"endDate":"2019-08-06"}}')}`
    );

    advancedFilter
      .find('input')
      .last()
      .simulate('change', { target: { value: '' } });

    expect(history.length).toBe(3);
    expect(history.location.search).toBe('?');
  });

  // TODO - can't find ListItemText
  it.skip('updates sort query params on sort', () => {
    const wrapper = createWrapper();

    const button = wrapper.find(ListItemText).first();
    expect(button.text()).toEqual('datasets.name');
    button.simulate('click');

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"name":"asc"}')}`
    );
  });

  // TODO - can't find AddToCartButton
  it.skip('addToCart button displays', () => {
    const wrapper = createWrapper();
    expect(wrapper.find(AddToCartButton).exists()).toBeTruthy();
    expect(wrapper.find(AddToCartButton).text()).toEqual('buttons.add_to_cart');
  });

  // TODO - can't find AddToCartButton
  it.skip('removeFromCart button displays', () => {
    (useCart as jest.Mock).mockReturnValueOnce({
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

    const wrapper = createWrapper();
    expect(wrapper.find(AddToCartButton).exists()).toBeTruthy();
    expect(wrapper.find(AddToCartButton).text()).toEqual(
      'buttons.remove_from_cart'
    );
  });

  // TODO - unsure what this even tests
  it.skip('usePushPage dispatched when page number is no longer valid', () => {
    // expect(usePushPage).toHaveBeenCalledTimes(1);
    // (parseSearchToQuery as jest.Mock).mockReturnValueOnce({
    //   view: null,
    //   search: null,
    //   page: 2,
    //   results: null,
    //   filters: {},
    //   sort: {},
    // });

    // state = {
    //   ...state,
    //   dgcommon: {
    //     ...state.dgcommon,
    //     totalDataCount: 1,
    //     query: {
    //       view: null,
    //       search: null,
    //       page: 2,
    //       results: null,
    //       filters: {},
    //       sort: {},
    //     },
    //   },
    // };
    // const store = mockStore(state);
    // wrapper.setProps({ store: store });
    // expect(usePushPage).toHaveBeenCalledTimes(2);
    createWrapper();
    expect(history.length).toBe(1);
    expect(history.location.search).toBe('?page=2');
  });
});
