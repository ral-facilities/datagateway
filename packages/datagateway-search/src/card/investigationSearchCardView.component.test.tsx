import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import {
  dGCommonInitialState,
  useAllFacilityCycles,
  useLuceneSearch,
  useInvestigationCount,
  useInvestigationsPaginated,
  useInvestigationsDatasetCount,
  useInvestigationSizes,
  Investigation,
  StateType,
  AdvancedFilter,
} from 'datagateway-common';
import InvestigationSearchCardView from './investigationSearchCardView.component';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { ReactWrapper } from 'enzyme';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

import { createMemoryHistory, History } from 'history';
import { initialState as dgSearchInitialState } from '../state/reducers/dgsearch.reducer';
import { Link, ListItemText } from '@material-ui/core';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useAllFacilityCycles: jest.fn(),
    useLuceneSearch: jest.fn(),
    useInvestigationCount: jest.fn(),
    useInvestigationsPaginated: jest.fn(),
    useInvestigationsDatasetCount: jest.fn(),
    useInvestigationSizes: jest.fn(),
  };
});

describe('Investigation - Card View', () => {
  let mount;
  let mockStore;
  let state: StateType;
  let cardData: Investigation[];
  let history: History;

  const createWrapper = (hierarchy?: string): ReactWrapper => {
    return mount(
      <Provider store={mockStore(state)}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <InvestigationSearchCardView hierarchy={hierarchy ?? ''} />
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
        name: 'Investigation test name',
        size: 1,
        modTime: '2019-07-23',
        createTime: '2019-07-23',
        startDate: '2019-07-24',
        endDate: '2019-07-25',
        title: 'Test 1',
        visitId: '1',
      },
    ];
    history = createMemoryHistory();

    mockStore = configureStore([thunk]);
    state = JSON.parse(
      JSON.stringify({
        dgcommon: dGCommonInitialState,
        dgsearch: dgSearchInitialState,
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
    (useLuceneSearch as jest.Mock).mockReturnValue({
      data: [],
    });

    (useAllFacilityCycles as jest.Mock).mockReturnValue({
      data: [],
    });

    (useInvestigationsDatasetCount as jest.Mock).mockImplementation(
      (investigations) =>
        (investigations
          ? 'pages' in investigations
            ? investigations.pages.flat()
            : investigations
          : []
        ).map(() => ({
          data: 1,
          isFetching: false,
          isSuccess: true,
        }))
    );

    (useInvestigationSizes as jest.Mock).mockImplementation((investigations) =>
      (investigations
        ? 'pages' in investigations
          ? investigations.pages.flat()
          : investigations
        : []
      ).map(() => ({
        data: 1,
        isFetching: false,
        isSuccess: true,
      }))
    );

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
    (useLuceneSearch as jest.Mock).mockReturnValue({
      data: [1],
    });

    createWrapper();

    expect(useLuceneSearch).toHaveBeenCalledWith('Investigation', {
      searchText: state.dgsearch.searchText,
      startDate: state.dgsearch.selectDate.startDate,
      endDate: state.dgsearch.selectDate.endDate,
    });

    expect(useInvestigationCount).toHaveBeenCalledWith([
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          id: { in: [1] },
        }),
      },
    ]);
    expect(useInvestigationsPaginated).toHaveBeenCalledWith([
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          id: { in: [1] },
        }),
      },
      {
        filterType: 'include',
        filterValue: JSON.stringify({
          investigationInstruments: 'instrument',
        }),
      },
    ]);
    expect(useInvestigationsDatasetCount).toHaveBeenCalledWith(cardData);
    expect(useInvestigationSizes).toHaveBeenCalledWith([]);
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
        '{"title":{"value":"test","type":"include"}}'
      )}`
    );

    advancedFilter
      .find('input')
      .first()
      .simulate('change', { target: { value: '' } });

    expect(history.length).toBe(3);
    expect(history.location.search).toBe('?');
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

  it('updates sort query params on sort', () => {
    const wrapper = createWrapper();

    const button = wrapper.find(ListItemText).first();
    expect(button.text()).toEqual('investigations.title');
    button.simulate('click');

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"title":"asc"}')}`
    );
  });

  it('renders fine with incomplete data', () => {
    (useInvestigationCount as jest.Mock).mockReturnValue({});
    (useInvestigationsPaginated as jest.Mock).mockReturnValue({});

    expect(() => createWrapper()).not.toThrowError();
  });
});
