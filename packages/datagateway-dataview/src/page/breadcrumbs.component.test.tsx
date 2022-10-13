import * as React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Router } from 'react-router-dom';
import { dGCommonInitialState } from 'datagateway-common';
import { initialState as dgDataViewInitialState } from '../state/reducers/dgdataview.reducer';
import { StateType } from '../state/app.types';
import { createLocation, createMemoryHistory, History } from 'history';
import PageBreadcrumbs from './breadcrumbs.component';
import axios from 'axios';
import { QueryClient, QueryClientProvider } from 'react-query';
import { render, type RenderResult, screen } from '@testing-library/react';

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
  let state: StateType;
  let history: History;

  const renderComponent = (
    state: StateType,
    landingPageEntities: string[] = []
  ): RenderResult => {
    const mockStore = configureStore([thunk]);
    return render(
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
    (axios.get as jest.Mock).mockClear();
  });

  it('generic route renders correctly at the base route and does not request', async () => {
    // Set up test state pathname.
    history.replace(createLocation(genericRoutes['investigations']));

    // Set up store with test state and mount the breadcrumb.
    renderComponent(state);

    // Expect the axios.get to not have been made.
    expect(axios.get).not.toBeCalled();

    expect(await screen.findByText('breadcrumbs.home')).toBeInTheDocument();
    expect(
      await screen.findByText('breadcrumbs.investigation')
    ).toBeInTheDocument();
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
    renderComponent(state);

    // Expect the axios.get to have been called once to get the investigation.
    expect(axios.get).toBeCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith('/investigations/1', {
      headers: {
        Authorization: 'Bearer null',
      },
    });

    expect(await screen.findByText('breadcrumbs.home')).toBeInTheDocument();
    expect(
      await screen.findByRole('link', { name: 'breadcrumbs.investigation' })
    ).toHaveAttribute('href', '/browse/investigation?view=card');
    expect(await screen.findByText('Title 1')).toBeInTheDocument();
    expect(await screen.findByText('breadcrumbs.dataset')).toBeInTheDocument();
  });

  it('generic route renders correctly at the datafile level and requests the investigation & dataset entities', async () => {
    // Set up test state pathname.
    history.replace(createLocation(genericRoutes['datafiles']));

    // Set up store with test state and mount the breadcrumb.
    renderComponent(state);

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

    expect(await screen.findByText('breadcrumbs.home')).toBeInTheDocument();
    expect(
      await screen.findByRole('link', { name: 'breadcrumbs.investigation' })
    ).toHaveAttribute('href', '/browse/investigation');
    expect(await screen.findByText('Title 1')).toBeInTheDocument();
    expect(await screen.findByText('Name 1')).toBeInTheDocument();
    expect(await screen.findByText('breadcrumbs.datafile')).toBeInTheDocument();
  });

  it('DLS route renders correctly at the base level and does not request', async () => {
    // Set up test state pathname.
    history.replace(createLocation(DLSRoutes['proposals']));

    // Set up store with test state and mount the breadcrumb.
    renderComponent(state);

    // Expect the axios.get to not have been called.
    expect(axios.get).not.toBeCalled();

    expect(await screen.findByText('breadcrumbs.home')).toBeInTheDocument();
    expect(await screen.findByText('breadcrumbs.proposal')).toBeInTheDocument();
  });

  it('DLS route renders correctly at the investigation level and requests the proposal entity', async () => {
    // Set up test state pathname.
    history.replace(createLocation(DLSRoutes['investigations']));

    // Set up store with test state and mount the breadcrumb.
    renderComponent(state);

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

    expect(await screen.findByText('breadcrumbs.home')).toBeInTheDocument();
    expect(
      await screen.findByRole('link', { name: 'breadcrumbs.proposal' })
    ).toHaveAttribute('href', '/browse/proposal');
    expect(await screen.findByText('Title 1')).toBeInTheDocument();
  });

  it('DLS route renders correctly at the dataset level and requests the proposal & investigation entities', async () => {
    // Set up test state pathname.
    history.replace(createLocation(DLSRoutes['datasets']));

    // Set up store with test state and mount the breadcrumb.
    renderComponent(state);

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

    expect(await screen.findByText('breadcrumbs.home')).toBeInTheDocument();
    expect(
      await screen.findByRole('link', { name: 'breadcrumbs.proposal' })
    ).toHaveAttribute('href', '/browse/proposal');
    expect(
      await screen.findByRole('link', { name: 'Title 1' })
    ).toHaveAttribute('href', '/browse/proposal/INVESTIGATION 1/investigation');
    expect(await screen.findByText('1')).toBeInTheDocument();
    expect(await screen.findByText('breadcrumbs.dataset')).toBeInTheDocument();
  });

  it('DLS route renders correctly at the datafile level and requests the proposal, investigation and dataset entities', async () => {
    // Set up test state pathname.
    history.replace(createLocation(DLSRoutes['datafiles']));

    // Set up store with test state and mount the breadcrumb.
    renderComponent(state);

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

    expect(await screen.findByText('breadcrumbs.home')).toBeInTheDocument();
    expect(
      await screen.findByRole('link', { name: 'breadcrumbs.proposal' })
    ).toHaveAttribute('href', '/browse/proposal');
    expect(
      await screen.findByRole('link', { name: 'Title 1' })
    ).toHaveAttribute('href', '/browse/proposal/INVESTIGATION 1/investigation');
    expect(await screen.findByRole('link', { name: '1' })).toHaveAttribute(
      'href',
      '/browse/proposal/INVESTIGATION 1/investigation/1/dataset'
    );
    expect(await screen.findByText('Name 1')).toBeInTheDocument();
    expect(await screen.findByText('breadcrumbs.datafile')).toBeInTheDocument();
  });

  it('ISIS route renders correctly at the base level and does not request', async () => {
    // Set up test state pathname.
    history.replace(createLocation(ISISRoutes['instruments']));

    // Set up store with test state and mount the breadcrumb.
    renderComponent(state, ['investigation', 'dataset']);

    // Expect the axios.get not to have been called
    expect(axios.get).not.toHaveBeenCalled();

    expect(await screen.findByText('breadcrumbs.home')).toBeInTheDocument();
    expect(
      await screen.findByText('breadcrumbs.instrument')
    ).toBeInTheDocument();
  });

  it('ISIS route renders correctly at the facility cycle level and requests the instrument entity', async () => {
    // Set up test state pathname.
    history.replace(createLocation(ISISRoutes['facilityCycles']));

    // Set up store with test state and mount the breadcrumb.
    renderComponent(state, ['investigation', 'dataset']);

    // Expect the axios.get to have been called three times.
    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith('/instruments/1', {
      headers: {
        Authorization: 'Bearer null',
      },
    });

    expect(await screen.findByText('breadcrumbs.home')).toBeInTheDocument();
    expect(
      await screen.findByRole('link', { name: 'breadcrumbs.instrument' })
    ).toHaveAttribute('href', '/browse/instrument');
    expect(await screen.findByText('Name 1')).toBeInTheDocument();
    expect(
      await screen.findByText('breadcrumbs.facilityCycle')
    ).toBeInTheDocument();
  });

  it('ISIS route renders correctly at the investigation level and requests the instrument and facility cycle entities', async () => {
    // Set up test state pathname.
    history.replace(createLocation(ISISRoutes['investigations']));

    // Set up store with test state and mount the breadcrumb.
    renderComponent(state, ['investigation', 'dataset']);

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

    expect(await screen.findByText('breadcrumbs.home')).toBeInTheDocument();
    expect(
      await screen.findByRole('link', { name: 'breadcrumbs.instrument' })
    ).toHaveAttribute('href', '/browse/instrument');
    expect(await screen.findByRole('link', { name: 'Name 1' })).toHaveAttribute(
      'href',
      '/browse/instrument/1/facilityCycle'
    );
    expect(await screen.findAllByText('Name 1')).toHaveLength(2);
    expect(
      await screen.findByText('breadcrumbs.investigation')
    ).toBeInTheDocument();
  });

  it('ISIS route renders correctly at the dataset level and requests the instrument, facility cycle and investigation entities', async () => {
    // Set up test state pathname.
    history.replace(createLocation(ISISRoutes['datasets']));

    // Set up store with test state and mount the breadcrumb.
    renderComponent(state, ['investigation', 'dataset']);

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

    expect(await screen.findByText('breadcrumbs.home')).toBeInTheDocument();
    expect(
      await screen.findByRole('link', { name: 'breadcrumbs.instrument' })
    ).toHaveAttribute('href', '/browse/instrument');
    expect(
      (await screen.findAllByRole('link', { name: 'Name 1' }))[0]
    ).toHaveAttribute('href', '/browse/instrument/1/facilityCycle');
    expect(
      (await screen.findAllByRole('link', { name: 'Name 1' }))[1]
    ).toHaveAttribute(
      'href',
      '/browse/instrument/1/facilityCycle/1/investigation'
    );
    expect(
      await screen.findByRole('link', { name: 'Title 1' })
    ).toHaveAttribute(
      'href',
      '/browse/instrument/1/facilityCycle/1/investigation/1'
    );
    expect(await screen.findByText('breadcrumbs.dataset')).toBeInTheDocument();
  });

  it('ISIS route renders correctly at the datafile level and requests the instrument, facility cycle, investigation and dataset entities', async () => {
    // Set up test state pathname.
    history.replace(createLocation(ISISRoutes['datafiles']));

    // Set up store with test state and mount the breadcrumb.
    renderComponent(state, ['investigation', 'dataset']);

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

    expect(await screen.findByText('breadcrumbs.home')).toBeInTheDocument();
    expect(
      await screen.findByRole('link', { name: 'breadcrumbs.instrument' })
    ).toHaveAttribute('href', '/browse/instrument');
    expect(
      (await screen.findAllByRole('link', { name: 'Name 1' }))[0]
    ).toHaveAttribute('href', '/browse/instrument/1/facilityCycle');
    expect(
      (await screen.findAllByRole('link', { name: 'Name 1' }))[1]
    ).toHaveAttribute(
      'href',
      '/browse/instrument/1/facilityCycle/1/investigation'
    );
    expect(
      (await screen.findAllByRole('link', { name: 'Name 1' }))[2]
    ).toHaveAttribute(
      'href',
      '/browse/instrument/1/facilityCycle/1/investigation/1/dataset/1'
    );
    expect(
      await screen.findByRole('link', { name: 'Title 1' })
    ).toHaveAttribute(
      'href',
      '/browse/instrument/1/facilityCycle/1/investigation/1'
    );
    expect(await screen.findByText('breadcrumbs.datafile')).toBeInTheDocument();
  });
});
