import { ListItemText } from '@mui/material';
import {
  AdvancedFilter,
  dGCommonInitialState,
  useDatasetsPaginated,
  useDatasetCount,
  Dataset,
  AddToCartButton,
  DownloadButton,
  ISISDatasetDetailsPanel,
} from 'datagateway-common';
import { mount, ReactWrapper } from 'enzyme';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { StateType } from '../../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import ISISDatasetsCardView from './isisDatasetsCardView.component';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createMemoryHistory, History } from 'history';
import {
  applyDatePickerWorkaround,
  cleanupDatePickerWorkaround,
} from '../../../setupTests';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useDatasetCount: jest.fn(),
    useDatasetsPaginated: jest.fn(),
  };
});

describe('ISIS Datasets - Card View', () => {
  let mockStore;
  let state: StateType;
  let cardData: Dataset[];
  let history: History;

  const createWrapper = (): ReactWrapper => {
    const store = mockStore(state);
    return mount(
      <Provider store={store}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <ISISDatasetsCardView
              instrumentId="1"
              instrumentChildId="1"
              investigationId="1"
              studyHierarchy={false}
            />
          </QueryClientProvider>
        </Router>
      </Provider>
    );
  };

  beforeEach(() => {
    cardData = [
      {
        id: 1,
        name: 'Test 1',
        size: 1,
        modTime: '2019-07-23',
        createTime: '2019-07-23',
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

    (useDatasetCount as jest.Mock).mockReturnValue({
      data: 1,
      isLoading: false,
    });
    (useDatasetsPaginated as jest.Mock).mockReturnValue({
      data: cardData,
      isLoading: false,
    });

    // Prevent error logging
    window.scrollTo = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('CardView').props()).toMatchSnapshot();
  });

  it('calls the correct data fetching hooks on load', () => {
    const investigationId = '1';
    createWrapper();
    expect(useDatasetCount).toHaveBeenCalledWith([
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          'investigation.id': { eq: investigationId },
        }),
      },
    ]);
    expect(useDatasetsPaginated).toHaveBeenCalledWith([
      {
        filterType: 'where',
        filterValue: JSON.stringify({
          'investigation.id': { eq: investigationId },
        }),
      },
    ]);
  });

  it('correct link used when NOT in studyHierarchy', () => {
    const wrapper = createWrapper();
    expect(
      wrapper.find('[aria-label="card-title"]').last().childAt(0).prop('to')
    ).toEqual('/browse/instrument/1/facilityCycle/1/investigation/1/dataset/1');
  });

  it('correct link used for studyHierarchy', () => {
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <ISISDatasetsCardView
              studyHierarchy={true}
              instrumentId="1"
              instrumentChildId="1"
              investigationId="1"
            />
          </QueryClientProvider>
        </Router>
      </Provider>
    );
    expect(
      wrapper.find('[aria-label="card-title"]').last().childAt(0).prop('to')
    ).toEqual(
      '/browseStudyHierarchy/instrument/1/study/1/investigation/1/dataset/1'
    );
  });

  it('updates filter query params on text filter', () => {
    const wrapper = createWrapper();

    const advancedFilter = wrapper.find(AdvancedFilter);
    advancedFilter.find('button').simulate('click');
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
    applyDatePickerWorkaround();

    const wrapper = createWrapper();

    const advancedFilter = wrapper.find(AdvancedFilter);
    advancedFilter.find('button').first().simulate('click');
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

    cleanupDatePickerWorkaround();
  });

  it('uses default sort', () => {
    const wrapper = createWrapper();
    wrapper.update();

    expect(history.length).toBe(1);
    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"createTime":"desc"}')}`
    );
  });

  it('updates sort query params on sort', () => {
    const wrapper = createWrapper();

    const button = wrapper.find(ListItemText).first();
    expect(button.text()).toEqual('datasets.name');
    button.find('div').simulate('click');

    expect(history.location.search).toBe(
      `?sort=${encodeURIComponent('{"name":"asc"}')}`
    );
  });

  it('renders buttons correctly', () => {
    const wrapper = createWrapper();
    expect(wrapper.find(AddToCartButton).exists()).toBeTruthy();
    expect(wrapper.find(AddToCartButton).text()).toEqual('buttons.add_to_cart');

    expect(wrapper.find(DownloadButton).exists()).toBeTruthy();
    expect(wrapper.find(DownloadButton).text()).toEqual('buttons.download');
  });

  it('displays details panel when more information is expanded and navigates to datafiles view when tab clicked', () => {
    const wrapper = createWrapper();
    expect(wrapper.find(ISISDatasetDetailsPanel).exists()).toBeFalsy();
    wrapper
      .find('[aria-label="card-more-info-expand"]')
      .last()
      .simulate('click');

    expect(wrapper.find(ISISDatasetDetailsPanel).exists()).toBeTruthy();

    wrapper.find('#dataset-datafiles-tab').last().simulate('click');
    expect(history.location.pathname).toBe(
      '/browse/instrument/1/facilityCycle/1/investigation/1/dataset/1/datafile'
    );
  });

  it('renders fine with incomplete data', () => {
    (useDatasetCount as jest.Mock).mockReturnValueOnce({});
    (useDatasetsPaginated as jest.Mock).mockReturnValueOnce({});

    expect(() => createWrapper()).not.toThrowError();
  });
});
