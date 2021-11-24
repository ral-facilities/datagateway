import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import ISISFacilityCyclesTable from './isisFacilityCyclesTable.component';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import { StateType } from '../../../state/app.types';
import {
  FacilityCycle,
  useFacilityCycleCount,
  useFacilityCyclesInfinite,
  dGCommonInitialState,
} from 'datagateway-common';
import { ReactWrapper } from 'enzyme';
import configureStore from 'redux-mock-store';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { Router } from 'react-router';
import { createMemoryHistory, History } from 'history';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useFacilityCycleCount: jest.fn(),
    useFacilityCyclesInfinite: jest.fn(),
  };
});

describe('ISIS FacilityCycles table component', () => {
  let mount;
  let mockStore;
  let state: StateType;
  let rowData: FacilityCycle[];
  let history: History;
  let replaceSpy: jest.SpyInstance;

  const createWrapper = (): ReactWrapper => {
    const store = mockStore(state);
    return mount(
      <Provider store={store}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <ISISFacilityCyclesTable instrumentId="1" />
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
        description: 'Test 1',
        startDate: '2019-07-03',
        endDate: '2019-07-04',
      },
    ];
    history = createMemoryHistory();
    replaceSpy = jest.spyOn(history, 'replace');

    mockStore = configureStore([thunk]);
    state = JSON.parse(
      JSON.stringify({
        dgdataview: dgDataViewInitialState,
        dgcommon: dGCommonInitialState,
      })
    );

    (useFacilityCycleCount as jest.Mock).mockReturnValue({
      data: 1,
      isLoading: false,
    });
    (useFacilityCyclesInfinite as jest.Mock).mockReturnValue({
      data: { pages: [rowData] },
      fetchNextPage: jest.fn(),
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
    const instrumentId = '1';
    createWrapper();
    expect(useFacilityCycleCount).toHaveBeenCalledWith(parseInt(instrumentId));
    expect(useFacilityCyclesInfinite).toHaveBeenCalledWith(
      parseInt(instrumentId)
    );
  });

  it('calls useFacilityCyclesInfinite when loadMoreRows is called', () => {
    const fetchNextPage = jest.fn();
    (useFacilityCyclesInfinite as jest.Mock).mockReturnValue({
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

  it('sends filterTable action on text filter', () => {
    const wrapper = createWrapper();

    const filterInput = wrapper
      .find('[aria-label="Filter by facilitycycles.name"]')
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
      'input[id="facilitycycles.end_date filter to"]'
    );
    filterInput.instance().value = '2019-08-06';
    filterInput.simulate('change');

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent('{"endDate":{"endDate":"2019-08-06"}}')}`
    );

    filterInput.instance().value = '';
    filterInput.simulate('change');

    expect(history.length).toBe(3);
    expect(history.location.search).toBe('?');
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

    wrapper
      .find('[role="columnheader"] span[role="button"]')
      .first()
      .simulate('click');

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"name":"asc"}')}`
    );
  });

  it('renders facilitycycle name as a link', () => {
    const wrapper = createWrapper();

    expect(
      wrapper.find('[aria-colindex=1]').find('p').children()
    ).toMatchSnapshot();
  });

  it('renders fine with incomplete data', () => {
    (useFacilityCycleCount as jest.Mock).mockReturnValueOnce({});
    (useFacilityCyclesInfinite as jest.Mock).mockReturnValueOnce({});

    expect(() => createWrapper()).not.toThrowError();
  });
});
