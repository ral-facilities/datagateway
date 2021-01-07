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
import ISISStudiesTable from '../views/table/isis/isisStudiesTable.component';
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
  checkInstrumentAndStudyId,
} from './idCheckFunctions';

import { paths } from './pageContainer.component';
import { Paper } from '@material-ui/core';

const SafeDatafileTable = React.memo(
  (props: {
    investigationId: string;
    datasetId: string;
  }): React.ReactElement => {
    const SafeDatafileTable = withIdCheck(
      checkInvestigationId(
        parseInt(props.investigationId),
        parseInt(props.datasetId)
      )
    )(DatafileTable);

    return <SafeDatafileTable datasetId={props.datasetId} />;
  }
);

SafeDatafileTable.displayName = 'SafeDatafileTable';

const SafeISISDatafilesTable = React.memo(
  (props: {
    instrumentId: string;
    instrumentChildId: string;
    investigationId: string;
    datasetId: string;
    studyHierarchy: boolean;
  }): React.ReactElement => {
    const SafeISISDatafilesTable = props.studyHierarchy
      ? withIdCheck(
          Promise.all([
            checkInstrumentAndStudyId(
              parseInt(props.instrumentId),
              parseInt(props.instrumentChildId),
              parseInt(props.investigationId)
            ),
            checkInvestigationId(
              parseInt(props.investigationId),
              parseInt(props.datasetId)
            ),
          ]).then((values) => !values.includes(false))
        )(ISISDatafilesTable)
      : withIdCheck(
          Promise.all([
            checkInstrumentAndFacilityCycleId(
              parseInt(props.instrumentId),
              parseInt(props.instrumentChildId),
              parseInt(props.investigationId)
            ),
            checkInvestigationId(
              parseInt(props.investigationId),
              parseInt(props.datasetId)
            ),
          ]).then((values) => !values.includes(false))
        )(ISISDatafilesTable);

    return <SafeISISDatafilesTable datasetId={props.datasetId} />;
  }
);

SafeISISDatafilesTable.displayName = 'SafeISISDatafilesTable';

const SafeISISDatasetsTable = React.memo(
  (props: {
    instrumentId: string;
    instrumentChildId: string;
    investigationId: string;
    studyHierarchy: boolean;
  }): React.ReactElement => {
    const SafeISISDatasetsTable = props.studyHierarchy
      ? withIdCheck(
          checkInstrumentAndStudyId(
            parseInt(props.instrumentId),
            parseInt(props.instrumentChildId),
            parseInt(props.investigationId)
          )
        )(ISISDatasetsTable)
      : withIdCheck(
          checkInstrumentAndFacilityCycleId(
            parseInt(props.instrumentId),
            parseInt(props.instrumentChildId),
            parseInt(props.investigationId)
          )
        )(ISISDatasetsTable);

    return <SafeISISDatasetsTable {...props} />;
  }
);

SafeISISDatasetsTable.displayName = 'SafeISISDatasetsTable';

const SafeDLSDatafilesTable = React.memo(
  (props: {
    proposalName: string;
    investigationId: string;
    datasetId: string;
  }): React.ReactElement => {
    const SafeDLSDatafilesTable = withIdCheck(
      Promise.all([
        checkProposalName(props.proposalName, parseInt(props.investigationId)),
        checkInvestigationId(
          parseInt(props.investigationId),
          parseInt(props.datasetId)
        ),
      ]).then((values) => !values.includes(false))
    )(DLSDatafilesTable);

    return <SafeDLSDatafilesTable datasetId={props.datasetId} />;
  }
);

SafeDLSDatafilesTable.displayName = 'SafeDLSDatafilesTable';

const SafeDLSDatasetsTable = React.memo(
  (props: {
    proposalName: string;
    investigationId: string;
  }): React.ReactElement => {
    const SafeDLSDatasetsTable = withIdCheck(
      checkProposalName(props.proposalName, parseInt(props.investigationId))
    )(DLSDatasetsTable);

    return (
      <SafeDLSDatasetsTable
        proposalName={props.proposalName}
        investigationId={props.investigationId}
      />
    );
  }
);

SafeDLSDatasetsTable.displayName = 'SafeDLSDatasetsTable';

