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

  it.skip('calls the correct data fetching hooks on load');

  it.skip('updates filter query params on text filter');

  it.skip('updates filter query params on date filter');

  it.skip('updates sort query params on sort');

  it.skip('renders fine with incomplete data');
});
