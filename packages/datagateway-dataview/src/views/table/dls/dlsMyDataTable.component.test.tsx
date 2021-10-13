import { createMount } from '@material-ui/core/test-utils';
import {
  dGCommonInitialState,
  Investigation,
  NotificationType,
  readSciGatewayToken,
  useInvestigationCount,
  useInvestigationsDatasetCount,
  useInvestigationsInfinite,
} from 'datagateway-common';
import { ReactWrapper } from 'enzyme';
import { createMemoryHistory, MemoryHistory } from 'history';
import React from 'react';
import { QueryClientProvider, QueryClient } from 'react-query';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { AnyAction } from 'redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { StateType } from '../../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import DLSMyDataTable from './dlsMyDataTable.component';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useInvestigationCount: jest.fn(),
    useInvestigationsInfinite: jest.fn(),
    useInvestigationsDatasetCount: jest.fn(),
    readSciGatewayToken: jest.fn(),
  };
});

describe('DLS MyData table component', () => {
  let mount;
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let rowData: Investigation[];
  let history: MemoryHistory;
  let events: CustomEvent<AnyAction>[] = [];

  const createWrapper = (): ReactWrapper => {
    const store = mockStore(state);
    return mount(
      <Provider store={store}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <DLSMyDataTable />
          </QueryClientProvider>
        </Router>
      </Provider>
    );
  };

  beforeEach(() => {
    mount = createMount();
    events = [];
    history = createMemoryHistory();

    document.dispatchEvent = (e: Event) => {
      events.push(e as CustomEvent<AnyAction>);
      return true;
    };

    state = JSON.parse(
      JSON.stringify({
        dgdataview: dgDataViewInitialState,
        dgcommon: dGCommonInitialState,
      })
    );
    rowData = [
      {
        id: 1,
        title: 'Test 1',
        name: 'Test 1',
        summary: 'foo bar',
        visitId: '1',
        doi: 'doi 1',
        size: 1,
        investigationInstruments: [
          {
            id: 1,
            instrument: {
              id: 3,
              name: 'LARMOR',
            },
          },
        ],
        startDate: '2019-06-10',
        endDate: '2019-06-11',
      },
    ];

    (useInvestigationCount as jest.Mock).mockReturnValue({
      data: 0,
    });
    (useInvestigationsInfinite as jest.Mock).mockReturnValue({
      data: { pages: [rowData] },
      fetchNextPage: jest.fn(),
    });
    (useInvestigationsDatasetCount as jest.Mock).mockReturnValue([{ data: 1 }]);
    (readSciGatewayToken as jest.Mock).mockReturnValue({
      username: 'testUser',
    });
    global.Date.now = jest.fn(() => 1);
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
    createWrapper();
    expect(useInvestigationCount).toHaveBeenCalledWith([
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          'investigationUsers.user.name': { eq: 'testUser' },
        }),
      },
      {
        filterType: 'include',
        filterValue: JSON.stringify({ investigationUsers: 'user' }),
      },
    ]);
    expect(useInvestigationsInfinite).toHaveBeenCalledWith([
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          'investigationUsers.user.name': { eq: 'testUser' },
        }),
      },
      {
        filterType: 'include',
        filterValue: JSON.stringify([
          {
            investigationInstruments: 'instrument',
          },
          { investigationUsers: 'user' },
        ]),
      },
    ]);
    expect(useInvestigationsDatasetCount).toHaveBeenCalledWith({
      pages: [rowData],
    });
  });

  it('sorts by startDate desc and filters startDate to be before the current date on load', () => {
    createWrapper();

    expect(history.length).toBe(3);
    expect(history.entries[1].search).toBe(
      `?sort=${encodeURIComponent(JSON.stringify({ startDate: 'desc' }))}`
    );
    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent(
        JSON.stringify({ startDate: { endDate: '1970-01-01' } })
      )}`
    );
  });

  it('calls useInvestigationsInfinite when loadMoreRows is called', () => {
    const fetchNextPage = jest.fn();
    (useInvestigationsInfinite as jest.Mock).mockReturnValue({
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
      .find('[aria-label="Filter by investigations.visit_id"]')
      .first();
    filterInput.instance().value = 'test';
    filterInput.simulate('change');

    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent(
        '{"visitId":{"value":"test","type":"include"}}'
      )}`
    );

    filterInput.instance().value = '';
    filterInput.simulate('change');

    expect(history.location.search).toBe('?');
  });

  it('updates filter query params on date filter', () => {
    const wrapper = createWrapper();

    const filterInput = wrapper.find(
      'input[id="investigations.end_date filter to"]'
    );
    filterInput.instance().value = '2019-08-06';
    filterInput.simulate('change');

    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent('{"endDate":{"endDate":"2019-08-06"}}')}`
    );

    filterInput.instance().value = '';
    filterInput.simulate('change');

    expect(history.location.search).toBe('?');
  });

  it('updates sort query params on sort', () => {
    const wrapper = createWrapper();

    wrapper
      .find('[role="columnheader"] span[role="button"]')
      .first()
      .simulate('click');

    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"title":"asc"}')}`
    );
  });

  it('renders title and visit ID as a links', () => {
    const wrapper = createWrapper();

    expect(
      wrapper.find('[aria-colindex=2]').find('p').children()
    ).toMatchSnapshot();

    expect(
      wrapper.find('[aria-colindex=3]').find('p').children()
    ).toMatchSnapshot();
  });

  it('gracefully handles empty InvestigationInstrument and missing Instrument from InvestigationInstrument object', () => {
    rowData[0] = {
      ...rowData[0],
      investigationInstruments: [],
    };
    (useInvestigationsInfinite as jest.Mock).mockReturnValue({
      data: { pages: [rowData] },
      fetchNextPage: jest.fn(),
    });

    let wrapper = createWrapper();

    expect(() => wrapper).not.toThrowError();

    rowData[0] = {
      ...rowData[0],
      investigationInstruments: [
        {
          id: 1,
        },
      ],
    };
    (useInvestigationsInfinite as jest.Mock).mockReturnValue({
      data: { pages: [rowData] },
      fetchNextPage: jest.fn(),
    });

    wrapper = createWrapper();

    expect(wrapper.find('[aria-colindex=5]').find('p').text()).toEqual('');
  });

  it('sends a notification to SciGateway if user is not logged in', () => {
    (useInvestigationsInfinite as jest.Mock).mockReturnValue({
      data: { pages: [] },
      fetchNextPage: jest.fn(),
    });
    (readSciGatewayToken as jest.Mock).mockReturnValue({
      username: null,
    });
    localStorage.setItem('autoLogin', 'true');

    createWrapper();

    expect(events.length).toBe(1);
    expect(events[0].detail).toEqual({
      type: NotificationType,
      payload: {
        severity: 'warning',
        message: 'my_data_table.login_warning_msg',
      },
    });
  });
});
