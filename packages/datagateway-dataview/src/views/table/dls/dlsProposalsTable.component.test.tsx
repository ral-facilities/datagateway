import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import DLSProposalsTable from './dlsProposalsTable.component';
import { StateType } from '../../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import {
  Investigation,
  useInvestigationCount,
  useInvestigationsInfinite,
  dGCommonInitialState,
} from 'datagateway-common';
import { ReactWrapper } from 'enzyme';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Router } from 'react-router-dom';
import { createMemoryHistory, History } from 'history';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useInvestigationCount: jest.fn(),
    useInvestigationsInfinite: jest.fn(),
  };
});

describe('DLS Proposals table component', () => {
  let mount;
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
            <DLSProposalsTable />
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
        filterType: 'distinct',
        filterValue: JSON.stringify(['name', 'title']),
      },
    ]);
    expect(useInvestigationsInfinite).toHaveBeenCalledWith([
      {
        filterType: 'distinct',
        filterValue: JSON.stringify(['name', 'title']),
      },
    ]);
  });

  it('calls useInvestigationsInfinite when loadMoreRows is called', () => {
    const fetchNextPage = jest.fn();
    (useInvestigationsInfinite as jest.Mock).mockReturnValueOnce({
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

    const filterInput = wrapper.find('input').first();
    filterInput.instance().value = 'test';
    filterInput.simulate('change');

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent(
        '{"title":{"value":"test","type":"include"}}'
      )}`
    );

    filterInput.instance().value = '';
    filterInput.simulate('change');

    expect(history.length).toBe(3);
    expect(history.location.search).toBe('?');
  });

  it('updates sort query params on sort', () => {
    const wrapper = createWrapper();

    wrapper
      .find('[role="columnheader"] span[role="button"]')
      .first()
      .simulate('click');

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"title":"asc"}')}`
    );
  });

  it('renders title and name as links', () => {
    const wrapper = createWrapper();

    expect(
      wrapper.find('[aria-colindex=2]').find('p').children()
    ).toMatchSnapshot();

    expect(
      wrapper.find('[aria-colindex=3]').find('p').children()
    ).toMatchSnapshot();
  });
});
