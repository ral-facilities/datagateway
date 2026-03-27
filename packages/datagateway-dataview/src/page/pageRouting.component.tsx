import type { Location as LocationType } from 'history';
import React from 'react';
import {
  Link,
  Redirect,
  Route,
  Switch,
  type RouteComponentProps,
} from 'react-router-dom';
import DatafilePreviewer from '../views/datafilePreview/datafilePreviewer.component';

import DatafileTable from '../views/table/datafileTable.component';
import DatasetTable from '../views/table/datasetTable.component';
import InvestigationTable from '../views/table/investigationTable.component';

import DLSDatafilesTable from '../views/table/dls/dlsDatafilesTable.component';
import DLSDatasetsTable from '../views/table/dls/dlsDatasetsTable.component';
import DLSProposalsTable from '../views/table/dls/dlsProposalsTable.component';
import DLSVisitsTable from '../views/table/dls/dlsVisitsTable.component';

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
import ISISDatasetLanding from '../views/landing/isis/isisDatasetLanding.component';
import ISISInvestigationLanding from '../views/landing/isis/isisInvestigationLanding.component';

import DLSDatasetsCardView from '../views/card/dls/dlsDatasetsCardView.component';
import DLSProposalsCardView from '../views/card/dls/dlsProposalsCardView.component';
import DLSVisitsCardView from '../views/card/dls/dlsVisitsCardView.component';
import DLSDataPublicationLanding from '../views/landing/dls/dlsDataPublicationLanding.component';

import {
  checkDatasetId,
  checkInstrumentAndFacilityCycleId,
  checkInstrumentId,
  checkInvestigationId,
  checkProposalName,
  checkStudyDataPublicationId,
} from './idCheckFunctions';

import { useDataPublication, ViewsType } from 'datagateway-common';
import DLSDataPublicationEditForm from '../views/landing/dls/dlsDataPublicationEditForm.component';
import { paths } from './pageContainer.component';
import WithIdCheck from './withIdCheck';

const SafeISISDatafilesTable = (props: {
  instrumentId: string;
  instrumentChildId: string;
  investigationId: string;
  datasetId: string;
  dataPublication: boolean;
}): React.ReactElement => {
  const { data, isPending } = useDataPublication(
    parseInt(props.investigationId),
    props.dataPublication
  );
  const dataPublicationInvestigationId =
    data?.content?.dataCollectionInvestigations?.[0]?.investigation?.id;

  const checkingPromise = props.dataPublication
    ? Promise.all([
        checkInstrumentId(
          parseInt(props.instrumentId),
          parseInt(props.instrumentChildId)
        ),
        checkStudyDataPublicationId(
          parseInt(props.instrumentChildId),
          parseInt(props.investigationId)
        ),
        checkInvestigationId(
          dataPublicationInvestigationId ?? -1,
          parseInt(props.datasetId)
        ),
        ...(isPending ? [new Promise(() => undefined)] : []),
      ]).then((values) => !values.includes(false))
    : Promise.all([
        checkInstrumentAndFacilityCycleId(
          parseInt(props.instrumentId),
          parseInt(props.instrumentChildId),
          parseInt(props.investigationId)
        ),
        checkInvestigationId(
          parseInt(props.investigationId),
          parseInt(props.datasetId)
        ),
      ]).then((values) => !values.includes(false));

  return (
    <WithIdCheck checkingPromise={checkingPromise}>
      <ISISDatafilesTable
        datasetId={props.datasetId}
        investigationId={
          dataPublicationInvestigationId
            ? dataPublicationInvestigationId.toString()
            : props.investigationId
        }
      />
    </WithIdCheck>
  );
};

const SafeISISDatasetLanding = (props: {
  instrumentId: string;
  instrumentChildId: string;
  investigationId: string;
  datasetId: string;
  dataPublication: boolean;
}): React.ReactElement => {
  const { data, isPending } = useDataPublication(
    parseInt(props.investigationId),
    props.dataPublication
  );
  const dataPublicationInvestigationId =
    data?.content?.dataCollectionInvestigations?.[0]?.investigation?.id;

  const checkingPromise = props.dataPublication
    ? Promise.all([
        checkInstrumentId(
          parseInt(props.instrumentId),
          parseInt(props.instrumentChildId)
        ),
        checkStudyDataPublicationId(
          parseInt(props.instrumentChildId),
          parseInt(props.investigationId)
        ),
        checkInvestigationId(
          dataPublicationInvestigationId ?? -1,
          parseInt(props.datasetId)
        ),
        ...(isPending ? [new Promise(() => undefined)] : []),
      ]).then((values) => !values.includes(false))
    : Promise.all([
        checkInstrumentAndFacilityCycleId(
          parseInt(props.instrumentId),
          parseInt(props.instrumentChildId),
          parseInt(props.investigationId)
        ),
        checkInvestigationId(
          parseInt(props.investigationId),
          parseInt(props.datasetId)
        ),
      ]).then((values) => !values.includes(false));

  return (
    <WithIdCheck checkingPromise={checkingPromise}>
      <ISISDatasetLanding datasetId={props.datasetId} />
    </WithIdCheck>
  );
};

