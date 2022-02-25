import { ListItemText } from '@mui/material';
import {
  AdvancedFilter,
  dGCommonInitialState,
  useInstrumentsPaginated,
  useInstrumentCount,
  Instrument,
  ISISInstrumentDetailsPanel,
} from 'datagateway-common';
import { mount, ReactWrapper } from 'enzyme';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { StateType } from '../../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import ISISInstrumentsCardView from './isisInstrumentsCardView.component';
import { createMemoryHistory, History } from 'history';
import { QueryClient, QueryClientProvider } from 'react-query';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useInstrumentCount: jest.fn(),
    useInstrumentsPaginated: jest.fn(),
  };
});

describe('ISIS Instruments - Card View', () => {
  let mockStore;
  let state: StateType;
  let cardData: Instrument[];
  let history: History;

  const createWrapper = (): ReactWrapper => {
    const store = mockStore(state);
    return mount(
      <Provider store={store}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <ISISInstrumentsCardView studyHierarchy={false} />
          </QueryClientProvider>
        </Router>
      </Provider>
    );
  };

  beforeEach(() => {
    cardData = [
      {
        id: 1,
        name: 'Test 1',
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

    (useInstrumentCount as jest.Mock).mockReturnValue({
      data: 1,
      isLoading: false,
    });
    (useInstrumentsPaginated as jest.Mock).mockReturnValue({
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
    createWrapper();
    expect(useInstrumentCount).toHaveBeenCalled();
    expect(useInstrumentsPaginated).toHaveBeenCalled();
  });

  it('correct link used when NOT in studyHierarchy', () => {
    const wrapper = createWrapper();
    expect(
      wrapper.find('[aria-label="card-title"]').last().childAt(0).prop('to')
    ).toEqual('/browse/instrument/1/facilityCycle');
  });

  it('correct link used for studyHierarchy', () => {
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <ISISInstrumentsCardView studyHierarchy={true} />
          </QueryClientProvider>
        </Router>
      </Provider>
    );
    expect(
      wrapper.find('[aria-label="card-title"]').last().childAt(0).prop('to')
    ).toEqual('/browseStudyHierarchy/instrument/1/study');
  });

  it('updates filter query params on text filter', () => {
    const wrapper = createWrapper();

    const advancedFilter = wrapper.find(AdvancedFilter);
    advancedFilter.find('button').simulate('click');
    advancedFilter
      .find('input')
      .first()
      .simulate('change', { target: { value: 'test' } });

    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent(
        '{"fullName":{"value":"test","type":"include"}}'
      )}`
    );

    advancedFilter
      .find('input')
      .first()
      .simulate('change', { target: { value: '' } });

    expect(history.location.search).toBe('?');
  });

  it('uses default sort', () => {
    const wrapper = createWrapper();
    wrapper.update();

    expect(history.length).toBe(1);
    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"fullName":"asc"}')}`
    );
  });

  it('updates sort query params on sort', () => {
    const wrapper = createWrapper();

    const button = wrapper.find(ListItemText).first();
    expect(button.text()).toEqual('instruments.name');
    button.find('div').simulate('click');

    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"fullName":"desc"}')}`
    );
  });

  it('displays details panel when more information is expanded', () => {
    const wrapper = createWrapper();
    expect(wrapper.find(ISISInstrumentDetailsPanel).exists()).toBeFalsy();
    wrapper
      .find('[aria-label="card-more-info-expand"]')
      .last()
      .simulate('click');

    expect(wrapper.find(ISISInstrumentDetailsPanel).exists()).toBeTruthy();
  });

  it('renders fine with incomplete data', () => {
    (useInstrumentCount as jest.Mock).mockReturnValueOnce({});
    (useInstrumentsPaginated as jest.Mock).mockReturnValueOnce({});

    expect(() => createWrapper()).not.toThrowError();
  });
});
