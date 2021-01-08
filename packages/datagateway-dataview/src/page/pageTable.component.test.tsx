import React from 'react';
import { ReactWrapper } from 'enzyme';

import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { StateType } from '../state/app.types';

import { createMount } from '@material-ui/core/test-utils';
import { MemoryRouter } from 'react-router';
import PageTable from './pageTable.component';
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
import {
  checkInstrumentAndFacilityCycleId,
  checkInstrumentAndStudyId,
  checkInvestigationId,
  checkProposalName,
} from './idCheckFunctions';
import { flushPromises } from '../setupTests';
import { act } from 'react-dom/test-utils';

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
};

// The ISIS StudHierarchy routes to test.
const ISISStudyHierarchyRoutes = {
  instruments: '/browseStudyHierarchy/instrument',
  facilityCycles: '/browseStudyHierarchy/instrument/1/study',
  investigations: '/browseStudyHierarchy/instrument/1/study/1/investigation',
  datasets:
    '/browseStudyHierarchy/instrument/1/study/1/investigation/1/dataset',
  datafiles:
    '/browseStudyHierarchy/instrument/1/study/1/investigation/1/dataset/1/datafile',
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

  const createWrapper = (path: string): ReactWrapper => {
    const mockStore = configureStore([thunk]);
    return mount(
      <Provider store={mockStore(state)}>
        <MemoryRouter initialEntries={[{ key: 'testKey', pathname: path }]}>
          <PageTable />
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

  it('renders PageTable correctly', () => {
    const wrapper = createWrapper('/');

    expect(wrapper.exists(Link)).toBe(true);
  });

  it('renders InvestigationTable for generic investigations route', () => {
    const wrapper = createWrapper(genericRoutes['investigations']);

    // Expect the InvestigationTable component to be present.
    expect(wrapper.exists(InvestigationTable)).toBe(true);
  });

  it('renders DatasetTable for generic datasets route', () => {
    const wrapper = createWrapper(genericRoutes['datasets']);

    // Expect the DatasetTable component to be present.
    expect(wrapper.exists(DatasetTable)).toBe(true);
  });

  it('renders DatafileTable for generic datafiles route', async () => {
    const wrapper = createWrapper(genericRoutes['datafiles']);

    // wait for id check promises to resolve
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // Expect the DatafileTable component to be present.
    expect(wrapper.exists(DatafileTable)).toBe(true);
  });

  it('does not render DatafileTable for incorrect generic datafiles route', async () => {
    (checkInvestigationId as jest.Mock).mockImplementation(() =>
      Promise.resolve(false)
    );

    const wrapper = createWrapper(genericRoutes['datafiles']);

    // wait for id check promises to resolve
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // Expect the DatafileTable component not to be present.
    expect(wrapper.exists(DatafileTable)).toBe(false);
  });

  it('renders ISISMyDataTable for ISIS my data route', () => {
    const wrapper = createWrapper(ISISRoutes['mydata']);

    // Expect the ISISMyDataTable component to be present.
    expect(wrapper.exists(ISISMyDataTable)).toBe(true);
  });

  it('renders ISISInstrumentsTable for ISIS instruments route', () => {
    const wrapper = createWrapper(ISISRoutes['instruments']);

    // Expect the ISISInstrumentsTable component to be present.
    expect(wrapper.exists(ISISInstrumentsTable)).toBe(true);
  });

  it('renders ISISFacilityCyclesTable for ISIS facilityCycles route', () => {
    const wrapper = createWrapper(ISISRoutes['facilityCycles']);

    // Expect the ISISFacilityCyclesTable component to be present.
    expect(wrapper.exists(ISISFacilityCyclesTable)).toBe(true);
  });

  it('renders ISISInvestigations for ISIS investigations route', () => {
    const wrapper = createWrapper(ISISRoutes['investigations']);

    // Expect the ISISInvestigationsTable component to be present.
    expect(wrapper.exists(ISISInvestigationsTable)).toBe(true);
  });

  it('renders ISISDatasetsTable for ISIS datasets route', async () => {
    const wrapper = createWrapper(ISISRoutes['datasets']);

    // wait for id check promises to resolve
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // Expect the ISISDatasetsTable component to be present.
    expect(wrapper.exists(ISISDatasetsTable)).toBe(true);
  });

  it('does not render ISISDatasetsTable for incorrect ISIS datasets route', async () => {
    (checkInstrumentAndFacilityCycleId as jest.Mock).mockImplementation(() =>
      Promise.resolve(false)
    );

    const wrapper = createWrapper(ISISRoutes['datasets']);

    // wait for id check promises to resolve
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // Expect the ISISDatasetsTable component not to be present.
    expect(wrapper.exists(ISISDatasetsTable)).toBe(false);
  });

  it('renders ISISDatafilesTable for ISIS datafiles route', async () => {
    const wrapper = createWrapper(ISISRoutes['datafiles']);

    // wait for id check promises to resolve
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // Expect the ISISDatafilesTable component to be present.
    expect(wrapper.exists(ISISDatafilesTable)).toBe(true);
  });

  it('does not render ISISDatafilesTable for incorrect ISIS datafiles route', async () => {
    (checkInstrumentAndFacilityCycleId as jest.Mock).mockImplementation(() =>
      Promise.resolve(false)
    );
    (checkInvestigationId as jest.Mock).mockImplementation(() =>
      Promise.resolve(false)
    );

    const wrapper = createWrapper(ISISRoutes['datafiles']);

    // wait for id check promises to resolve
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // Expect the ISISDatafilesTable component not to be present.
    expect(wrapper.exists(ISISDatafilesTable)).toBe(false);
  });

  it('renders ISISInstrumentsTable for ISIS instruments route in Study Hierarchy', () => {
    const wrapper = createWrapper(ISISStudyHierarchyRoutes['instruments']);

    // Expect the ISISInstrumentsTable component to be present.
    expect(wrapper.exists(ISISInstrumentsTable)).toBe(true);
  });

  it('renders ISISFacilityCyclesTable for ISIS facilityCycles route in Study Hierarchy', () => {
    const wrapper = createWrapper(ISISStudyHierarchyRoutes['facilityCycles']);

    // Expect the ISISStudiesTable component to be present.
    expect(wrapper.exists(ISISStudiesTable)).toBe(true);
  });

  it('renders ISISInvestigations for ISIS investigations route in Study Hierarchy', () => {
    const wrapper = createWrapper(ISISStudyHierarchyRoutes['investigations']);

    // Expect the ISISInvestigationsTable component to be present.
    expect(wrapper.exists(ISISInvestigationsTable)).toBe(true);
  });

  it('renders ISISDatasetsTable for ISIS datasets route in Study Hierarchy', async () => {
    const wrapper = createWrapper(ISISStudyHierarchyRoutes['datasets']);

    // wait for id check promises to resolve
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // Expect the ISISDatasetsTable component to be present.
    expect(wrapper.exists(ISISDatasetsTable)).toBe(true);
  });

  it('does not render ISISDatasetsTable for incorrect ISIS datasets route in Study Hierarchy', async () => {
    (checkInstrumentAndStudyId as jest.Mock).mockImplementation(() =>
      Promise.resolve(false)
    );

    const wrapper = createWrapper(ISISStudyHierarchyRoutes['datasets']);

    // wait for id check promises to resolve
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // Expect the ISISDatasetsTable component not to be present.
    expect(wrapper.exists(ISISDatasetsTable)).toBe(false);
  });

  it('renders ISISDatafilesTable for ISIS datafiles route in Study Hierarchy', async () => {
    const wrapper = createWrapper(ISISStudyHierarchyRoutes['datafiles']);

    // wait for id check promises to resolve
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // Expect the ISISDatafilesTable component to be present.
    expect(wrapper.exists(ISISDatafilesTable)).toBe(true);
  });

  it('does not render ISISDatafilesTable for incorrect ISIS datafiles route in Study Hierarchy', async () => {
    (checkInstrumentAndStudyId as jest.Mock).mockImplementation(() =>
      Promise.resolve(false)
    );
    (checkInvestigationId as jest.Mock).mockImplementation(() =>
      Promise.resolve(false)
    );

    const wrapper = createWrapper(ISISStudyHierarchyRoutes['datafiles']);

    // wait for id check promises to resolve
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // Expect the ISISDatafilesTable component not to be present.
    expect(wrapper.exists(ISISDatafilesTable)).toBe(false);
  });

  it('renders DLSMyDataTable for DLS my data route', () => {
    const wrapper = createWrapper(DLSRoutes['mydata']);

    // Expect the DLSMyDataTable component to be present.
    expect(wrapper.exists(DLSMyDataTable)).toBe(true);
  });

  it('renders DLSProposalTable for DLS proposal route', () => {
    const wrapper = createWrapper(DLSRoutes['proposals']);

    // Expect the DLSProposalsTable component to be present.
    expect(wrapper.exists(DLSProposalsTable)).toBe(true);
  });

  it('renders DLSVisitsTable for DLS investigations route', () => {
    const wrapper = createWrapper(DLSRoutes['investigations']);

    // Expect the DLSVisitsTable component to be present.
    expect(wrapper.exists(DLSVisitsTable)).toBe(true);
  });

  it('renders DLSDatasetsTable for DLS datasets route', async () => {
    const wrapper = createWrapper(DLSRoutes['datasets']);

    // wait for id check promises to resolve
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // Expect the DLSDatasetsTable component to be present.
    expect(wrapper.exists(DLSDatasetsTable)).toBe(true);
  });

  it('does not render DLSDatasetsTable for incorrect DLS datasets route', async () => {
    (checkProposalName as jest.Mock).mockImplementation(() =>
      Promise.resolve(false)
    );

    const wrapper = createWrapper(DLSRoutes['datasets']);

    // wait for id check promises to resolve
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // Expect the DLSDatasetsTable component not to be present.
    expect(wrapper.exists(DLSDatasetsTable)).toBe(false);
  });

  it('renders DLSDatafilesTable for DLS datafiles route', async () => {
    const wrapper = createWrapper(DLSRoutes['datafiles']);

    // wait for id check promises to resolve
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // Expect the DLSDatafilesTable component to be present.
    expect(wrapper.exists(DLSDatafilesTable)).toBe(true);
  });

  it('does not render DLSDatafilesTable for incorrect DLS datafiles route', async () => {
    (checkProposalName as jest.Mock).mockImplementation(() =>
      Promise.resolve(false)
    );
    (checkInvestigationId as jest.Mock).mockImplementation(() =>
      Promise.resolve(false)
    );

    const wrapper = createWrapper(DLSRoutes['datafiles']);

    // wait for id check promises to resolve
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // Expect the DLSDatafilesTable component not to be present.
    expect(wrapper.exists(DLSDatafilesTable)).toBe(false);
  });
});
