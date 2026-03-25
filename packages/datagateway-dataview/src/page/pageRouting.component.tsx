import React from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';

import DatafileTable from '../views/table/datafileTable.component';
import DatasetTable from '../views/table/datasetTable.component';
import InvestigationTable from '../views/table/investigationTable.component';

import DLSDatafilesTable from '../views/table/dls/dlsDatafilesTable.component';
import DLSDatasetsTable from '../views/table/dls/dlsDatasetsTable.component';
import DLSProposalsTable from '../views/table/dls/dlsProposalsTable.component';

import ISISDatafilesTable from '../views/table/isis/isisDatafilesTable.component';
import ISISDataPublicationsTable from '../views/table/isis/isisDataPublicationsTable.component';
import ISISDatasetsTable from '../views/table/isis/isisDatasetsTable.component';
import ISISFacilityCyclesTable from '../views/table/isis/isisFacilityCyclesTable.component';
import ISISInstrumentsTable from '../views/table/isis/isisInstrumentsTable.component';
import ISISInvestigationsTable from '../views/table/isis/isisInvestigationsTable.component';

import {
  DLSAllDOIsTable,
  DLSMyDOIsTable,
} from '../views/table/dls/dlsDOITables.component';
import DLSMyDataTable from '../views/table/dls/dlsMyDataTable.component';
import ISISMyDataTable from '../views/table/isis/isisMyDataTable.component';

import DatasetCardView from '../views/card/datasetCardView.component';
import InvestigationCardView from '../views/card/investigationCardView.component';

import ISISDataPublicationsCardView from '../views/card/isis/isisDataPublicationsCardView.component';
import ISISDatasetsCardView from '../views/card/isis/isisDatasetsCardView.component';
import ISISFacilityCyclesCardView from '../views/card/isis/isisFacilityCyclesCardView.component';
import ISISInstrumentsCardView from '../views/card/isis/isisInstrumentsCardView.component';
import ISISInvestigationsCardView from '../views/card/isis/isisInvestigationsCardView.component';
import ISISDataPublicationLanding from '../views/landing/isis/isisDataPublicationLanding.component';
import ISISInvestigationLanding from '../views/landing/isis/isisInvestigationLanding.component';

import DLSDatasetsCardView from '../views/card/dls/dlsDatasetsCardView.component';
import DLSProposalsCardView from '../views/card/dls/dlsProposalsCardView.component';
import DLSDataPublicationLanding from '../views/landing/dls/dlsDataPublicationLanding.component';

import {
  parseSearchToQuery,
  readSciGatewayToken,
  StateType,
  ViewsType,
} from 'datagateway-common';
import { useSelector } from 'react-redux';
import DLSVisitsCardView from '../views/card/dls/dlsVisitsCardView.component';
import { ISISDatafilePreviewer } from '../views/datafilePreview/isisDatafilePreviewer.component';
import DLSDataPublicationEditForm from '../views/landing/dls/dlsDataPublicationEditForm.component';
import ISISDatasetLandingPage from '../views/landing/isis/isisDatasetLanding.component';
import DLSVisitsTable from '../views/table/dls/dlsVisitsTable.component';
import PageContainer, { paths } from './pageContainer.component';
import { DoiRedirect, GenericRedirect } from './redirect.component';
import { TranslatedHomePage } from './translatedHomePage.component';

interface PageRoutingProps {
  view: ViewsType;
  loggedInAnonymously: boolean;
}

