import React from 'react';
import { Switch, Route, RouteComponentProps } from 'react-router';

import InvestigationCardView from '../views/card/investigationCardView.component';
import DatasetCardView from '../views/card/datasetCardView.component';
import DatafileTable from '../views/table/datafileTable.component';

import ISISInstrumentsCardView from '../views/card/isis/isisInstrumentsCardView.component';
import ISISStudiesCardView from '../views/card/isis/isisStudiesCardView.component';
import ISISFacilityCyclesCardView from '../views/card/isis/isisFacilityCyclesCardView.component';
import ISISInvestigationsCardView from '../views/card/isis/isisInvestigationsCardView.component';
import ISISDatasetsCardView from '../views/card/isis/isisDatasetsCardView.component';
import ISISDatafilesTable from '../views/table/isis/isisDatafilesTable.component';

import DLSProposalsCardView from '../views/card/dls/dlsProposalsCardView.component';
import DLSVisitsCardView from '../views/card/dls/dlsVisitsCardView.component';
import DLSDatasetsCardView from '../views/card/dls/dlsDatasetsCardView.component';
import DLSDatafilesTable from '../views/table/dls/dlsDatafilesTable.component';

import { paths } from './pageContainer.component';

import withIdCheck from './withIdCheck';
import {
  checkProposalName,
  checkInstrumentAndFacilityCycleId,
  checkInvestigationId,
  checkInstrumentAndStudyId,
} from './idCheckFunctions';
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

    return (
      <Paper
        square
        style={{
          height: 'calc(100vh - 150px)',
          width: '100%',
          backgroundColor: 'inherit',
          overflowX: 'auto',
        }}
      >
        <SafeDatafileTable datasetId={props.datasetId} />
      </Paper>
    );
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

    return (
      <Paper
        square
        style={{
          height: 'calc(100vh - 150px)',
          width: '100%',
          backgroundColor: 'inherit',
          overflowX: 'auto',
        }}
      >
        <SafeISISDatafilesTable datasetId={props.datasetId} />
      </Paper>
    );
  }
);
SafeISISDatafilesTable.displayName = 'SafeISISDatafilesTable';

const SafeISISDatasetsCardView = React.memo(
  (props: {
    instrumentId: string;
    instrumentChildId: string;
    investigationId: string;
    studyHierarchy: boolean;
  }): React.ReactElement => {
    const SafeISISDatasetsCardView = props.studyHierarchy
      ? withIdCheck(
          checkInstrumentAndStudyId(
            parseInt(props.instrumentId),
            parseInt(props.instrumentChildId),
            parseInt(props.investigationId)
          )
        )(ISISDatasetsCardView)
      : withIdCheck(
          checkInstrumentAndFacilityCycleId(
            parseInt(props.instrumentId),
            parseInt(props.instrumentChildId),
            parseInt(props.investigationId)
          )
        )(ISISDatasetsCardView);

    return <SafeISISDatasetsCardView {...props} />;
  }
);
SafeISISDatasetsCardView.displayName = 'SafeISISDatasetsCardView';

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

    return (
      <Paper
        square
        style={{
          height: 'calc(100vh - 150px)',
          width: '100%',
          backgroundColor: 'inherit',
          overflowX: 'auto',
        }}
      >
        <SafeDLSDatafilesTable datasetId={props.datasetId} />
      </Paper>
    );
  }
);
SafeDLSDatafilesTable.displayName = 'SafeDLSDatafilesTable';

const SafeDLSDatasetsCardView = React.memo(
  (props: {
    proposalName: string;
    investigationId: string;
  }): React.ReactElement => {
    const SafeDLSDatasetsCardView = withIdCheck(
      checkProposalName(props.proposalName, parseInt(props.investigationId))
    )(DLSDatasetsCardView);

    return (
      <SafeDLSDatasetsCardView
        proposalName={props.proposalName}
        investigationId={props.investigationId}
      />
    );
  }
);
SafeDLSDatasetsCardView.displayName = 'SafeDLSDatasetsCardView';

class PageCard extends React.Component {
  public render(): React.ReactNode {
    return (
      <Switch>
        {/* Generic routes */}
        <Route
          exact
          path={paths.toggle.investigation}
          render={() => <InvestigationCardView />}
        />
        <Route
          exact
          path={paths.toggle.dataset}
          render={({
            match,
          }: RouteComponentProps<{ investigationId: string }>) => (
            <DatasetCardView investigationId={match.params.investigationId} />
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
        {/* ISIS routes */}
        <Route
          exact
          path={paths.toggle.isisInstrument}
          render={() => <ISISInstrumentsCardView studyHierarchy={false} />}
        />
        <Route
          exact
          path={paths.toggle.isisFacilityCycle}
          render={({
            match,
          }: RouteComponentProps<{ instrumentId: string }>) => (
            <ISISFacilityCyclesCardView
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
            <ISISInvestigationsCardView
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
            <SafeISISDatasetsCardView
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
          render={() => <ISISInstrumentsCardView studyHierarchy={true} />}
        />
        <Route
          exact
          path={paths.studyHierarchy.toggle.isisStudy}
          render={({
            match,
          }: RouteComponentProps<{ instrumentId: string }>) => (
            <ISISStudiesCardView instrumentId={match.params.instrumentId} />
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
            <ISISInvestigationsCardView
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
            <SafeISISDatasetsCardView
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
              studyHierarchy={false}
              instrumentId={match.params.instrumentId}
              instrumentChildId={match.params.studyId}
              investigationId={match.params.investigationId}
              datasetId={match.params.datasetId}
            />
          )}
        />
        {/* DLS routes */}
        <Route
          exact
          path={paths.toggle.dlsDataset}
          render={({
            match,
          }: RouteComponentProps<{
            proposalName: string;
            investigationId: string;
          }>) => (
            <SafeDLSDatasetsCardView
              proposalName={match.params.proposalName}
              investigationId={match.params.investigationId}
            />
          )}
        />
        <Route
          exact
          path={paths.toggle.dlsProposal}
          component={DLSProposalsCardView}
        />
        <Route
          exact
          path={paths.toggle.dlsVisit}
          render={({
            match,
          }: RouteComponentProps<{ proposalName: string }>) => (
            <DLSVisitsCardView proposalName={match.params.proposalName} />
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
    );
  }
}

export default PageCard;
