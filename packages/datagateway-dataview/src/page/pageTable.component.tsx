import React from 'react';

import { Switch, Route, RouteComponentProps } from 'react-router';
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
import ISISInvestigationsTable from '../views/table/isis/isisInvestigationsTable.component';
import ISISDatasetsTable from '../views/table/isis/isisDatasetsTable.component';
import ISISDatafilesTable from '../views/table/isis/isisDatafilesTable.component';

import DLSMyDataTable from '../views/table/dls/dlsMyDataTable.component';
import ISISMyDataTable from '../views/table/isis/isisMyDataTable.component';

import withIdCheck from './withIdCheck';
import {
  checkProposalName,
  checkInvestigationId,
  checkInstrumentAndFacilityCycleId,
} from './idCheckFunctions';

import { paths } from './pageContainer.component';

class PageTable extends React.PureComponent {
  public render(): React.ReactNode {
    return (
      <Switch>
        <Route
          exact
          path="/"
          render={() => (
            <Link to={paths.toggle.investigation}>Browse investigations</Link>
          )}
        />
        <Route path={paths.myData.dls} component={DLSMyDataTable} />
        <Route path={paths.myData.isis} component={ISISMyDataTable} />
        <Route
          exact
          path={paths.toggle.dlsProposal}
          component={DLSProposalsTable}
        />
        <Route
          exact
          path={paths.toggle.dlsVisit}
          render={({
            match,
          }: RouteComponentProps<{ proposalName: string }>) => (
            <DLSVisitsTable proposalName={match.params.proposalName} />
          )}
        />
        <Route
          exact
          path={paths.toggle.dlsDataset}
          render={({
            match,
          }: RouteComponentProps<{
            proposalName: string;
            investigationId: string;
          }>) => {
            const SafeDLSDatasetsTable = withIdCheck(
              checkProposalName(
                match.params.proposalName,
                parseInt(match.params.investigationId)
              )
            )(DLSDatasetsTable);
            return (
              <SafeDLSDatasetsTable
                proposalName={match.params.proposalName}
                investigationId={match.params.investigationId}
              />
            );
          }}
        />
        <Route
          exact
          path={paths.standard.dlsDatafile}
          render={({
            match,
          }: RouteComponentProps<{
            proposalName: string;
            investigationId: string;
            datasetId: string;
          }>) => {
            const SafeDLSDatafilesTable = withIdCheck(
              Promise.all([
                checkProposalName(
                  match.params.proposalName,
                  parseInt(match.params.investigationId)
                ),
                checkInvestigationId(
                  parseInt(match.params.investigationId),
                  parseInt(match.params.datasetId)
                ),
              ]).then((values) => !values.includes(false))
            )(DLSDatafilesTable);
            return <SafeDLSDatafilesTable datasetId={match.params.datasetId} />;
          }}
        />
        <Route
          exact
          path={paths.toggle.isisInstrument}
          component={ISISInstrumentsTable}
        />
        <Route
          exact
          path={paths.toggle.isisFacilityCycle}
          render={({
            match,
          }: RouteComponentProps<{ instrumentId: string }>) => (
            <ISISFacilityCyclesTable instrumentId={match.params.instrumentId} />
          )}
        />
        <Route
          exact
          path={paths.toggle.isisInvestigation}
          render={({
            match,
          }: RouteComponentProps<{
            instrumentId: string;
            facilityCycleId: string;
          }>) => (
            <ISISInvestigationsTable
              instrumentId={match.params.instrumentId}
              facilityCycleId={match.params.facilityCycleId}
            />
          )}
        />
        <Route
          exact
          path={paths.toggle.isisDataset}
          render={({
            match,
          }: RouteComponentProps<{
            instrumentId: string;
            facilityCycleId: string;
            investigationId: string;
          }>) => {
            const SafeISISDatasetsTable = withIdCheck(
              checkInstrumentAndFacilityCycleId(
                parseInt(match.params.instrumentId),
                parseInt(match.params.facilityCycleId),
                parseInt(match.params.investigationId)
              )
            )(ISISDatasetsTable);
            return (
              <SafeISISDatasetsTable
                instrumentId={match.params.instrumentId}
                facilityCycleId={match.params.facilityCycleId}
                investigationId={match.params.investigationId}
              />
            );
          }}
        />
        <Route
          exact
          path={paths.standard.isisDatafile}
          render={({
            match,
          }: RouteComponentProps<{
            instrumentId: string;
            facilityCycleId: string;
            investigationId: string;
            datasetId: string;
          }>) => {
            const SafeISISDatafilesTable = withIdCheck(
              Promise.all([
                checkInstrumentAndFacilityCycleId(
                  parseInt(match.params.instrumentId),
                  parseInt(match.params.facilityCycleId),
                  parseInt(match.params.investigationId)
                ),
                checkInvestigationId(
                  parseInt(match.params.investigationId),
                  parseInt(match.params.datasetId)
                ),
              ]).then((values) => !values.includes(false))
            )(ISISDatafilesTable);
            return (
              <SafeISISDatafilesTable datasetId={match.params.datasetId} />
            );
          }}
        />
        <Route
          exact
          path={paths.toggle.investigation}
          component={InvestigationTable}
        />
        <Route
          exact
          path={paths.toggle.dataset}
          render={({
            match,
          }: RouteComponentProps<{ investigationId: string }>) => (
            <DatasetTable investigationId={match.params.investigationId} />
          )}
        />
        <Route
          exact
          path={paths.standard.datafile}
          render={({
            match,
          }: RouteComponentProps<{
            investigationId: string;
            datasetId: string;
          }>) => {
            const SafeDatafileTable = withIdCheck(
              checkInvestigationId(
                parseInt(match.params.investigationId),
                parseInt(match.params.datasetId)
              )
            )(DatafileTable);
            return <SafeDatafileTable datasetId={match.params.datasetId} />;
          }}
        />
      </Switch>
    );
  }
}

export default PageTable;
