import React from 'react';
import { createMount, createShallow } from '@material-ui/core/test-utils';
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
} from 'datagateway-common';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { Router } from 'react-router';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactWrapper } from 'enzyme';
import { createMemoryHistory, History } from 'history';

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
  let shallow;
  let mount;
  let mockStore;
  let state: StateType;
  let rowData: Investigation[];
  let history: History;
  let replaceSpy: jest.SpyInstance;

  const createWrapper = (): ReactWrapper => {
    const store = mockStore(state);
    return mount(
      <Provider store={store}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <ISISInvestigationsTable
              studyHierarchy={false}
              instrumentId="4"
              instrumentChildId="5"
            />
          </QueryClientProvider>
        </Router>
      </Provider>
    );
  };

  beforeEach(() => {
    shallow = createShallow();
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
              id: 4,
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
    mount.cleanUp();
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

    wrapper.find('[aria-label="select row 0"]').first().simulate('click');

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

    wrapper.find('[aria-label="select row 0"]').first().simulate('click');

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

  it('renders details panel correctly and it fetches data and can navigate', () => {
    const wrapper = createWrapper();

    const detailsPanelWrapper = shallow(
      wrapper.find(Table).prop('detailsPanel')({
        rowData: rowData[0],
      })
    );
    expect(detailsPanelWrapper).toMatchSnapshot();

    mount(
      wrapper.find(Table).prop('detailsPanel')({
        rowData: rowData[0],
        detailsPanelResize: jest.fn(),
      })
    );

    expect(useInvestigationDetails).toHaveBeenCalledWith(1);

    detailsPanelWrapper.find('#investigation-datasets-tab').simulate('click');
    expect(history.location.pathname).toBe(
      '/browse/instrument/4/facilityCycle/5/investigation/1/dataset'
    );
  });

  it('renders title, name and DOI as links', () => {
    const wrapper = createWrapper();

    expect(
      wrapper.find('[aria-colindex=3]').find('p').children()
    ).toMatchSnapshot();

    expect(
      wrapper.find('[aria-colindex=4]').find('p').children()
    ).toMatchSnapshot();

    expect(
      wrapper.find('[aria-colindex=5]').find('p').children()
    ).toMatchSnapshot();
  });

  it('renders title, name and DOI as links in StudyHierarchy', () => {
    const store = mockStore(state);
    const wrapper = mount(
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
      wrapper.find('[aria-colindex=3]').find('p').children()
    ).toMatchSnapshot();

    expect(
      wrapper.find('[aria-colindex=4]').find('p').children()
    ).toMatchSnapshot();

    expect(
      wrapper.find('[aria-colindex=5]').find('p').children()
    ).toMatchSnapshot();
  });

  it('gracefully handles empty Study Investigation and InvestigationInstrument, missing Study from Study Investigation object and missing Instrument from InvestigationInstrument object', () => {
    (useISISInvestigationsInfinite as jest.Mock).mockReturnValue({
      data: {
        pages: [
          {
            ...rowData[0],
            investigationInstruments: [],
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
