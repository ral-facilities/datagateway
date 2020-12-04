import React from 'react';

import { Switch, Route, RouteComponentProps } from 'react-router';

import IsisInvestigationLanding from '../views/landing/isis/isisInvestigationLanding.component';

import { paths } from './pageContainer.component';

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
            return (
              <IsisInvestigationLanding
                instrumentId={match.params.instrumentId}
                facilityCycleId={match.params.facilityCycleId}
                investigationId={match.params.investigationId}
              />
            );
          }}
        />
      </Switch>
    );
  }
}

export default PageLanding;
