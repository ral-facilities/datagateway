import React from 'react';
import { Location as LocationType } from 'history';
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

import InvestigationCardView from '../views/card/investigationCardView.component';
import DatasetCardView from '../views/card/datasetCardView.component';

import ISISInstrumentsCardView from '../views/card/isis/isisInstrumentsCardView.component';
import ISISStudiesCardView from '../views/card/isis/isisStudiesCardView.component';
import ISISStudyLanding from '../views/landing/isis/isisStudyLanding.component';
import ISISFacilityCyclesCardView from '../views/card/isis/isisFacilityCyclesCardView.component';
import ISISInvestigationsCardView from '../views/card/isis/isisInvestigationsCardView.component';
import ISISInvestigationLanding from '../views/landing/isis/isisInvestigationLanding.component';
import ISISDatasetsCardView from '../views/card/isis/isisDatasetsCardView.component';
import ISISDatasetLanding from '../views/landing/isis/isisDatasetLanding.component';

import DLSProposalsCardView from '../views/card/dls/dlsProposalsCardView.component';
import DLSVisitsCardView from '../views/card/dls/dlsVisitsCardView.component';
import DLSDatasetsCardView from '../views/card/dls/dlsDatasetsCardView.component';

import withIdCheck from './withIdCheck';
import {
  checkProposalName,
  checkInvestigationId,
  checkInstrumentAndFacilityCycleId,
  checkInstrumentAndStudyId,
} from './idCheckFunctions';

import { paths } from './pageContainer.component';
import { ViewsType } from 'datagateway-common';

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

const SafeISISDatasetLanding = React.memo(
  (props: {
    instrumentId: string;
    instrumentChildId: string;
    investigationId: string;
    datasetId: string;
    studyHierarchy: boolean;
  }): React.ReactElement => {
    const SafeISISDatasetLanding = props.studyHierarchy
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
        )(ISISDatasetLanding)
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
        )(ISISDatasetLanding);

    return <SafeISISDatasetLanding {...props} />;
  }
);
SafeISISDatasetLanding.displayName = 'SafeISISDatasetLanding';

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

const SafeISISInvestigationLanding = React.memo(
  (props: {
    instrumentId: string;
    instrumentChildId: string;
    investigationId: string;
    studyHierarchy: boolean;
  }): React.ReactElement => {
    const SafeISISInvestigationLanding = props.studyHierarchy
      ? withIdCheck(
          checkInstrumentAndStudyId(
            parseInt(props.instrumentId),
            parseInt(props.instrumentChildId),
            parseInt(props.investigationId)
          )
        )(ISISInvestigationLanding)
      : withIdCheck(
          checkInstrumentAndFacilityCycleId(
            parseInt(props.instrumentId),
            parseInt(props.instrumentChildId),
            parseInt(props.investigationId)
          )
        )(ISISInvestigationLanding);

    return <SafeISISInvestigationLanding {...props} />;
  }
);
SafeISISInvestigationLanding.displayName = 'SafeISISInvestigationLanding';

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

interface PageRoutingProps {
  view: ViewsType;
  location: LocationType;
}

