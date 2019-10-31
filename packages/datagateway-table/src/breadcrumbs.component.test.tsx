import React from 'react';
import { Provider } from 'react-redux';

import { createMount } from '@material-ui/core/test-utils';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router';

import { resetActions } from './setupTests';
import axios from 'axios';
import { initialState } from './state/reducers/dgtable.reducer';
import { StateType } from './state/app.types';
import { createLocation } from 'history';

import PageBreadcrumbs from './breadcrumbs.component';

jest.mock('loglevel');

describe('PageBreadcrumb Component - Generic Tests', () => {
  // let shallow;
  let mount;
  let mockStore;
  let state: StateType;

  const generalRoutes = {
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
      data: [
        {
          ID: 1,
          NAME: 'INVESTIGATION 1',
          TITLE: 'Test 1',
          VISIT_ID: '1',
        },
      ],
    });
  });

  beforeEach(() => {
    mount = createMount();
    // shallow = createShallow({ untilSelector: 'div' });

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
    (axios.get as jest.Mock).mockClear();
    resetActions();
  });

  it('renders correctly for investigations route', () => {
    const investigationsRoute = generalRoutes['investigations'];

    // TODO: Do we need to set any apiUrl as axios is mocked?
    // Set up test state pathname.
    state.router.location = createLocation(investigationsRoute);

    // Set up store with test state and mount the breadcrumb.
    console.log('Test state: ', state);
    const testStore = mockStore(state);
    const wrapper = mount(
      <Provider store={testStore}>
        <MemoryRouter initialEntries={[{ key: 'testKey' }]}>
          <PageBreadcrumbs />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper).toMatchSnapshot();
  });

  // it('renders correctly when clicking a breadcrumb in trail', () => {
  // });
});

// describe('Breadcrumb - DLS Tests', () => {
//     // const DLSRoutes = {
//     //     'proposals': '/browse/proposal/',
//     //     'investigations': '/browse/proposal/INVESTIGATION%201/investigation/',
//     //     'datasets': '/browse/proposal/INVESTIGATION%201/investigation/1/dataset/',
//     //     'datafiles': '/browse/proposal/INVESTIGATION%201/investigation/1/dataset/1/datafiles/'
//     // };

//     afterEach(() => {
//         (axios.get as jest.Mock).mockClear();
//         // resetActions();
//     });
// });

// describe('Breadcrumb - ISIS Tests', () => {
//   // const ISISRoutes = {
//   //     'instruments': '',
//   //     'facilityCycles': '',
//   //     'investigations': '/browse/investigation',
//   //     'datasets': '/browse/investigation/1/dataset',
//   //     'datafiles': '/browse/investigation/1/dataset/1/datafile',
//   // };

//   afterEach(() => {
//     (axios.get as jest.Mock).mockClear();
//     // resetActions();
//   });
// });
