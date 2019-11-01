import React from 'react';
import { Provider } from 'react-redux';

import { createMount } from '@material-ui/core/test-utils';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router';

import { initialState } from './state/reducers/dgtable.reducer';
import { StateType } from './state/app.types';
import { createLocation } from 'history';

import PageBreadcrumbs from './breadcrumbs.component';
import axios from 'axios';

jest.mock('loglevel');

describe('PageBreadcrumb Component - Generic Tests', () => {
  let mount;
  let mockStore;
  let state: StateType;

  // The generic routes to test.
  const genericRoutes = {
    investigations: '/browse/investigation',
    datasets: '/browse/investigation/1/dataset',
    datafiles: '/browse/investigation/1/dataset/1/datafile',
  };

  // Set up generic axios response; to be used for all tests.
  // We only need to include the ID, NAME, TITLE and VISIT_ID
  // as those are the entity fields which the breadcrumb looks for
  // when requesting information from the API.
  (axios.get as jest.Mock).mockImplementation(() => {
    Promise.resolve({
      data: {
        ID: 1,
        NAME: 'INVESTIGATION 1',
        TITLE: 'Test 1',
        VISIT_ID: '1',
      },
    });
  });

  // Ensure that we can flush all promises before updating a wrapper.
  const flushPromises = (): Promise<NodeJS.Immediate> =>
    new Promise(setImmediate);

  beforeEach(() => {
    mount = createMount();

    mockStore = configureStore([thunk]);
    state = JSON.parse(
      JSON.stringify({
        dgtable: initialState,

        // Initialise our router object to hold location information.
        router: {
          action: 'POP',
          location: createLocation('/'),
        },
      })
    );
  });

  afterEach(() => {
    mount.cleanUp();
  });

  it('renders correctly for investigations route', async () => {
    // Set up test state pathname.
    state.router.location = createLocation(genericRoutes['investigations']);

    // Set up store with test state and mount the breadcrumb.
    console.log('Test state: ', state);
    const testStore = mockStore(state);
    let wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter initialEntries={[{ key: 'testKey' }]}>
          <PageBreadcrumbs />
        </MemoryRouter>
      </Provider>
    );

    // Flush promises and update the re-render the wrapper.
    await flushPromises();
    wrapper.update();

    expect(wrapper).toMatchSnapshot();
  });
});
