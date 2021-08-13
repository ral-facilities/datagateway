import {
  // Chip,
  // Accordion,
  Link,
  ListItemText,
  // SvgIcon,
} from '@material-ui/core';
import { createMount } from '@material-ui/core/test-utils';
import {
  AdvancedFilter,
  dGCommonInitialState,
  useInvestigationsPaginated,
  useInvestigationCount,
  Investigation,
  useCart,
  useInvestigationsDatasetCount,
  useFilter,
} from 'datagateway-common';
import { ReactWrapper } from 'enzyme';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { StateType } from '../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../state/reducers/dgdataview.reducer';
import InvestigationCardView from './investigationCardView.component';
import { QueryClient, QueryClientProvider } from 'react-query';
import AddToCartButton from '../addToCartButton.component';
import { createMemoryHistory, History } from 'history';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useInvestigationCount: jest.fn(),
    useInvestigationsPaginated: jest.fn(),
    useInvestigationsDatasetCount: jest.fn(),
    useCart: jest.fn(),
    useFilter: jest.fn(),
  };
});

describe('Investigation - Card View', () => {
  let mount;
  let mockStore;
  let state: StateType;
  let cardData: Investigation[];
  let history: History;

  const createWrapper = (): ReactWrapper => {
    const store = mockStore(state);
    return mount(
      <Provider store={store}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <InvestigationCardView />
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
        title: 'Test 1',
        name: 'Test 1',
        visitId: '1',
      },
    ];
    history = createMemoryHistory();

    mockStore = configureStore([thunk]);
    state = JSON.parse(
      JSON.stringify({
        dgcommon: dGCommonInitialState,
        dgdataview: dgDataViewInitialState,
      })
    );

    (useInvestigationCount as jest.Mock).mockReturnValue({
      data: 1,
      isLoading: false,
    });
    (useInvestigationsPaginated as jest.Mock).mockReturnValue({
      data: cardData,
      isLoading: false,
    });
    (useInvestigationsDatasetCount as jest.Mock).mockReturnValue(0);
    (useCart as jest.Mock).mockReturnValue({
      data: [],
    });
    (useFilter as jest.Mock).mockReturnValue({
      typeIds: ['1', '2'],
      facilityIds: ['1', '2'],
    });

    // Prevent error logging
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
    createWrapper();
    expect(useInvestigationCount).toHaveBeenCalled();
    expect(useInvestigationsPaginated).toHaveBeenCalled();
    expect(useInvestigationsDatasetCount).toHaveBeenCalledWith(cardData);
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
        '{"title":{"value":"test","type":"include"}}'
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
      `?filters=${encodeURIComponent('{"endDate":{"endDate":"2019-08-06"}}')}`
    );

    advancedFilter
      .find('input')
      .last()
      .simulate('change', { target: { value: '' } });

    expect(history.length).toBe(3);
    expect(history.location.search).toBe('?');
  });

  it('updates sort query params on sort', () => {
    const wrapper = createWrapper();

    const button = wrapper.find(ListItemText).first();
    expect(button.text()).toEqual('investigations.title');
    button.simulate('click');

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"title":"asc"}')}`
    );
  });

  it('addToCart button displays', () => {
    const wrapper = createWrapper();
    expect(wrapper.exists(AddToCartButton)).toBeTruthy();
    // expect(wrapper.find(AddToCartButton).text()).toEqual('buttons.add_to_cart');
  });

  // TODO - add_to_cart displays instead. Investigate why
  it.skip('removeFromCart button displays', () => {
    (useCart as jest.Mock).mockReturnValueOnce({
      data: [
        {
          entityId: 1,
          entityType: 'investigation',
          id: 1,
          name: 'test',
          parentEntities: [],
        },
      ],
    });

    const wrapper = createWrapper();
    expect(wrapper.exists(AddToCartButton)).toBeTruthy();
    expect(wrapper.find(AddToCartButton).text()).toEqual(
      'buttons.remove_from_cart'
    );
  });

  it.todo('constructs more information details panel #185-188');

  // TODO - unsure what this even tests
  it.skip('usePushPage dispatched when page number is no longer valid', () => {
    const wrapper = createWrapper();
    // expect(usePushPage).toHaveBeenCalledTimes(2);

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
    // expect(usePushPage).toHaveBeenCalledTimes(3);
  });

  it.todo('sets up buttons correctly #132-134');

  it.todo('displays dataset count #102-108');

  // TODO - find a way to mock the filter values for the below tests
  it.skip('pushFilters dispatched by filter panel', () => {
    // state.dgcommon.filterData = {
    //   'type.id': ['1', '2'],
    //   'facility.id': ['1', '2'],
    // };
    // const wrapper = createWrapper();
    // expect(usePushResults).toHaveBeenCalledTimes(2);
    // const typePanel = wrapper.find(Accordion).first();
    // typePanel.simulate('click');
    // expect(typePanel.find(Chip).first().text()).toEqual('1');
    // expect(typePanel.find(Chip).last().text()).toEqual('2');
    // typePanel.find(Chip).first().simulate('click');
    // expect(usePushResults).toHaveBeenCalledTimes(3);
  });

  // TODO - not sure how to test this
  it.skip('pushFilters dispatched by deleting chip', () => {
    // state.dgcommon.filterData = {
    //   'type.id': ['1', '2'],
    //   'facility.id': ['1', '2'],
    // };
    // state.dgcommon.query.filters = { 'type.id': ['1'] };
    // const wrapper = createWrapper();
    // expect(usePushResults).toHaveBeenCalledTimes(2);
    // wrapper.find(Chip).at(4).find(SvgIcon).simulate('click');
    // expect(usePushResults).toHaveBeenCalledTimes(3);
  });

  it.todo('renders investigation title as a link #60');
});
