import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import {
  dGCommonInitialState,
  useAllFacilityCycles,
  useLuceneSearchInfinite,
  useInvestigationsDatasetCount,
  useInvestigationSizes,
  StateType,
  CardView,
  InvestigationDetailsPanel,
  ISISInvestigationDetailsPanel,
  DLSVisitDetailsPanel,
  SearchResponse,
  SearchResult,
  SearchResultSource,
} from 'datagateway-common';
import InvestigationSearchCardView from './investigationSearchCardView.component';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { ReactWrapper } from 'enzyme';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

// this is a dependency of react-router so we already have it
// eslint-disable-next-line import/no-extraneous-dependencies
import { createMemoryHistory, History } from 'history';
import { initialState as dgSearchInitialState } from '../state/reducers/dgsearch.reducer';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useAllFacilityCycles: jest.fn(),
    useLuceneSearchInfinite: jest.fn(),
    useInvestigationsDatasetCount: jest.fn(),
    useInvestigationSizes: jest.fn(),
  };
});

describe('Investigation - Card View', () => {
  let mount;
  let mockStore;
  let state: StateType;
  let cardData: SearchResultSource;
  let searchResult: SearchResult;
  let searchResponse: SearchResponse;
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
    cardData = {
      id: 1,
      name: 'Investigation test name',
      startDate: 1563922800000,
      endDate: 1564009200000,
      title: 'Test 1',
      visitId: '1',
      doi: 'doi 1',
      investigationinstrument: [
        {
          'instrument.id': 4,
          'instrument.name': 'LARMOR',
        },
      ],
    };
    searchResult = {
      score: 1,
      id: 1,
      source: cardData,
    };
    searchResponse = {
      results: [searchResult],
    };
    history = createMemoryHistory();

    mockStore = configureStore([thunk]);
    state = JSON.parse(
      JSON.stringify({
        dgcommon: dGCommonInitialState,
        dgsearch: dgSearchInitialState,
      })
    );

    (useLuceneSearchInfinite as jest.Mock).mockReturnValue({
      data: { pages: [searchResponse] },
      fetchNextPage: jest.fn(),
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

  //The below tests are modified from datasetSearchCardView

  it('renders correctly', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('CardView').props()).toMatchSnapshot();
  });

  it('calls the correct data fetching hooks on load', () => {
    createWrapper();

    expect(useLuceneSearchInfinite).toHaveBeenCalledWith(
      'Investigation',
      {
        searchText: '',
        startDate: null,
        endDate: null,
        maxCount: 100,
        minCount: 10,
        restrict: true,
        sort: {},
        facets: [
          {
            target: 'Investigation',
          },
          {
            dimensions: [{ dimension: 'type.name' }],
            target: 'InvestigationParameter',
          },
          {
            dimensions: [{ dimension: 'type.name' }],
            target: 'Sample',
          },
        ],
      },
      {}
    );

    expect(useInvestigationsDatasetCount).toHaveBeenCalledWith([cardData]);
    expect(useInvestigationSizes).toHaveBeenCalledWith(undefined);
  });

  it('renders fine with incomplete data', () => {
    expect(() => createWrapper()).not.toThrowError();
  });

  it('renders generic link & pending count correctly', () => {
    (useInvestigationsDatasetCount as jest.Mock).mockImplementation(() => [
      {
        isFetching: true,
      },
    ]);
    const wrapper = createWrapper();

    expect(wrapper.find(CardView).find('a').first().prop('href')).toEqual(
      `/browse/investigation/1/dataset`
    );
    expect(wrapper.find(CardView).find('a').first().text()).toEqual('Test 1');
    expect(
      wrapper
        .find(CardView)
        .first()
        .find('[data-testid="card-info-data-investigations.dataset_count"]')
        .text()
    ).toEqual('Calculating...');
  });

  it("renders DLS link correctly and doesn't allow for cart selection or download", () => {
    const wrapper = createWrapper('dls');

    expect(wrapper.find(CardView).find('a').first().prop('href')).toEqual(
      '/browse/proposal/Investigation test name/investigation/1/dataset'
    );
    expect(wrapper.find(CardView).find('a').first().text()).toEqual('Test 1');
    expect(wrapper.exists('#add-to-cart-btn-1')).toBe(false);
    expect(wrapper.exists('#download-btn-1')).toBe(false);
  });

  it('renders ISIS link & file sizes correctly', () => {
    (useAllFacilityCycles as jest.Mock).mockReturnValue({
      data: [
        {
          id: 6,
          name: 'facility cycle name',
          startDate: '2000-06-10',
          endDate: '2020-06-11',
        },
      ],
    });

    const wrapper = createWrapper('isis');

    expect(useInvestigationSizes).toHaveBeenCalledWith([cardData]);
    expect(useInvestigationsDatasetCount).toHaveBeenCalledWith(undefined);

    expect(wrapper.find(CardView).find('a').first().prop('href')).toEqual(
      `/browse/instrument/4/facilityCycle/6/investigation/1/dataset`
    );
    expect(wrapper.find(CardView).find('a').first().text()).toEqual('Test 1');
    expect(
      wrapper
        .find(CardView)
        .first()
        .find('[data-testid="card-info-data-investigations.size"]')
        .text()
    ).toEqual('1 B');
  });

  it('displays DOI and renders the expected Link ', () => {
    const wrapper = createWrapper();
    expect(
      wrapper
        .find('[data-testid="investigation-search-card-doi-link"]')
        .first()
        .text()
    ).toEqual('doi 1');

    expect(
      wrapper
        .find('[data-testid="investigation-search-card-doi-link"]')
        .first()
        .prop('href')
    ).toEqual('https://doi.org/doi 1');
  });

  it('does not render ISIS link when instrumentId cannot be found', () => {
    (useAllFacilityCycles as jest.Mock).mockReturnValue({
      data: [
        {
          id: 4,
          name: 'facility cycle name',
          startDate: '2000-06-10',
          endDate: '2020-06-11',
        },
      ],
    });
    delete cardData.investigationinstrument;

    const wrapper = createWrapper('isis');

    expect(wrapper.find(CardView).first().find('a')).toHaveLength(1);
    expect(
      wrapper.find(CardView).first().find('[aria-label="card-title"]').text()
    ).toEqual('Test 1');
  });

  it('displays generic details panel when expanded', () => {
    const wrapper = createWrapper();
    expect(wrapper.find(InvestigationDetailsPanel).exists()).toBeFalsy();
    wrapper
      .find('[aria-label="card-more-info-expand"]')
      .first()
      .simulate('click');

    expect(wrapper.find(InvestigationDetailsPanel).exists()).toBeTruthy();
  });

  it('displays correct details panel for ISIS when expanded', () => {
    const wrapper = createWrapper('isis');
    expect(wrapper.find(ISISInvestigationDetailsPanel).exists()).toBeFalsy();
    wrapper
      .find('[aria-label="card-more-info-expand"]')
      .first()
      .simulate('click');

    expect(wrapper.find(ISISInvestigationDetailsPanel).exists()).toBeTruthy();
  });

  it('can navigate using the details panel for ISIS when there are facility cycles', () => {
    (useAllFacilityCycles as jest.Mock).mockReturnValue({
      data: [
        {
          id: 4,
          name: 'facility cycle name',
          startDate: '2000-06-10',
          endDate: '2020-06-11',
        },
      ],
    });

    const wrapper = createWrapper('isis');
    expect(wrapper.find(ISISInvestigationDetailsPanel).exists()).toBeFalsy();
    wrapper
      .find('[aria-label="card-more-info-expand"]')
      .first()
      .simulate('click');

    expect(wrapper.find(ISISInvestigationDetailsPanel).exists()).toBeTruthy();

    wrapper.find('#investigation-datasets-tab').first().simulate('click');
    expect(history.location.pathname).toBe(
      '/browse/instrument/4/facilityCycle/4/investigation/1/dataset'
    );
  });

  it('displays correct details panel for DLS when expanded', () => {
    const wrapper = createWrapper('dls');
    expect(wrapper.find(DLSVisitDetailsPanel).exists()).toBeFalsy();
    wrapper
      .find('[aria-label="card-more-info-expand"]')
      .first()
      .simulate('click');

    expect(wrapper.find(DLSVisitDetailsPanel).exists()).toBeTruthy();
  });
});
