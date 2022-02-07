import React from 'react';
import { Provider } from 'react-redux';

import { createMount } from '@material-ui/core/test-utils';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Router } from 'react-router-dom';
import { dGCommonInitialState } from 'datagateway-common';
import { initialState as dgDataViewInitialState } from '../state/reducers/dgdataview.reducer';
import { StateType } from '../state/app.types';
import { createLocation, createMemoryHistory, History } from 'history';
import { flushPromises } from '../setupTests';
import PageBreadcrumbs from './breadcrumbs.component';
import axios from 'axios';
import { ReactWrapper } from 'enzyme';
import { QueryClientProvider, QueryClient } from 'react-query';

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
    '/browse/instrument/1/facilityCycle/1/investigation/1/dataset/1/datafile',
};

// The DLS routes to test.
const DLSRoutes = {
  proposals: '/browse/proposal',
  investigations: '/browse/proposal/INVESTIGATION 1/investigation',
  datasets: '/browse/proposal/INVESTIGATION 1/investigation/1/dataset',
  datafiles:
    '/browse/proposal/INVESTIGATION 1/investigation/1/dataset/1/datafile',
};

describe('PageBreadcrumbs tests (Generic, DLS, ISIS)', () => {
  let mount;
  let state: StateType;
  let history: History;

  const createWrapper = (
    state: StateType,
    landingPageEntities: string[] = []
  ): ReactWrapper => {
    const mockStore = configureStore([thunk]);
    return mount(
      <Provider store={mockStore(state)}>
        <QueryClientProvider client={new QueryClient()}>
          <Router history={history}>
            <PageBreadcrumbs landingPageEntities={landingPageEntities} />
          </Router>
        </QueryClientProvider>
      </Provider>
    );
  };

  beforeEach(() => {
    mount = createMount();
    history = createMemoryHistory();

    state = JSON.parse(
      JSON.stringify({
        dgdataview: {
          ...dgDataViewInitialState,

          // Set up the breadcrumb settings.
          breadcrumbSettings: {
            proposal: {
              replaceEntity: 'investigation',
              replaceEntityField: 'title',
            },
            investigation: {
              replaceEntityField: 'visitId',
              parentEntity: 'proposal',
            },
          },
        },
        dgcommon: dGCommonInitialState,

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
          id: 1,
          name: 'Name 1',
          title: 'Title 1',
          visitId: '1',
        },
      })
    );
  });

  afterEach(() => {
    mount.cleanUp();
    (axios.get as jest.Mock).mockClear();
  });

  it('generic route renders correctly at the base route and does not request', async () => {
    // Set up test state pathname.
    history.replace(createLocation(genericRoutes['investigations']));

    // Set up store with test state and mount the breadcrumb.
    const wrapper = createWrapper(state);

    // Flush promises and update the re-render the wrapper.
    await flushPromises();
    wrapper.update();

    // Expect the axios.get to not have been made.
    expect(axios.get).not.toBeCalled();

    expect(wrapper.find('[data-testid="Breadcrumb-home"] p').text()).toEqual(
      'breadcrumbs.home'
    );
    expect(wrapper.find('[data-testid="Breadcrumb-base"] p').text()).toEqual(
      'breadcrumbs.investigation'
    );
  });

  it('generic route renders correctly at the dataset level and requests the investigation entity', async () => {
    // Set up test state pathname.
    history.replace(
      createLocation({
        pathname: genericRoutes['datasets'],
        search: '?view=card',
      })
    );

    // Set up store with test state and mount the breadcrumb.
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

    expect(wrapper.find('[data-testid="Breadcrumb-home"] p').text()).toEqual(
      'breadcrumbs.home'
    );
    expect(wrapper.find('[data-testid="Breadcrumb-base"] a').text()).toEqual(
      'breadcrumbs.investigation'
    );
    expect(
      wrapper.find('[data-testid="Breadcrumb-base"] a').prop('href')
    ).toEqual('/browse/investigation?view=card');
    expect(
      wrapper.find('[data-testid="Breadcrumb-hierarchy-1"] p').text()
    ).toEqual('Title 1');
    expect(wrapper.find('[data-testid="Breadcrumb-last"] p').text()).toEqual(
      'breadcrumbs.dataset'
    );
  });

  it('generic route renders correctly at the datafile level and requests the investigation & dataset entities', async () => {
    // Set up test state pathname.
    history.replace(createLocation(genericRoutes['datafiles']));

    // Set up store with test state and mount the breadcrumb.
    const wrapper = createWrapper(state);

    // Flush promises and update the re-render the wrapper.
    await flushPromises();
    wrapper.update();

    // Expect the axios.get to have been called twice; first to get the investigation
    // and second to get the dataset.
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

    expect(wrapper.find('[data-testid="Breadcrumb-home"] p').text()).toEqual(
      'breadcrumbs.home'
    );
    expect(wrapper.find('[data-testid="Breadcrumb-base"] a').text()).toEqual(
      'breadcrumbs.investigation'
    );
    expect(
      wrapper.find('[data-testid="Breadcrumb-base"] a').prop('href')
    ).toEqual('/browse/investigation');
    expect(
      wrapper.find('[data-testid="Breadcrumb-hierarchy-1"] a').text()
    ).toEqual('Title 1');
    expect(
      wrapper.find('[data-testid="Breadcrumb-hierarchy-1"] a').prop('href')
    ).toEqual('/browse/investigation/1/dataset');
    expect(
      wrapper.find('[data-testid="Breadcrumb-hierarchy-2"] p').text()
    ).toEqual('Name 1');
    expect(wrapper.find('[data-testid="Breadcrumb-last"] p').text()).toEqual(
      'breadcrumbs.datafile'
    );
  });

  it('DLS route renders correctly at the base level and does not request', async () => {
    // Set up test state pathname.
    history.replace(createLocation(DLSRoutes['proposals']));

    // Set up store with test state and mount the breadcrumb.
    const wrapper = createWrapper(state);

    // Flush promises and update the re-render the wrapper.
    await flushPromises();
    wrapper.update();

    // Expect the axios.get to not have been called.
    expect(axios.get).not.toBeCalled();

    expect(wrapper.find('[data-testid="Breadcrumb-home"] p').text()).toEqual(
      'breadcrumbs.home'
    );
    expect(wrapper.find('[data-testid="Breadcrumb-base"] p').text()).toEqual(
      'breadcrumbs.proposal'
    );
  });

  it('DLS route renders correctly at the investigation level and requests the proposal entity', async () => {
    // Set up test state pathname.
    history.replace(createLocation(DLSRoutes['investigations']));

    // Set up store with test state and mount the breadcrumb.
    const wrapper = createWrapper(state);

    // Flush promises and update the re-render the wrapper.
    await flushPromises();
    wrapper.update();

    // Expect the axios.get to have been called twice.
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(
      '/investigations/findone?where=' +
        JSON.stringify({ name: { eq: 'INVESTIGATION 1' } }),
      {
        headers: {
          Authorization: 'Bearer null',
        },
      }
    );

    expect(wrapper.find('[data-testid="Breadcrumb-home"] p').text()).toEqual(
      'breadcrumbs.home'
    );
    expect(wrapper.find('[data-testid="Breadcrumb-base"] a').text()).toEqual(
      'breadcrumbs.proposal'
    );
    expect(
      wrapper.find('[data-testid="Breadcrumb-base"] a').prop('href')
    ).toEqual('/browse/proposal');
    expect(
      wrapper.find('[data-testid="Breadcrumb-hierarchy-1"] p').text()
    ).toEqual('Title 1');
  });

  it('DLS route renders correctly at the dataset level and requests the proposal & investigation entities', async () => {
    // Set up test state pathname.
    history.replace(createLocation(DLSRoutes['datasets']));

    // Set up store with test state and mount the breadcrumb.
    const wrapper = createWrapper(state);

    // Flush promises and update the re-render the wrapper.
    await flushPromises();
    wrapper.update();

    // Expect the axios.get to have been called twice.
    expect(axios.get).toHaveBeenCalledTimes(2);
    expect(axios.get).toHaveBeenNthCalledWith(
      1,
      '/investigations/findone?where=' +
        JSON.stringify({ name: { eq: 'INVESTIGATION 1' } }),
      {
        headers: {
          Authorization: 'Bearer null',
        },
      }
    );
    expect(axios.get).toHaveBeenNthCalledWith(2, '/investigations/1', {
      headers: {
        Authorization: 'Bearer null',
      },
    });

    expect(wrapper.find('[data-testid="Breadcrumb-home"] p').text()).toEqual(
      'breadcrumbs.home'
    );
    expect(wrapper.find('[data-testid="Breadcrumb-base"] a').text()).toEqual(
      'breadcrumbs.proposal'
    );
    expect(
      wrapper.find('[data-testid="Breadcrumb-base"] a').prop('href')
    ).toEqual('/browse/proposal');
    expect(
      wrapper.find('[data-testid="Breadcrumb-hierarchy-1"] a').text()
    ).toEqual('Title 1');
    expect(
      wrapper.find('[data-testid="Breadcrumb-hierarchy-1"] a').prop('href')
    ).toEqual('/browse/proposal/INVESTIGATION 1/investigation');
    expect(
      wrapper.find('[data-testid="Breadcrumb-hierarchy-2"] p').text()
    ).toEqual('1');
    expect(wrapper.find('[data-testid="Breadcrumb-last"] p').text()).toEqual(
      'breadcrumbs.dataset'
    );
  });

  it('DLS route renders correctly at the datafile level and requests the proposal, investigation and dataset entities', async () => {
    // Set up test state pathname.
    history.replace(createLocation(DLSRoutes['datafiles']));

    // Set up store with test state and mount the breadcrumb.
    const wrapper = createWrapper(state);

    // Flush promises and update the re-render the wrapper.
    await flushPromises();
    wrapper.update();

    // Expect the axios.get to have been called three times.
    expect(axios.get).toHaveBeenCalledTimes(3);
    expect(axios.get).toHaveBeenNthCalledWith(
      1,
      '/investigations/findone?where=' +
        JSON.stringify({ name: { eq: 'INVESTIGATION 1' } }),
      {
        headers: {
          Authorization: 'Bearer null',
        },
      }
    );
    expect(axios.get).toHaveBeenNthCalledWith(2, '/investigations/1', {
      headers: {
        Authorization: 'Bearer null',
      },
    });
    expect(axios.get).toHaveBeenNthCalledWith(3, '/datasets/1', {
      headers: {
        Authorization: 'Bearer null',
      },
    });

    expect(wrapper.find('[data-testid="Breadcrumb-home"] p').text()).toEqual(
      'breadcrumbs.home'
    );
    expect(wrapper.find('[data-testid="Breadcrumb-base"] a').text()).toEqual(
      'breadcrumbs.proposal'
    );
    expect(
      wrapper.find('[data-testid="Breadcrumb-base"] a').prop('href')
    ).toEqual('/browse/proposal');
    expect(
      wrapper.find('[data-testid="Breadcrumb-hierarchy-1"] a').text()
    ).toEqual('Title 1');
    expect(
      wrapper.find('[data-testid="Breadcrumb-hierarchy-1"] a').prop('href')
    ).toEqual('/browse/proposal/INVESTIGATION 1/investigation');
    expect(
      wrapper.find('[data-testid="Breadcrumb-hierarchy-2"] a').text()
    ).toEqual('1');
    expect(
      wrapper.find('[data-testid="Breadcrumb-hierarchy-2"] a').prop('href')
    ).toEqual('/browse/proposal/INVESTIGATION 1/investigation/1/dataset');
    expect(
      wrapper.find('[data-testid="Breadcrumb-hierarchy-3"] p').text()
    ).toEqual('Name 1');
    expect(wrapper.find('[data-testid="Breadcrumb-last"] p').text()).toEqual(
      'breadcrumbs.datafile'
    );
  });

  it('ISIS route renders correctly at the base level and does not request', async () => {
    // Set up test state pathname.
    history.replace(createLocation(ISISRoutes['instruments']));

    // Set up store with test state and mount the breadcrumb.
    const wrapper = createWrapper(state, ['investigation', 'dataset']);

    // Flush promises and update the re-render the wrapper.
    await flushPromises();
    wrapper.update();

    // Expect the axios.get not to have been called
    expect(axios.get).not.toHaveBeenCalled();

    expect(wrapper.find('[data-testid="Breadcrumb-home"] p').text()).toEqual(
      'breadcrumbs.home'
    );
    expect(wrapper.find('[data-testid="Breadcrumb-base"] p').text()).toEqual(
      'breadcrumbs.instrument'
    );
  });

  it('ISIS route renders correctly at the facility cycle level and requests the instrument entity', async () => {
    // Set up test state pathname.
    history.replace(createLocation(ISISRoutes['facilityCycles']));

    // Set up store with test state and mount the breadcrumb.
    const wrapper = createWrapper(state, ['investigation', 'dataset']);

    // Flush promises and update the re-render the wrapper.
    await flushPromises();
    wrapper.update();

    // Expect the axios.get to have been called three times.
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith('/instruments/1', {
      headers: {
        Authorization: 'Bearer null',
      },
    });

    expect(wrapper.find('[data-testid="Breadcrumb-home"] p').text()).toEqual(
      'breadcrumbs.home'
    );
    expect(wrapper.find('[data-testid="Breadcrumb-base"] a').text()).toEqual(
      'breadcrumbs.instrument'
    );
    expect(
      wrapper.find('[data-testid="Breadcrumb-base"] a').prop('href')
    ).toEqual('/browse/instrument');
    expect(
      wrapper.find('[data-testid="Breadcrumb-hierarchy-1"] p').text()
    ).toEqual('Name 1');
    expect(wrapper.find('[data-testid="Breadcrumb-last"] p').text()).toEqual(
      'breadcrumbs.facilityCycle'
    );
  });

  it('ISIS route renders correctly at the investigation level and requests the instrument and facility cycle entities', async () => {
    // Set up test state pathname.
    history.replace(createLocation(ISISRoutes['investigations']));

    // Set up store with test state and mount the breadcrumb.
    const wrapper = createWrapper(state, ['investigation', 'dataset']);

    // Flush promises and update the re-render the wrapper.
    await flushPromises();
    wrapper.update();

    // Expect the axios.get to have been called three times.
    expect(axios.get).toHaveBeenCalledTimes(2);
    expect(axios.get).toHaveBeenNthCalledWith(1, '/instruments/1', {
      headers: {
        Authorization: 'Bearer null',
      },
    });
    expect(axios.get).toHaveBeenNthCalledWith(2, '/facilitycycles/1', {
      headers: {
        Authorization: 'Bearer null',
      },
    });

    expect(wrapper.find('[data-testid="Breadcrumb-home"] p').text()).toEqual(
      'breadcrumbs.home'
    );
    expect(wrapper.find('[data-testid="Breadcrumb-base"] a').text()).toEqual(
      'breadcrumbs.instrument'
    );
    expect(
      wrapper.find('[data-testid="Breadcrumb-base"] a').prop('href')
    ).toEqual('/browse/instrument');
    expect(
      wrapper.find('[data-testid="Breadcrumb-hierarchy-1"] a').text()
    ).toEqual('Name 1');
    expect(
      wrapper.find('[data-testid="Breadcrumb-hierarchy-1"] a').prop('href')
    ).toEqual('/browse/instrument/1/facilityCycle');
    expect(
      wrapper.find('[data-testid="Breadcrumb-hierarchy-2"] p').text()
    ).toEqual('Name 1');
    expect(wrapper.find('[data-testid="Breadcrumb-last"] p').text()).toEqual(
      'breadcrumbs.investigation'
    );
  });

  it('ISIS route renders correctly at the dataset level and requests the instrument, facility cycle and investigation entities', async () => {
    // Set up test state pathname.
    history.replace(createLocation(ISISRoutes['datasets']));

    // Set up store with test state and mount the breadcrumb.
    const wrapper = createWrapper(state, ['investigation', 'dataset']);

    // Flush promises and update the re-render the wrapper.
    await flushPromises();
    wrapper.update();

    // Expect the axios.get to have been called three times.
    expect(axios.get).toHaveBeenCalledTimes(3);
    expect(axios.get).toHaveBeenNthCalledWith(1, '/instruments/1', {
      headers: {
        Authorization: 'Bearer null',
      },
    });
    expect(axios.get).toHaveBeenNthCalledWith(2, '/facilitycycles/1', {
      headers: {
        Authorization: 'Bearer null',
      },
    });
    expect(axios.get).toHaveBeenNthCalledWith(3, '/investigations/1', {
      headers: {
        Authorization: 'Bearer null',
      },
    });
    expect(wrapper.find('[data-testid="Breadcrumb-home"] p').text()).toEqual(
      'breadcrumbs.home'
    );
    expect(wrapper.find('[data-testid="Breadcrumb-base"] a').text()).toEqual(
      'breadcrumbs.instrument'
    );
    expect(
      wrapper.find('[data-testid="Breadcrumb-base"] a').prop('href')
    ).toEqual('/browse/instrument');
    expect(
      wrapper.find('[data-testid="Breadcrumb-hierarchy-1"] a').text()
    ).toEqual('Name 1');
    expect(
      wrapper.find('[data-testid="Breadcrumb-hierarchy-1"] a').prop('href')
    ).toEqual('/browse/instrument/1/facilityCycle');
    expect(
      wrapper.find('[data-testid="Breadcrumb-hierarchy-2"] a').text()
    ).toEqual('Name 1');
    expect(
      wrapper.find('[data-testid="Breadcrumb-hierarchy-2"] a').prop('href')
    ).toEqual('/browse/instrument/1/facilityCycle/1/investigation');
    expect(
      wrapper.find('[data-testid="Breadcrumb-hierarchy-3"] a').text()
    ).toEqual('Title 1');
    expect(
      wrapper.find('[data-testid="Breadcrumb-hierarchy-3"] a').prop('href')
    ).toEqual('/browse/instrument/1/facilityCycle/1/investigation/1');
    expect(wrapper.find('[data-testid="Breadcrumb-last"] p').text()).toEqual(
      'breadcrumbs.dataset'
    );
  });

  it('ISIS route renders correctly at the datafile level and requests the instrument, facility cycle, investigation and dataset entities', async () => {
    // Set up test state pathname.
    history.replace(createLocation(ISISRoutes['datafiles']));

    // Set up store with test state and mount the breadcrumb.
    const wrapper = createWrapper(state, ['investigation', 'dataset']);

    // Flush promises and update the re-render the wrapper.
    await flushPromises();
    wrapper.update();

    // Expect the axios.get to have been called three times.
    expect(axios.get).toHaveBeenCalledTimes(4);
    expect(axios.get).toHaveBeenNthCalledWith(1, '/instruments/1', {
      headers: {
        Authorization: 'Bearer null',
      },
    });
    expect(axios.get).toHaveBeenNthCalledWith(2, '/facilitycycles/1', {
      headers: {
        Authorization: 'Bearer null',
      },
    });
    expect(axios.get).toHaveBeenNthCalledWith(3, '/investigations/1', {
      headers: {
        Authorization: 'Bearer null',
      },
    });
    expect(axios.get).toHaveBeenNthCalledWith(4, '/datasets/1', {
      headers: {
        Authorization: 'Bearer null',
      },
    });

    expect(wrapper.find('[data-testid="Breadcrumb-home"] p').text()).toEqual(
      'breadcrumbs.home'
    );
    expect(wrapper.find('[data-testid="Breadcrumb-base"] a').text()).toEqual(
      'breadcrumbs.instrument'
    );
    expect(
      wrapper.find('[data-testid="Breadcrumb-base"] a').prop('href')
    ).toEqual('/browse/instrument');
    expect(
      wrapper.find('[data-testid="Breadcrumb-hierarchy-1"] a').text()
    ).toEqual('Name 1');
    expect(
      wrapper.find('[data-testid="Breadcrumb-hierarchy-1"] a').prop('href')
    ).toEqual('/browse/instrument/1/facilityCycle');
    expect(
      wrapper.find('[data-testid="Breadcrumb-hierarchy-2"] a').text()
    ).toEqual('Name 1');
    expect(
      wrapper.find('[data-testid="Breadcrumb-hierarchy-2"] a').prop('href')
    ).toEqual('/browse/instrument/1/facilityCycle/1/investigation');
    expect(
      wrapper.find('[data-testid="Breadcrumb-hierarchy-3"] a').text()
    ).toEqual('Title 1');
    expect(
      wrapper.find('[data-testid="Breadcrumb-hierarchy-3"] a').prop('href')
    ).toEqual('/browse/instrument/1/facilityCycle/1/investigation/1');
    expect(
      wrapper.find('[data-testid="Breadcrumb-hierarchy-4"] a').text()
    ).toEqual('Name 1');
    expect(
      wrapper.find('[data-testid="Breadcrumb-hierarchy-4"] a').prop('href')
    ).toEqual('/browse/instrument/1/facilityCycle/1/investigation/1/dataset/1');
    expect(wrapper.find('[data-testid="Breadcrumb-last"] p').text()).toEqual(
      'breadcrumbs.datafile'
    );
  });
});
