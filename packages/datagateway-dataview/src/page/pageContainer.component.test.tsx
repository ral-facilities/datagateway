import React from 'react';
import { ReactWrapper, mount } from 'enzyme';

import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { StateType } from '../state/app.types';
import { initialState as dgDataViewInitialState } from '../state/reducers/dgdataview.reducer';
import {
  dGCommonInitialState,
  readSciGatewayToken,
  useCart,
  ClearFiltersButton,
} from 'datagateway-common';

import { LinearProgress } from '@mui/material';
import { createLocation, createMemoryHistory, History } from 'history';
import { Router } from 'react-router-dom';

import PageContainer, { paths } from './pageContainer.component';
import { checkInstrumentId, checkInvestigationId } from './idCheckFunctions';
import axios from 'axios';
import { act } from 'react-dom/test-utils';
import { flushPromises } from '../setupTests';
import {
  QueryClient,
  QueryClientProvider,
  useIsFetching,
  useQueryClient,
} from 'react-query';
import { Provider } from 'react-redux';

jest.mock('loglevel');
jest.mock('./idCheckFunctions');

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useCart: jest.fn(() => ({ data: [] })),
    // mock table and cardview to opt out of rendering them in these tests as there's no need
    Table: jest.fn(() => 'MockedTable'),
    CardView: jest.fn(() => 'MockedCardView'),
    readSciGatewayToken: jest.fn(() => originalModule.readSciGatewayToken()),
  };
});

jest.mock('react-query', () => ({
  __esModule: true,
  ...jest.requireActual('react-query'),
  useQueryClient: jest.fn(() => ({
    getQueryData: jest.fn(() => 0),
  })),
  useIsFetching: jest.fn(() => 0),
}));

