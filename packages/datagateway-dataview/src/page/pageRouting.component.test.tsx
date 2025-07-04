import * as React from 'react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { StateType } from '../state/app.types';

import { DataPublication, dGCommonInitialState } from 'datagateway-common';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { initialState as dgDataViewInitialState } from '../state/reducers/dgdataview.reducer';
import PageRouting from './pageRouting.component';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import axios from 'axios';
import { History, createMemoryHistory } from 'history';
import { act } from 'react-dom/test-utils';
import { findColumnHeaderByName, flushPromises } from '../setupTests';
import {
  checkDatasetId as unmockedCheckDatasetId,
  checkInstrumentAndFacilityCycleId as unmockedCheckInstrumentAndFacilityCycleId,
  checkInstrumentId as unmockedCheckInstrumentId,
  checkInvestigationId as unmockedCheckInvestigationId,
  checkProposalName as unmockedCheckProposalName,
  checkStudyDataPublicationId as unmockedCheckStudyDataPublicationId,
} from './idCheckFunctions';

vi.mock('loglevel');
vi.mock('./idCheckFunctions');
const checkDatasetId = vi.mocked(unmockedCheckDatasetId);
const checkInstrumentAndFacilityCycleId = vi.mocked(
  unmockedCheckInstrumentAndFacilityCycleId
);
const checkInstrumentId = vi.mocked(unmockedCheckInstrumentId);
const checkInvestigationId = vi.mocked(unmockedCheckInvestigationId);
const checkProposalName = vi.mocked(unmockedCheckProposalName);
const checkStudyDataPublicationId = vi.mocked(
  unmockedCheckStudyDataPublicationId
);

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
  mydata: '/my-data/ISIS',
  landing: {
    investigation: '/browse/instrument/1/facilityCycle/1/investigation/1',
    dataset: '/browse/instrument/1/facilityCycle/1/investigation/1/dataset/1',
  },
  datafilePreview:
    '/browse/instrument/1/facilityCycle/1/investigation/1/dataset/1/datafile/1',
};

// The ISIS DataPublications routes to test.
const ISISDataPublicationsRoutes = {
  instruments: '/browseDataPublications/instrument',
  dataPublications: '/browseDataPublications/instrument/1/dataPublication',
  investigations:
    '/browseDataPublications/instrument/1/dataPublication/1/investigation',
  datasets:
    '/browseDataPublications/instrument/1/dataPublication/1/investigation/1/dataset',
  datafiles:
    '/browseDataPublications/instrument/1/dataPublication/1/investigation/1/dataset/1/datafile',
  landing: {
    dataPublication: '/browseDataPublications/instrument/1/dataPublication/1',
    investigation:
      '/browseDataPublications/instrument/1/dataPublication/1/investigation/1',
    dataset:
      '/browseDataPublications/instrument/1/dataPublication/1/investigation/1/dataset/1',
  },
  datafilePreview:
    '/browseDataPublications/instrument/1/dataPublication/1/investigation/1/dataset/1/datafile/1',
};

// The DLS routes to test.
const DLSRoutes = {
  proposals: '/browse/proposal',
  investigations: '/browse/proposal/INVESTIGATION 1/investigation',
  datasets: '/browse/proposal/INVESTIGATION 1/investigation/1/dataset',
  datafiles:
    '/browse/proposal/INVESTIGATION 1/investigation/1/dataset/1/datafile',
  mydata: '/my-data/DLS',
};