class PageRouting extends React.PureComponent<PageRoutingProps> {
  public render(): React.ReactNode {
    return (
      <Switch location={this.props.location}>
        <Route
          exact
          path="/"
          render={() =>
            this.props.view === 'card' ? (
              <Link to={paths.toggle.investigation + '?view=card'}>
                Browse investigations
              </Link>
            ) : (
              <Link to={paths.toggle.investigation}>Browse investigations</Link>
            )
          }
        />

        {/* My Data routes */}
        <Route path={paths.myData.dls} component={DLSMyDataTable} />
        <Route path={paths.myData.isis} component={ISISMyDataTable} />

        {/* DLS routes */}
        <Route
          exact
          path={paths.toggle.dlsProposal}
          component={
            this.props.view === 'card'
              ? DLSProposalsCardView
              : DLSProposalsTable
          }
        />
        <Route
          exact
          path={paths.toggle.dlsVisit}
          render={({
            match,
          }: RouteComponentProps<{
            [x: string]: string | undefined;
          }>) =>
            this.props.view === 'card' ? (
              <DLSVisitsCardView
                proposalName={match.params.proposalName as string}
              />
            ) : (
              <DLSVisitsTable
                proposalName={match.params.proposalName as string}
              />
            )
          }
        />
        <Route
          exact
          path={paths.toggle.dlsDataset}
          render={({ match }) =>
            this.props.view === 'card' ? (
              <SafeDLSDatasetsCardView
                proposalName={match.params.proposalName as string}
                investigationId={match.params.investigationId as string}
              />
            ) : (
              <SafeDLSDatasetsTable
                proposalName={match.params.proposalName as string}
                investigationId={match.params.investigationId as string}
              />
            )
          }
        />
        <Route
          exact
          path={paths.standard.dlsDatafile}
          render={({ match }) => (
            <SafeDLSDatafilesTable
              proposalName={match.params.proposalName as string}
              investigationId={match.params.investigationId as string}
              datasetId={match.params.datasetId as string}
            />
          )}
        />

        {/* ISIS studyHierarchy routes */}
        <Route
          exact
          path={paths.studyHierarchy.toggle.isisInstrument}
          render={() =>
            this.props.view === 'card' ? (
              <ISISInstrumentsCardView studyHierarchy={true} />
            ) : (
              <ISISInstrumentsTable studyHierarchy={true} />
            )
          }
        />
        <Route
          exact
          path={paths.studyHierarchy.toggle.isisStudy}
          render={({ match }) =>
            this.props.view === 'card' ? (
              <ISISStudiesCardView
                instrumentId={match.params.instrumentId as string}
              />
            ) : (
              <ISISStudiesTable
                instrumentId={match.params.instrumentId as string}
              />
            )
          }
        />
        <Route
          exact
          path={paths.studyHierarchy.landing.isisStudyLanding}
          render={({ match }) => (
            <ISISStudyLanding
              instrumentId={match.params.instrumentId as string}
              studyId={match.params.studyId as string}
            />
          )}
        />
        <Route
          exact
          path={paths.studyHierarchy.toggle.isisInvestigation}
          render={({ match }) =>
            this.props.view === 'card' ? (
              <ISISInvestigationsCardView
                studyHierarchy={true}
                instrumentId={match.params.instrumentId as string}
                instrumentChildId={match.params.studyId as string}
              />
            ) : (
              <ISISInvestigationsTable
                studyHierarchy={true}
                instrumentId={match.params.instrumentId as string}
                instrumentChildId={match.params.studyId as string}
              />
            )
          }
        />
        <Route
          exact
          path={paths.studyHierarchy.landing.isisInvestigationLanding}
          render={({ match }) => (
            <SafeISISInvestigationLanding
              studyHierarchy={true}
              instrumentId={match.params.instrumentId as string}
              instrumentChildId={match.params.studyId as string}
              investigationId={match.params.investigationId as string}
            />
          )}
        />
        <Route
          exact
          path={paths.studyHierarchy.toggle.isisDataset}
          render={({ match }) =>
            this.props.view === 'card' ? (
              <SafeISISDatasetsCardView
                studyHierarchy={true}
                instrumentId={match.params.instrumentId as string}
                instrumentChildId={match.params.studyId as string}
                investigationId={match.params.investigationId as string}
              />
            ) : (
              <SafeISISDatasetsTable
                studyHierarchy={true}
                instrumentId={match.params.instrumentId as string}
                instrumentChildId={match.params.studyId as string}
                investigationId={match.params.investigationId as string}
              />
            )
          }
        />
        <Route
          exact
          path={paths.studyHierarchy.landing.isisDatasetLanding}
          render={({ match }) => (
            <SafeISISDatasetLanding
              studyHierarchy={true}
              instrumentId={match.params.instrumentId as string}
              instrumentChildId={match.params.studyId as string}
              investigationId={match.params.investigationId as string}
              datasetId={match.params.datasetId as string}
            />
          )}
        />
        <Route
          exact
          path={paths.studyHierarchy.standard.isisDatafile}
          render={({ match }) => (
            <SafeISISDatafilesTable
              studyHierarchy={true}
              instrumentId={match.params.instrumentId as string}
              instrumentChildId={match.params.studyId as string}
              investigationId={match.params.investigationId as string}
              datasetId={match.params.datasetId as string}
            />
          )}
        />

        {/* ISIS routes */}
        <Route
          exact
          path={paths.toggle.isisInstrument}
          render={() =>
            this.props.view === 'card' ? (
              <ISISInstrumentsCardView studyHierarchy={false} />
            ) : (
              <ISISInstrumentsTable studyHierarchy={false} />
            )
          }
        />
        <Route
          exact
          path={paths.toggle.isisFacilityCycle}
          render={({ match }) =>
            this.props.view === 'card' ? (
              <ISISFacilityCyclesCardView
                instrumentId={match.params.instrumentId as string}
              />
            ) : (
              <ISISFacilityCyclesTable
                instrumentId={match.params.instrumentId as string}
              />
            )
          }
        />
        <Route
          exact
          path={paths.toggle.isisInvestigation}
          render={({ match }) =>
            this.props.view === 'card' ? (
              <ISISInvestigationsCardView
                studyHierarchy={false}
                instrumentId={match.params.instrumentId as string}
                instrumentChildId={match.params.facilityCycleId as string}
              />
            ) : (
              <ISISInvestigationsTable
                studyHierarchy={false}
                instrumentId={match.params.instrumentId as string}
                instrumentChildId={match.params.facilityCycleId as string}
              />
            )
          }
        />
        <Route
          exact
          path={paths.landing.isisInvestigationLanding}
          render={({ match }) => (
            <SafeISISInvestigationLanding
              studyHierarchy={false}
              instrumentId={match.params.instrumentId as string}
              instrumentChildId={match.params.facilityCycleId as string}
              investigationId={match.params.investigationId as string}
            />
          )}
        />
        <Route
          exact
          path={paths.toggle.isisDataset}
          render={({ match }) =>
            this.props.view === 'card' ? (
              <SafeISISDatasetsCardView
                studyHierarchy={false}
                instrumentId={match.params.instrumentId as string}
                instrumentChildId={match.params.facilityCycleId as string}
                investigationId={match.params.investigationId as string}
              />
            ) : (
              <SafeISISDatasetsTable
                studyHierarchy={false}
                instrumentId={match.params.instrumentId as string}
                instrumentChildId={match.params.facilityCycleId as string}
                investigationId={match.params.investigationId as string}
              />
            )
          }
        />
        <Route
          exact
          path={paths.landing.isisDatasetLanding}
          render={({ match }) => (
            <SafeISISDatasetLanding
              studyHierarchy={false}
              instrumentId={match.params.instrumentId as string}
              instrumentChildId={match.params.facilityCycleId as string}
              investigationId={match.params.investigationId as string}
              datasetId={match.params.datasetId as string}
            />
          )}
        />
        <Route
          exact
          path={paths.standard.isisDatafile}
          render={({ match }) => (
            <SafeISISDatafilesTable
              studyHierarchy={false}
              instrumentId={match.params.instrumentId as string}
              instrumentChildId={match.params.facilityCycleId as string}
              investigationId={match.params.investigationId as string}
              datasetId={match.params.datasetId as string}
            />
          )}
        />

        {/* Generic routes */}
        <Route
          exact
          path={paths.toggle.investigation}
          component={
            this.props.view === 'card'
              ? InvestigationCardView
              : InvestigationTable
          }
        />
        <Route
          exact
          path={paths.toggle.dataset}
          render={({ match }) =>
            this.props.view === 'card' ? (
              <DatasetCardView
                investigationId={match.params.investigationId as string}
              />
            ) : (
              <DatasetTable
                investigationId={match.params.investigationId as string}
              />
            )
          }
        />
        <Route
          exact
          path={paths.standard.datafile}
          render={({ match }) => (
            <SafeDatafileTable
              datasetId={match.params.datasetId as string}
              investigationId={match.params.investigationId as string}
            />
          )}
        />
      </Switch>
    );
  }
}

export default PageRouting;
