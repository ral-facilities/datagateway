import React from 'react';
import { ReactWrapper } from 'enzyme';

import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { StateType } from '../state/app.types';

import { createMount } from '@material-ui/core/test-utils';
import { MemoryRouter } from 'react-router';
import PageRouting from './pageRouting.component';
import { Provider } from 'react-redux';
import { initialState as dgDataViewInitialState } from '../state/reducers/dgdataview.reducer';
import { dGCommonInitialState } from 'datagateway-common';
import { Link } from 'react-router-dom';

import InvestigationTable from '../views/table/investigationTable.component';
import DatasetTable from '../views/table/datasetTable.component';
import DatafileTable from '../views/table/datafileTable.component';

import DLSProposalsTable from '../views/table/dls/dlsProposalsTable.component';
import DLSVisitsTable from '../views/table/dls/dlsVisitsTable.component';
import DLSDatasetsTable from '../views/table/dls/dlsDatasetsTable.component';
import DLSDatafilesTable from '../views/table/dls/dlsDatafilesTable.component';

import ISISInstrumentsTable from '../views/table/isis/isisInstrumentsTable.component';
import ISISFacilityCyclesTable from '../views/table/isis/isisFacilityCyclesTable.component';
import ISISStudiesTable from '../views/table/isis/isisStudiesTable.component';
import ISISInvestigationsTable from '../views/table/isis/isisInvestigationsTable.component';
import ISISDatasetsTable from '../views/table/isis/isisDatasetsTable.component';
import ISISDatafilesTable from '../views/table/isis/isisDatafilesTable.component';
import ISISMyDataTable from '../views/table/isis/isisMyDataTable.component';
import DLSMyDataTable from '../views/table/dls/dlsMyDataTable.component';

import InvestigationCardView from '../views/card/investigationCardView.component';
import DatasetCardView from '../views/card/datasetCardView.component';

import DLSProposalsCardView from '../views/card/dls/dlsProposalsCardView.component';
import DLSVisitsCardView from '../views/card/dls/dlsVisitsCardView.component';
import DLSDatasetsCardView from '../views/card/dls/dlsDatasetsCardView.component';

import ISISInstrumentsCardView from '../views/card/isis/isisInstrumentsCardView.component';
import ISISFacilityCyclesCardView from '../views/card/isis/isisFacilityCyclesCardView.component';
import ISISStudiesCardView from '../views/card/isis/isisStudiesCardView.component';
import ISISInvestigationsCardView from '../views/card/isis/isisInvestigationsCardView.component';
import ISISDatasetsCardView from '../views/card/isis/isisDatasetsCardView.component';

import ISISStudyLanding from '../views/landing/isis/isisStudyLanding.component';
import ISISInvestigationLanding from '../views/landing/isis/isisInvestigationLanding.component';
import ISISDatasetLanding from '../views/landing/isis/isisDatasetLanding.component';

import {
  checkInstrumentAndFacilityCycleId,
  checkInstrumentAndStudyId,
  checkInvestigationId,
  checkProposalName,
} from './idCheckFunctions';
import { flushPromises } from '../setupTests';
import { act } from 'react-dom/test-utils';
import axios from 'axios';
import { QueryClient, QueryClientProvider } from 'react-query';

jest.mock('loglevel');
jest.mock('./idCheckFunctions');

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
};