describe('PageTable', () => {
  let state: StateType;
  let history: History;

  function Wrapper({ children }: { children: React.ReactNode }): JSX.Element {
    const mockStore = configureStore([thunk]);
    const client = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    return (
      <Provider store={mockStore(state)}>
        <Router history={history}>
          <QueryClientProvider client={client}>{children}</QueryClientProvider>
        </Router>
      </Provider>
    );
  }

  beforeEach(() => {
    history = createMemoryHistory();

    state = JSON.parse(
      JSON.stringify({
        dgdataview: dgDataViewInitialState,
        dgcommon: dGCommonInitialState,
      })
    );

    vi.mocked(axios.get).mockImplementation((url: string) => {
      if (url.includes('count')) {
        return Promise.resolve({ data: 0 });
      } else if (url.includes('datapublications')) {
        // this is so that routes can convert from data pub id -> investigation id
        return Promise.resolve({
          data: [
            {
              id: 1,
              pid: 'pid.1',
              title: 'test',
              content: {
                id: 2,
                dataCollectionInvestigations: [
                  {
                    id: 3,
                    investigation: {
                      id: 4,
                      title: 'Test',
                      name: 'test',
                      visitId: '1',
                    },
                  },
                ],
              },
            } satisfies DataPublication,
          ],
        });
      } else {
        return Promise.resolve({ data: [{ id: 1, name: '1' }] });
      }
    });
    checkInstrumentAndFacilityCycleId.mockImplementation(() =>
      Promise.resolve(true)
    );
    checkInstrumentId.mockImplementation(() => Promise.resolve(true));
    checkStudyDataPublicationId.mockImplementation(() => Promise.resolve(true));
    checkInvestigationId.mockImplementation(() => Promise.resolve(true));
    checkProposalName.mockImplementation(() => Promise.resolve(true));
    checkDatasetId.mockImplementation(() => Promise.resolve(true));
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Generic', () => {
    it('renders PageTable correctly', () => {
      history.push('/');

      render(
        <PageRouting
          view="table"
          location={history.location}
          loggedInAnonymously={false}
        />,
        {
          wrapper: Wrapper,
        }
      );

      expect(
        screen.getByRole('link', { name: 'Browse investigations' })
      ).toHaveAttribute('href', '/browse/investigation');
    });

    it('renders PageCard correctly', () => {
      history.push('/');

      render(
        <PageRouting
          view="card"
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      expect(
        screen.getByRole('link', { name: 'Browse investigations' })
      ).toHaveAttribute('href', '/browse/investigation?view=card');
    });

    it('renders InvestigationTable for generic investigations route', async () => {
      history.push(genericRoutes['investigations']);

      render(
        <PageRouting
          view="table"
          location={history.location}
          loggedInAnonymously={false}
        />,
        {
          wrapper: Wrapper,
        }
      );

      expect(
        await findColumnHeaderByName('investigations.title')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('investigations.visit_id')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('investigations.name')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('investigations.doi')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('investigations.size')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('investigations.instrument')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('investigations.start_date')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('investigations.end_date')
      ).toBeInTheDocument();
    });

    it('renders InvestigationCardView for generic investigations route', async () => {
      history.push(genericRoutes.investigations);

      render(
        <PageRouting
          view="card"
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      expect(
        await screen.findByTestId('investigation-card-view')
      ).toBeInTheDocument();
    });

    it('renders DatasetTable for generic datasets route', async () => {
      history.push(genericRoutes['datasets']);

      render(
        <PageRouting
          view="table"
          location={history.location}
          loggedInAnonymously={false}
        />,
        {
          wrapper: Wrapper,
        }
      );

      expect(await findColumnHeaderByName('datasets.name')).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('datasets.datafile_count')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('datasets.create_time')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('datasets.modified_time')
      ).toBeInTheDocument();
    });

    it('renders DatasetCardView for generic datasets route', async () => {
      history.push(genericRoutes.datasets);

      render(
        <PageRouting
          view="card"
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      expect(
        await screen.findByTestId('dataset-card-view')
      ).toBeInTheDocument();
    });

    it('renders DatafileTable for generic datafiles route', async () => {
      history.push(genericRoutes['datafiles']);

      render(
        <PageRouting
          view="table"
          location={history.location}
          loggedInAnonymously={false}
        />,
        {
          wrapper: Wrapper,
        }
      );

      expect(
        await findColumnHeaderByName('datafiles.name')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('datafiles.location')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('datafiles.size')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('datafiles.modified_time')
      ).toBeInTheDocument();
    });

    it('does not render DatafileTable for incorrect generic datafiles route', async () => {
      checkInvestigationId.mockImplementation(() => Promise.resolve(false));
      history.push(genericRoutes['datafiles']);

      render(
        <PageRouting
          view="table"
          location={history.location}
          loggedInAnonymously={false}
        />,
        {
          wrapper: Wrapper,
        }
      );

      expect(await screen.findByText('loading.oops')).toBeInTheDocument();
    });
  });

  describe('ISIS', () => {
    it('renders ISISMyDataTable for ISIS my data route', async () => {
      history.push(ISISRoutes['mydata']);

      render(
        <PageRouting
          view="table"
          location={history.location}
          loggedInAnonymously={false}
        />,
        {
          wrapper: Wrapper,
        }
      );

      expect(
        await findColumnHeaderByName('investigations.title')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('investigations.doi')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('investigations.visit_id')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('investigations.name')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('investigations.instrument')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('investigations.size')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('investigations.start_date')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('investigations.end_date')
      ).toBeInTheDocument();
    });

    it('redirects to login page when not signed in (ISISMyDataTable) ', () => {
      history.push(ISISRoutes['mydata']);

      render(
        <PageRouting
          loggedInAnonymously
          view="table"
          location={history.location}
        />,
        {
          wrapper: Wrapper,
        }
      );

      expect(history.location.pathname).toBe('/login');
    });

    it('renders ISISInstrumentsTable for ISIS instruments route', async () => {
      history.push(ISISRoutes['instruments']);

      render(
        <PageRouting
          view="table"
          location={history.location}
          loggedInAnonymously={false}
        />,
        {
          wrapper: Wrapper,
        }
      );

      expect(
        await findColumnHeaderByName('instruments.name')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('instruments.type')
      ).toBeInTheDocument();
    });

    it('renders ISISInstrumentsCardView for ISIS instruments route', async () => {
      history.push(ISISRoutes.instruments);

      render(
        <PageRouting
          view="card"
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      expect(
        await screen.findByTestId('isis-instruments-card-view')
      ).toBeInTheDocument();
    });

    it('renders ISISFacilityCyclesTable for ISIS facilityCycles route', async () => {
      history.push(ISISRoutes['facilityCycles']);

      render(
        <PageRouting
          view="table"
          location={history.location}
          loggedInAnonymously={false}
        />,
        {
          wrapper: Wrapper,
        }
      );

      expect(
        await findColumnHeaderByName('facilitycycles.name')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('facilitycycles.start_date')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('facilitycycles.end_date')
      ).toBeInTheDocument();
    });

    it('renders ISISFacilityCyclesCardView for ISIS facilityCycles route', async () => {
      history.push(ISISRoutes.facilityCycles);

      render(
        <PageRouting
          view="card"
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      expect(
        await screen.findByTestId('isis-facility-card-view')
      ).toBeInTheDocument();
    });

    it('renders ISISInvestigationsTable for ISIS investigations route', async () => {
      history.push(ISISRoutes['investigations']);

      render(
        <PageRouting
          view="table"
          location={history.location}
          loggedInAnonymously={false}
        />,
        {
          wrapper: Wrapper,
        }
      );

      expect(
        await findColumnHeaderByName('investigations.title')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('investigations.name')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('investigations.doi')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('investigations.size')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('investigations.principal_investigators')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('investigations.start_date')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('investigations.end_date')
      ).toBeInTheDocument();
    });

    it('renders ISISInvestigationsCardView for ISIS investigations route', async () => {
      history.push(ISISRoutes.investigations);

      render(
        <PageRouting
          view="card"
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      expect(
        await screen.findByTestId('isis-investigations-card-view')
      ).toBeInTheDocument();
    });

    it('renders ISISInvestigationLanding for ISIS investigation route', async () => {
      history.push(ISISRoutes['landing']['investigation']);

      render(
        <PageRouting
          view={null}
          location={history.location}
          loggedInAnonymously={false}
        />,
        {
          wrapper: Wrapper,
        }
      );

      expect(
        await screen.findByLabelText('branding-title')
      ).toBeInTheDocument();
    });

    it('does not render ISISInvestigationLanding for incorrect ISIS investigation route', async () => {
      checkInstrumentAndFacilityCycleId.mockImplementation(() =>
        Promise.resolve(false)
      );

      history.push(ISISRoutes.landing.investigation);

      render(
        <PageRouting
          view={null}
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      await act(async () => {
        await flushPromises();
      });

      expect(screen.getByText('loading.oops')).toBeInTheDocument();
    });

    it('renders ISISDatasetsTable for ISIS datasets route', async () => {
      history.push(ISISRoutes.datasets);

      render(
        <PageRouting
          view="table"
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      await act(async () => {
        await flushPromises();
      });

      expect(await findColumnHeaderByName('datasets.name')).toBeInTheDocument();
      expect(await findColumnHeaderByName('datasets.size')).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('datasets.create_time')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('datasets.modified_time')
      ).toBeInTheDocument();
    });

    it('does not render ISISDatasetsTable for incorrect ISIS datasets route', async () => {
      checkInstrumentAndFacilityCycleId.mockImplementation(() =>
        Promise.resolve(false)
      );

      history.push(ISISRoutes.datasets);

      render(
        <PageRouting
          view="table"
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      await act(async () => {
        await flushPromises();
      });

      expect(await screen.findByText('loading.oops')).toBeInTheDocument();
    });

    it('renders ISISDatasetsCardview for ISIS datasets route', async () => {
      history.push(ISISRoutes.datasets);

      render(
        <PageRouting
          view="card"
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      await act(async () => {
        await flushPromises();
      });

      expect(screen.getByTestId('isis-datasets-card-view')).toBeInTheDocument();
    });

    it('does not render ISISDatasetsCardView for incorrect ISIS datasets route', async () => {
      checkInstrumentAndFacilityCycleId.mockImplementation(() =>
        Promise.resolve(false)
      );

      history.push(ISISRoutes.datasets);

      render(
        <PageRouting
          view="card"
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      expect(await screen.findByText('loading.oops')).toBeInTheDocument();
    });

    it('renders ISISDatasetLanding for ISIS dataset route', async () => {
      history.push(ISISRoutes.landing.dataset);

      render(
        <PageRouting
          view={null}
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      expect(
        await screen.findByTestId('isis-dataset-landing')
      ).toBeInTheDocument();
    });

    it('does not render ISISDatasetLanding for incorrect ISIS dataset route', async () => {
      checkInstrumentAndFacilityCycleId.mockImplementation(() =>
        Promise.resolve(false)
      );

      history.push(ISISRoutes.landing.dataset);

      render(
        <PageRouting
          view={null}
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      expect(await screen.findByText('loading.oops')).toBeInTheDocument();
    });

    it('renders ISISDatafilesTable for ISIS datafiles route', async () => {
      history.push(ISISRoutes.datafiles);

      render(
        <PageRouting
          view="table"
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      expect(
        await findColumnHeaderByName('datafiles.name')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('datafiles.location')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('datafiles.size')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('datafiles.modified_time')
      ).toBeInTheDocument();
    });

    it('does not render ISISDatafilesTable for incorrect ISIS datafiles route', async () => {
      checkInstrumentAndFacilityCycleId.mockImplementation(() =>
        Promise.resolve(false)
      );
      checkInvestigationId.mockImplementation(() => Promise.resolve(false));

      history.push(ISISRoutes.datafiles);

      render(
        <PageRouting
          view="table"
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      expect(await screen.findByText('loading.oops')).toBeInTheDocument();
    });

    it('renders DatafilePreviewer for ISIS datafiles previewer route', async () => {
      history.push(ISISRoutes.datafilePreview);

      render(
        <PageRouting
          view="table"
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      expect(
        await screen.findByText('datafiles.preview.cannot_preview')
      ).toBeInTheDocument();
    });

    it('does not render DatafilePreviewer for incorrect ISIS datafiles previewer route', async () => {
      checkInstrumentAndFacilityCycleId.mockImplementation(() =>
        Promise.resolve(false)
      );
      checkInvestigationId.mockImplementation(() => Promise.resolve(false));
      checkDatasetId.mockImplementation(() => Promise.resolve(false));

      history.push(ISISRoutes.datafilePreview);

      render(
        <PageRouting
          view="table"
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      expect(await screen.findByText('loading.oops')).toBeInTheDocument();
    });
  });

  describe('ISIS Data Publication Hierarchy', () => {
    it('renders ISISInstrumentsTable for ISIS instruments route in Data Publication Hierarchy', async () => {
      history.push(ISISDataPublicationsRoutes.instruments);

      render(
        <PageRouting
          view="table"
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      expect(
        await findColumnHeaderByName('instruments.name')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('instruments.type')
      ).toBeInTheDocument();
    });

    it('renders ISISInstrumentsCardView for ISIS instruments route in Data Publication Hierarchy', async () => {
      history.push(ISISDataPublicationsRoutes.instruments);

      render(
        <PageRouting
          view="card"
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      expect(
        await screen.findByTestId('isis-instruments-card-view')
      ).toBeInTheDocument();
    });

    it('renders ISISDataPublicationsTable for ISIS dataPublications route in Data Publication Hierarchy', async () => {
      history.push(ISISDataPublicationsRoutes['dataPublications']);

      render(
        <PageRouting
          view="table"
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      expect(
        await findColumnHeaderByName('datapublications.title')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('datapublications.pid')
      ).toBeInTheDocument();
    });

    it('renders ISISDataPublicationsCardView for ISIS dataPublications route in Data Publication Hierarchy', async () => {
      history.push(ISISDataPublicationsRoutes.dataPublications);

      render(
        <PageRouting
          view="card"
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      expect(
        await screen.findByTestId('isis-dataPublications-card-view')
      ).toBeInTheDocument();
    });

    it('renders ISISDataPublicationLanding for ISIS dataPublications route for Data Publication Hierarchy', async () => {
      history.push(ISISDataPublicationsRoutes.landing.dataPublication);

      render(
        <PageRouting
          view={null}
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      expect(
        await screen.findByTestId('isis-dataPublication-landing')
      ).toBeInTheDocument();
    });

    it('does not render ISISDataPublicationLanding for incorrect ISIS dataPublications route for Data Publication Hierarchy', async () => {
      checkInstrumentId.mockImplementation(() => Promise.resolve(false));

      history.push(ISISDataPublicationsRoutes.landing.dataPublication);

      render(
        <PageRouting
          view={null}
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      expect(await screen.findByText('loading.oops')).toBeInTheDocument();
    });

    it('renders ISISInvestigationsTable for ISIS investigations route in Data Publication Hierarchy', async () => {
      history.push(ISISDataPublicationsRoutes.investigations);

      render(
        <PageRouting
          view="table"
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      expect(
        await findColumnHeaderByName('datapublications.title')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('datapublications.pid')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('datapublications.publication_date')
      ).toBeInTheDocument();
    });

    it('renders ISISInvestigationsCardView for ISIS investigations route in Data Publication Hierarchy', async () => {
      history.push(ISISDataPublicationsRoutes.investigations);

      render(
        <PageRouting
          view="card"
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      expect(
        await screen.findByTestId('isis-dataPublications-card-view')
      ).toBeInTheDocument();
    });

    it('renders ISISDatasetsTable for ISIS datasets route in Data Publication Hierarchy', async () => {
      history.push(ISISDataPublicationsRoutes.datasets);

      render(
        <PageRouting
          view="table"
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      expect(await findColumnHeaderByName('datasets.name')).toBeInTheDocument();
      expect(await findColumnHeaderByName('datasets.size')).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('datasets.create_time')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('datasets.modified_time')
      ).toBeInTheDocument();
    });

    it('does not render ISISDatasetsTable for incorrect ISIS datasets route in Data Publication Hierarchy', async () => {
      checkInstrumentId.mockImplementation(() => Promise.resolve(false));
      checkStudyDataPublicationId.mockImplementation(() =>
        Promise.resolve(false)
      );

      history.push(ISISDataPublicationsRoutes.datasets);

      render(
        <PageRouting
          view="table"
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      expect(await screen.findByText('loading.oops')).toBeInTheDocument();
    });

    it('renders ISISInvestigationLanding for ISIS investigation route for Data Publication Hierarchy', async () => {
      history.push(ISISDataPublicationsRoutes.landing.investigation);

      render(
        <PageRouting
          view={null}
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      expect(
        await screen.findByTestId('isis-investigation-landing')
      ).toBeInTheDocument();
    });

    it('does not render ISISInvestigationLanding for incorrect ISIS investigation route for Data Publication Hierarchy', async () => {
      checkInstrumentId.mockImplementation(() => Promise.resolve(false));
      checkStudyDataPublicationId.mockImplementation(() =>
        Promise.resolve(false)
      );

      history.push(ISISDataPublicationsRoutes.landing.investigation);

      render(
        <PageRouting
          view={null}
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      expect(await screen.findByText('loading.oops')).toBeInTheDocument();
    });

    it('renders ISISDatasetsCardView for ISIS datasets route in Data Publication Hierarchy', async () => {
      history.push(ISISDataPublicationsRoutes.datasets);

      render(
        <PageRouting
          view="card"
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      expect(
        await screen.findByTestId('isis-datasets-card-view')
      ).toBeInTheDocument();
    });

    it('does not render ISISDatasetsCardView for incorrect ISIS datasets route in Data Publication Hierarchy', async () => {
      checkInstrumentId.mockImplementation(() => Promise.resolve(false));
      checkStudyDataPublicationId.mockImplementation(() =>
        Promise.resolve(false)
      );

      history.push(ISISDataPublicationsRoutes.datasets);

      render(
        <PageRouting
          view="card"
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      expect(await screen.findByText('loading.oops')).toBeInTheDocument();
    });

    it('renders ISISDatasetLanding for ISIS dataset route for Data Publication Hierarchy', async () => {
      history.push(ISISDataPublicationsRoutes.landing.dataset);

      render(
        <PageRouting
          view={null}
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      expect(
        await screen.findByTestId('isis-dataset-landing')
      ).toBeInTheDocument();
    });

    it('does not render ISISDatasetLanding for incorrect ISIS dataset route for Data Publication Hierarchy', async () => {
      checkInstrumentId.mockImplementation(() => Promise.resolve(false));
      checkStudyDataPublicationId.mockImplementation(() =>
        Promise.resolve(false)
      );

      history.push(ISISDataPublicationsRoutes.landing.dataset);

      render(
        <PageRouting
          view={null}
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      expect(await screen.findByText('loading.oops')).toBeInTheDocument();
    });

    it('renders ISISDatafilesTable for ISIS datafiles route in Data Publication Hierarchy', async () => {
      history.push(ISISDataPublicationsRoutes.datafiles);

      render(
        <PageRouting
          view="table"
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      expect(
        await findColumnHeaderByName('datafiles.name')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('datafiles.location')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('datafiles.size')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('datafiles.modified_time')
      ).toBeInTheDocument();
    });

    it('does not render ISISDatafilesTable for incorrect ISIS datafiles route in Data Publication Hierarchy', async () => {
      checkInstrumentId.mockImplementation(() => Promise.resolve(false));
      checkStudyDataPublicationId.mockImplementation(() =>
        Promise.resolve(false)
      );
      checkInvestigationId.mockImplementation(() => Promise.resolve(false));

      history.push(ISISDataPublicationsRoutes.datafiles);

      render(
        <PageRouting
          view="table"
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      expect(await screen.findByText('loading.oops')).toBeInTheDocument();
    });

    it('renders DatafilePreviewer for ISIS datafile preview route in Data Publication Hierarchy', async () => {
      history.push(ISISDataPublicationsRoutes.datafilePreview);

      render(
        <PageRouting
          view="table"
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      expect(
        await screen.findByText('datafiles.preview.cannot_preview')
      ).toBeInTheDocument();
    });

    it('does not render DatafilePreviewer for incorrect ISIS datafile preview route in Data Publication Hierarchy', async () => {
      checkInstrumentId.mockImplementation(() => Promise.resolve(false));
      checkStudyDataPublicationId.mockImplementation(() =>
        Promise.resolve(false)
      );
      checkInvestigationId.mockImplementation(() => Promise.resolve(false));
      checkDatasetId.mockImplementation(() => Promise.resolve(false));

      history.push(ISISDataPublicationsRoutes.datafilePreview);

      render(
        <PageRouting
          view="table"
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      expect(await screen.findByText('loading.oops')).toBeInTheDocument();
    });
  });

  describe('DLS', () => {
    it('renders DLSMyDataTable for DLS my data route', async () => {
      history.push(DLSRoutes.mydata);

      render(
        <PageRouting
          view="table"
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      expect(
        await findColumnHeaderByName('investigations.title')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('investigations.visit_id')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('investigations.size')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('investigations.instrument')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('investigations.start_date')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('investigations.end_date')
      ).toBeInTheDocument();
    });

    it('redirects to login page when not signed in (DLSMyDataTable) ', () => {
      history.push(DLSRoutes.mydata);

      render(
        <PageRouting
          loggedInAnonymously
          view="table"
          location={history.location}
        />,
        { wrapper: Wrapper }
      );

      expect(history.location.pathname).toBe('/login');
    });

    it('renders DLSProposalTable for DLS proposal route', async () => {
      history.push(DLSRoutes.proposals);

      render(
        <PageRouting
          view="table"
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      expect(
        await findColumnHeaderByName('investigations.title')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('investigations.name')
      ).toBeInTheDocument();
    });

    it('renders DLSProposalCardView for DLS proposal route', async () => {
      history.push(DLSRoutes.proposals);

      render(
        <PageRouting
          view="card"
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      expect(
        await screen.findByTestId('dls-proposals-card-view')
      ).toBeInTheDocument();
    });

    it('renders DLSVisitsTable for DLS investigations route', async () => {
      history.push(DLSRoutes.investigations);

      render(
        <PageRouting
          view="table"
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      expect(
        await findColumnHeaderByName('investigations.visit_id')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('investigations.size')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('investigations.instrument')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('investigations.start_date')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('investigations.end_date')
      ).toBeInTheDocument();
    });

    it('renders DLSVisitsCardView for DLS investigations route', async () => {
      history.push(DLSRoutes.investigations);

      render(
        <PageRouting
          view="card"
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      expect(
        await screen.findByTestId('dls-visits-card-view')
      ).toBeInTheDocument();
    });

    it('renders DLSDatasetsTable for DLS datasets route', async () => {
      history.push(DLSRoutes.datasets);

      render(
        <PageRouting
          view="table"
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      expect(await findColumnHeaderByName('datasets.name')).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('datasets.datafile_count')
      ).toBeInTheDocument();
      expect(await findColumnHeaderByName('datasets.size')).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('datasets.create_time')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('datasets.modified_time')
      ).toBeInTheDocument();
    });

    it('does not render DLSDatasetsTable for incorrect DLS datasets route', async () => {
      checkProposalName.mockImplementation(() => Promise.resolve(false));

      history.push(DLSRoutes.datasets);

      render(
        <PageRouting
          view="table"
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      expect(await screen.findByText('loading.oops')).toBeInTheDocument();
    });

    it('renders DLSDatasetsCardView for DLS datasets route', async () => {
      history.push(DLSRoutes.datasets);

      render(
        <PageRouting
          view="card"
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      expect(
        await screen.findByTestId('dls-datasets-card-view')
      ).toBeInTheDocument();
    });

    it('does not render DLSDatasetsCardView for incorrect DLS datasets route', async () => {
      checkProposalName.mockImplementation(() => Promise.resolve(false));

      history.push(DLSRoutes.datasets);

      render(
        <PageRouting
          view="card"
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      expect(await screen.findByText('loading.oops')).toBeInTheDocument();
    });

    it('renders DLSDatafilesTable for DLS datafiles route', async () => {
      history.push(DLSRoutes.datafiles);

      render(
        <PageRouting
          view="table"
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      expect(
        await findColumnHeaderByName('datafiles.name')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('datafiles.location')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('datafiles.size')
      ).toBeInTheDocument();
      expect(
        await findColumnHeaderByName('datafiles.create_time')
      ).toBeInTheDocument();
    });

    it('does not render DLSDatafilesTable for incorrect DLS datafiles route', async () => {
      checkProposalName.mockImplementation(() => Promise.resolve(false));
      checkInvestigationId.mockImplementation(() => Promise.resolve(false));

      history.push(DLSRoutes.datafiles);

      render(
        <PageRouting
          view="card"
          location={history.location}
          loggedInAnonymously={false}
        />,
        { wrapper: Wrapper }
      );

      expect(await screen.findByText('loading.oops')).toBeInTheDocument();
    });
  });
});
