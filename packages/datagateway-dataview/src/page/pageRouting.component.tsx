import React from 'react';
import type { Location as LocationType } from 'history';
import {
  Switch,
  Route,
  type RouteComponentProps,
  Redirect,
  Link,
} from 'react-router-dom';
import DatafilePreviewer from '../views/datafilePreview/datafilePreviewer.component';

import InvestigationTable from '../views/table/investigationTable.component';
import DatasetTable from '../views/table/datasetTable.component';
import DatafileTable from '../views/table/datafileTable.component';

import DLSProposalsTable from '../views/table/dls/dlsProposalsTable.component';
import DLSVisitsTable from '../views/table/dls/dlsVisitsTable.component';
import DLSDatasetsTable from '../views/table/dls/dlsDatasetsTable.component';
import DLSDatafilesTable from '../views/table/dls/dlsDatafilesTable.component';

import ISISInstrumentsTable from '../views/table/isis/isisInstrumentsTable.component';
import ISISDataPublicationsTable from '../views/table/isis/isisDataPublicationsTable.component';
import ISISFacilityCyclesTable from '../views/table/isis/isisFacilityCyclesTable.component';
import ISISInvestigationsTable from '../views/table/isis/isisInvestigationsTable.component';
import ISISDatasetsTable from '../views/table/isis/isisDatasetsTable.component';
import ISISDatafilesTable from '../views/table/isis/isisDatafilesTable.component';

import DLSMyDataTable from '../views/table/dls/dlsMyDataTable.component';
import ISISMyDataTable from '../views/table/isis/isisMyDataTable.component';

import InvestigationCardView from '../views/card/investigationCardView.component';
import DatasetCardView from '../views/card/datasetCardView.component';

import ISISInstrumentsCardView from '../views/card/isis/isisInstrumentsCardView.component';
import ISISDataPublicationsCardView from '../views/card/isis/isisDataPublicationsCardView.component';
import ISISDataPublicationLanding from '../views/landing/isis/isisDataPublicationLanding.component';
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
  checkInstrumentId,
  checkDataPublicationId,
  checkDatafileId,
} from './idCheckFunctions';

import { paths } from './pageContainer.component';
import type { ViewsType } from 'datagateway-common';

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
      <SafeDatafileTable
        datasetId={props.datasetId}
        investigationId={props.investigationId}
      />
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
    dataPublication: boolean;
  }): React.ReactElement => {
    const SafeISISDatafilesTable = props.dataPublication
      ? withIdCheck(
          Promise.all([
            checkInstrumentId(
              parseInt(props.instrumentId),
              parseInt(props.instrumentChildId)
            ),
            checkDataPublicationId(
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
          ]).then((values) => !values.includes(false))
        )(ISISDatafilesTable);

    return (
      <SafeISISDatafilesTable
        datasetId={props.datasetId}
        investigationId={props.investigationId}
      />
    );
  }
);
SafeISISDatafilesTable.displayName = 'SafeISISDatafilesTable';

