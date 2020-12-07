import React from 'react';

import { Switch, Route, RouteComponentProps } from 'react-router';

import ISISInvestigationLanding from '../views/landing/isis/isisInvestigationLanding.component';
import ISISDatasetLanding from '../views/landing/isis/isisDatasetLanding.component';
import {
  checkInstrumentAndFacilityCycleId,
  checkInvestigationId,
} from './idCheckFunctions';

import { paths } from './pageContainer.component';
import withIdCheck from './withIdCheck';

class PageLanding extends React.PureComponent {
  public render(): React.ReactNode {
    return (
      <Switch>
        <Route
          exact
          path={paths.landing.isisInvestigationLanding}
          render={({
            match,
          }: RouteComponentProps<{
            instrumentId: string;
            facilityCycleId: string;
            investigationId: string;
          }>) => {
            const SafeISISInvestigationLanding = withIdCheck(
              checkInstrumentAndFacilityCycleId(
                parseInt(match.params.instrumentId),
                parseInt(match.params.facilityCycleId),
                parseInt(match.params.investigationId)
              )
            )(ISISInvestigationLanding);
            return (
              <SafeISISInvestigationLanding
                instrumentId={match.params.instrumentId}
                facilityCycleId={match.params.facilityCycleId}
                investigationId={match.params.investigationId}
              />
            );
          }}
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
          }>) => {
            const SafeISISDatasetLanding = withIdCheck(
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
            )(ISISDatasetLanding);
            return (
              <SafeISISDatasetLanding
                instrumentId={match.params.instrumentId}
                facilityCycleId={match.params.facilityCycleId}
                investigationId={match.params.investigationId}
                datasetId={match.params.datasetId}
              />
            );
          }}
        />
      </Switch>
    );
  }
}

export default PageLanding;
