import React from 'react';
import ISISInvestigationsTable from './isisInvestigationsTable.component';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import configureStore from 'redux-mock-store';
import { StateType } from '../../../state/app.types';
import {
  Investigation,
  dGCommonInitialState,
  useISISInvestigationCount,
  useISISInvestigationIds,
  useCart,
  useAddToCart,
  useRemoveFromCart,
  useISISInvestigationsInfinite,
  useInvestigationSizes,
  useInvestigationDetails,
  Table,
  DownloadButton,
  ISISInvestigationDetailsPanel,
} from 'datagateway-common';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { mount, ReactWrapper } from 'enzyme';
import { createMemoryHistory, History } from 'history';
import {
  applyDatePickerWorkaround,
  cleanupDatePickerWorkaround,
} from '../../../setupTests';
import { render, RenderResult } from '@testing-library/react';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useISISInvestigationCount: jest.fn(),
    useISISInvestigationsInfinite: jest.fn(),
    useInvestigationSizes: jest.fn(),
    useISISInvestigationIds: jest.fn(),
    useCart: jest.fn(),
    useAddToCart: jest.fn(),
    useRemoveFromCart: jest.fn(),
    useInvestigationDetails: jest.fn(),
  };
});

describe('ISIS Investigations table component', () => {
  let mockStore;
  let state: StateType;
  let rowData: Investigation[];
  let history: History;
  let replaceSpy: jest.SpyInstance;

  const createWrapper = (
    element: React.ReactElement = (
      <ISISInvestigationsTable
        studyHierarchy={false}
        instrumentId="4"
        instrumentChildId="5"
      />
    )
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
    element: React.ReactElement = (
      <ISISInvestigationsTable
        studyHierarchy={false}
        instrumentId="4"
        instrumentChildId="5"
      />
    )
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
    rowData = [
      {
        id: 1,
        title: 'Test 1',
        name: 'Test 1',
        summary: 'foo bar',
        visitId: '1',
        doi: 'doi 1',
        size: 1,
        investigationUsers: [
          {
            id: 2,
            role: 'experimenter',
            user: { id: 2, name: 'test', fullName: 'Test experimenter' },
          },
          {
            id: 3,
            role: 'principal_experimenter',
            user: { id: 3, name: 'testpi', fullName: 'Test PI' },
          },
        ],
        studyInvestigations: [
          {
            id: 6,
            study: {
              id: 7,
              pid: 'study pid',
            },
          },
        ],
        startDate: '2019-06-10',
        endDate: '2019-06-11',
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

    (useCart as jest.Mock).mockReturnValue({
      data: [],
    });
    (useISISInvestigationCount as jest.Mock).mockReturnValue({
      data: 0,
    });
    (useISISInvestigationsInfinite as jest.Mock).mockReturnValue({
      data: { pages: [rowData] },
      fetchNextPage: jest.fn(),
    });
    (useInvestigationSizes as jest.Mock).mockReturnValue([
      {
        data: 1,
      },
    ]);
    (useISISInvestigationIds as jest.Mock).mockReturnValue({
      data: [1],
    });
    (useAddToCart as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isLoading: false,
    });
    (useRemoveFromCart as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isLoading: false,
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
    const studyHierarchy = false;
    const instrumentId = '4';
    const instrumentChildId = '5';
    createWrapper();
    expect(useISISInvestigationCount).toHaveBeenCalledWith(
      parseInt(instrumentId),
      parseInt(instrumentChildId),
      studyHierarchy
    );
    expect(useISISInvestigationsInfinite).toHaveBeenCalledWith(
      parseInt(instrumentId),
      parseInt(instrumentChildId),
      studyHierarchy
    );
    expect(useInvestigationSizes).toHaveBeenCalledWith({
      pages: [rowData],
    });
    expect(useISISInvestigationIds).toHaveBeenCalledWith(
      parseInt(instrumentId),
      parseInt(instrumentChildId),
      studyHierarchy,
      true
    );
    expect(useCart).toHaveBeenCalled();
    expect(useAddToCart).toHaveBeenCalledWith('investigation');
    expect(useRemoveFromCart).toHaveBeenCalledWith('investigation');
  });

  it('calls useISISInvestigationsInfinite when loadMoreRows is called', () => {
    const fetchNextPage = jest.fn();
    (useISISInvestigationsInfinite as jest.Mock).mockReturnValue({
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

  it('displays DOI and renders the expected Link ', () => {
    const wrapper = createWrapper();
    expect(
      wrapper
        .find('[data-testid="isis-investigation-table-doi-link"]')
        .first()
        .text()
    ).toEqual('study pid');

    expect(
      wrapper
        .find('[data-testid="isis-investigation-table-doi-link"]')
        .first()
        .prop('href')
    ).toEqual('https://doi.org/study pid');
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
    (useCart as jest.Mock).mockReturnValueOnce({
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

    expect(useISISInvestigationIds).toHaveBeenCalledWith(4, 5, false, false);
    expect(useISISInvestigationIds).not.toHaveBeenCalledWith(4, 5, false, true);
    expect(wrapper.exists('[aria-label="select all rows"]')).toBe(false);
  });

  it('displays details panel when expanded', () => {
    const wrapper = createWrapper();
    expect(wrapper.find(ISISInvestigationDetailsPanel).exists()).toBeFalsy();
    wrapper.find('[aria-label="Show details"]').last().simulate('click');

    expect(wrapper.find(ISISInvestigationDetailsPanel).exists()).toBeTruthy();
  });

  it('renders details panel with datasets link and can navigate', () => {
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
      '/browse/instrument/4/facilityCycle/5/investigation/1/dataset'
    );
  });

  it('renders title and DOI as links', () => {
    const wrapper = createRTLWrapper();

    expect(
      wrapper.getAllByTestId('isis-investigations-table-title')
    ).toMatchSnapshot();

    expect(
      wrapper.getAllByTestId('isis-investigation-table-doi-link')
    ).toMatchSnapshot();
  });

  it('renders title and DOI as links in StudyHierarchy', () => {
    const store = mockStore(state);
    const wrapper = render(
      <Provider store={store}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <ISISInvestigationsTable
              studyHierarchy={true}
              instrumentId="4"
              instrumentChildId="5"
            />
          </QueryClientProvider>
        </Router>
      </Provider>
    );

    expect(
      wrapper.getAllByTestId('isis-investigations-table-title')
    ).toMatchSnapshot();

    expect(
      wrapper.getAllByTestId('isis-investigation-table-doi-link')
    ).toMatchSnapshot();
  });

  it('displays the correct user as the PI ', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('[aria-colindex=7]').find('p').text()).toEqual(
      'Test PI'
    );
  });

  it('gracefully handles empty Study Investigation and investigationUsers, missing Study from Study Investigation object and missing User from investigationUsers object', () => {
    (useISISInvestigationsInfinite as jest.Mock).mockReturnValue({
      data: {
        pages: [
          {
            ...rowData[0],
            investigationUsers: [],
            studyInvestigations: [],
          },
        ],
      },
      fetchNextPage: jest.fn(),
    });

    let wrapper = createWrapper();
    expect(() => wrapper).not.toThrowError();

    (useISISInvestigationsInfinite as jest.Mock).mockClear();
    (useISISInvestigationsInfinite as jest.Mock).mockReturnValue({
      data: {
        pages: [
          {
            ...rowData[0],
            investigationUsers: [
              {
                id: 1,
              },
            ],
            studyInvestigations: [
              {
                id: 6,
              },
            ],
          },
        ],
      },
      fetchNextPage: jest.fn(),
    });

    wrapper = createWrapper();
    expect(wrapper.find('[aria-colindex=5]').find('p').text()).toEqual('');
    expect(wrapper.find('[aria-colindex=7]').find('p').text()).toEqual('');
  });

  it('renders actions correctly', () => {
    const wrapper = createWrapper();
    expect(wrapper.find(DownloadButton).exists()).toBeTruthy();
  });
});