const PageRouting = ({ view, loggedInAnonymously }: PageRoutingProps) => {
  return (
    <Routes>
      <Route path={paths.homepage} element={<TranslatedHomePage />} />
      <Route path={paths.doiRedirect} element={<DoiRedirect />} />
      <Route path={paths.genericRedirect} element={<GenericRedirect />} />
      <Route
        element={<PageContainer loggedInAnonymously={loggedInAnonymously} />}
      >
        <Route
          path="/"
          element={
            view === 'card' ? (
              <Link to={paths.toggle.investigation + '?view=card'}>
                Browse investigations
              </Link>
            ) : (
              <Link to={paths.toggle.investigation}>Browse investigations</Link>
            )
          }
        />

        {/* My Data routes */}

        <Route
          path={paths.myData.dls}
          element={
            loggedInAnonymously === true ? (
              <Navigate to={'/login'} />
            ) : (
              <DLSMyDataTable />
            )
          }
        />

        <Route
          path={paths.myData.isis}
          element={
            loggedInAnonymously === true ? (
              <Navigate to={'/login'} />
            ) : (
              <ISISMyDataTable />
            )
          }
        />

        <Route
          path={paths.dataPublications.dls.myDOIs}
          element={
            loggedInAnonymously === true ? (
              <Navigate to={'/login'} />
            ) : (
              <DLSMyDOIsTable />
            )
          }
        />

        <Route
          path={paths.dataPublications.dls.allDOIs}
          element={<DLSAllDOIsTable />}
        />

        {/* DLS routes */}
        <Route
          path={paths.toggle.dlsProposal}
          element={
            view === 'card' ? <DLSProposalsCardView /> : <DLSProposalsTable />
          }
        />
        <Route
          path={paths.toggle.dlsVisit}
          element={view === 'card' ? <DLSVisitsCardView /> : <DLSVisitsTable />}
        />
        <Route
          path={paths.toggle.dlsDataset}
          element={
            view === 'card' ? <DLSDatasetsCardView /> : <DLSDatasetsTable />
          }
        />
        <Route
          path={paths.standard.dlsDatafile}
          element={<DLSDatafilesTable />}
        />
        <Route
          path={paths.landing.dlsDataPublicationLanding}
          element={<DLSDataPublicationLanding />}
        />

        <Route
          path={paths.landing.dlsDataPublicationLanding + '/edit'}
          element={<DLSDataPublicationEditForm />}
        />

        {/* ISIS dataPublications routes */}
        <Route
          path={paths.dataPublications.toggle.isisInstrument}
          element={
            view === 'card' ? (
              <ISISInstrumentsCardView dataPublication={true} />
            ) : (
              <ISISInstrumentsTable dataPublication={true} />
            )
          }
        />
        <Route
          path={paths.dataPublications.toggle.isisStudyDataPublication}
          element={
            view === 'card' ? (
              <ISISDataPublicationsCardView />
            ) : (
              <ISISDataPublicationsTable />
            )
          }
        />
        <Route
          path={paths.dataPublications.landing.isisDataPublicationLanding}
          element={<ISISDataPublicationLanding />}
        />
        <Route
          path={paths.dataPublications.toggle.isisInvestigationDataPublication}
          element={
            view === 'card' ? (
              <ISISDataPublicationsCardView />
            ) : (
              <ISISDataPublicationsTable />
            )
          }
        />
        <Route
          path={paths.dataPublications.landing.isisInvestigationLanding}
          element={<ISISInvestigationLanding dataPublication={true} />}
        />
        <Route
          path={paths.dataPublications.toggle.isisDataset}
          element={
            view === 'card' ? (
              <ISISDatasetsCardView dataPublication={true} />
            ) : (
              <ISISDatasetsTable dataPublication={true} />
            )
          }
        />
        <Route
          path={paths.dataPublications.landing.isisDatasetLanding}
          element={<ISISDatasetLandingPage dataPublication={true} />}
        />
        <Route
          path={paths.dataPublications.standard.isisDatafile}
          element={<ISISDatafilesTable dataPublication={true} />}
        />
        <Route
          path={paths.preview.isisDataPublicationDatafilePreview}
          element={<ISISDatafilePreviewer dataPublication={true} />}
        />

        {/* ISIS routes */}
        <Route
          path={paths.toggle.isisInstrument}
          element={
            view === 'card' ? (
              <ISISInstrumentsCardView dataPublication={false} />
            ) : (
              <ISISInstrumentsTable dataPublication={false} />
            )
          }
        />
        <Route
          path={paths.toggle.isisFacilityCycle}
          element={
            view === 'card' ? (
              <ISISFacilityCyclesCardView />
            ) : (
              <ISISFacilityCyclesTable />
            )
          }
        />
        <Route
          path={paths.toggle.isisInvestigation}
          element={
            view === 'card' ? (
              <ISISInvestigationsCardView />
            ) : (
              <ISISInvestigationsTable />
            )
          }
        />
        <Route
          path={paths.landing.isisInvestigationLanding}
          element={<ISISInvestigationLanding dataPublication={false} />}
        />
        <Route
          path={paths.toggle.isisDataset}
          element={
            view === 'card' ? (
              <ISISDatasetsCardView dataPublication={false} />
            ) : (
              <ISISDatasetsTable dataPublication={false} />
            )
          }
        />
        <Route
          path={paths.landing.isisDatasetLanding}
          element={<ISISDatasetLandingPage dataPublication={false} />}
        />
        <Route
          path={paths.standard.isisDatafile}
          element={<ISISDatafilesTable dataPublication={false} />}
        />
        <Route
          path={paths.preview.isisDatafilePreview}
          element={<ISISDatafilePreviewer dataPublication={false} />}
        />

        {/* Generic routes */}
        <Route
          path={paths.toggle.investigation}
          element={
            view === 'card' ? <InvestigationCardView /> : <InvestigationTable />
          }
        />
        <Route
          path={paths.toggle.dataset}
          element={view === 'card' ? <DatasetCardView /> : <DatasetTable />}
        />
        <Route path={paths.standard.datafile} element={<DatafileTable />} />
      </Route>
    </Routes>
  );
};

const ConnectedPageRouting = () => {
  const anonUserName = useSelector(
    (state: StateType) => state.dgcommon.anonUserName
  );
  // Determine whether logged in anonymously (assume this if username is null)
  const username = readSciGatewayToken().username;
  const loggedInAnonymously =
    username === null || username === (anonUserName ?? 'anon/anon');

  const location = useLocation();
  const { view } = React.useMemo(
    () => parseSearchToQuery(location.search),
    [location.search]
  );

  return <PageRouting loggedInAnonymously={loggedInAnonymously} view={view} />;
};

export default ConnectedPageRouting;
