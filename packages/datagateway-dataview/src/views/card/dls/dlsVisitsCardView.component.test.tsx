import { Link, ListItemText } from '@material-ui/core';
import { createMount } from '@material-ui/core/test-utils';
import {
  AdvancedFilter,
  dGCommonInitialState,
  useInvestigationCount,
  useInvestigationsPaginated,
  useInvestigationsDatasetCount,
  Investigation,
} from 'datagateway-common';
import { ReactWrapper } from 'enzyme';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { StateType } from '../../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import DLSVisitsCardView from './dlsVisitsCardView.component';
import { createMemoryHistory, History } from 'history';
import { QueryClient, QueryClientProvider } from 'react-query';
import VisitDetailsPanel from '../../detailsPanels/dls/visitDetailsPanel.component';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useInvestigationCount: jest.fn(),
    useInvestigationsPaginated: jest.fn(),
    useInvestigationsDatasetCount: jest.fn(),
  };
});

describe('DLS Visits - Card View', () => {
  let mount;
  let mockStore;
  let state: StateType;
  let cardData: Investigation[];
  let history: History;

  const createWrapper = (): ReactWrapper => {
    const store = mockStore(state);
    return mount(
      <Provider store={store}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <DLSVisitsCardView proposalName="test" />
          </QueryClientProvider>
        </Router>
      </Provider>
    );
  };

  beforeEach(() => {
    mount = createMount();
    cardData = [
      {
        id: 1,
        title: 'Test 1',
        name: 'Test 1',
        visitId: '1',
      },
    ];
    history = createMemoryHistory();

    mockStore = configureStore([thunk]);
    state = JSON.parse(
      JSON.stringify({
        dgcommon: dGCommonInitialState,
        dgdataview: dgDataViewInitialState,
      })
    );

    (useInvestigationCount as jest.Mock).mockReturnValue({
      data: 1,
      isLoading: false,
    });
    (useInvestigationsPaginated as jest.Mock).mockReturnValue({
      data: cardData,
      isLoading: false,
    });
    (useInvestigationsDatasetCount as jest.Mock).mockReturnValue({ data: 1 });

    // Prevent error logging
    window.scrollTo = jest.fn();
  });

  afterEach(() => {
    mount.cleanUp();
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('CardView').props()).toMatchSnapshot();
  });

  it('calls the correct data fetching hooks on load', () => {
    const proposalName = 'test';
    createWrapper();
    expect(useInvestigationCount).toHaveBeenCalledWith([
      {
        filterType: 'where',
        filterValue: JSON.stringify({ name: { eq: proposalName } }),
      },
    ]);
    expect(useInvestigationsPaginated).toHaveBeenCalledWith([
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
    expect(useInvestigationsDatasetCount).toHaveBeenCalledWith(cardData);
  });

  it('updates filter query params on date filter', () => {
    const wrapper = createWrapper();

    const advancedFilter = wrapper.find(AdvancedFilter);
    advancedFilter.find(Link).simulate('click');
    advancedFilter
      .find('input')
      .last()
      .simulate('change', { target: { value: '2019-08-06' } });

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent('{"endDate":{"endDate":"2019-08-06"}}')}`
    );

    advancedFilter
      .find('input')
      .last()
      .simulate('change', { target: { value: '' } });

    expect(history.length).toBe(3);
    expect(history.location.search).toBe('?');
  });

  it('updates filter query params on text filter', () => {
    const wrapper = createWrapper();

    const advancedFilter = wrapper.find(AdvancedFilter);
    advancedFilter.find(Link).simulate('click');
    advancedFilter
      .find('input')
      .first()
      .simulate('change', { target: { value: 'test' } });

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent(
        '{"visitId":{"value":"test","type":"include"}}'
      )}`
    );

    advancedFilter
      .find('input')
      .first()
      .simulate('change', { target: { value: '' } });

    expect(history.length).toBe(3);
    expect(history.location.search).toBe('?');
  });

  it('updates sort query params on sort', () => {
    const wrapper = createWrapper();

    const button = wrapper.find(ListItemText).first();
    expect(button.text()).toEqual('investigations.visit_id');
    button.simulate('click');

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"visitId":"asc"}')}`
    );
  });

  // TODO - unsure what this even tests
  it.skip('pushPage dispatched when page number is no longer valid', () => {
    // const wrapper = createWrapper();
    // store = mockStore({
    //   ...state,
    //   dgcommon: {
    //     ...state.dgcommon,
    //     totalDataCount: 1,
    //     query: {
    //       view: null,
    //       search: null,
    //       page: 2,
    //       results: null,
    //       filters: {},
    //       sort: {},
    //     },
    //   },
    // });
    // wrapper.setProps({ store: store });
    // // The push has outdated query?
    // expect(store.getActions().length).toEqual(4);
    // expect(store.getActions()[1]).toEqual(updatePage(1));
    // expect(store.getActions()[2]).toEqual(push('?page=2'));
  });

  it('displays details panel when more information is expanded', () => {
    const wrapper = createWrapper();
    expect(wrapper.find(VisitDetailsPanel).exists()).toBeFalsy();
    wrapper
      .find('[aria-label="card-more-info-expand"]')
      .first()
      .simulate('click');

    expect(wrapper.find(VisitDetailsPanel).exists()).toBeTruthy();
  });

  it('renders fine with incomplete data', () => {
    (useInvestigationCount as jest.Mock).mockReturnValueOnce({});
    (useInvestigationsPaginated as jest.Mock).mockReturnValueOnce({});
    (useInvestigationsDatasetCount as jest.Mock).mockReturnValueOnce([]);

    expect(() => createWrapper()).not.toThrowError();
  });
});
