import { ListItemText } from '@mui/material';
import {
  AdvancedFilter,
  dGCommonInitialState,
  useFacilityCycleCount,
  useFacilityCyclesPaginated,
  FacilityCycle,
} from 'datagateway-common';
import { mount, ReactWrapper } from 'enzyme';
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
import {
  applyDatePickerWorkaround,
  cleanupDatePickerWorkaround,
} from '../../../setupTests';

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
  let mockStore;
  let state: StateType;
  let cardData: FacilityCycle[];
  let history: History;
  let replaceSpy: jest.SpyInstance;

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
    replaceSpy = jest.spyOn(history, 'replace');

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
    advancedFilter.find('button').last().simulate('click');
    advancedFilter
      .find('input')
      .first()
      .simulate('change', { target: { value: 'test' } });

    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent(
        '{"name":{"value":"test","type":"include"}}'
      )}`
    );

    advancedFilter
      .find('input')
      .first()
      .simulate('change', { target: { value: '' } });

    expect(history.location.search).toBe('?');
  });

  it('updates filter query params on date filter', () => {
    applyDatePickerWorkaround();

    const wrapper = createWrapper();

    const advancedFilter = wrapper.find(AdvancedFilter);
    advancedFilter.find('button').first().simulate('click');
    advancedFilter
      .find('input')
      .last()
      .simulate('change', { target: { value: '2019-08-06' } });

    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent('{"endDate":{"endDate":"2019-08-06"}}')}`
    );

    advancedFilter
      .find('input')
      .last()
      .simulate('change', { target: { value: '' } });

    expect(history.location.search).toBe('?');

    cleanupDatePickerWorkaround();
  });

  it('uses default sort', () => {
    const wrapper = createWrapper();
    wrapper.update();

    expect(history.length).toBe(1);
    expect(replaceSpy).toHaveBeenCalledWith({
      search: `?sort=${encodeURIComponent('{"startDate":"desc"}')}`,
    });
  });

  it('updates sort query params on sort', () => {
    const wrapper = createWrapper();

    const button = wrapper.find(ListItemText).first();
    expect(button.text()).toEqual('facilitycycles.name');
    button.find('div').simulate('click');

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
