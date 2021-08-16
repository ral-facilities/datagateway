import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import ISISInstrumentsTable from './isisInstrumentsTable.component';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import { StateType } from '../../../state/app.types';
import {
  // fetchInstrumentsRequest,
  // filterTable,
  // sortTable,
  // fetchInstrumentDetailsRequest,
  // fetchInstrumentCountRequest,
  Instrument,
  useInstrumentCount,
  useInstrumentsInfinite,
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
    useInstrumentCount: jest.fn(),
    useInstrumentsInfinite: jest.fn(),
  };
});

describe('ISIS Instruments table component', () => {
  // let shallow;
  let mount;
  let mockStore;
  let state: StateType;
  let rowData: Instrument[];
  let history: History;

  const createWrapper = (studyHierarchy?: boolean): ReactWrapper => {
    const store = mockStore(state);
    return mount(
      <Provider store={store}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <ISISInstrumentsTable
              studyHierarchy={studyHierarchy ? true : false}
            />
          </QueryClientProvider>
        </Router>
      </Provider>
    );
  };

  beforeEach(() => {
    // shallow = createShallow({ untilSelector: 'ISISInstrumentsTable' });
    mount = createMount();
    rowData = [
      {
        id: 1,
        name: 'Test 1',
        fullName: 'Test instrument 1',
        description: 'foo bar',
        url: 'test url',
      },
      {
        id: 2,
        name: 'Test 2',
        description: 'foo bar',
        url: 'test url',
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
    //     fullName: 'Test instrument 1',
    //     description: 'foo bar',
    //     url: 'test url',
    //   },
    //   {
    //     id: 2,
    //     name: 'Test 2',
    //     description: 'foo bar',
    //     url: 'test url',
    //   },
    // ];

    (useInstrumentCount as jest.Mock).mockReturnValue(0);
    (useInstrumentsInfinite as jest.Mock).mockReturnValue({
      data: { pages: [rowData] },
      fetchNextPage: jest.fn(),
    });
  });

  afterEach(() => {
    mount.cleanUp();
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    // const wrapper = shallow(<ISISInstrumentsTable store={mockStore(state)} />);

    const wrapper = createWrapper();
    expect(wrapper.find('VirtualizedTable').props()).toMatchSnapshot();
  });

  // it('sends fetchInstrumentCount and fetchInstruments actions when watched store values change', () => {
  //   let testStore = mockStore(state);
  //   const wrapper = mount(
  //     <Provider store={testStore}>
  //       <MemoryRouter>
  //         <ISISInstrumentsTable />
  //       </MemoryRouter>
  //     </Provider>
  //   );

  //   // simulate clearTable action
  //   testStore = mockStore({
  //     ...state,
  //     dgdataview: { ...state.dgdataview, sort: {}, filters: {} },
  //   });
  //   wrapper.setProps({ store: testStore });

  //   expect(testStore.getActions()[0]).toEqual(fetchInstrumentCountRequest(1));
  //   expect(testStore.getActions()[1]).toEqual(fetchInstrumentsRequest(1));
  // });

  it('calls the correct data fetching hooks on load', () => {
    createWrapper();
    expect(useInstrumentCount).toHaveBeenCalled();
    expect(useInstrumentsInfinite).toHaveBeenCalled();
  });

  it('calls useInstrumentsInfinite when loadMoreRows is called', () => {
    // const testStore = mockStore(state);
    // const wrapper = shallow(<ISISInstrumentsTable store={testStore} />);

    // wrapper.prop('loadMoreRows')({ startIndex: 50, stopIndex: 74 });

    // expect(testStore.getActions()[0]).toEqual(fetchInstrumentsRequest(1));

    const fetchNextPage = jest.fn();
    (useInstrumentsInfinite as jest.Mock).mockReturnValueOnce({
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

  it('sends filterTable action on filter', () => {
    // const testStore = mockStore(state);
    // const wrapper = mount(
    //   <Provider store={testStore}>
    //     <MemoryRouter>
    //       <ISISInstrumentsTable />
    //     </MemoryRouter>
    //   </Provider>
    // );

    // const filterInput = wrapper.find('input').first();
    // filterInput.instance().value = 'test';
    // filterInput.simulate('change');

    // expect(testStore.getActions()[2]).toEqual(
    //   filterTable('fullName', { value: 'test', type: 'include' })
    // );

    // filterInput.instance().value = '';
    // filterInput.simulate('change');

    // expect(testStore.getActions()[4]).toEqual(filterTable('fullName', null));

    const wrapper = createWrapper();

    const filterInput = wrapper.find('input').first();
    filterInput.instance().value = 'test';
    filterInput.simulate('change');

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent(
        '{"fullName":{"value":"test","type":"include"}}'
      )}`
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
    //       <ISISInstrumentsTable />
    //     </MemoryRouter>
    //   </Provider>
    // );

    // wrapper
    //   .find('[role="columnheader"] span[role="button"]')
    //   .first()
    //   .simulate('click');

    // expect(testStore.getActions()[2]).toEqual(sortTable('fullName', 'asc'));

    const wrapper = createWrapper();

    wrapper
      .find('[role="columnheader"] span[role="button"]')
      .first()
      .simulate('click');

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"fullName":"asc"}')}`
    );
  });

  // TODO: Come back to this as there is hooks error
  it.skip('renders details panel correctly and it calls useInstrumentDetails', () => {
    // const testStore = mockStore(state);
    // const wrapper = mount(
    //   <Provider store={testStore}>
    //     <MemoryRouter>
    //       <ISISInstrumentsTable />
    //     </MemoryRouter>
    //   </Provider>
    // );

    // const detailsPanelWrapper = shallow(
    //   wrapper.find(Table).prop('detailsPanel')({
    //     rowData: state.dgcommon.data[0],
    //   })
    // );
    // expect(detailsPanelWrapper).toMatchSnapshot();

    // mount(
    //   wrapper.find(Table).prop('detailsPanel')({
    //     rowData: state.dgcommon.data[0],
    //     detailsPanelResize: jest.fn(),
    //   })
    // );

    // expect(testStore.getActions()[2]).toEqual(fetchInstrumentDetailsRequest());

    const wrapper = createWrapper();

    const detailsPanelWrapper = mount(
      wrapper.find('VirtualizedTable').prop('detailsPanel')({
        rowData: rowData[0],
      })
    );
    expect(detailsPanelWrapper).toMatchSnapshot();
  });

  it('renders names as links', () => {
    // const wrapper = mount(
    //   <Provider store={mockStore(state)}>
    //     <MemoryRouter>
    //       <ISISInstrumentsTable />
    //     </MemoryRouter>
    //   </Provider>
    // );

    // expect(
    //   wrapper.find('[aria-colindex=2]').find('p').children()
    // ).toMatchSnapshot();

    const wrapper = createWrapper();

    expect(
      wrapper.find('[aria-colindex=2]').find('p').children()
    ).toMatchSnapshot();
  });

  it('renders names as links in StudyHierarchy', () => {
    // const wrapper = mount(
    //   <Provider store={mockStore(state)}>
    //     <MemoryRouter>
    //       <ISISInstrumentsTable studyHierarchy={true} />
    //     </MemoryRouter>
    //   </Provider>
    // );

    // expect(
    //   wrapper.find('[aria-colindex=2]').find('p').children()
    // ).toMatchSnapshot();

    const wrapper = createWrapper(true);

    expect(
      wrapper.find('[aria-colindex=2]').find('p').children()
    ).toMatchSnapshot();
  });
});
