import { Link, ListItemText } from '@material-ui/core';
import { createMount } from '@material-ui/core/test-utils';
import {
  AdvancedFilter,
  dGCommonInitialState,
  useStudyCount,
  useStudiesPaginated,
  Study,
} from 'datagateway-common';
import { ReactWrapper } from 'enzyme';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { StateType } from '../../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import ISISStudiesCardView from './isisStudiesCardView.component';
import { createMemoryHistory, History } from 'history';
import { QueryClient, QueryClientProvider } from 'react-query';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useStudyCount: jest.fn(),
    useStudiesPaginated: jest.fn(),
  };
});

describe('ISIS Studies - Card View', () => {
  let mount;
  let mockStore;
  let state: StateType;
  let cardData: Study[];
  let history: History;

  const createWrapper = (): ReactWrapper => {
    const store = mockStore(state);
    return mount(
      <Provider store={store}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <ISISStudiesCardView instrumentId="1" />
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
        study: {
          id: 1,
          pid: 'doi',
          name: 'Test 1',
          modTime: '2000-01-01',
          createTime: '2000-01-01',
        },
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

    (useStudyCount as jest.Mock).mockReturnValue({
      data: 1,
      isLoading: false,
    });
    (useStudiesPaginated as jest.Mock).mockReturnValue({
      data: cardData,
      isLoading: false,
    });

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
    const instrumentId = '1';
    createWrapper();
    expect(useStudyCount).toHaveBeenCalledWith([
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          'studyInvestigations.investigation.investigationInstruments.instrument.id': {
            eq: instrumentId,
          },
        }),
      },
    ]);
    expect(useStudiesPaginated).toHaveBeenCalledWith([
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          'studyInvestigations.investigation.investigationInstruments.instrument.id': {
            eq: instrumentId,
          },
        }),
      },
      {
        filterType: 'include',
        filterValue: JSON.stringify({
          studyInvestigations: 'investigation',
        }),
      },
    ]);
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
        '{"name":{"value":"test","type":"include"}}'
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
      `?filters=${encodeURIComponent(
        '{"studyInvestigations.investigation.endDate":{"endDate":"2019-08-06"}}'
      )}`
    );

    advancedFilter
      .find('input')
      .last()
      .simulate('change', { target: { value: '' } });

    expect(history.length).toBe(3);
    expect(history.location.search).toBe('?');
  });

  // it('pushFilters dispatched by date filter', () => {
  //   const wrapper = createWrapper();
  //   const advancedFilter = wrapper.find(AdvancedFilter);
  //   advancedFilter.find(Link).simulate('click');
  //   advancedFilter
  //     .find('input')
  //     .last()
  //     .simulate('change', { target: { value: '2019-08-06' } });
  //   expect(store.getActions().length).toEqual(3);
  //   expect(store.getActions()[1]).toEqual(
  //     filterTable('investigation.endDate', {
  //       endDate: '2019-08-06',
  //       startDate: undefined,
  //     })
  //   );

  //   advancedFilter
  //     .find('input')
  //     .last()
  //     .simulate('change', { target: { value: '' } });
  //   expect(store.getActions().length).toEqual(5);
  //   expect(store.getActions()[3]).toEqual(
  //     filterTable('investigation.endDate', null)
  //   );
  //   expect(store.getActions()[4]).toEqual(push('?'));
  // });

  // it('pushFilters dispatched by text filter', () => {
  //   const wrapper = createWrapper();
  //   const advancedFilter = wrapper.find(AdvancedFilter);
  //   advancedFilter.find(Link).simulate('click');
  //   advancedFilter
  //     .find('input')
  //     .first()
  //     .simulate('change', { target: { value: 'test' } });
  //   expect(store.getActions().length).toEqual(3);
  //   expect(store.getActions()[1]).toEqual(
  //     filterTable('study.name', { value: 'test', type: 'include' })
  //   );
  //   expect(store.getActions()[2]).toEqual(push('?'));

  //   advancedFilter
  //     .find('input')
  //     .first()
  //     .simulate('change', { target: { value: '' } });
  //   expect(store.getActions().length).toEqual(5);
  //   expect(store.getActions()[3]).toEqual(filterTable('study.name', null));
  //   expect(store.getActions()[4]).toEqual(push('?'));
  // });

  it('updates sort query params on sort', () => {
    const wrapper = createWrapper();

    const button = wrapper.find(ListItemText).first();
    expect(button.text()).toEqual('studies.name');
    button.simulate('click');

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"name":"asc"}')}`
    );
  });

  it('renders fine with incomplete data', () => {
    (useStudyCount as jest.Mock).mockReturnValueOnce({});
    (useStudiesPaginated as jest.Mock).mockReturnValueOnce({});

    expect(() => createWrapper()).not.toThrowError();
  });
});
