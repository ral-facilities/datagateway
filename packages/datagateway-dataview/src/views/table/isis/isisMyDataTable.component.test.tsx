import { render, RenderResult } from '@testing-library/react';
import {
  dGCommonInitialState,
  Investigation,
  ISISInvestigationDetailsPanel,
  readSciGatewayToken,
  Table,
  useAddToCart,
  useAllFacilityCycles,
  useCart,
  useIds,
  useInvestigationCount,
  useInvestigationDetails,
  useInvestigationsInfinite,
  useInvestigationSizes,
  useRemoveFromCart,
} from 'datagateway-common';
import { mount, ReactWrapper } from 'enzyme';
import { createMemoryHistory, History } from 'history';
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
import ISISMyDataTable from './isisMyDataTable.component';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useInvestigationCount: jest.fn(),
    useInvestigationsInfinite: jest.fn(),
    useInvestigationSizes: jest.fn(),
    useIds: jest.fn(),
    useCart: jest.fn(),
    useAddToCart: jest.fn(),
    useRemoveFromCart: jest.fn(),
    useAllFacilityCycles: jest.fn(),
    readSciGatewayToken: jest.fn(),
    useInvestigationDetails: jest.fn(),
  };
});

describe('ISIS MyData table component', () => {
  const mockStore = configureStore([thunk]);
  let state: StateType;
  let rowData: Investigation[];
  let history: History;
  let events: CustomEvent<AnyAction>[] = [];

  const createWrapper = (
    element: React.ReactElement = <ISISMyDataTable />
  ): ReactWrapper => {
    const store = mockStore(state);
    return mount(
      <Provider store={store}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            {element}
          </QueryClientProvider>
        </Router>
      </Provider>
    );
  };

  const createRTLWrapper = (
    element: React.ReactElement = <ISISMyDataTable />
  ): RenderResult => {
    const store = mockStore(state);
    return render(
      <Provider store={store}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            {element}
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
        title: 'Test 1 title',
        name: 'Test 1 name',
        summary: 'foo bar',
        visitId: '1',
        doi: 'doi 1',
        investigationInstruments: [
          {
            id: 1,
            instrument: {
              id: 3,
              name: 'LARMOR',
            },
          },
        ],
        studyInvestigations: [
          {
            id: 6,
            study: {
              id: 7,
              pid: 'study pid',
              name: 'study',
              createTime: '2019-06-10',
              modTime: '2019-06-10',
            },
            investigation: {
              id: 1,
              title: 'Test 1 title',
              name: 'Test 1 name',
              visitId: '1',
            },
          },
        ],
        startDate: '2019-06-10',
        endDate: '2019-06-11',
      },
    ];

    (useCart as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });
    (useInvestigationCount as jest.Mock).mockReturnValue({
      data: 0,
    });
    (useInvestigationsInfinite as jest.Mock).mockReturnValue({
      data: { pages: [rowData] },
      fetchNextPage: jest.fn(),
    });
    (useInvestigationSizes as jest.Mock).mockReturnValue([
      {
        data: 1,
      },
    ]);
    (useIds as jest.Mock).mockReturnValue({
      data: [1],
      isLoading: false,
    });
    (useAddToCart as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isLoading: false,
    });
    (useRemoveFromCart as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isLoading: false,
    });
    (useAllFacilityCycles as jest.Mock).mockReturnValue({
      data: [
        {
          id: 8,
          name: 'Cycle name',
          startDate: '2019-06-01',
          endDate: '2019-07-01',
        },
      ],
    });
    (readSciGatewayToken as jest.Mock).mockReturnValue({
      username: 'testUser',
    });
    (useInvestigationDetails as jest.Mock).mockReturnValue({
      data: [],
    });
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
          { studyInvestigations: 'study' },
        ]),
      },
    ]);
    expect(useInvestigationSizes).toHaveBeenCalledWith({
      pages: [rowData],
    });
    expect(useIds).toHaveBeenCalledWith(
      'investigation',
      [
        {
          filterType: 'where',
          filterValue: JSON.stringify({
            'investigationUsers.user.name': { eq: 'testUser' },
          }),
        },
      ],
      true
    );
    expect(useCart).toHaveBeenCalled();
    expect(useAddToCart).toHaveBeenCalledWith('investigation');
    expect(useRemoveFromCart).toHaveBeenCalledWith('investigation');
    expect(useAllFacilityCycles).toHaveBeenCalled();
  });

  it('sorts by startDate desc on load', () => {
    createWrapper();

    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent(JSON.stringify({ startDate: 'desc' }))}`
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
      .find('[aria-label="Filter by investigations.name"]')
      .last();
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
    applyDatePickerWorkaround();

    const wrapper = createWrapper();

    const filterInput = wrapper.find(
      'input[id="investigations.start_date filter from"]'
    );
    filterInput.instance().value = '2019-08-06';
    filterInput.simulate('change');

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent(
        '{"startDate":{"startDate":"2019-08-06"}}'
      )}`
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
      `?sort=${encodeURIComponent('{"title":"asc"}')}`
    );
  });

  it('calls addToCart mutate function on unchecked checkbox click', () => {
    const addToCart = jest.fn();
    (useAddToCart as jest.Mock).mockReturnValue({
      mutate: addToCart,
      loading: false,
    });
    const wrapper = createWrapper();

    wrapper.find('[aria-label="select row 0"]').last().simulate('click');

    expect(addToCart).toHaveBeenCalledWith([1]);
  });

  it('calls removeFromCart mutate function on checked checkbox click', () => {
    (useCart as jest.Mock).mockReturnValue({
      data: [
        {
          entityId: 1,
          entityType: 'investigation',
          id: 1,
          name: 'test',
          parentEntities: [],
        },
      ],
      isLoading: false,
    });

    const removeFromCart = jest.fn();
    (useRemoveFromCart as jest.Mock).mockReturnValue({
      mutate: removeFromCart,
      loading: false,
    });

    const wrapper = createWrapper();

    wrapper.find('[aria-label="select row 0"]').last().simulate('click');

    expect(removeFromCart).toHaveBeenCalledWith([1]);
  });

  it('selected rows only considers relevant cart items', () => {
    (useCart as jest.Mock).mockReturnValue({
      data: [
        {
          entityId: 2,
          entityType: 'investigation',
          id: 1,
          name: 'test',
          parentEntities: [],
        },
        {
          entityId: 1,
          entityType: 'dataset',
          id: 2,
          name: 'test',
          parentEntities: [],
        },
      ],
      isLoading: false,
    });

    const wrapper = createWrapper();

    const selectAllCheckbox = wrapper
      .find('[aria-label="select all rows"]')
      .first();

    expect(selectAllCheckbox.prop('checked')).toEqual(false);
    expect(selectAllCheckbox.prop('data-indeterminate')).toEqual(false);
  });

  it('no select all checkbox appears and no fetchAllIds sent if selectAllSetting is false', () => {
    state.dgdataview.selectAllSetting = false;

    const wrapper = createWrapper();

    expect(useIds).toHaveBeenCalledWith(
      'investigation',
      expect.anything(),
      false
    );
    expect(useIds).not.toHaveBeenCalledWith(
      'investigation',
      expect.anything(),
      true
    );
    expect(wrapper.exists('[aria-label="select all rows"]')).toBe(false);
  });

  it('displays details panel when expanded', () => {
    const wrapper = createWrapper();
    expect(wrapper.find(ISISInvestigationDetailsPanel).exists()).toBeFalsy();
    wrapper.find('[aria-label="Show details"]').last().simulate('click');

    expect(wrapper.find(ISISInvestigationDetailsPanel).exists()).toBeTruthy();
  });

  it('displays details panel when more information is expanded and navigates to datasets view when tab clicked', () => {
    const wrapper = createWrapper();

    const detailsPanelWrapper = createWrapper(
      wrapper.find(Table).prop('detailsPanel')({
        rowData: rowData[0],
        detailsPanelResize: jest.fn(),
      })
    );

    detailsPanelWrapper
      .find('#investigation-datasets-tab')
      .last()
      .simulate('click');
    expect(history.location.pathname).toBe(
      '/browse/instrument/3/facilityCycle/8/investigation/1/dataset'
    );
  });

  it('displays DOI and renders the expected Link ', () => {
    const wrapper = createWrapper();
    expect(
      wrapper.find('[data-testid="isis-mydata-table-doi-link"]').first().text()
    ).toEqual('study pid');

    expect(
      wrapper
        .find('[data-testid="isis-mydata-table-doi-link"]')
        .first()
        .prop('href')
    ).toEqual('https://doi.org/study pid');
  });

  it('renders details panel without datasets link if no facility cycles', () => {
    (useAllFacilityCycles as jest.Mock).mockReturnValue({
      data: undefined,
    });

    const wrapper = createWrapper();

    const detailsPanelWrapper = createWrapper(
      wrapper.find(Table).prop('detailsPanel')({
        rowData: rowData[0],
      })
    );

    expect(
      detailsPanelWrapper.find('#investigation-datasets-tab').length
    ).toEqual(0);
  });

  it('renders title and name as links', () => {
    const wrapper = createRTLWrapper();

    expect(wrapper.getAllByTestId('isis-mydata-table-title')).toMatchSnapshot();

    expect(
      wrapper.getAllByTestId('isis-mydata-table-doi-link')
    ).toMatchSnapshot();
  });

  it('gracefully handles empty arrays, missing Study from Study Investigation object and missing Instrument from InvestigationInstrument object and missing facility cycles', () => {
    // check it doesn't error if arrays are empty
    rowData[0] = {
      ...rowData[0],
      investigationInstruments: [],
      studyInvestigations: [],
    };
    (useInvestigationsInfinite as jest.Mock).mockReturnValue({
      data: { pages: [rowData] },
      fetchNextPage: jest.fn(),
    });
    (useAllFacilityCycles as jest.Mock).mockReturnValue({
      data: [],
    });
    let wrapper = createWrapper();

    expect(() => wrapper).not.toThrowError();

    // check it renders plain text if valid facility cycle can't be found
    (useAllFacilityCycles as jest.Mock).mockReturnValue({
      data: [
        {
          id: 9,
          startDate: '2018-01-01',
          endDate: '2019-01-01',
        },
      ],
    });
    wrapper = createWrapper();

    expect(wrapper.find('[aria-colindex=3]').find('p').text()).toEqual(
      'Test 1 title'
    );

    expect(wrapper.find('[aria-colindex=6]').find('p').text()).toEqual(
      'Test 1 name'
    );

    // now check that blank is returned if objects are missing
    rowData[0] = {
      ...rowData[0],
      investigationInstruments: [
        {
          id: 1,
        },
      ],
      studyInvestigations: [
        {
          id: 6,
        },
      ],
    };
    (useInvestigationsInfinite as jest.Mock).mockReturnValue({
      data: { pages: [rowData] },
      fetchNextPage: jest.fn(),
    });
    wrapper = createWrapper();

    expect(wrapper.find('[aria-colindex=4]').find('p').text()).toEqual('');

    expect(wrapper.find('[aria-colindex=7]').find('p').text()).toEqual('');
  });
});
