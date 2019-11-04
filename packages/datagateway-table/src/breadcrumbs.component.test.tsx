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
import { ReactWrapper } from 'enzyme';

jest.mock('loglevel');

// The generic routes to test.
const genericRoutes = {
  investigations: '/browse/investigation',
  datasets: '/browse/investigation/1/dataset',
  datafiles: '/browse/investigation/1/dataset/1/datafile',
};

// The ISIS routes to test.
const ISISRoutes = {
  instruments: '/browse/instrument',
  facilityCycles: '/browse/instrument/1/facilityCycle',
  investigations: '/browse/instrument/1/facilityCycle/1/investigation',
  datasets: '/browse/instrument/1/facilityCycle/1/investigation/1/dataset',
  datafiles:
    '/browse/instrument/1/facilityCycle/1/investigation/1/dataset/1/datafiles',
};

// The DLS routes to test.
const DLSRoutes = {
  proposals: '/browse/proposal',
  investigations: '/browse/proposal/INVESTIGATION 1/investigation',
  datasets: '/browse/proposal/INVESTIGATION 1/investigation/1/dataset',
  datafiles:
    '/browse/proposal/INVESTIGATION 1/investigation/1/dataset/1/datafile',
};

describe('PageBreadcrumbs - Snapshot Tests (Generic, ISIS, DLS)', () => {
  let mount;
  let state: StateType;

  // Set up generic axios response; to be used for all tests.
  // We only need to include the ID, NAME, TITLE and VISIT_ID
  // as those are the entity fields which the breadcrumb looks for
  // when requesting information from the API.
  (axios.get as jest.Mock).mockImplementation(() =>
    Promise.resolve({
      data: {
        ID: 1,
        NAME: 'INVESTIGATION 1',
        TITLE: 'Test 1',
        VISIT_ID: '1',
      },
    })
  );

  const createWrapper = (state: StateType): ReactWrapper => {
    const mockStore = configureStore([thunk]);
    return mount(
      <Provider store={mockStore(state)}>
        <MemoryRouter initialEntries={[{ key: 'testKey' }]}>
          <PageBreadcrumbs />
        </MemoryRouter>
      </Provider>
    );
  };

  // Ensure that we can flush all promises before updating a wrapper.
  const flushPromises = (): Promise<NodeJS.Immediate> =>
    new Promise(setImmediate);

  beforeEach(() => {
    mount = createMount();

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

  afterAll(() => {
    (axios.get as jest.Mock).mockClear();
  });

  it('renders correctly for generic investigations route', async () => {
    // Set up test state pathname.
    state.router.location = createLocation(genericRoutes['investigations']);

    // Set up store with test state and mount the breadcrumb.
    console.log('Test state: ', state);
    const wrapper = createWrapper(state);

    // Flush promises and update the re-render the wrapper.
    await flushPromises();
    wrapper.update();

    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly for DLS proposals route', async () => {
    // Set up test state pathname.
    state.router.location = createLocation(DLSRoutes['proposals']);

    // Set up store with test state and mount the breadcrumb.
    console.log('Test state: ', state);
    const wrapper = createWrapper(state);

    // Flush promises and update the re-render the wrapper.
    await flushPromises();
    wrapper.update();

    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly for ISIS instruments route', async () => {
    // Set up test state pathname.
    state.router.location = createLocation(ISISRoutes['instruments']);

    // Set up store with test state and mount the breadcrumb.
    console.log('Test state: ', state);
    const wrapper = createWrapper(state);

    // Flush promises and update the re-render the wrapper.
    await flushPromises();
    wrapper.update();

    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly for ISIS facilityCycles route', async () => {
    // Set up test state pathname.
    state.router.location = createLocation(ISISRoutes['facilityCycles']);

    // Set up store with test state and mount the breadcrumb.
    console.log('Test state: ', state);
    const wrapper = createWrapper(state);

    // Flush promises and update the re-render the wrapper.
    await flushPromises();
    wrapper.update();

    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly for DLS investigations route', async () => {
    // Set up test state pathname.
    state.router.location = createLocation(DLSRoutes['investigations']);

    // Set up store with test state and mount the breadcrumb.
    console.log('Test state: ', state);
    const wrapper = createWrapper(state);

    // Flush promises and update the re-render the wrapper.
    await flushPromises();
    wrapper.update();

    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly for generic datasets route', async () => {
    // Set up test state pathname.
    state.router.location = createLocation(genericRoutes['datasets']);

    // Set up store with test state and mount the breadcrumb.
    console.log('Test state: ', state);
    const wrapper = createWrapper(state);

    // Flush promises and update the re-render the wrapper.
    await flushPromises();
    wrapper.update();

    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly for ISIS datasets route', async () => {
    // Set up test state pathname.
    state.router.location = createLocation(ISISRoutes['datasets']);

    // Set up store with test state and mount the breadcrumb.
    console.log('Test state: ', state);
    const wrapper = createWrapper(state);

    // Flush promises and update the re-render the wrapper.
    await flushPromises();
    wrapper.update();

    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly for DLS datasets route', async () => {
    // Set up test state pathname.
    state.router.location = createLocation(DLSRoutes['datasets']);

    // Set up store with test state and mount the breadcrumb.
    console.log('Test state: ', state);
    const wrapper = createWrapper(state);

    // Flush promises and update the re-render the wrapper.
    await flushPromises();
    wrapper.update();

    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly for generic datafiles route', async () => {
    // Set up test state pathname.
    state.router.location = createLocation(genericRoutes['datafiles']);

    // Set up store with test state and mount the breadcrumb.
    console.log('Test state: ', state);
    const wrapper = createWrapper(state);

    // Flush promises and update the re-render the wrapper.
    await flushPromises();
    wrapper.update();

    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly for ISIS datafiles route', async () => {
    // Set up test state pathname.
    state.router.location = createLocation(ISISRoutes['datafiles']);

    // Set up store with test state and mount the breadcrumb.
    console.log('Test state: ', state);
    const wrapper = createWrapper(state);

    // Flush promises and update the re-render the wrapper.
    await flushPromises();
    wrapper.update();

    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly for DLS datafiles route', async () => {
    // Set up test state pathname.
    state.router.location = createLocation(DLSRoutes['datafiles']);

    // Set up store with test state and mount the breadcrumb.
    console.log('Test state: ', state);
    const wrapper = createWrapper(state);

    // Flush promises and update the re-render the wrapper.
    await flushPromises();
    wrapper.update();

    expect(wrapper).toMatchSnapshot();
  });
});

describe('PageBreadcrumbs - Axios.GET Tests (Generic, DLS, ISIS)', () => {
  let mount;
  let state: StateType;

  const createWrapper = (state: StateType): ReactWrapper => {
    const mockStore = configureStore([thunk]);
    return mount(
      <Provider store={mockStore(state)}>
        <MemoryRouter initialEntries={[{ key: 'testKey' }]}>
          <PageBreadcrumbs />
        </MemoryRouter>
      </Provider>
    );
  };

  // Ensure that we can flush all promises before updating a wrapper.
  const flushPromises = (): Promise<NodeJS.Immediate> =>
    new Promise(setImmediate);

  beforeEach(() => {
    mount = createMount();

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

    (axios.get as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: {
          ID: 1,
          NAME: 'INVESTIGATION 1',
          TITLE: 'Test 1',
          VISIT_ID: '1',
        },
      })
    );
  });

  afterEach(() => {
    mount.cleanUp();
    (axios.get as jest.Mock).mockClear();
  });

  it('requests the investigation entity from the correct API endpoint for generic route', async () => {
    // Set up test state pathname.
    state.router.location = createLocation(genericRoutes['investigations']);

    // Set up store with test state and mount the breadcrumb.
    console.log('Test state: ', state);
    const wrapper = createWrapper(state);

    // Flush promises and update the re-render the wrapper.
    await flushPromises();
    wrapper.update();

    // Expect the axios.get to not have been made.
    expect(axios.get).not.toBeCalled();
  });

  it('requests the dataset entity from the correct API endpoint for generic route', async () => {
    // Set up test state pathname.
    state.router.location = createLocation(genericRoutes['datasets']);

    // Set up store with test state and mount the breadcrumb.
    console.log('Test state: ', state);
    const wrapper = createWrapper(state);

    // Flush promises and update the re-render the wrapper.
    await flushPromises();
    wrapper.update();

    // Expect the axios.get to have been called once to get the investigation.
    expect(axios.get).toBeCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith('/investigations/1', {
      headers: {
        Authorization: 'Bearer null',
      },
    });
  });

  it('requests the datafiles entity from the correct API endpoint for generic route', async () => {
    // Set up test state pathname.
    state.router.location = createLocation(genericRoutes['datafiles']);

    // Set up store with test state and mount the breadcrumb.
    console.log('Test state: ', state);
    const wrapper = createWrapper(state);

    // Flush promises and update the re-render the wrapper.
    await flushPromises();
    wrapper.update();

    // Expect the axios.get to have been called once to get the investigation.
    expect(axios.get).toBeCalledTimes(2);
    expect(axios.get).toHaveBeenNthCalledWith(1, '/investigations/1', {
      headers: {
        Authorization: 'Bearer null',
      },
    });
    expect(axios.get).toHaveBeenNthCalledWith(2, '/datasets/1', {
      headers: {
        Authorization: 'Bearer null',
      },
    });
  });
});
