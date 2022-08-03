import { render, RenderResult } from '@testing-library/react';
import {
  dGCommonInitialState,
  DLSVisitDetailsPanel,
  Investigation,
  readSciGatewayToken,
  useInvestigationCount,
  useInvestigationsDatasetCount,
  useInvestigationsInfinite,
} from 'datagateway-common';
import { mount, ReactWrapper } from 'enzyme';
import { createMemoryHistory, MemoryHistory } from 'history';
import React from 'react';
import { QueryClientProvider, QueryClient } from 'react-query';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { AnyAction } from 'redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
  applyDatePickerWorkaround,
  cleanupDatePickerWorkaround,
} from '../../../setupTests';
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

  const createRTLWrapper = (): RenderResult => {
    const store = mockStore(state);
    return render(
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
        ]),
      },
    ]);
    expect(useInvestigationsDatasetCount).toHaveBeenCalledWith({
      pages: [rowData],
    });
  });

  it('sorts by startDate desc and filters startDate to be before the current date on load', () => {
    createWrapper();

    expect(history.length).toBe(2);
    expect(history.entries[0].search).toBe(
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
      .last();
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
    applyDatePickerWorkaround();

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

    cleanupDatePickerWorkaround();
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
    const wrapper = createRTLWrapper();

    expect(wrapper.getAllByTestId('dls-mydata-table-name')).toMatchSnapshot();

    expect(
      wrapper.getAllByTestId('dls-mydata-table-visitId')
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

  it('displays details panel when expanded', () => {
    const wrapper = createWrapper();
    expect(wrapper.find(DLSVisitDetailsPanel).exists()).toBeFalsy();
    wrapper.find('[aria-label="Show details"]').last().simulate('click');

    expect(wrapper.find(DLSVisitDetailsPanel).exists()).toBeTruthy();
  });
});