const SafeISISDatasetsTable = (props: {
  instrumentId: string;
  instrumentChildId: string;
  investigationId: string;
  dataPublication: boolean;
}): React.ReactElement => {
  const { data, isPending } = useDataPublication(
    parseInt(props.investigationId),

    props.dataPublication
  );

  const dataPublicationInvestigationId =
    data?.content?.dataCollectionInvestigations?.[0]?.investigation?.id;

  const checkingPromise = props.dataPublication
    ? Promise.all([
        checkInstrumentId(
          parseInt(props.instrumentId),
          parseInt(props.instrumentChildId)
        ),
        checkStudyDataPublicationId(
          parseInt(props.instrumentChildId),
          parseInt(props.investigationId)
        ),
        ...(isPending ? [new Promise(() => undefined)] : []),
      ]).then((values) => !values.includes(false))
    : checkInstrumentAndFacilityCycleId(
        parseInt(props.instrumentId),
        parseInt(props.instrumentChildId),
        parseInt(props.investigationId)
      );

  return (
    <WithIdCheck checkingPromise={checkingPromise}>
      <ISISDatasetsTable
        investigationId={
          dataPublicationInvestigationId
            ? dataPublicationInvestigationId.toString()
            : props.investigationId
        }
      />
    </WithIdCheck>
  );
};

const SafeISISDatasetsCardView = (props: {
  instrumentId: string;
  instrumentChildId: string;
  investigationId: string;
  dataPublication: boolean;
}): React.ReactElement => {
  const { data, isPending } = useDataPublication(
    parseInt(props.investigationId),
    props.dataPublication
  );

  const dataPublicationInvestigationId =
    data?.content?.dataCollectionInvestigations?.[0]?.investigation?.id;

  const checkingPromise = props.dataPublication
    ? Promise.all([
        checkInstrumentId(
          parseInt(props.instrumentId),
          parseInt(props.instrumentChildId)
        ),
        checkStudyDataPublicationId(
          parseInt(props.instrumentChildId),
          parseInt(props.investigationId)
        ),
        ...(isPending ? [new Promise(() => undefined)] : []),
      ]).then((values) => !values.includes(false))
    : checkInstrumentAndFacilityCycleId(
        parseInt(props.instrumentId),
        parseInt(props.instrumentChildId),
        parseInt(props.investigationId)
      );

  return (
    <WithIdCheck checkingPromise={checkingPromise}>
      <ISISDatasetsCardView
        investigationId={
          dataPublicationInvestigationId
            ? dataPublicationInvestigationId.toString()
            : props.investigationId
        }
      />
    </WithIdCheck>
  );
};

const SafeISISInvestigationLanding = React.memo(
  (props: {
    instrumentId: string;
    instrumentChildId: string;
    investigationId: string;
    dataPublication: boolean;
  }): React.ReactElement => {
    const checkingPromise = props.dataPublication
      ? Promise.all([
          checkInstrumentId(
            parseInt(props.instrumentId),
            parseInt(props.instrumentChildId)
          ),
          checkStudyDataPublicationId(
            parseInt(props.instrumentChildId),
            parseInt(props.investigationId)
          ),
        ]).then((values) => !values.includes(false))
      : checkInstrumentAndFacilityCycleId(
          parseInt(props.instrumentId),
          parseInt(props.instrumentChildId),
          parseInt(props.investigationId)
        );

    return (
      <WithIdCheck checkingPromise={checkingPromise}>
        <ISISInvestigationLanding
          dataPublication={props.dataPublication}
          // for dataPublication views, investigationId = investigationDataPublicationId
          investigationId={props.investigationId}
        />
      </WithIdCheck>
    );
  }
);
SafeISISInvestigationLanding.displayName = 'SafeISISInvestigationLanding';

