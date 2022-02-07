import { Link, ListItemText } from '@material-ui/core';
import { createMount } from '@material-ui/core/test-utils';
import {
  AdvancedFilter,
  dGCommonInitialState,
  useDatasetsPaginated,
  useDatasetCount,
  Dataset,
  useLuceneSearch,
  useAllFacilityCycles,
  useDatasetSizes,
  useDatasetsDatafileCount,
  CardView,
  DLSDatasetDetailsPanel,
  ISISDatasetDetailsPanel,
  DatasetDetailsPanel,
} from 'datagateway-common';
import { ReactWrapper } from 'enzyme';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
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
    useDatasetCount: jest.fn(),
    useDatasetsPaginated: jest.fn(),
    useLuceneSearch: jest.fn(),
    useDatasetsDatafileCount: jest.fn(),
    useDatasetSizes: jest.fn(),
    useAllFacilityCycles: jest.fn(),
  };
});

describe('Dataset - Card View', () => {
  let mount;
  let mockStore;
  let state: StateType;
  let cardData: Dataset[];
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
    cardData = [
      {
        id: 1,
        name: 'Dataset test name',
        size: 1,
        modTime: '2019-07-23',
        createTime: '2019-07-23',
        startDate: '2019-07-24',
        endDate: '2019-07-25',
        investigation: {
          id: 2,
          title: 'Investigation test title',
          name: 'Investigation test name',
          summary: 'foo bar',
          visitId: '1',
          doi: 'doi 1',
          size: 1,
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
          startDate: '2019-06-10',
          endDate: '2019-06-11',
          facility: {
            id: 7,
            name: 'facility name',
          },
        },
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

    (useDatasetCount as jest.Mock).mockReturnValue({
      data: 1,
      isLoading: false,
    });
    (useDatasetsPaginated as jest.Mock).mockReturnValue({
      data: cardData,
      isLoading: false,
    });
    (useLuceneSearch as jest.Mock).mockReturnValue({
      data: [],
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
    (useLuceneSearch as jest.Mock).mockReturnValue({
      data: [1],
    });

    createWrapper();

    expect(useLuceneSearch).toHaveBeenCalledWith('Dataset', {
      searchText: '',
      startDate: null,
      endDate: null,
      maxCount: 300,
    });

    expect(useDatasetCount).toHaveBeenCalledWith([
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          id: { in: [1] },
        }),
      },
    ]);
    expect(useDatasetsPaginated).toHaveBeenCalledWith([
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          id: { in: [1] },
        }),
      },
      {
        filterType: 'include',
        filterValue: JSON.stringify({
          investigation: { investigationInstruments: 'instrument' },
        }),
      },
    ]);
    expect(useDatasetsDatafileCount).toHaveBeenCalledWith(cardData);
    expect(useDatasetSizes).toHaveBeenCalledWith([]);
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
        '{"name":{"value":"test","type":"include"}}'
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
      `?filters=${encodeURIComponent('{"modTime":{"endDate":"2019-08-06"}}')}`
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
    expect(button.text()).toEqual('datasets.name');
    button.simulate('click');

    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"name":"asc"}')}`
    );
  });

  it('renders fine with incomplete data', () => {
    (useDatasetCount as jest.Mock).mockReturnValue({});
    (useDatasetsPaginated as jest.Mock).mockReturnValue({});

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

    expect(useDatasetSizes).toHaveBeenCalledWith(cardData);
    expect(useDatasetsDatafileCount).toHaveBeenCalledWith([]);

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
    delete cardData[0].investigation?.investigationInstruments;

    (useDatasetsPaginated as jest.Mock).mockReturnValue({
      data: cardData,
      fetchNextPage: jest.fn(),
    });
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
    delete cardData[0].investigation;
    (useDatasetsPaginated as jest.Mock).mockReturnValue({
      data: cardData,
      fetchNextPage: jest.fn(),
    });

    const wrapper = createWrapper('data');

    expect(wrapper.find(CardView).first().find('a')).toHaveLength(0);
    expect(
      wrapper.find(CardView).first().find('[aria-label="card-title"]').text()
    ).toEqual('Dataset test name');
  });

  it('displays only the dataset name when there is no DLS investigation to link to', () => {
    delete cardData[0].investigation;
    (useDatasetsPaginated as jest.Mock).mockReturnValue({
      data: cardData,
      fetchNextPage: jest.fn(),
    });

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
    delete cardData[0].investigation;
    (useDatasetsPaginated as jest.Mock).mockReturnValue({
      data: cardData,
      fetchNextPage: jest.fn(),
    });

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
