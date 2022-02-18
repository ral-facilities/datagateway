import React from 'react';
import DLSVisitsTable from './dlsVisitsTable.component';
import { StateType } from '../../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import {
  Investigation,
  useInvestigationCount,
  useInvestigationsInfinite,
  useInvestigationsDatasetCount,
  dGCommonInitialState,
  DLSVisitDetailsPanel,
} from 'datagateway-common';
import { mount, ReactWrapper } from 'enzyme';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Router } from 'react-router-dom';
import { createMemoryHistory, History } from 'history';
import {
  applyDatePickerWorkaround,
  cleanupDatePickerWorkaround,
} from '../../../setupTests';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useInvestigationCount: jest.fn(),
    useInvestigationsInfinite: jest.fn(),
    useInvestigationsDatasetCount: jest.fn(),
  };
});

describe('DLS Visits table component', () => {
  let mockStore;
  let state: StateType;
  let rowData: Investigation[];
  let history: History;

  const createWrapper = (): ReactWrapper => {
    const store = mockStore(state);
    return mount(
      <Provider store={store}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <DLSVisitsTable proposalName="Test 1" />
          </QueryClientProvider>
        </Router>
      </Provider>
    );
  };

  beforeEach(() => {
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
    history = createMemoryHistory();

    mockStore = configureStore([thunk]);
    state = JSON.parse(
      JSON.stringify({
        dgdataview: dgDataViewInitialState,
        dgcommon: dGCommonInitialState,
      })
    );

    (useInvestigationCount as jest.Mock).mockReturnValue({
      data: 1,
      isLoading: false,
    });
    (useInvestigationsInfinite as jest.Mock).mockReturnValue({
      data: rowData,
      isLoading: false,
    });
    (useInvestigationsDatasetCount as jest.Mock).mockReturnValue([1]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('VirtualizedTable').props()).toMatchSnapshot();
  });

  it('calls the correct data fetching hooks on load', () => {
    const proposalName = 'Test 1';
    createWrapper();
    expect(useInvestigationCount).toHaveBeenCalledWith([
      {
        filterType: 'where',
        filterValue: JSON.stringify({ name: { eq: proposalName } }),
      },
    ]);
    expect(useInvestigationsInfinite).toHaveBeenCalledWith([
      {
        filterType: 'where',
        filterValue: JSON.stringify({ name: { eq: proposalName } }),
      },
      {
        filterType: 'include',
        filterValue: JSON.stringify({
          investigationInstruments: 'instrument',
        }),
      },
    ]);
    expect(useInvestigationsDatasetCount).toHaveBeenCalledWith(rowData);
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

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent(
        '{"visitId":{"value":"test","type":"include"}}'
      )}`
    );

    filterInput.instance().value = '';
    filterInput.simulate('change');

    expect(history.length).toBe(3);
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

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent('{"endDate":{"endDate":"2019-08-06"}}')}`
    );

    filterInput.instance().value = '';
    filterInput.simulate('change');

    expect(history.length).toBe(3);
    expect(history.location.search).toBe('?');

    cleanupDatePickerWorkaround();
  });

  it('uses default sort', () => {
    const wrapper = createWrapper();
    wrapper.update();

    expect(history.length).toBe(1);
    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"startDate":"desc"}')}`
    );
  });

  it('updates sort query params on sort', () => {
    const wrapper = createWrapper();

    wrapper
      .find('[role="columnheader"] span[role="button"]')
      .first()
      .simulate('click');

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"visitId":"asc"}')}`
    );
  });

  it('renders details panel correctly and it sends off an FetchInvestigationDetails action', () => {
    const wrapper = createWrapper();
    expect(wrapper.find(DLSVisitDetailsPanel).exists()).toBeFalsy();
    wrapper.find('[aria-label="Show details"]').last().simulate('click');

    expect(wrapper.find(DLSVisitDetailsPanel).exists()).toBeTruthy();
  });

  it('renders visit ID as links', () => {
    const wrapper = createWrapper();

    expect(
      wrapper.find('[aria-colindex=2]').find('p').children()
    ).toMatchSnapshot();
  });

  it('renders fine with incomplete data', () => {
    (useInvestigationCount as jest.Mock).mockReturnValueOnce({});
    (useInvestigationsInfinite as jest.Mock).mockReturnValueOnce({});
    (useInvestigationsDatasetCount as jest.Mock).mockReturnValueOnce([]);

    expect(() => createWrapper()).not.toThrowError();

    (useInvestigationCount as jest.Mock).mockReturnValueOnce({
      data: 1,
      isLoading: false,
    });
    (useInvestigationsInfinite as jest.Mock).mockReturnValueOnce({
      data: [
        {
          ...rowData[0],
          investigationInstruments: [],
        },
      ],
      isLoading: false,
    });
    (useInvestigationsDatasetCount as jest.Mock).mockReturnValueOnce([1]);

    expect(() => createWrapper()).not.toThrowError();

    (useInvestigationsInfinite as jest.Mock).mockReturnValueOnce({
      data: [
        {
          ...rowData[0],
          investigationInstruments: [
            {
              id: 1,
            },
          ],
        },
      ],
      isLoading: false,
    });

    const wrapper = createWrapper();

    expect(wrapper.find('[aria-colindex=4]').find('p').text()).toEqual('');
  });
});
