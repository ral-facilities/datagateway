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
import { Router } from 'react-router-dom';
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
    advancedFilter
      .find('[aria-label="advanced-filters-link"]')
      .first()
      .simulate('click');
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
    advancedFilter
      .find('[aria-label="advanced-filters-link"]')
      .first()
      .simulate('click');
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

  it('updates sort query params on sort', () => {
    const wrapper = createWrapper();

    const button = wrapper.find('[aria-label="ListItemText"]').first();
    expect(button.text()).toEqual('studies.name');
    button.simulate('click');

    expect(history.length).toBe(2);
    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"name":"asc"}')}`
    );
  });

  it('displays information from investigation when investigation present', () => {
    cardData = [
      {
        ...cardData[0],
        studyInvestigations: [
          {
            id: 2,
            study: {
              ...cardData[0],
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
    (useStudiesPaginated as jest.Mock).mockReturnValue({
      data: cardData,
    });

    const wrapper = createWrapper();

    expect(
      wrapper.find('[aria-label="card-description"]').first().text()
    ).toEqual('Test investigation');
  });

  it('renders fine with incomplete data', () => {
    (useStudyCount as jest.Mock).mockReturnValueOnce({});
    (useStudiesPaginated as jest.Mock).mockReturnValueOnce({});

    expect(() => createWrapper()).not.toThrowError();

    cardData = [
      {
        ...cardData[0],
        studyInvestigations: [
          {
            id: 2,
            study: {
              ...cardData[0],
            },
          },
        ],
      },
    ];
    (useStudiesPaginated as jest.Mock).mockReturnValue({
      data: cardData,
    });

    expect(() => createWrapper()).not.toThrowError();
  });
});