const SafeDatafilePreviewer = (props: {
  dataPublication: boolean;
  instrumentId: string;
  instrumentChildId: string;
  investigationId: string;
  datasetId: string;
  datafileId: string;
}): React.ReactElement => {
  const { data, isPending } = useDataPublication(
    parseInt(props.investigationId),
    props.dataPublication
  );

  const dataPublicationInvestigationId =
    data?.content?.dataCollectionInvestigations?.[0]?.investigation?.id;

  const checkingPromise = props.dataPublication
    ? Promise.all([
        checkInstrumentId(
          parseInt(props.instrumentId),
          parseInt(props.instrumentChildId)
        ),
        checkStudyDataPublicationId(
          parseInt(props.instrumentChildId),
          parseInt(props.investigationId)
        ),
        checkInvestigationId(
          dataPublicationInvestigationId ?? -1,
          parseInt(props.datasetId)
        ),
        checkDatasetId(parseInt(props.datasetId), parseInt(props.datafileId)),
        ...(isPending ? [new Promise(() => undefined)] : []),
      ]).then((values) => !values.includes(false))
    : Promise.all([
        checkInstrumentAndFacilityCycleId(
          parseInt(props.instrumentId),
          parseInt(props.instrumentChildId),
          parseInt(props.investigationId)
        ),
        checkInvestigationId(
          parseInt(props.investigationId),
          parseInt(props.datasetId)
        ),
        checkDatasetId(parseInt(props.datasetId), parseInt(props.datafileId)),
      ]).then((checks) => checks.every((passes) => passes));

  return (
    <WithIdCheck checkingPromise={checkingPromise}>
      <DatafilePreviewer datafileId={parseInt(props.datafileId)} />
    </WithIdCheck>
  );
};

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

        <Route exact path={paths.dataPublications.dls.myDOIs}>
          {this.props.loggedInAnonymously === true ? (
            <Redirect to={'/login'} />
          ) : (
            <DLSMyDOIsTable />
          )}
        </Route>

        <Route exact path={paths.dataPublications.dls.allDOIs}>
          <DLSAllDOIsTable />
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
          render={({ match }) => (
            <WithIdCheck
              checkingPromise={checkProposalName(
                match.params.proposalName as string,
                parseInt(match.params.investigationId as string)
              )}
            >
              {this.props.view === 'card' ? (
                <DLSDatasetsCardView
                  proposalName={match.params.proposalName as string}
                  investigationId={match.params.investigationId as string}
                />
              ) : (
                <DLSDatasetsTable
                  proposalName={match.params.proposalName as string}
                  investigationId={match.params.investigationId as string}
                />
              )}
            </WithIdCheck>
          )}
        />
        <Route
          exact
          path={paths.standard.dlsDatafile}
          render={({ match }) => (
            <WithIdCheck
              checkingPromise={Promise.all([
                checkProposalName(
                  match.params.proposalName as string,
                  parseInt(match.params.investigationId as string)
                ),
                checkInvestigationId(
                  parseInt(match.params.investigationId as string),
                  parseInt(match.params.datasetId as string)
                ),
              ]).then((values) => !values.includes(false))}
            >
              <DLSDatafilesTable
                investigationId={match.params.investigationId as string}
                datasetId={match.params.datasetId as string}
              />
            </WithIdCheck>
          )}
        />
        <Route
          exact
          path={paths.landing.dlsDataPublicationLanding}
          render={({ match }) => (
            <DLSDataPublicationLanding
              dataPublicationId={match.params.dataPublicationId as string}
            />
          )}
        />

        <Route
          exact
          path={paths.landing.dlsDataPublicationLanding + '/edit'}
          render={({ match }) => (
            <DLSDataPublicationEditForm
              dataPublicationId={match.params.dataPublicationId as string}
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
          path={paths.dataPublications.toggle.isisStudyDataPublication}
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
            <WithIdCheck
              checkingPromise={checkInstrumentId(
                parseInt(match.params.instrumentId as string),
                parseInt(match.params.dataPublicationId as string)
              )}
            >
              <ISISDataPublicationLanding
                dataPublicationId={match.params.dataPublicationId as string}
              />
            </WithIdCheck>
          )}
        />
        <Route
          exact
          path={paths.dataPublications.toggle.isisInvestigationDataPublication}
          render={({ match }) =>
            this.props.view === 'card' ? (
              <ISISDataPublicationsCardView
                instrumentId={match.params.instrumentId as string}
                studyDataPublicationId={
                  match.params.studyDataPublicationId as string
                }
              />
            ) : (
              <ISISDataPublicationsTable
                instrumentId={match.params.instrumentId as string}
                studyDataPublicationId={
                  match.params.studyDataPublicationId as string
                }
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
        <Route
          exact
          path={paths.preview.isisDataPublicationDatafilePreview}
          render={({ match }) => (
            <SafeDatafilePreviewer
              dataPublication={true}
              instrumentId={match.params.instrumentId as string}
              instrumentChildId={match.params.dataPublicationId as string}
              investigationId={match.params.investigationId as string}
              datasetId={match.params.datasetId as string}
              datafileId={match.params.datafileId as string}
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
                instrumentId={match.params.instrumentId as string}
                facilityCycleId={match.params.facilityCycleId as string}
              />
            ) : (
              <ISISInvestigationsTable
                instrumentId={match.params.instrumentId as string}
                facilityCycleId={match.params.facilityCycleId as string}
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
              dataPublication={false}
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
            <WithIdCheck
              checkingPromise={checkInvestigationId(
                parseInt(match.params.investigationId as string),
                parseInt(match.params.datasetId as string)
              )}
            >
              <DatafileTable
                datasetId={match.params.datasetId as string}
                investigationId={match.params.investigationId as string}
              />
            </WithIdCheck>
          )}
        />
      </Switch>
    );
  }
}

export default PageRouting;
