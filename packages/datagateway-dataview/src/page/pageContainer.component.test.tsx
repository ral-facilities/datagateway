import React from 'react';
import { ReactWrapper, mount } from 'enzyme';

import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { StateType } from '../state/app.types';
import { initialState as dgDataViewInitialState } from '../state/reducers/dgdataview.reducer';
import { dGCommonInitialState, useCart } from 'datagateway-common';

import { LinearProgress } from '@material-ui/core';
import { createLocation, createMemoryHistory, History } from 'history';
import { Router } from 'react-router-dom';

import PageContainer, { paths } from './pageContainer.component';
import { checkInvestigationId } from './idCheckFunctions';
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

    wrapper.find('[aria-label="view-search"]').first().simulate('click');

    expect(history.length).toBe(2);
    expect(history.location.pathname).toBe('/search/data');
  });

  it('opens download plugin when Download Cart clicked', () => {
    const wrapper = createWrapper();

    wrapper.find('[aria-label="view-cart"]').first().simulate('click');

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

  it('display filter warning on datafile table', async () => {
    history.replace('/browse/investigation/1/dataset/25/datafile');
    (checkInvestigationId as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve(true)
    );

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
      wrapper.find('[aria-label="page-view app.view_cards"]').exists()
    ).toBeTruthy();
    expect(
      wrapper.find('[aria-label="page-view app.view_cards"]').first().text()
    ).toEqual('app.view_cards');

    // Click view button
    wrapper
      .find('[aria-label="page-view app.view_cards"]')
      .first()
      .simulate('click');
    wrapper.update();

    // Check that the text on the button has changed
    expect(
      wrapper.find('[aria-label="page-view app.view_table"]').first().text()
    ).toEqual('app.view_table');
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

  it('do not use StyledRouting component on landing pages', () => {
    (useQueryClient as jest.Mock).mockReturnValue({
      getQueryData: jest.fn(),
    });
    history.replace(`${paths.studyHierarchy.landing.isisStudyLanding}`);

    const wrapper = createWrapper();

    expect(wrapper.exists('StyledRouting')).toBeFalsy();
  });

  it('set view to card if cardview stored in localstorage', () => {
    localStorage.setItem('dataView', 'card');
    history.replace(paths.toggle.investigation);

    createWrapper();

    expect(history.location.search).toBe('?view=card');
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
});
