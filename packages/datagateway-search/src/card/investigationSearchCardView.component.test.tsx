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
  CardView,
  InvestigationDetailsPanel,
  ISISInvestigationDetailsPanel,
  DLSVisitDetailsPanel,
} from 'datagateway-common';
import InvestigationSearchCardView from './investigationSearchCardView.component';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { ReactWrapper } from 'enzyme';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';

// this is a dependency of react-router so we already have it
// eslint-disable-next-line import/no-extraneous-dependencies
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
        doi: 'doi 1',
        investigationInstruments: [
          {
            id: 3,
            instrument: {
              id: 4,
              name: 'LARMOR',
            },
          },
        ],
        studyInvestigations: [
          {
            id: 5,
            study: {
              id: 6,
              pid: 'study pid',
              name: 'study name',
              modTime: '2019-06-10',
              createTime: '2019-06-10',
            },
            investigation: {
              id: 2,
              title: 'Investigation test title',
              name: 'Investigation test name',
              visitId: '1',
            },
          },
        ],
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

  //The below tests are modified from datasetSearchCardView

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
      searchText: '',
      startDate: null,
      endDate: null,
      maxCount: 300,
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

    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent(
        '{"title":{"value":"test","type":"include"}}'
      )}`
    );

    advancedFilter
      .find('input')
      .first()
      .simulate('change', { target: { value: '' } });

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

    expect(history.location.search).toBe(
      `?filters=${encodeURIComponent('{"endDate":{"endDate":"2019-08-06"}}')}`
    );

    advancedFilter
      .find('input')
      .last()
      .simulate('change', { target: { value: '' } });

    expect(history.location.search).toBe('?');
  });

  it('updates sort query params on sort', () => {
    const wrapper = createWrapper();

    const button = wrapper.find(ListItemText).first();
    expect(button.text()).toEqual('investigations.title');
    button.simulate('click');

    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"title":"asc"}')}`
    );
  });

  it('renders fine with incomplete data', () => {
    (useInvestigationCount as jest.Mock).mockReturnValue({});
    (useInvestigationsPaginated as jest.Mock).mockReturnValue({});

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

    expect(useInvestigationSizes).toHaveBeenCalledWith(cardData);
    expect(useInvestigationsDatasetCount).toHaveBeenCalledWith([]);

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
    delete cardData[0].investigationInstruments;

    (useInvestigationsPaginated as jest.Mock).mockReturnValue({
      data: cardData,
      fetchNextPage: jest.fn(),
    });
    const wrapper = createWrapper('isis');

    expect(wrapper.find(CardView).first().find('a')).toHaveLength(1);
    expect(
      wrapper.find(CardView).first().find('[aria-label="card-title"]').text()
    ).toEqual('Test 1');
  });

  it('displays only the dataset name when there is no generic investigation to link to', () => {
    delete cardData[0].investigation;
    (useInvestigationsPaginated as jest.Mock).mockReturnValue({
      data: cardData,
      fetchNextPage: jest.fn(),
    });

    const wrapper = createWrapper('data');

    expect(wrapper.find(CardView).first().find('a')).toHaveLength(2);
    expect(
      wrapper.find(CardView).first().find('[aria-label="card-title"]').text()
    ).toEqual('Test 1');
  });

  it('displays only the dataset name when there is no DLS investigation to link to', () => {
    delete cardData[0].investigation;
    (useInvestigationsPaginated as jest.Mock).mockReturnValue({
      data: cardData,
      fetchNextPage: jest.fn(),
    });

    const wrapper = createWrapper('dls');

    expect(wrapper.find(CardView).first().find('a')).toHaveLength(2);
    expect(
      wrapper.find(CardView).first().find('[aria-label="card-title"]').text()
    ).toEqual('Test 1');
  });

  it('displays only the dataset name when there is no ISIS investigation to link to', () => {
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
    delete cardData[0].investigation;
    (useInvestigationsPaginated as jest.Mock).mockReturnValue({
      data: cardData,
      fetchNextPage: jest.fn(),
    });

    const wrapper = createWrapper('isis');

    expect(wrapper.find(CardView).first().find('a')).toHaveLength(2);
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