describe('PageContainer - Tests', () => {
  let queryClient: QueryClient;
  let history: History;

  const createWrapper = (
    h: History = history,
    client: QueryClient = queryClient
  ): ReactWrapper => {
    const state: StateType = {
      dgcommon: dGCommonInitialState,
      dgdataview: dgDataViewInitialState,
      router: {
        action: 'POP',
        location: createLocation('/'),
      },
    };
    const mockStore = configureStore([thunk]);
    const testStore = mockStore(state);
    return mount(
      <Provider store={testStore}>
        <Router history={h}>
          <QueryClientProvider client={client}>
            <PageContainer />
          </QueryClientProvider>
        </Router>
      </Provider>
    );
  };

  beforeEach(() => {
    (axios.get as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('count')) {
        return Promise.resolve({ data: 0 });
      } else {
        return Promise.resolve({ data: [] });
      }
    });
    queryClient = new QueryClient();
    history = createMemoryHistory({
      initialEntries: ['/'],
    });
    (useQueryClient as jest.Mock).mockReturnValue({
      getQueryData: jest.fn(() => 0),
    });
  });

  afterEach(() => {
    (useCart as jest.Mock).mockClear();
  });

  it('displays the correct entity count', () => {
    history.replace(paths.toggle.investigation);
    (useQueryClient as jest.Mock).mockReturnValue({
      getQueryData: jest.fn(() => 101),
    });

    const wrapper = createWrapper();

    expect(
      wrapper.find('[aria-label="view-count"]').first().find('h3').text()
    ).toBe('app.results: 101');
  });

  it('fetches cart on mount', () => {
    (useCart as jest.Mock).mockReturnValueOnce({
      data: [
        {
          entityId: 1,
          entityType: 'dataset',
          id: 1,
          name: 'Test 1',
          parentEntities: [],
        },
      ],
    });

    createWrapper();

    expect(useCart).toHaveBeenCalled();
  });

  it('opens search plugin when icon clicked', () => {
    const wrapper = createWrapper();

    wrapper.find('[aria-label="view-search"]').last().simulate('click');

    expect(history.location.pathname).toBe('/search/data');

    history.push('/browse/instrument');
    wrapper.find('[aria-label="view-search"]').last().simulate('click');

    expect(history.location.pathname).toBe('/search/isis');

    history.push('/browse/proposal');
    wrapper.find('[aria-label="view-search"]').last().simulate('click');

    expect(history.location.pathname).toBe('/search/dls');
  });

  it('opens download plugin when Download Cart clicked', () => {
    const wrapper = createWrapper();

    wrapper.find('[aria-label="app.cart_arialabel"]').last().simulate('click');

    expect(history.length).toBe(2);
    expect(history.location.pathname).toBe('/download');
  });

  it('do not display loading bar loading false', () => {
    const wrapper = createWrapper();

    expect(wrapper.exists(LinearProgress)).toBeFalsy();
  });

  it('display loading bar when loading true', () => {
    (useIsFetching as jest.Mock).mockReturnValueOnce(1);
    const wrapper = createWrapper();

    expect(wrapper.exists(LinearProgress)).toBeTruthy();
  });

  it('display clear filters button and clear for filters onClick', () => {
    history.replace(
      '/browse/investigation?filters=%7B"title"%3A%7B"value"%3A"spend"%2C"type"%3A"include"%7D%7D'
    );
    const wrapper = createWrapper();

    expect(wrapper.find(ClearFiltersButton).prop('disabled')).toEqual(false);

    wrapper
      .find('[data-testid="clear-filters-button"]')
      .last()
      .simulate('click');

    wrapper.update();

    expect(wrapper.find(ClearFiltersButton).prop('disabled')).toEqual(true);
    expect(history.location.search).toEqual('?');
  });

  it('display clear filters button and clear for filters onClick (/my-data/DLS)', () => {
    const dateNow = `${new Date(Date.now()).toISOString().split('T')[0]}`;
    history.replace(
      '/my-data/DLS?filters=%7B"startDate"%3A%7B"endDate"%3A" ' +
        dateNow +
        '"%7D%2C"title"%3A%7B"value"%3A"test"%2C"type"%3A"include"%7D%7D&sort=%7B"startDate"%3A"desc"%7D'
    );
    const response = { username: 'SomePerson' };
    (readSciGatewayToken as jest.Mock).mockReturnValue(response);
    const wrapper = createWrapper();

    expect(wrapper.find(ClearFiltersButton).prop('disabled')).toEqual(false);

    wrapper
      .find('[data-testid="clear-filters-button"]')
      .last()
      .simulate('click');

    wrapper.update();

    expect(wrapper.find(ClearFiltersButton).prop('disabled')).toEqual(true);

    expect(history.location.search).toEqual(
      '?filters=%7B%22startDate%22%3A%7B%22endDate%22%3A%22' +
        dateNow +
        '%22%7D%7D'
    );

    (readSciGatewayToken as jest.Mock).mockClear();
  });

  it('display disabled clear filters button', () => {
    history.replace(paths.toggle.investigation);
    const wrapper = createWrapper();

    expect(wrapper.find(ClearFiltersButton).prop('disabled')).toEqual(true);
  });

  it('display filter warning on datafile table', async () => {
    history.replace('/browse/investigation/1/dataset/25/datafile');
    (checkInvestigationId as jest.Mock).mockResolvedValueOnce(true);

    const wrapper = createWrapper();

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });
    expect(
      wrapper.find('[aria-label="filter-message"]').first().text()
    ).toEqual('loading.filter_message');
  });

  it('switches view button display name when clicked', () => {
    history.replace(paths.toggle.investigation);

    const wrapper = createWrapper();

    expect(
      wrapper.find('[aria-label="page view app.view_cards"]').exists()
    ).toBeTruthy();
    expect(
      wrapper.find('[aria-label="page view app.view_cards"]').first().text()
    ).toEqual('app.view_cards');

    // Click view button
    wrapper
      .find('[aria-label="page view app.view_cards"]')
      .last()
      .simulate('click');
    wrapper.update();

    // Check that the text on the button has changed
    expect(
      wrapper.find('[aria-label="page view app.view_table"]').first().text()
    ).toEqual('app.view_table');
  });

  it('displays role selector when on My Data route', () => {
    history.replace(paths.myData.root);

    const wrapper = createWrapper();

    expect(wrapper.find('#role-selector').exists()).toBeTruthy();
  });

  it('display filter warning on toggle table', () => {
    history.replace(`${paths.toggle.investigation}?view=table`);

    const wrapper = createWrapper();

    expect(
      wrapper.find('[aria-label="filter-message"]').first().text()
    ).toEqual('loading.filter_message');
  });

  it('do not display filter warning on toggle card', () => {
    history.replace(`${paths.toggle.investigation}?view=card`);

    const wrapper = createWrapper();

    expect(wrapper.exists('[aria-label="filter-message"]')).toBeFalsy();
  });

  it('do not use StyledRouting component on landing pages', async () => {
    (checkInstrumentId as jest.Mock).mockResolvedValueOnce(true);
    (useQueryClient as jest.Mock).mockReturnValue({
      getQueryData: jest.fn(),
    });
    history.replace(`${paths.studyHierarchy.landing.isisStudyLanding}`);

    const wrapper = createWrapper();

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.exists('StyledRouting')).toBeFalsy();
  });

  it('set view to card if cardview stored in localstorage', () => {
    localStorage.setItem('dataView', 'card');
    history.replace(paths.toggle.investigation);

    createWrapper();

    expect(history.location.search).toBe('?view=card');
  });

  it('displays warning label when browsing data anonymously', () => {
    const response = { username: 'anon/anon' };
    (readSciGatewayToken as jest.Mock).mockReturnValueOnce(response);

    const wrapper = createWrapper();

    expect(
      wrapper.find('[aria-label="open-data-warning"]').exists()
    ).toBeTruthy();
  });

  it('displays warning label when browsing study hierarchy', () => {
    history.replace(paths.studyHierarchy.toggle.isisStudy);
    const response = { username: 'SomePerson' };
    (readSciGatewayToken as jest.Mock).mockReturnValueOnce(response);

    const wrapper = createWrapper();

    expect(
      wrapper.find('[aria-label="open-data-warning"]').exists()
    ).toBeTruthy();
  });

  it('does not display warning label when logged in', () => {
    const response = { username: 'SomePerson' };
    (readSciGatewayToken as jest.Mock).mockReturnValueOnce(response);

    const wrapper = createWrapper();

    expect(
      wrapper.find('[aria-label="open-data-warning"]').exists()
    ).toBeFalsy();
  });

  it('shows SelectionAlert banner when item selected', () => {
    // Supply data to make SelectionAlert display
    (useCart as jest.Mock).mockReturnValueOnce({
      data: [
        {
          entityId: 1,
          entityType: 'dataset',
          id: 1,
          name: 'Test 1',
          parentEntities: [],
        },
      ],
    });
    const wrapper = createWrapper();

    expect(wrapper.exists('[aria-label="selection-alert"]')).toBeTruthy();
  });

  it('does not show SelectionAlert banner when no items are selected', () => {
    (useCart as jest.Mock).mockReturnValueOnce({
      data: [],
    });
    const wrapper = createWrapper();

    expect(wrapper.exists('[aria-label="selection-alert"]')).toBeFalsy();
  });

  it('opens download plugin when link in SelectionAlert clicked', () => {
    // Supply data to make SelectionAlert display
    (useCart as jest.Mock).mockReturnValueOnce({
      data: [
        {
          entityId: 1,
          entityType: 'dataset',
          id: 1,
          name: 'Test 1',
          parentEntities: [],
        },
      ],
    });
    const wrapper = createWrapper();

    wrapper
      .find('[aria-label="selection-alert-link"]')
      .first()
      .simulate('click');

    expect(history.location.pathname).toBe('/download');
  });

  it('passes correct landing page entities to breadcrumbs', () => {
    history.replace(paths.toggle.isisInvestigation);
    let wrapper = createWrapper();

    expect(wrapper.find('PageBreadcrumbs').prop('landingPageEntities')).toEqual(
      ['investigation', 'dataset']
    );

    history.replace(paths.studyHierarchy.toggle.isisInvestigation);
    wrapper = createWrapper();

    expect(wrapper.find('PageBreadcrumbs').prop('landingPageEntities')).toEqual(
      ['study', 'investigation', 'dataset']
    );
  });

  it('does not fetch cart when on homepage (cart request errors when user is viewing homepage unauthenticated)', () => {
    history.replace(paths.homepage);
    createWrapper();

    expect(useCart).not.toHaveBeenCalled();
  });
});