class PageTable extends React.PureComponent {
  public render(): React.ReactNode {
    return (
      <Route
        exact
        path={['/'].concat(
          Object.values(paths.myData),
          Object.values(paths.toggle),
          Object.values(paths.standard),
          Object.values(paths.studyHierarchy.toggle),
          Object.values(paths.studyHierarchy.standard)
        )}
      >
        {/* Place table in Paper component which adjusts for the height
      of the AppBar (64px) on parent application and the cart icon (48px). */}
        <Paper
          square
          style={{
            height: 'calc(100vh - 112px)',
            width: '100%',
            backgroundColor: 'inherit',
          }}
        >
          <Switch>
            <Route
              exact
              path="/"
              render={() => (
                <Link to={paths.toggle.investigation}>
                  Browse investigations
                </Link>
              )}
            />
            {/* DLS routes */}
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
              }>) => (
                <SafeDLSDatasetsTable
                  proposalName={match.params.proposalName}
                  investigationId={match.params.investigationId}
                />
              )}
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
              }>) => <SafeDLSDatafilesTable {...match.params} />}
            />
            {/* ISIS routes */}
            <Route
              exact
              path={paths.toggle.isisInstrument}
              render={() => <ISISInstrumentsTable studyHierarchy={false} />}
            />
            <Route
              exact
              path={paths.toggle.isisFacilityCycle}
              render={({
                match,
              }: RouteComponentProps<{ instrumentId: string }>) => (
                <ISISFacilityCyclesTable
                  instrumentId={match.params.instrumentId}
                />
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
                  studyHierarchy={false}
                  instrumentId={match.params.instrumentId}
                  instrumentChildId={match.params.facilityCycleId}
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
              }>) => (
                <SafeISISDatasetsTable
                  studyHierarchy={false}
                  instrumentId={match.params.instrumentId}
                  instrumentChildId={match.params.facilityCycleId}
                  investigationId={match.params.investigationId}
                />
              )}
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
              }>) => (
                <SafeISISDatafilesTable
                  studyHierarchy={false}
                  instrumentId={match.params.instrumentId}
                  instrumentChildId={match.params.facilityCycleId}
                  investigationId={match.params.investigationId}
                  datasetId={match.params.datasetId}
                />
              )}
            />
            {/* ISIS studyHierarchy routes */}
            <Route
              exact
              path={paths.studyHierarchy.toggle.isisInstrument}
              render={() => <ISISInstrumentsTable studyHierarchy={true} />}
            />
            <Route
              exact
              path={paths.studyHierarchy.toggle.isisStudy}
              render={({
                match,
              }: RouteComponentProps<{ instrumentId: string }>) => (
                <ISISStudiesTable instrumentId={match.params.instrumentId} />
              )}
            />
            <Route
              exact
              path={paths.studyHierarchy.toggle.isisInvestigation}
              render={({
                match,
              }: RouteComponentProps<{
                instrumentId: string;
                studyId: string;
              }>) => (
                <ISISInvestigationsTable
                  studyHierarchy={true}
                  instrumentId={match.params.instrumentId}
                  instrumentChildId={match.params.studyId}
                />
              )}
            />
            <Route
              exact
              path={paths.studyHierarchy.toggle.isisDataset}
              render={({
                match,
              }: RouteComponentProps<{
                instrumentId: string;
                studyId: string;
                investigationId: string;
              }>) => (
                <SafeISISDatasetsTable
                  studyHierarchy={true}
                  instrumentId={match.params.instrumentId}
                  instrumentChildId={match.params.studyId}
                  investigationId={match.params.investigationId}
                />
              )}
            />
            <Route
              exact
              path={paths.studyHierarchy.standard.isisDatafile}
              render={({
                match,
              }: RouteComponentProps<{
                instrumentId: string;
                studyId: string;
                investigationId: string;
                datasetId: string;
              }>) => (
                <SafeISISDatafilesTable
                  studyHierarchy={true}
                  instrumentId={match.params.instrumentId}
                  instrumentChildId={match.params.studyId}
                  investigationId={match.params.investigationId}
                  datasetId={match.params.datasetId}
                />
              )}
            />
            {/* Generic routes */}
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
              }>) => (
                <SafeDatafileTable
                  datasetId={match.params.datasetId}
                  investigationId={match.params.investigationId}
                />
              )}
            />
          </Switch>
        </Paper>
      </Route>
    );
  }
}

export default PageTable;
