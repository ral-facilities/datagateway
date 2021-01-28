import React from 'react';

import { Switch, Route, RouteComponentProps } from 'react-router';

import ISISStudyLanding from '../views/landing/isis/isisStudyLanding.component';
import ISISInvestigationLanding from '../views/landing/isis/isisInvestigationLanding.component';
import ISISDatasetLanding from '../views/landing/isis/isisDatasetLanding.component';
import {
  checkInstrumentAndFacilityCycleId,
  checkInstrumentAndStudyId,
  checkInvestigationId,
} from './idCheckFunctions';

import { paths } from './pageContainer.component';
import withIdCheck from './withIdCheck';

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

class PageLanding extends React.PureComponent {
  public render(): React.ReactNode {
    return (
      <Switch>
        {/* ISIS routes */}
        <Route
          exact
          path={paths.landing.isisInvestigationLanding}
          render={({
            match,
          }: RouteComponentProps<{
            instrumentId: string;
            facilityCycleId: string;
            investigationId: string;
          }>) => (
            <SafeISISInvestigationLanding
              studyHierarchy={false}
              instrumentId={match.params.instrumentId}
              instrumentChildId={match.params.facilityCycleId}
              investigationId={match.params.investigationId}
            />
          )}
        />
        <Route
          exact
          path={paths.landing.isisDatasetLanding}
          render={({
            match,
          }: RouteComponentProps<{
            instrumentId: string;
            facilityCycleId: string;
            investigationId: string;
            datasetId: string;
          }>) => (
            <SafeISISDatasetLanding
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
          path={paths.studyHierarchy.landing.isisStudyLanding}
          render={({
            match,
          }: RouteComponentProps<{
            instrumentId: string;
            studyId: string;
          }>) => (
            <ISISStudyLanding
              instrumentId={match.params.instrumentId}
              studyId={match.params.studyId}
            />
          )}
        />
        <Route
          exact
          path={paths.studyHierarchy.landing.isisInvestigationLanding}
          render={({
            match,
          }: RouteComponentProps<{
            instrumentId: string;
            studyId: string;
            investigationId: string;
          }>) => (
            <SafeISISInvestigationLanding
              studyHierarchy={true}
              instrumentId={match.params.instrumentId}
              instrumentChildId={match.params.studyId}
              investigationId={match.params.investigationId}
            />
          )}
        />
        <Route
          exact
          path={paths.studyHierarchy.landing.isisDatasetLanding}
          render={({
            match,
          }: RouteComponentProps<{
            instrumentId: string;
            studyId: string;
            investigationId: string;
            datasetId: string;
          }>) => (
            <SafeISISDatasetLanding
              studyHierarchy={true}
              instrumentId={match.params.instrumentId}
              instrumentChildId={match.params.studyId}
              investigationId={match.params.investigationId}
              datasetId={match.params.datasetId}
            />
          )}
        />
      </Switch>
    );
  }
}

export default PageLanding;
