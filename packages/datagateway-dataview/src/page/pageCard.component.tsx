import React from 'react';
import { Switch, Route, RouteComponentProps } from 'react-router';

import InvestigationCardView from '../views/card/investigationCardView.component';
import DatasetCardView from '../views/card/datasetCardView.component';
import DatafileTable from '../views/table/datafileTable.component';

import ISISInstrumentsCardView from '../views/card/isis/isisInstrumentsCardView.component';
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
} from './idCheckFunctions';

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

SafeDatafileTable.displayName = 'SafeDatafileTable';

const SafeISISDatafilesTable = React.memo(
  (props: {
    instrumentId: string;
    facilityCycleId: string;
    investigationId: string;
    datasetId: string;
  }): React.ReactElement => {
    const SafeISISDatafilesTable = withIdCheck(
      Promise.all([
        checkInstrumentAndFacilityCycleId(
          parseInt(props.instrumentId),
          parseInt(props.facilityCycleId),
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

const SafeISISDatasetsCardView = React.memo(
  (props: {
    instrumentId: string;
    facilityCycleId: string;
    investigationId: string;
  }): React.ReactElement => {
    const SafeISISDatasetsCardView = withIdCheck(
      checkInstrumentAndFacilityCycleId(
        parseInt(props.instrumentId),
        parseInt(props.facilityCycleId),
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

    return <SafeDLSDatafilesTable datasetId={props.datasetId} />;
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
        <Route
          exact
          path={paths.toggle.isisInstrument}
          render={() => <ISISInstrumentsCardView />}
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
          }>) => (
            <SafeISISDatasetsCardView
              instrumentId={match.params.instrumentId}
              facilityCycleId={match.params.facilityCycleId}
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
          }>) => <SafeISISDatafilesTable {...match.params} />}
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