// The ISIS StudHierarchy routes to test.
const ISISStudyHierarchyRoutes = {
  instruments: '/browseStudyHierarchy/instrument',
  studies: '/browseStudyHierarchy/instrument/1/study',
  investigations: '/browseStudyHierarchy/instrument/1/study/1/investigation',
  datasets:
    '/browseStudyHierarchy/instrument/1/study/1/investigation/1/dataset',
  datafiles:
    '/browseStudyHierarchy/instrument/1/study/1/investigation/1/dataset/1/datafile',
  landing: {
    study: '/browseStudyHierarchy/instrument/1/study/1',
    investigation: '/browseStudyHierarchy/instrument/1/study/1/investigation/1',
    dataset:
      '/browseStudyHierarchy/instrument/1/study/1/investigation/1/dataset/1',
  },
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
  let mount;
  let state: StateType;

  const createTableWrapper = (path: string): ReactWrapper => {
    const mockStore = configureStore([thunk]);
    const client = new QueryClient();
    return mount(
      <Provider store={mockStore(state)}>
        <MemoryRouter initialEntries={[{ key: 'testKey', pathname: path }]}>
          <QueryClientProvider client={client}>
            <PageRouting view="table" />
          </QueryClientProvider>
        </MemoryRouter>
      </Provider>
    );
  };

  const createCardWrapper = (path: string): ReactWrapper => {
    const mockStore = configureStore([thunk]);
    const client = new QueryClient();
    return mount(
      <Provider store={mockStore(state)}>
        <MemoryRouter initialEntries={[{ key: 'testKey', pathname: path }]}>
          <QueryClientProvider client={client}>
            <PageRouting view="card" />
          </QueryClientProvider>
        </MemoryRouter>
      </Provider>
    );
  };

  const createLandingWrapper = (path: string): ReactWrapper => {
    const mockStore = configureStore([thunk]);
    const client = new QueryClient();
    return mount(
      <Provider store={mockStore(state)}>
        <MemoryRouter initialEntries={[{ key: 'testKey', pathname: path }]}>
          <QueryClientProvider client={client}>
            <PageRouting view={null} />
          </QueryClientProvider>
        </MemoryRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    mount = createMount();

    state = JSON.parse(
      JSON.stringify({
        dgdataview: dgDataViewInitialState,
        dgcommon: dGCommonInitialState,
      })
    );

    (axios.get as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('count')) {
        return Promise.resolve({ data: 0 });
      } else {
        return Promise.resolve({ data: [] });
      }
    });
    (checkInstrumentAndFacilityCycleId as jest.Mock).mockImplementation(() =>
      Promise.resolve(true)
    );
    (checkInstrumentAndStudyId as jest.Mock).mockImplementation(() =>
      Promise.resolve(true)
    );
    (checkInvestigationId as jest.Mock).mockImplementation(() =>
      Promise.resolve(true)
    );
    (checkProposalName as jest.Mock).mockImplementation(() =>
      Promise.resolve(true)
    );
  });

  afterEach(() => {
    (axios.get as jest.Mock).mockRestore();
    (checkInstrumentAndFacilityCycleId as jest.Mock).mockRestore();
    (checkInstrumentAndStudyId as jest.Mock).mockRestore();
    (checkInvestigationId as jest.Mock).mockRestore();
    (checkProposalName as jest.Mock).mockRestore();
  });

  describe('Generic', () => {
    it('renders PageTable correctly', () => {
      const wrapper = createTableWrapper('/');
      expect(wrapper.exists(Link)).toBe(true);
    });

    it('renders PageCard correctly', () => {
      const wrapper = createCardWrapper('/');
      expect(wrapper.exists(Link)).toBe(true);
    });

    it('renders InvestigationTable for generic investigations route', () => {
      const wrapper = createTableWrapper(genericRoutes['investigations']);
      expect(wrapper.exists(InvestigationTable)).toBe(true);
    });

    it('renders InvestigationCardView for generic investigations route', () => {
      const wrapper = createCardWrapper(genericRoutes['investigations']);
      expect(wrapper.exists(InvestigationCardView)).toBe(true);
    });

    it('renders DatasetTable for generic datasets route', () => {
      const wrapper = createTableWrapper(genericRoutes['datasets']);
      expect(wrapper.exists(DatasetTable)).toBe(true);
    });

    it('renders DatasetCardView for generic datasets route', () => {
      const wrapper = createCardWrapper(genericRoutes['datasets']);
      expect(wrapper.exists(DatasetCardView)).toBe(true);
    });

    it('renders DatafileTable for generic datafiles route', async () => {
      const wrapper = createTableWrapper(genericRoutes['datafiles']);
      await act(async () => {
        await flushPromises();
        wrapper.update();
      });
      expect(wrapper.exists(DatafileTable)).toBe(true);
    });

    it('does not render DatafileTable for incorrect generic datafiles route', async () => {
      (checkInvestigationId as jest.Mock).mockImplementation(() =>
        Promise.resolve(false)
      );
      const wrapper = createTableWrapper(genericRoutes['datafiles']);
      await act(async () => {
        await flushPromises();
        wrapper.update();
      });
      expect(wrapper.exists(DatafileTable)).toBe(false);
    });
  });

  describe('ISIS', () => {
    it('renders ISISMyDataTable for ISIS my data route', () => {
      const wrapper = createTableWrapper(ISISRoutes['mydata']);
      expect(wrapper.exists(ISISMyDataTable)).toBe(true);
    });

    it('renders ISISInstrumentsTable for ISIS instruments route', () => {
      const wrapper = createTableWrapper(ISISRoutes['instruments']);
      expect(wrapper.exists(ISISInstrumentsTable)).toBe(true);
    });

    it('renders ISISInstrumentsCardView for ISIS instruments route', () => {
      const wrapper = createCardWrapper(ISISRoutes['instruments']);
      expect(wrapper.exists(ISISInstrumentsCardView)).toBe(true);
    });

    it('renders ISISFacilityCyclesTable for ISIS facilityCycles route', () => {
      const wrapper = createTableWrapper(ISISRoutes['facilityCycles']);
      expect(wrapper.exists(ISISFacilityCyclesTable)).toBe(true);
    });

    it('renders ISISFacilityCyclesCardView for ISIS facilityCycles route', () => {
      const wrapper = createCardWrapper(ISISRoutes['facilityCycles']);
      expect(wrapper.exists(ISISFacilityCyclesCardView)).toBe(true);
    });

    it('renders ISISInvestigationsTable for ISIS investigations route', () => {
      const wrapper = createTableWrapper(ISISRoutes['investigations']);
      expect(wrapper.exists(ISISInvestigationsTable)).toBe(true);
    });

    it('renders ISISInvestigationsCardView for ISIS investigations route', () => {
      const wrapper = createCardWrapper(ISISRoutes['investigations']);
      expect(wrapper.exists(ISISInvestigationsCardView)).toBe(true);
    });

    it('renders ISISInvestigationLanding for ISIS investigation route', async () => {
      const wrapper = createLandingWrapper(
        ISISRoutes['landing']['investigation']
      );
      await act(async () => {
        await flushPromises();
        wrapper.update();
      });
      expect(wrapper.exists(ISISInvestigationLanding)).toBe(true);
    });

    it('does not render ISISInvestigationLanding for incorrect ISIS investigation route', async () => {
      (checkInstrumentAndFacilityCycleId as jest.Mock).mockImplementation(() =>
        Promise.resolve(false)
      );
      const wrapper = createLandingWrapper(
        ISISRoutes['landing']['investigation']
      );
      await act(async () => {
        await flushPromises();
        wrapper.update();
      });
      expect(wrapper.exists(ISISInvestigationLanding)).toBe(false);
    });

    it('renders ISISDatasetsTable for ISIS datasets route', async () => {
      const wrapper = createTableWrapper(ISISRoutes['datasets']);
      await act(async () => {
        await flushPromises();
        wrapper.update();
      });
      expect(wrapper.exists(ISISDatasetsTable)).toBe(true);
    });

    it('does not render ISISDatasetsTable for incorrect ISIS datasets route', async () => {
      (checkInstrumentAndFacilityCycleId as jest.Mock).mockImplementation(() =>
        Promise.resolve(false)
      );
      const wrapper = createTableWrapper(ISISRoutes['datasets']);
      await act(async () => {
        await flushPromises();
        wrapper.update();
      });
      expect(wrapper.exists(ISISDatasetsTable)).toBe(false);
    });

    it('renders ISISDatasetsCardview for ISIS datasets route', async () => {
      const wrapper = createCardWrapper(ISISRoutes['datasets']);
      await act(async () => {
        await flushPromises();
        wrapper.update();
      });
      expect(wrapper.exists(ISISDatasetsCardView)).toBe(true);
    });

    it('does not render ISISDatasetsCardView for incorrect ISIS datasets route', async () => {
      (checkInstrumentAndFacilityCycleId as jest.Mock).mockImplementation(() =>
        Promise.resolve(false)
      );
      const wrapper = createCardWrapper(ISISRoutes['datasets']);
      await act(async () => {
        await flushPromises();
        wrapper.update();
      });
      expect(wrapper.exists(ISISDatasetsCardView)).toBe(false);
    });

    it('renders ISISDatasetLanding for ISIS dataset route', async () => {
      const wrapper = createLandingWrapper(ISISRoutes['landing']['dataset']);
      await act(async () => {
        await flushPromises();
        wrapper.update();
      });
      expect(wrapper.exists(ISISDatasetLanding)).toBe(true);
    });

    it('does not render ISISDatasetLanding for incorrect ISIS dataset route', async () => {
      (checkInstrumentAndFacilityCycleId as jest.Mock).mockImplementation(() =>
        Promise.resolve(false)
      );
      const wrapper = createLandingWrapper(ISISRoutes['landing']['dataset']);
      await act(async () => {
        await flushPromises();
        wrapper.update();
      });
      expect(wrapper.exists(ISISDatasetLanding)).toBe(false);
    });

    it('renders ISISDatafilesTable for ISIS datafiles route', async () => {
      const wrapper = createTableWrapper(ISISRoutes['datafiles']);
      await act(async () => {
        await flushPromises();
        wrapper.update();
      });
      expect(wrapper.exists(ISISDatafilesTable)).toBe(true);
    });

    it('does not render ISISDatafilesTable for incorrect ISIS datafiles route', async () => {
      (checkInstrumentAndFacilityCycleId as jest.Mock).mockImplementation(() =>
        Promise.resolve(false)
      );
      (checkInvestigationId as jest.Mock).mockImplementation(() =>
        Promise.resolve(false)
      );
      const wrapper = createTableWrapper(ISISRoutes['datafiles']);
      await act(async () => {
        await flushPromises();
        wrapper.update();
      });
      expect(wrapper.exists(ISISDatafilesTable)).toBe(false);
    });
  });

  describe('ISIS Study Hierarchy', () => {
    it('renders ISISInstrumentsTable for ISIS instruments route in Study Hierarchy', () => {
      const wrapper = createTableWrapper(
        ISISStudyHierarchyRoutes['instruments']
      );
      expect(wrapper.exists(ISISInstrumentsTable)).toBe(true);
    });

    it('renders ISISInstrumentsCardView for ISIS instruments route in Study Hierarchy', () => {
      const wrapper = createCardWrapper(
        ISISStudyHierarchyRoutes['instruments']
      );
      expect(wrapper.exists(ISISInstrumentsCardView)).toBe(true);
    });

    it('renders ISISStudiesTable for ISIS studies route in Study Hierarchy', () => {
      const wrapper = createTableWrapper(ISISStudyHierarchyRoutes['studies']);
      expect(wrapper.exists(ISISStudiesTable)).toBe(true);
    });

    it('renders ISISStudiesCardView for ISIS studies route in Study Hierarchy', () => {
      const wrapper = createCardWrapper(ISISStudyHierarchyRoutes['studies']);
      expect(wrapper.exists(ISISStudiesCardView)).toBe(true);
    });

    it('renders ISISStudyLanding for ISIS study route for studyHierarchy', async () => {
      const wrapper = createLandingWrapper(
        ISISStudyHierarchyRoutes['landing']['study']
      );
      await act(async () => {
        await flushPromises();
        wrapper.update();
      });
      expect(wrapper.exists(ISISStudyLanding)).toBe(true);
    });

    it('renders ISISInvestigationsTable for ISIS investigations route in Study Hierarchy', () => {
      const wrapper = createTableWrapper(
        ISISStudyHierarchyRoutes['investigations']
      );
      expect(wrapper.exists(ISISInvestigationsTable)).toBe(true);
    });

    it('renders ISISInvestigationsCardView for ISIS investigations route in Study Hierarchy', () => {
      const wrapper = createCardWrapper(
        ISISStudyHierarchyRoutes['investigations']
      );
      expect(wrapper.exists(ISISInvestigationsCardView)).toBe(true);
    });

    it('renders ISISDatasetsTable for ISIS datasets route in Study Hierarchy', async () => {
      const wrapper = createTableWrapper(ISISStudyHierarchyRoutes['datasets']);
      await act(async () => {
        await flushPromises();
        wrapper.update();
      });
      expect(wrapper.exists(ISISDatasetsTable)).toBe(true);
    });

    it('does not render ISISDatasetsTable for incorrect ISIS datasets route in Study Hierarchy', async () => {
      (checkInstrumentAndStudyId as jest.Mock).mockImplementation(() =>
        Promise.resolve(false)
      );
      const wrapper = createTableWrapper(ISISStudyHierarchyRoutes['datasets']);
      await act(async () => {
        await flushPromises();
        wrapper.update();
      });
      expect(wrapper.exists(ISISDatasetsTable)).toBe(false);
    });

    it('renders ISISInvestigationLanding for ISIS investigation route for studyHierarchy', async () => {
      const wrapper = createLandingWrapper(
        ISISStudyHierarchyRoutes['landing']['investigation']
      );
      await act(async () => {
        await flushPromises();
        wrapper.update();
      });
      expect(wrapper.exists(ISISInvestigationLanding)).toBe(true);
    });

    it('does not render ISISInvestigationLanding for incorrect ISIS investigation route for studyHierarchy', async () => {
      (checkInstrumentAndStudyId as jest.Mock).mockImplementation(() =>
        Promise.resolve(false)
      );
      const wrapper = createLandingWrapper(
        ISISStudyHierarchyRoutes['landing']['investigation']
      );
      await act(async () => {
        await flushPromises();
        wrapper.update();
      });
      expect(wrapper.exists(ISISInvestigationLanding)).toBe(false);
    });

    it('renders ISISDatasetsCardView for ISIS datasets route in Study Hierarchy', async () => {
      const wrapper = createCardWrapper(ISISStudyHierarchyRoutes['datasets']);
      await act(async () => {
        await flushPromises();
        wrapper.update();
      });
      expect(wrapper.exists(ISISDatasetsCardView)).toBe(true);
    });

    it('does not render ISISDatasetsCardView for incorrect ISIS datasets route in Study Hierarchy', async () => {
      (checkInstrumentAndStudyId as jest.Mock).mockImplementation(() =>
        Promise.resolve(false)
      );
      const wrapper = createCardWrapper(ISISStudyHierarchyRoutes['datasets']);
      await act(async () => {
        await flushPromises();
        wrapper.update();
      });
      expect(wrapper.exists(ISISDatasetsCardView)).toBe(false);
    });

    it('renders ISISDatasetLanding for ISIS dataset route for studyHierarchy', async () => {
      const wrapper = createLandingWrapper(
        ISISStudyHierarchyRoutes['landing']['dataset']
      );
      await act(async () => {
        await flushPromises();
        wrapper.update();
      });
      expect(wrapper.exists(ISISDatasetLanding)).toBe(true);
    });

    it('does not render ISISDatasetLanding for incorrect ISIS dataset route for studyHierarchy', async () => {
      (checkInstrumentAndStudyId as jest.Mock).mockImplementation(() =>
        Promise.resolve(false)
      );
      const wrapper = createLandingWrapper(
        ISISStudyHierarchyRoutes['landing']['dataset']
      );
      await act(async () => {
        await flushPromises();
        wrapper.update();
      });
      expect(wrapper.exists(ISISDatasetLanding)).toBe(false);
    });

    it('renders ISISDatafilesTable for ISIS datafiles route in Study Hierarchy', async () => {
      const wrapper = createTableWrapper(ISISStudyHierarchyRoutes['datafiles']);
      await act(async () => {
        await flushPromises();
        wrapper.update();
      });
      expect(wrapper.exists(ISISDatafilesTable)).toBe(true);
    });

    it('does not render ISISDatafilesTable for incorrect ISIS datafiles route in Study Hierarchy', async () => {
      (checkInstrumentAndStudyId as jest.Mock).mockImplementation(() =>
        Promise.resolve(false)
      );
      (checkInvestigationId as jest.Mock).mockImplementation(() =>
        Promise.resolve(false)
      );
      const wrapper = createTableWrapper(ISISStudyHierarchyRoutes['datafiles']);
      await act(async () => {
        await flushPromises();
        wrapper.update();
      });
      expect(wrapper.exists(ISISDatafilesTable)).toBe(false);
    });
  });

  describe('DLS', () => {
    it('renders DLSMyDataTable for DLS my data route', () => {
      const wrapper = createTableWrapper(DLSRoutes['mydata']);
      expect(wrapper.exists(DLSMyDataTable)).toBe(true);
    });

    it('renders DLSProposalTable for DLS proposal route', () => {
      const wrapper = createTableWrapper(DLSRoutes['proposals']);
      expect(wrapper.exists(DLSProposalsTable)).toBe(true);
    });

    it('renders DLSProposalCardView for DLS proposal route', () => {
      const wrapper = createCardWrapper(DLSRoutes['proposals']);
      expect(wrapper.exists(DLSProposalsCardView)).toBe(true);
    });

    it('renders DLSVisitsTable for DLS investigations route', () => {
      const wrapper = createTableWrapper(DLSRoutes['investigations']);
      expect(wrapper.exists(DLSVisitsTable)).toBe(true);
    });

    it('renders DLSVisitsCardView for DLS investigations route', () => {
      const wrapper = createCardWrapper(DLSRoutes['investigations']);
      expect(wrapper.exists(DLSVisitsCardView)).toBe(true);
    });

    it('renders DLSDatasetsTable for DLS datasets route', async () => {
      const wrapper = createTableWrapper(DLSRoutes['datasets']);
      await act(async () => {
        await flushPromises();
        wrapper.update();
      });
      expect(wrapper.exists(DLSDatasetsTable)).toBe(true);
    });

    it('does not render DLSDatasetsTable for incorrect DLS datasets route', async () => {
      (checkProposalName as jest.Mock).mockImplementation(() =>
        Promise.resolve(false)
      );
      const wrapper = createTableWrapper(DLSRoutes['datasets']);
      await act(async () => {
        await flushPromises();
        wrapper.update();
      });
      expect(wrapper.exists(DLSDatasetsTable)).toBe(false);
    });

    it('renders DLSDatasetsCardView for DLS datasets route', async () => {
      const wrapper = createCardWrapper(DLSRoutes['datasets']);
      await act(async () => {
        await flushPromises();
        wrapper.update();
      });
      expect(wrapper.exists(DLSDatasetsCardView)).toBe(true);
    });

    it('does not render DLSDatasetsCardView for incorrect DLS datasets route', async () => {
      (checkProposalName as jest.Mock).mockImplementation(() =>
        Promise.resolve(false)
      );
      const wrapper = createCardWrapper(DLSRoutes['datasets']);
      await act(async () => {
        await flushPromises();
        wrapper.update();
      });
      expect(wrapper.exists(DLSDatasetsCardView)).toBe(false);
    });

    it('renders DLSDatafilesTable for DLS datafiles route', async () => {
      const wrapper = createTableWrapper(DLSRoutes['datafiles']);
      await act(async () => {
        await flushPromises();
        wrapper.update();
      });
      expect(wrapper.exists(DLSDatafilesTable)).toBe(true);
    });

    it('does not render DLSDatafilesTable for incorrect DLS datafiles route', async () => {
      (checkProposalName as jest.Mock).mockImplementation(() =>
        Promise.resolve(false)
      );
      (checkInvestigationId as jest.Mock).mockImplementation(() =>
        Promise.resolve(false)
      );
      const wrapper = createTableWrapper(DLSRoutes['datafiles']);
      await act(async () => {
        await flushPromises();
        wrapper.update();
      });
      expect(wrapper.exists(DLSDatafilesTable)).toBe(false);
    });
  });
});
