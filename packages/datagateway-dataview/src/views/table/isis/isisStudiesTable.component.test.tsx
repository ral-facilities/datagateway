import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import ISISStudiesTable from './isisStudiesTable.component';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';

import { StateType } from '../../../state/app.types';
import {
  Study,
  dGCommonInitialState,
  useStudyCount,
  useStudiesInfinite,
} from 'datagateway-common';
import { ReactWrapper } from 'enzyme';
import configureStore from 'redux-mock-store';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { Router } from 'react-router';
import { createMemoryHistory, History } from 'history';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useStudyCount: jest.fn(),
    useStudiesInfinite: jest.fn(),
  };
});

describe('ISIS Studies table component', () => {
  let mount;
  let mockStore;
  let state: StateType;
  let rowData: Study[];
  let history: History;

  const createWrapper = (): ReactWrapper => {
    const store = mockStore(state);
    return mount(
      <Provider store={store}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <ISISStudiesTable instrumentId="1" />
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
        pid: 'doi',
        name: 'Test 1',
        modTime: '2000-01-01',
        createTime: '2000-01-01',
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

    (useStudyCount as jest.Mock).mockReturnValue({
      data: 1,
      isLoading: false,
    });

    (useStudiesInfinite as jest.Mock).mockReturnValue({
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
    expect(useStudiesInfinite).toHaveBeenCalledWith([
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

  it('calls useStudiesInfinite when loadMoreRows is called', () => {
    const fetchNextPage = jest.fn();
    (useStudiesInfinite as jest.Mock).mockReturnValueOnce({
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
      .find('[aria-label="Filter by studies.name"]')
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

    const filterInput = wrapper.find('input[id="studies.end_date filter to"]');
    filterInput.instance().value = '2019-08-06';
    filterInput.simulate('change');

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent(
        '{"studyInvestigations.investigation.endDate":{"endDate":"2019-08-06"}}'
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
      `?sort=${encodeURIComponent('{"name":"asc"}')}`
    );
  });

  it('renders studies name as a link', () => {
    const wrapper = createWrapper();

    expect(
      wrapper.find('[aria-colindex=1]').find('p').children()
    ).toMatchSnapshot();
  });

  it('displays Experiment DOI and renders the expected Link ', () => {
    rowData = [
      {
        ...rowData[0],
        studyInvestigations: [
          {
            id: 2,
            study: {
              ...rowData[0],
            },
            investigation: {
              id: 3,
              name: 'Test',
              title: 'Test investigation',
              visitId: '3',
              startDate: '2021-08-19',
              endDate: '2021-08-20',
            },
          },
        ],
      },
    ];
    (useStudiesInfinite as jest.Mock).mockReturnValue({
      data: { pages: [rowData] },
      fetchNextPage: jest.fn(),
    });

    const wrapper = createWrapper();
    expect(
      wrapper.find('[data-test-id="table-study-doi-link"]').first().text()
    ).toEqual('doi');

    expect(
      wrapper.find('[data-test-id="table-study-doi-link"]').first().prop('href')
    ).toEqual('https://doi.org/doi');
  });

  it('displays information from investigation when investigation present', () => {
    rowData = [
      {
        ...rowData[0],
        studyInvestigations: [
          {
            id: 2,
            study: {
              ...rowData[0],
            },
            investigation: {
              id: 3,
              name: 'Test',
              title: 'Test investigation',
              visitId: '3',
              startDate: '2021-08-19',
              endDate: '2021-08-20',
            },
          },
        ],
      },
    ];
    (useStudiesInfinite as jest.Mock).mockReturnValue({
      data: { pages: [rowData] },
      fetchNextPage: jest.fn(),
    });

    const wrapper = createWrapper();

    expect(wrapper.find('[aria-colindex=2]').find('p').first().text()).toBe(
      'Test investigation'
    );
  });

  it('renders fine when investigation is undefined', () => {
    rowData = [
      {
        ...rowData[0],
        studyInvestigations: [
          {
            id: 2,
            study: {
              ...rowData[0],
            },
          },
        ],
      },
    ];
    (useStudiesInfinite as jest.Mock).mockReturnValue({
      data: { pages: [rowData] },
      fetchNextPage: jest.fn(),
    });

    expect(() => createWrapper()).not.toThrowError();
  });
});