const SafeISISDatasetLanding = React.memo(
  (props: {
    instrumentId: string;
    instrumentChildId: string;
    investigationId: string;
    datasetId: string;
    dataPublication: boolean;
  }): React.ReactElement => {
    const SafeISISDatasetLanding = props.dataPublication
      ? withIdCheck(
          Promise.all([
            checkInstrumentId(
              parseInt(props.instrumentId),
              parseInt(props.instrumentChildId)
            ),
            checkDataPublicationId(
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
    dataPublication: boolean;
  }): React.ReactElement => {
    const SafeISISDatasetsTable = props.dataPublication
      ? withIdCheck(
          Promise.all([
            checkInstrumentId(
              parseInt(props.instrumentId),
              parseInt(props.instrumentChildId)
            ),
            checkDataPublicationId(
              parseInt(props.instrumentChildId),
              parseInt(props.investigationId)
            ),
          ]).then((values) => !values.includes(false))
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
    dataPublication: boolean;
  }): React.ReactElement => {
    const SafeISISDatasetsCardView = props.dataPublication
      ? withIdCheck(
          Promise.all([
            checkInstrumentId(
              parseInt(props.instrumentId),
              parseInt(props.instrumentChildId)
            ),
            checkDataPublicationId(
              parseInt(props.instrumentChildId),
              parseInt(props.investigationId)
            ),
          ]).then((values) => !values.includes(false))
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
    dataPublication: boolean;
  }): React.ReactElement => {
    const SafeISISInvestigationLanding = props.dataPublication
      ? withIdCheck(
          Promise.all([
            checkInstrumentId(
              parseInt(props.instrumentId),
              parseInt(props.instrumentChildId)
            ),
            checkDataPublicationId(
              parseInt(props.instrumentChildId),
              parseInt(props.investigationId)
            ),
          ]).then((values) => !values.includes(false))
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

const SafeISISDataPublicationLanding = React.memo(
  (props: {
    instrumentId: string;
    dataPublicationId: string;
  }): React.ReactElement => {
    const SafeISISDataPublicationLanding = withIdCheck(
      checkInstrumentId(
        parseInt(props.instrumentId),
        parseInt(props.dataPublicationId)
      )
    )(ISISDataPublicationLanding);

    return <SafeISISDataPublicationLanding {...props} />;
  }
);
SafeISISDataPublicationLanding.displayName = 'SafeISISDataPublicationLanding';

const SafeDLSDatafilesTable = React.memo(
  (props: {
    proposalName: string;
    investigationId: string;
    datasetId: string;
  }): React.ReactElement => {
    const SafeDLSDatafilesTable = withIdCheck(
      Promise.all([
        checkProposalName(props.proposalName, parseInt(props.investigationId)),
      ]).then((values) => !values.includes(false))
    )(DLSDatafilesTable);

    return (
      <SafeDLSDatafilesTable
        datasetId={props.datasetId}
        investigationId={props.investigationId}
      />
    );
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

const SafeDatafilePreviewer = React.memo(
  (props: {
    instrumentId: string;
    instrumentChildId: string;
    investigationId: string;
    datasetId: string;
    datafileId: string;
  }): React.ReactElement => {
    const SafeDatafilePreviewer = withIdCheck(
      Promise.all([
        checkInstrumentAndFacilityCycleId(
          parseInt(props.instrumentId),
          parseInt(props.instrumentChildId),
          parseInt(props.investigationId)
        ),
        checkDatafileId(
          parseInt(props.investigationId),
          parseInt(props.datasetId),
          parseInt(props.datafileId)
        ),
      ]).then((checks) => checks.every((passes) => passes))
    )(DatafilePreviewer);

    return <SafeDatafilePreviewer datafileId={parseInt(props.datafileId)} />;
  }
);
SafeDatafilePreviewer.displayName = 'SafeDatafilePreviewer';

interface PageRoutingProps {
  view: ViewsType;
  location: LocationType;
  loggedInAnonymously: boolean;
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

        <Route exact path={paths.myData.dls}>
          {this.props.loggedInAnonymously === true ? (
            <Redirect to={'/login'} />
          ) : (
            <DLSMyDataTable />
          )}
        </Route>

        <Route exact path={paths.myData.isis}>
          {this.props.loggedInAnonymously === true ? (
            <Redirect to={'/login'} />
          ) : (
            <ISISMyDataTable />
          )}
        </Route>

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

        {/* ISIS dataPublications routes */}
        <Route
          exact
          path={paths.dataPublications.toggle.isisInstrument}
          render={() =>
            this.props.view === 'card' ? (
              <ISISInstrumentsCardView dataPublication={true} key="true" />
            ) : (
              <ISISInstrumentsTable dataPublication={true} key="true" />
            )
          }
        />
        <Route
          exact
          path={paths.dataPublications.toggle.isisDataPublication}
          render={({ match }) =>
            this.props.view === 'card' ? (
              <ISISDataPublicationsCardView
                instrumentId={match.params.instrumentId as string}
              />
            ) : (
              <ISISDataPublicationsTable
                instrumentId={match.params.instrumentId as string}
              />
            )
          }
        />
        <Route
          exact
          path={paths.dataPublications.landing.isisDataPublicationLanding}
          render={({ match }) => (
            <SafeISISDataPublicationLanding
              instrumentId={match.params.instrumentId as string}
              dataPublicationId={match.params.dataPublicationId as string}
            />
          )}
        />
        <Route
          exact
          path={paths.dataPublications.toggle.isisInvestigation}
          render={({ match }) =>
            this.props.view === 'card' ? (
              <ISISInvestigationsCardView
                dataPublication={true}
                instrumentId={match.params.instrumentId as string}
                instrumentChildId={match.params.dataPublicationId as string}
              />
            ) : (
              <ISISInvestigationsTable
                dataPublication={true}
                instrumentId={match.params.instrumentId as string}
                instrumentChildId={match.params.dataPublicationId as string}
              />
            )
          }
        />
        <Route
          exact
          path={paths.dataPublications.landing.isisInvestigationLanding}
          render={({ match }) => (
            <SafeISISInvestigationLanding
              dataPublication={true}
              instrumentId={match.params.instrumentId as string}
              instrumentChildId={match.params.dataPublicationId as string}
              investigationId={match.params.investigationId as string}
            />
          )}
        />
        <Route
          exact
          path={paths.dataPublications.toggle.isisDataset}
          render={({ match }) =>
            this.props.view === 'card' ? (
              <SafeISISDatasetsCardView
                dataPublication={true}
                instrumentId={match.params.instrumentId as string}
                instrumentChildId={match.params.dataPublicationId as string}
                investigationId={match.params.investigationId as string}
              />
            ) : (
              <SafeISISDatasetsTable
                dataPublication={true}
                instrumentId={match.params.instrumentId as string}
                instrumentChildId={match.params.dataPublicationId as string}
                investigationId={match.params.investigationId as string}
              />
            )
          }
        />
        <Route
          exact
          path={paths.dataPublications.landing.isisDatasetLanding}
          render={({ match }) => (
            <SafeISISDatasetLanding
              dataPublication={true}
              instrumentId={match.params.instrumentId as string}
              instrumentChildId={match.params.dataPublicationId as string}
              investigationId={match.params.investigationId as string}
              datasetId={match.params.datasetId as string}
            />
          )}
        />
        <Route
          exact
          path={paths.dataPublications.standard.isisDatafile}
          render={({ match }) => (
            <SafeISISDatafilesTable
              dataPublication={true}
              instrumentId={match.params.instrumentId as string}
              instrumentChildId={match.params.dataPublicationId as string}
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
              <ISISInstrumentsCardView dataPublication={false} key="false" />
            ) : (
              <ISISInstrumentsTable dataPublication={false} key="false" />
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
                dataPublication={false}
                instrumentId={match.params.instrumentId as string}
                instrumentChildId={match.params.facilityCycleId as string}
              />
            ) : (
              <ISISInvestigationsTable
                dataPublication={false}
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
              dataPublication={false}
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
                dataPublication={false}
                instrumentId={match.params.instrumentId as string}
                instrumentChildId={match.params.facilityCycleId as string}
                investigationId={match.params.investigationId as string}
              />
            ) : (
              <SafeISISDatasetsTable
                dataPublication={false}
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
              dataPublication={false}
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
              dataPublication={false}
              instrumentId={match.params.instrumentId as string}
              instrumentChildId={match.params.facilityCycleId as string}
              investigationId={match.params.investigationId as string}
              datasetId={match.params.datasetId as string}
            />
          )}
        />
        <Route
          exact
          path={paths.preview.isisDatafilePreview}
          render={({ match }) => (
            <SafeDatafilePreviewer
              instrumentId={match.params.instrumentId as string}
              instrumentChildId={match.params.facilityCycleId as string}
              investigationId={match.params.investigationId as string}
              datasetId={match.params.datasetId as string}
              datafileId={match.params.datafileId as string}
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
