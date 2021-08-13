import React from 'react';
import { createShallow, createMount } from '@material-ui/core/test-utils';
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
// import axios from 'axios';

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
    shallow = createShallow({ untilSelector: 'ISISFacilityCyclesTable' });
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

    mockStore = configureStore([thunk]);
    state = JSON.parse(
      JSON.stringify({
        dgdataview: dgDataViewInitialState,
        dgcommon: dGCommonInitialState,
      })
    );
    // state.dgcommon.data = [
    //   {
    //     id: 1,
    //     name: 'Test 1',
    //     description: 'Test 1',
    //     startDate: '2019-07-03',
    //     endDate: '2019-07-04',
    //   },
    // ];

    // (axios.get as jest.Mock).mockImplementation(() =>
    //   Promise.resolve({ data: [] })
    // );
    // global.Date.now = jest.fn(() => 1);

    (useFacilityCycleCount as jest.Mock).mockReturnValue(0);
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
    // const wrapper = shallow(
    //   <ISISFacilityCyclesTable store={mockStore(state)} instrumentId="1" />
    // );
    const wrapper = createWrapper();
    expect(wrapper.find('VirtualizedTable').props()).toMatchSnapshot();
  });

  // it('sends fetchFacilityCycleCount and fetchFacilityCycles actions when watched store values change', () => {
  //   let testStore = mockStore(state);
  //   const wrapper = mount(
  //     <Provider store={testStore}>
  //       <MemoryRouter>
  //         <ISISFacilityCyclesTable instrumentId="1" />
  //       </MemoryRouter>
  //     </Provider>
  //   );

  //   // simulate clearTable action
  //   testStore = mockStore({
  //     ...state,
  //     dgdataview: { ...state.dgdataview, sort: {}, filters: {} },
  //   });
  //   wrapper.setProps({ store: testStore });

  //   expect(testStore.getActions()[0]).toEqual(
  //     fetchFacilityCycleCountRequest(1)
  //   );
  //   expect(testStore.getActions()[1]).toEqual(fetchFacilityCyclesRequest(1));
  // });

  it('calls the correct data fetching hooks on load', () => {
    createWrapper();
    expect(useFacilityCycleCount).toHaveBeenCalled();
    expect(useFacilityCyclesInfinite).toHaveBeenCalled();
  });

  it('calls useFacilityCyclesInfinite when loadMoreRows is called', () => {
    // const testStore = mockStore(state);
    // const wrapper = shallow(
    //   <ISISFacilityCyclesTable instrumentId="1" store={testStore} />
    // );
    // wrapper.prop('loadMoreRows')({ startIndex: 50, stopIndex: 74 });
    // expect(testStore.getActions()[0]).toEqual(fetchFacilityCyclesRequest(1));

    const fetchNextPage = jest.fn();
    (useFacilityCyclesInfinite as jest.Mock).mockReturnValueOnce({
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
    // const testStore = mockStore(state);
    // const wrapper = mount(
    //   <Provider store={testStore}>
    //     <MemoryRouter>
    //       <ISISFacilityCyclesTable instrumentId="1" />
    //     </MemoryRouter>
    //   </Provider>
    // );

    // const filterInput = wrapper
    //   .find('[aria-label="Filter by facilitycycles.name"] input')
    //   .first();
    // filterInput.instance().value = 'test';
    // filterInput.simulate('change');

    // expect(testStore.getActions()[2]).toEqual(
    //   filterTable('name', { value: 'test', type: 'include' })
    // );

    // filterInput.instance().value = '';
    // filterInput.simulate('change');

    // expect(testStore.getActions()[4]).toEqual(filterTable('name', null));

    const wrapper = createWrapper();

    const filterInput = wrapper
      .find('[aria-label="Filter by facilitycycles.name"] input')
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
    // const testStore = mockStore(state);
    // const wrapper = mount(
    //   <Provider store={testStore}>
    //     <MemoryRouter>
    //       <ISISFacilityCyclesTable instrumentId="1" />
    //     </MemoryRouter>
    //   </Provider>
    // );

    // const filterInput = wrapper.find(
    //   '[aria-label="facilitycycles.end_date date filter to"]'
    // );
    // filterInput.instance().value = '2019-08-06';
    // filterInput.simulate('change');

    // expect(testStore.getActions()[2]).toEqual(
    //   filterTable('endDate', { endDate: '2019-08-06' })
    // );

    // filterInput.instance().value = '';
    // filterInput.simulate('change');

    // expect(testStore.getActions()[4]).toEqual(filterTable('endDate', null));

    const wrapper = createWrapper();

    const filterInput = wrapper.find(
      '[aria-label="facilitycycles.end_date date filter to"]'
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

  it('updates sort query params on sort', () => {
    // const testStore = mockStore(state);
    // const wrapper = mount(
    //   <Provider store={testStore}>
    //     <MemoryRouter>
    //       <ISISFacilityCyclesTable instrumentId="1" />
    //     </MemoryRouter>
    //   </Provider>
    // );

    // wrapper
    //   .find('[role="columnheader"] span[role="button"]')
    //   .first()
    //   .simulate('click');

    // expect(testStore.getActions()[2]).toEqual(sortTable('name', 'asc'));

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
    // const wrapper = mount(
    //   <Provider store={mockStore(state)}>
    //     <MemoryRouter>
    //       <ISISFacilityCyclesTable instrumentId="1" />
    //     </MemoryRouter>
    //   </Provider>
    // );

    // expect(
    //   wrapper.find('[aria-colindex=1]').find('p').children()
    // ).toMatchSnapshot();

    const wrapper = createWrapper();

    expect(
      wrapper.find('[aria-colindex=1]').find('p').children()
    ).toMatchSnapshot();
  });
});
