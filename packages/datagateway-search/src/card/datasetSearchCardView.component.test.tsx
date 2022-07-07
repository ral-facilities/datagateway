import { createMount } from '@material-ui/core/test-utils';
import {
  dGCommonInitialState,
  useLuceneSearchInfinite,
  useAllFacilityCycles,
  useDatasetSizes,
  useDatasetsDatafileCount,
  CardView,
  DLSDatasetDetailsPanel,
  ISISDatasetDetailsPanel,
  DatasetDetailsPanel,
  SearchResponse,
  SearchResult,
  SearchResultSource,
} from 'datagateway-common';
import { ReactWrapper } from 'enzyme';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { StateType } from '../state/app.types';
import DatasetSearchCardView from './datasetSearchCardView.component';
import { QueryClient, QueryClientProvider } from 'react-query';
// this is a dependency of react-router so we already have it
// eslint-disable-next-line import/no-extraneous-dependencies
import { createMemoryHistory, History } from 'history';
import { initialState as dgSearchInitialState } from '../state/reducers/dgsearch.reducer';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useLuceneSearchInfinite: jest.fn(),
    useDatasetsDatafileCount: jest.fn(),
    useDatasetSizes: jest.fn(),
    useAllFacilityCycles: jest.fn(),
  };
});

describe('Dataset - Card View', () => {
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
            <DatasetSearchCardView hierarchy={hierarchy ?? ''} />
          </QueryClientProvider>
        </Router>
      </Provider>
    );
  };

  beforeEach(() => {
    mount = createMount();
    cardData = {
      id: 1,
      name: 'Dataset test name',
      startDate: 1563922800000,
      endDate: 1564009200000,
      investigationinstrument: [
        {
          'instrument.id': 4,
          'instrument.name': 'LARMOR',
        },
      ],
      'investigation.id': 2,
      'investigation.title': 'Investigation test title',
      'investigation.name': 'Investigation test name',
      'investigation.startDate': 1560121200000,
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
    (useDatasetsDatafileCount as jest.Mock).mockImplementation((datasets) =>
      (datasets
        ? 'pages' in datasets
          ? datasets.pages.flat()
          : datasets
        : []
      ).map(() => ({
        data: 1,
        isFetching: false,
        isSuccess: true,
      }))
    );
    (useDatasetSizes as jest.Mock).mockImplementation((datasets) =>
      (datasets
        ? 'pages' in datasets
          ? datasets.pages.flat()
          : datasets
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
    createWrapper();

    expect(useLuceneSearchInfinite).toHaveBeenCalledWith(
      'Dataset',
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
            target: 'Dataset',
          },
        ],
      },
      {}
    );

    expect(useDatasetsDatafileCount).toHaveBeenCalledWith([cardData]);
    expect(useDatasetSizes).toHaveBeenCalledWith(undefined);
  });

  it('renders fine with incomplete data', () => {
    expect(() => createWrapper()).not.toThrowError();
  });

  it('renders generic link & pending count correctly', () => {
    (useDatasetsDatafileCount as jest.Mock).mockImplementation(() => [
      {
        isFetching: true,
      },
    ]);
    const wrapper = createWrapper();

    expect(wrapper.find(CardView).find('a').first().prop('href')).toEqual(
      `/browse/investigation/2/dataset/1/datafile`
    );
    expect(wrapper.find(CardView).find('a').first().text()).toEqual(
      'Dataset test name'
    );
    expect(
      wrapper
        .find(CardView)
        .first()
        .find('[data-testid="card-info-data-datasets.datafile_count"]')
        .text()
    ).toEqual('Calculating...');
  });

  it("renders DLS link correctly and doesn't allow for download", () => {
    const wrapper = createWrapper('dls');

    expect(wrapper.find(CardView).find('a').first().prop('href')).toEqual(
      '/browse/proposal/Investigation test name/investigation/2/dataset/1/datafile'
    );
    expect(wrapper.find(CardView).find('a').first().text()).toEqual(
      'Dataset test name'
    );
    expect(wrapper.exists('#add-to-cart-btn-dataset-1')).toBe(true);
    expect(wrapper.exists('#download-btn-dataset-1')).toBe(false);
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

    expect(useDatasetSizes).toHaveBeenCalledWith([cardData]);
    expect(useDatasetsDatafileCount).toHaveBeenCalledWith(undefined);

    expect(wrapper.find(CardView).find('a').first().prop('href')).toEqual(
      `/browse/instrument/4/facilityCycle/6/investigation/2/dataset/1`
    );
    expect(wrapper.find(CardView).find('a').first().text()).toEqual(
      'Dataset test name'
    );
    expect(
      wrapper
        .find(CardView)
        .first()
        .find('[data-testid="card-info-data-datasets.size"]')
        .text()
    ).toEqual('1 B');
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

    expect(wrapper.find(CardView).first().find('a')).toHaveLength(0);
    expect(
      wrapper.find(CardView).first().find('[aria-label="card-title"]').text()
    ).toEqual('Dataset test name');
  });

  it('does not render ISIS link when facilityCycleId cannot be found', () => {
    const wrapper = createWrapper('isis');

    expect(wrapper.find(CardView).first().find('a')).toHaveLength(0);
    expect(
      wrapper.find(CardView).first().find('[aria-label="card-title"]').text()
    ).toEqual('Dataset test name');
  });

  it('does not render ISIS link when facilityCycleId has incompatible dates', () => {
    (useAllFacilityCycles as jest.Mock).mockReturnValue({
      data: [
        {
          id: 2,
          name: 'facility cycle name',
          startDate: '2020-06-11',
          endDate: '2000-06-10',
        },
      ],
    });

    const wrapper = createWrapper('isis');

    expect(wrapper.find(CardView).first().find('a')).toHaveLength(0);
    expect(
      wrapper.find(CardView).first().find('[aria-label="card-title"]').text()
    ).toEqual('Dataset test name');
  });

  it('displays only the dataset name when there is no generic investigation to link to', () => {
    delete cardData['investigation.id'];
    delete cardData['investigation.name'];
    delete cardData['investigation.title'];
    delete cardData['investigation.startDate'];

    const wrapper = createWrapper('data');

    expect(wrapper.find(CardView).first().find('a')).toHaveLength(0);
    expect(
      wrapper.find(CardView).first().find('[aria-label="card-title"]').text()
    ).toEqual('Dataset test name');
  });

  it('displays only the dataset name when there is no DLS investigation to link to', () => {
    delete cardData['investigation.id'];
    delete cardData['investigation.name'];
    delete cardData['investigation.title'];
    delete cardData['investigation.startDate'];

    const wrapper = createWrapper('dls');

    expect(wrapper.find(CardView).first().find('a')).toHaveLength(0);
    expect(
      wrapper.find(CardView).first().find('[aria-label="card-title"]').text()
    ).toEqual('Dataset test name');
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
    delete cardData['investigation.id'];
    delete cardData['investigation.name'];
    delete cardData['investigation.title'];
    delete cardData['investigation.startDate'];

    const wrapper = createWrapper('isis');

    expect(wrapper.find(CardView).first().find('a')).toHaveLength(0);
    expect(
      wrapper.find(CardView).first().find('[aria-label="card-title"]').text()
    ).toEqual('Dataset test name');
  });

  it('displays generic details panel when expanded', () => {
    const wrapper = createWrapper();
    expect(wrapper.find(DatasetDetailsPanel).exists()).toBeFalsy();
    wrapper
      .find('[aria-label="card-more-info-expand"]')
      .first()
      .simulate('click');

    expect(wrapper.find(DatasetDetailsPanel).exists()).toBeTruthy();
  });

  it('displays correct details panel for ISIS when expanded', () => {
    const wrapper = createWrapper('isis');
    expect(wrapper.find(ISISDatasetDetailsPanel).exists()).toBeFalsy();
    wrapper
      .find('[aria-label="card-more-info-expand"]')
      .first()
      .simulate('click');

    expect(wrapper.find(ISISDatasetDetailsPanel).exists()).toBeTruthy();
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
    expect(wrapper.find(ISISDatasetDetailsPanel).exists()).toBeFalsy();
    wrapper
      .find('[aria-label="card-more-info-expand"]')
      .first()
      .simulate('click');

    expect(wrapper.find(ISISDatasetDetailsPanel).exists()).toBeTruthy();

    wrapper.find('#dataset-datafiles-tab').first().simulate('click');
    expect(history.location.pathname).toBe(
      '/browse/instrument/4/facilityCycle/4/investigation/2/dataset/1'
    );
  });

  it('displays correct details panel for DLS when expanded', () => {
    const wrapper = createWrapper('dls');
    expect(wrapper.find(DLSDatasetDetailsPanel).exists()).toBeFalsy();
    wrapper
      .find('[aria-label="card-more-info-expand"]')
      .first()
      .simulate('click');

    expect(wrapper.find(DLSDatasetDetailsPanel).exists()).toBeTruthy();
  });
});
