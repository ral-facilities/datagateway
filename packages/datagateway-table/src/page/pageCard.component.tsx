import React from 'react';
import { Switch, Route, RouteComponentProps } from 'react-router';

import InvestigationCardView from '../card/investigationCardView.component';
import DatasetCardView from '../card/datasetCardView.component';
import ISISInstrumentsCardView from '../card/isis/isisInstrumentsCardView.component';
import ISISFacilityCyclesCardView from '../card/isis/isisFacilityCyclesCardView.component';

export const supportedPaths = {
  investigation: '/browse/investigation',
  dataset: '/browse/investigation/:investigationId/dataset',
  isisInstrument: '/browse/instrument',
  isisFacilityCycle: '/browse/instrument/:instrumentId/facilityCycle',
};

class PageCard extends React.Component {
  public render(): React.ReactNode {
    return (
      <Switch>
        <Route
          exact
          path={supportedPaths['investigation']}
          render={() => <InvestigationCardView />}
        />
        <Route
          exact
          path={supportedPaths['dataset']}
          render={({
            match,
          }: RouteComponentProps<{ investigationId: string }>) => (
            <DatasetCardView investigationId={match.params.investigationId} />
          )}
        />
        <Route
          exact
          path={supportedPaths['isisInstrument']}
          render={() => <ISISInstrumentsCardView />}
        />
        <Route
          exact
          path={supportedPaths['isisFacilityCycle']}
          render={({
            match,
          }: RouteComponentProps<{ instrumentId: string }>) => (
            <ISISFacilityCyclesCardView
              instrumentId={match.params.instrumentId}
            />
          )}
        />
      </Switch>
    );
  }
}

export default PageCard;
