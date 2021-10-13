import { Link, ListItemText } from '@material-ui/core';
import { createMount } from '@material-ui/core/test-utils';
import {
  AdvancedFilter,
  dGCommonInitialState,
  useFacilityCycleCount,
  useFacilityCyclesPaginated,
  FacilityCycle,
} from 'datagateway-common';
import { ReactWrapper } from 'enzyme';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { StateType } from '../../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import ISISFacilityCyclesCardView from './isisFacilityCyclesCardView.component';
import { createMemoryHistory, History } from 'history';
import { QueryClient, QueryClientProvider } from 'react-query';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useFacilityCycleCount: jest.fn(),
    useFacilityCyclesPaginated: jest.fn(),
  };
});

describe('ISIS Facility Cycles - Card View', () => {
  let mount;
  let mockStore;
  let state: StateType;
  let cardData: FacilityCycle[];
  let history: History;

  const createWrapper = (): ReactWrapper => {
    const store = mockStore(state);
    return mount(
      <Provider store={store}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <ISISFacilityCyclesCardView instrumentId="1" />
          </QueryClientProvider>
        </Router>
      </Provider>
    );
  };

  beforeEach(() => {
    mount = createMount();
    mockStore = configureStore([thunk]);
    state = JSON.parse(
      JSON.stringify({
        dgcommon: dGCommonInitialState,
        dgdataview: dgDataViewInitialState,
      })
    );

    cardData = [
      {
        id: 1,
        name: 'Test 1',
      },
    ];
    history = createMemoryHistory();

    (useFacilityCycleCount as jest.Mock).mockReturnValue({
      data: 1,
      isLoading: false,
    });
    (useFacilityCyclesPaginated as jest.Mock).mockReturnValue({
      data: cardData,
      isLoading: false,
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
    const instrumentId = '1';
    createWrapper();
    expect(useFacilityCycleCount).toHaveBeenCalledWith(parseInt(instrumentId));
    expect(useFacilityCyclesPaginated).toHaveBeenCalledWith(
      parseInt(instrumentId)
    );
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
    expect(button.text()).toEqual('facilitycycles.name');
    button.simulate('click');

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"name":"asc"}')}`
    );
  });

  it('renders fine with incomplete data', () => {
    (useFacilityCycleCount as jest.Mock).mockReturnValueOnce({});
    (useFacilityCyclesPaginated as jest.Mock).mockReturnValueOnce({});

    expect(() => createWrapper()).not.toThrowError();
  });
});
