import { Link, ListItemText } from '@material-ui/core';
import { createMount } from '@material-ui/core/test-utils';
import {
  AdvancedFilter,
  dGCommonInitialState,
  useISISInvestigationsPaginated,
  useISISInvestigationCount,
  Investigation,
  useInvestigationSizes,
} from 'datagateway-common';
import { ReactWrapper } from 'enzyme';
import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { StateType } from '../../../state/app.types';
import { initialState as dgDataViewInitialState } from '../../../state/reducers/dgdataview.reducer';
import ISISInvestigationsCardView from './isisInvestigationsCardView.component';
import { QueryClient, QueryClientProvider } from 'react-query';
import AddToCartButton from '../../addToCartButton.component';
import DownloadButton from '../../downloadButton.component';
import InvestigationDetailsPanel from '../../detailsPanels/isis/investigationDetailsPanel.component';
import { createMemoryHistory, History } from 'history';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useISISInvestigationCount: jest.fn(),
    useISISInvestigationsPaginated: jest.fn(),
    useInvestigationSizes: jest.fn(),
  };
});

describe('ISIS Investigations - Card View', () => {
  let mount;
  let mockStore;
  let state: StateType;
  let cardData: Investigation[];
  let history: History;

  const createWrapper = (studyHierarchy = false): ReactWrapper => {
    const store = mockStore(state);
    return mount(
      <Provider store={store}>
        <Router history={history}>
          <QueryClientProvider client={new QueryClient()}>
            <ISISInvestigationsCardView
              instrumentId="1"
              instrumentChildId="1"
              studyHierarchy={studyHierarchy}
            />
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
        title: 'Test 1',
        name: 'Test 1',
        visitId: '1',
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

    (useISISInvestigationCount as jest.Mock).mockReturnValue({
      data: 1,
      isLoading: false,
    });
    (useISISInvestigationsPaginated as jest.Mock).mockReturnValue({
      data: cardData,
      isLoading: false,
    });
    (useInvestigationSizes as jest.Mock).mockReturnValue([{ data: 1 }]);

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

  it('calls required query, filter and sort functions on page load', () => {
    const instrumentId = '1';
    const instrumentChildId = '1';
    const studyHierarchy = false;
    createWrapper();
    expect(useISISInvestigationCount).toHaveBeenCalledWith(
      parseInt(instrumentId),
      parseInt(instrumentChildId),
      studyHierarchy
    );
    expect(useISISInvestigationsPaginated).toHaveBeenCalledWith(
      parseInt(instrumentId),
      parseInt(instrumentChildId),
      studyHierarchy
    );
    expect(useInvestigationSizes).toHaveBeenCalledWith(cardData);
  });

  it('correct link used when NOT in studyHierarchy', () => {
    const wrapper = createWrapper();
    expect(
      wrapper.find('[aria-label="card-title"]').childAt(0).prop('to')
    ).toEqual('/browse/instrument/1/facilityCycle/1/investigation/1');
  });

  it('correct link used for studyHierarchy', () => {
    const wrapper = createWrapper(true);

    expect(
      wrapper.find('[aria-label="card-title"]').childAt(0).prop('to')
    ).toEqual('/browseStudyHierarchy/instrument/1/study/1/investigation/1');
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

  it('renders buttons correctly', () => {
    const wrapper = createWrapper();
    expect(wrapper.find(AddToCartButton).exists()).toBeTruthy();
    expect(wrapper.find(AddToCartButton).text()).toEqual('buttons.add_to_cart');

    expect(wrapper.find(DownloadButton).exists()).toBeTruthy();
    expect(wrapper.find(DownloadButton).text()).toEqual('buttons.download');
  });

  it('displays details panel when more information is expanded and navigates to datasets view when tab clicked', () => {
    const wrapper = createWrapper();
    expect(wrapper.find(InvestigationDetailsPanel).exists()).toBeFalsy();
    wrapper
      .find('[aria-label="card-more-info-expand"]')
      .first()
      .simulate('click');

    expect(wrapper.find(InvestigationDetailsPanel).exists()).toBeTruthy();

    wrapper.find('#investigation-datasets-tab').first().simulate('click');
    expect(history.location.pathname).toBe(
      '/browse/instrument/1/facilityCycle/1/investigation/1/dataset'
    );
  });

  it('renders fine with incomplete data', () => {
    (useISISInvestigationCount as jest.Mock).mockReturnValueOnce({});
    (useISISInvestigationsPaginated as jest.Mock).mockReturnValueOnce({});
    (useInvestigationSizes as jest.Mock).mockReturnValueOnce([{ data: 0 }]);

    expect(() => createWrapper()).not.toThrowError();
  });
});
