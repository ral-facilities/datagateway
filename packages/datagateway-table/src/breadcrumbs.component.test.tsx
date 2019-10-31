// import React from 'react';
import axios from 'axios';
// import { actions, dispatch, getState, resetActions } from './setupTests';

// import configureStore from 'redux-mock-store';

// import PageBreadcrumbs from './breadcrumbs.component';
// import thunk from 'redux-thunk';

jest.mock('loglevel');

describe('PageBreadcrumb Component - Generic Tests', () => {
  //   let shallow;
  //   let mount;
  //   let mockStore;

  //   const generalRoutes = {
  //     investigations: '/browse/investigation',
  //     datasets: '/browse/investigation/1/dataset',
  //     datafiles: '/browse/investigation/1/dataset/1/datafile',
  //   };

  beforeEach(() => {
    // mount = createMount();
    // mockStore = configureStore([thunk]);
    // state = JSON.parse(JSON.stringify({  }));
  });

  afterEach(() => {
    (axios.get as jest.Mock).mockClear();
    // resetActions();
  });

  it('sets the correct base, last and hierarchy for investigations route', () => {
    // const investigationsRoute = generalRoutes['investigations'];
    // Set up generic state with the apiUrl and the pathname?
    // Set up the props required for this route.
  });

  // it('renders correctly for investigations route', () => {

  // });
});

describe('Breadcrumb - DLS Tests', () => {
  // const DLSRoutes = {
  //     'proposals': '/browse/proposal/',
  //     'investigations': '/browse/proposal/INVESTIGATION%201/investigation/',
  //     'datasets': '/browse/proposal/INVESTIGATION%201/investigation/1/dataset/',
  //     'datafiles': '/browse/proposal/INVESTIGATION%201/investigation/1/dataset/1/datafiles/'
  // };

  afterEach(() => {
    (axios.get as jest.Mock).mockClear();
    // resetActions();
  });
});

describe('Breadcrumb - ISIS Tests', () => {
  // const ISISRoutes = {
  //     'instruments': '',
  //     'facilityCycles': '',
  //     'investigations': '/browse/investigation',
  //     'datasets': '/browse/investigation/1/dataset',
  //     'datafiles': '/browse/investigation/1/dataset/1/datafile',
  // };

  afterEach(() => {
    (axios.get as jest.Mock).mockClear();
    // resetActions();
  });
});
