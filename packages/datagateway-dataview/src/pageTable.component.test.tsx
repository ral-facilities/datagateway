import React from 'react';
import { ReactWrapper } from 'enzyme';

import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { StateType } from './state/app.types';

import { createMount } from '@material-ui/core/test-utils';
import { MemoryRouter } from 'react-router';
import PageTable from './pageTable.component';
import { Provider } from 'react-redux';
import { initialState as dgDataViewInitialState } from './state/reducers/dgdataview.reducer';
import { dGCommonInitialState } from 'datagateway-common';
import { Link } from 'react-router-dom';

import InvestigationTable from './table/investigationTable.component';
import DatasetTable from './table/datasetTable.component';
import DatafileTable from './table/datafileTable.component';

import DLSProposalsTable from './dls/tables/dlsProposalsTable.component';
import DLSVisitsTable from './dls/tables/dlsVisitsTable.component';
import DLSDatasetsTable from './dls/tables/dlsDatasetsTable.component';
import DLSDatafilesTable from './dls/tables/dlsDatafilesTable.component';

import ISISInstrumentsTable from './isis/tables/isisInstrumentsTable.component';
import ISISFacilityCyclesTable from './isis/tables/isisFacilityCyclesTable.component';
import ISISInvestigationsTable from './isis/tables/isisInvestigationsTable.component';
import ISISDatasetsTable from './isis/tables/isisDatasetsTable.component';
import ISISDatafilesTable from './isis/tables/isisDatafilesTable.component';
import ISISMyDataTable from './isis/tables/isisMyDataTable.component';
import DLSMyDataTable from './dls/tables/dlsMyDataTable.component';

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
  mydata: '/my-data/ISIS',
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

  it('renders DatafileTable for generic datafiles route', () => {
    const wrapper = createWrapper(genericRoutes['datafiles']);

    // Expect the DatafileTable component to be present.
    expect(wrapper.exists(DatafileTable)).toBe(true);
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

  it('renders ISISDatasetsTable for ISIS datasets route', () => {
    const wrapper = createWrapper(ISISRoutes['datasets']);

    // Expect the ISISDatasetsTable component to be present.
    expect(wrapper.exists(ISISDatasetsTable)).toBe(true);
  });

  it('renders ISISDatafilesTable for ISIS datafiles route', () => {
    const wrapper = createWrapper(ISISRoutes['datafiles']);

    // Expect the ISISDatafilesTable component to be present.
    expect(wrapper.exists(ISISDatafilesTable)).toBe(true);
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

  it('renders DLSDatasetsTable for DLS datasets route', () => {
    const wrapper = createWrapper(DLSRoutes['datasets']);

    // Expect the DLSDatasetsTable component to be present.
    expect(wrapper.exists(DLSDatasetsTable)).toBe(true);
  });

  it('renders DLSDatafilesTable for DLS datafiles route', () => {
    const wrapper = createWrapper(DLSRoutes['datafiles']);

    // Expect the DLSDatafilesTable component to be present.
    expect(wrapper.exists(DLSDatafilesTable)).toBe(true);
  });
});
