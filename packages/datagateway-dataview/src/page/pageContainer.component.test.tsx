import React from 'react';
import { ReactWrapper, mount } from 'enzyme';

import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { StateType } from '../state/app.types';
import { initialState as dgDataViewInitialState } from '../state/reducers/dgdataview.reducer';
import {
  clearData,
  clearTable,
  dGCommonInitialState,
  updateQueryParams,
  HomePage,
} from 'datagateway-common';

import { LinearProgress } from '@material-ui/core';
import { createShallow } from '@material-ui/core/test-utils';
// history package is part of react-router, which we depend on
// eslint-disable-next-line import/no-extraneous-dependencies
import { createLocation } from 'history';
import { MemoryRouter } from 'react-router';
import { push } from 'connected-react-router';

import PageContainer, { paths } from './pageContainer.component';
import { Provider } from 'react-redux';
import { checkInvestigationId } from './idCheckFunctions';
import axios from 'axios';
import { act } from 'react-dom/test-utils';
import { flushPromises } from '../setupTests';

jest.mock('loglevel');
jest.mock('./idCheckFunctions');

describe('PageContainer - Tests', () => {
  let shallow;
  let state: StateType;
  document.getElementById = jest.fn();

  const createWrapper = (state: StateType): ReactWrapper => {
    const mockStore = configureStore([thunk]);
    return shallow(
      <MemoryRouter initialEntries={[{ key: 'testKey' }]}>
        <PageContainer store={mockStore(state)} />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'Grid' });

    state = JSON.parse(
      JSON.stringify({
        dgcommon: { ...dGCommonInitialState, totalDataCount: 101 },
        dgdataview: dgDataViewInitialState,

        router: {
          action: 'POP',
          location: createLocation('/'),
        },
      })
    );

    (axios.get as jest.Mock).mockImplementation(() =>
      Promise.resolve({ data: [] })
    );
  });

  afterEach(() => {
    document.getElementById.mockReset();
  });

  it('displays the correct entity count', () => {
    // Set up store with the test state and mounted page head.
    const wrapper = createWrapper(state);

    expect(wrapper).toMatchSnapshot();
  });

  it('fetches cart on mount', () => {
    // Mock getElementById so that it returns truthy.
    const testElement = document.createElement('DIV');
    document.getElementById = jest.fn(() => testElement);
    const mockStore = configureStore([thunk]);
    const testStore = mockStore(state);
    mount(
      <Provider store={testStore}>
        <MemoryRouter initialEntries={[{ key: 'testKey' }]}>
          <PageContainer />
        </MemoryRouter>
      </Provider>
    );
    expect(document.getElementById.mock.calls[0][0]).toBe(
      'datagateway-dataview'
    );
    expect(testStore.getActions()).toContainEqual({
      type: 'datagateway_common:fetch_download_cart_request',
    });
  });

  it('does not fetch cart on load if no dg-dataview element exists', () => {
    const mockStore = configureStore([thunk]);
    const testStore = mockStore(state);
    mount(
      <MemoryRouter initialEntries={[{ key: 'testKey' }]}>
        <PageContainer store={testStore} />
      </MemoryRouter>
    );

    expect(testStore.getActions()).toHaveLength(2);
    expect(testStore.getActions()).not.toContain({
      type: 'datagateway_common:fetch_download_cart_request',
    });
  });

  it('opens search plugin when icon clicked', () => {
    const mockStore = configureStore([thunk]);
    const testStore = mockStore(state);
    const wrapper = mount(
      <MemoryRouter initialEntries={[{ key: 'testKey' }]}>
        <PageContainer store={testStore} />
      </MemoryRouter>
    );

    wrapper
      .find('[aria-label="container-table-search"]')
      .first()
      .simulate('click');

    expect(testStore.getActions().length).toEqual(3);
    expect(testStore.getActions()[2]).toEqual(push('/search/data'));
  });

  it('opens download plugin when Download Cart clicked', () => {
    const mockStore = configureStore([thunk]);
    const testStore = mockStore(state);
    const wrapper = mount(
      <MemoryRouter initialEntries={[{ key: 'testKey' }]}>
        <PageContainer store={testStore} />
      </MemoryRouter>
    );

    wrapper
      .find('[aria-label="container-table-cart"]')
      .first()
      .simulate('click');

    expect(testStore.getActions().length).toEqual(3);
    expect(testStore.getActions()[2]).toEqual(push('/download'));
  });

  it('do not display loading bar loading false', () => {
    const mockStore = configureStore([thunk]);
    const testStore = mockStore(state);
    const wrapper = mount(
      <MemoryRouter initialEntries={[{ key: 'testKey' }]}>
        <PageContainer store={testStore} />
      </MemoryRouter>
    );

    expect(wrapper.exists(LinearProgress)).toBeFalsy();
  });

  it('display loading bar when loading true', () => {
    state = JSON.parse(
      JSON.stringify({
        dgcommon: {
          ...dGCommonInitialState,
          totalDataCount: 101,
          loading: true,
        },
        dgdataview: dgDataViewInitialState,

        router: {
          action: 'POP',
          location: createLocation('/'),
        },
      })
    );

    const mockStore = configureStore([thunk]);
    const testStore = mockStore(state);
    const wrapper = mount(
      <MemoryRouter initialEntries={[{ key: 'testKey' }]}>
        <PageContainer store={testStore} />
      </MemoryRouter>
    );

    expect(wrapper.exists(LinearProgress)).toBeTruthy();
  });

  it('display filter warning on datafile table', async () => {
    // Mock getElementById so that it returns truthy.
    const testElement = document.createElement('DIV');
    document.getElementById = jest.fn(() => testElement);
    (checkInvestigationId as jest.Mock).mockImplementation(() =>
      Promise.resolve(true)
    );
    state = JSON.parse(
      JSON.stringify({
        dgcommon: {
          ...dGCommonInitialState,
          totalDataCount: 0,
          loadedCount: true,
        },
        dgdataview: dgDataViewInitialState,
        router: {
          action: 'POP',
          location: createLocation(
            paths.toggle.investigation + '/1/dataset/25/datafile'
          ),
        },
      })
    );
    const mockStore = configureStore([thunk]);
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter
          initialEntries={[
            {
              key: 'testKey',
              pathname: '/browse/investigation/1/dataset/25/datafile',
            },
          ]}
        >
          <PageContainer />
        </MemoryRouter>
      </Provider>
    );
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });
    expect(
      wrapper.find('[aria-label="filter-message"]').first().text()
    ).toEqual('loading.filter_message');
  });

  it('display filter warning on toggle table', () => {
    // Mock getElementById so that it returns truthy.
    const testElement = document.createElement('DIV');
    document.getElementById = jest.fn(() => testElement);
    state = JSON.parse(
      JSON.stringify({
        dgcommon: {
          ...dGCommonInitialState,
          totalDataCount: 0,
          loadedCount: true,
        },
        dgdataview: dgDataViewInitialState,
        router: {
          action: 'POP',
          location: createLocation(paths.toggle.investigation),
        },
      })
    );
    const mockStore = configureStore([thunk]);
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter
          initialEntries={[
            { key: 'testKey', pathname: '/browse/investigation' },
          ]}
        >
          <PageContainer />
        </MemoryRouter>
      </Provider>
    );
    expect(
      wrapper.find('[aria-label="filter-message"]').first().text()
    ).toEqual('loading.filter_message');
  });

  it('do not display filter warning on toggle card', () => {
    state = JSON.parse(
      JSON.stringify({
        dgcommon: {
          ...dGCommonInitialState,
          totalDataCount: 0,
          loadedCount: true,
          query: {
            ...dGCommonInitialState.query,
            view: 'card',
          },
        },
        dgdataview: dgDataViewInitialState,
        router: {
          action: 'POP',
          location: createLocation(paths.toggle.investigation + '?view=card'),
        },
      })
    );
    const mockStore = configureStore([thunk]);
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter
          initialEntries={[
            {
              key: 'testKey',
              pathname: '/browse/investigation',
              search: 'view=card',
            },
          ]}
        >
          <PageContainer />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.exists('[aria-label="filter-message"]')).toBeFalsy();
  });

  it('clearTable and updateQueryParams when location.pathname changes', () => {
    state = JSON.parse(
      JSON.stringify({
        dgcommon: dGCommonInitialState,
        dgdataview: dgDataViewInitialState,

        router: {
          action: 'POP',
          location: createLocation(paths.toggle.investigation),
        },
      })
    );
    const mockStore = configureStore([thunk]);
    let testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter initialEntries={[{ key: 'testKey' }]}>
          <PageContainer />
        </MemoryRouter>
      </Provider>
    );
    // Update store to trigger componentDidUpdate
    testStore = mockStore({
      ...state,
      router: {
        action: 'PUSH',
        location: createLocation(paths.toggle.investigation + '/1/dataset'),
      },
    });
    wrapper.setProps({ store: testStore });

    expect(testStore.getActions()[0]).toEqual(clearTable());
    expect(testStore.getActions()[1]).toEqual(
      updateQueryParams(dGCommonInitialState.query)
    );
  });

  it('clearData and updateQueryParams when location.search changes', () => {
    state = JSON.parse(
      JSON.stringify({
        dgcommon: dGCommonInitialState,
        dgdataview: dgDataViewInitialState,
        router: {
          action: 'POP',
          location: createLocation(paths.toggle.investigation),
        },
      })
    );
    const mockStore = configureStore([thunk]);
    let testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter initialEntries={[{ key: 'testKey' }]}>
          <PageContainer />
        </MemoryRouter>
      </Provider>
    );
    // Update store to trigger componentDidUpdate
    testStore = mockStore({
      ...state,
      router: {
        action: 'PUSH',
        location: { ...state.router.location, search: '?view=card' },
      },
    });
    wrapper.setProps({ store: testStore });

    expect(testStore.getActions()[0]).toEqual(clearData());
    expect(testStore.getActions()[1]).toEqual(
      updateQueryParams({ ...dGCommonInitialState.query, view: 'card' })
    );
  });

  it('use/remove dummy url when location/query changes', () => {
    const dummyLocation = createLocation('/');
    const initialLocation = createLocation(paths.toggle.investigation);
    const newLocation = createLocation(
      paths.toggle.investigation + '/1/dataset'
    );
    state = JSON.parse(
      JSON.stringify({
        dgcommon: dGCommonInitialState,
        dgdataview: dgDataViewInitialState,
        router: {
          action: 'POP',
          location: initialLocation,
        },
      })
    );
    const mockStore = configureStore([thunk]);
    let testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter initialEntries={[{ key: 'testKey' }]}>
          <PageContainer />
        </MemoryRouter>
      </Provider>
    );
    expect(
      wrapper.find(PageContainer).children().first().state('modifiedLocation')
    ).toEqual(initialLocation);

    // Update store with new location
    testStore = mockStore({
      ...state,
      router: {
        action: 'PUSH',
        location: newLocation,
      },
    });
    wrapper.setProps({ store: testStore });
    // Check we have modified the location in state
    expect(
      wrapper.find(PageContainer).children().first().state('modifiedLocation')
    ).toEqual(dummyLocation);

    // Update store with a change to the query
    testStore = mockStore({
      ...state,
      dgcommon: {
        ...state.dgcommon,
        query: {
          ...dGCommonInitialState.query,
          page: 1,
        },
      },
      router: {
        action: 'PUSH',
        location: newLocation,
      },
    });
    wrapper.setProps({ store: testStore });
    // Check that once the query is updated we use the real location
    expect(
      wrapper.find(PageContainer).children().first().state('modifiedLocation')
    ).toEqual(newLocation);
  });

  it('should return the homepage if current path equals homepage route', () => {
    const homepageLocation = createLocation(paths.homepage);
    state = JSON.parse(
      JSON.stringify({
        dgcommon: dGCommonInitialState,
        dgdataview: dgDataViewInitialState,
        router: {
          action: 'POP',
          location: homepageLocation,
        },
      })
    );
    const mockStore = configureStore([thunk]);
    const testStore = mockStore(state);

    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter initialEntries={[{ key: 'testKey' }]}>
          <PageContainer />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(HomePage).exists()).toEqual(true);
  });
});
