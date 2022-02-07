import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import ISISInstrumentsTable from './isisInstrumentsTable.component';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import { StateType } from '../../../state/app.types';
import {
  Instrument,
  useInstrumentCount,
  useInstrumentsInfinite,
  dGCommonInitialState,
  ISISInstrumentDetailsPanel,
} from 'datagateway-common';
import { ReactWrapper } from 'enzyme';
import configureStore from 'redux-mock-store';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { Router } from 'react-router-dom';
import { createMemoryHistory, History } from 'history';

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
  let mount;
  let mockStore;
  let state: StateType;
  let rowData: Instrument[];
  let history: History;

  const createWrapper = (studyHierarchy = false): ReactWrapper => {
    const store = mockStore(state);
    return mount(
      <Provider store={store}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <ISISInstrumentsTable studyHierarchy={studyHierarchy} />
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

    (useInstrumentCount as jest.Mock).mockReturnValue({
      data: 1,
      isLoading: false,
    });
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
    const wrapper = createWrapper();
    expect(wrapper.find('VirtualizedTable').props()).toMatchSnapshot();
  });

  it('calls the correct data fetching hooks on load', () => {
    createWrapper();
    expect(useInstrumentCount).toHaveBeenCalled();
    expect(useInstrumentsInfinite).toHaveBeenCalled();
  });

  it('calls useInstrumentsInfinite when loadMoreRows is called', () => {
    const fetchNextPage = jest.fn();
    (useInstrumentsInfinite as jest.Mock).mockReturnValue({
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
        '{"fullName":{"value":"test","type":"include"}}'
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
    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"fullName":"asc"}')}`
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
      `?sort=${encodeURIComponent('{"fullName":"desc"}')}`
    );
  });

  it('displays details panel when expanded', () => {
    const wrapper = createWrapper();
    expect(wrapper.find(ISISInstrumentDetailsPanel).exists()).toBeFalsy();
    wrapper.find('[aria-label="Show details"]').first().simulate('click');

    expect(wrapper.find(ISISInstrumentDetailsPanel).exists()).toBeTruthy();
  });

  it('renders names as links when NOT in studyHierarchy', () => {
    const wrapper = createWrapper();

    expect(
      wrapper.find('[aria-colindex=2]').find('p').children()
    ).toMatchSnapshot();
  });

  it('renders names as links in StudyHierarchy', () => {
    const wrapper = createWrapper(true);

    expect(
      wrapper.find('[aria-colindex=2]').find('p').children()
    ).toMatchSnapshot();
  });

  it('renders fine with incomplete data', () => {
    (useInstrumentCount as jest.Mock).mockReturnValueOnce({});
    (useInstrumentsInfinite as jest.Mock).mockReturnValueOnce({});

    expect(() => createWrapper()).not.toThrowError();
  });
});
