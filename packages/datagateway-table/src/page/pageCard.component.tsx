import React from 'react';
import { Switch, Route, RouteComponentProps } from 'react-router';

import InvestigationCardView from '../card/investigationCardView.component';
import DatasetCardView from '../card/datasetCardView.component';

import ISISInstrumentsCardView from '../card/isis/isisInstrumentsCardView.component';
import ISISFacilityCyclesCardView from '../card/isis/isisFacilityCyclesCardView.component';
import ISISInvestigationsCardView from '../card/isis/isisInvestigationCardView.component';
import ISISDatasetsCardView from '../card/isis/isisDatasetsCardView.component';

import DLSProposalCardView from '../card/dls/dlsProposalsCardView.component';

export const supportedPaths = {
  investigation: '/browse/investigation',
  dataset: '/browse/investigation/:investigationId/dataset',
  isisInstrument: '/browse/instrument',
  isisFacilityCycle: '/browse/instrument/:instrumentId/facilityCycle',
  isisInvestigation:
    '/browse/instrument/:instrumentId/facilityCycle/:facilityCycleId/investigation',
  isisDataset:
    '/browse/instrument/:instrumentId/facilityCycle/:facilityCycleId/investigation/:investigationId/dataset',
  dlsProposal: '/browse/proposal',
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
        <Route
          exact
          path={supportedPaths['isisInvestigation']}
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
          path={supportedPaths['isisDataset']}
          render={({
            match,
          }: RouteComponentProps<{
            instrumentId: string;
            facilityCycleId: string;
            investigationId: string;
          }>) => (
            <ISISDatasetsCardView
              instrumentId={match.params.instrumentId}
              facilityCycleId={match.params.facilityCycleId}
              investigationId={match.params.investigationId}
            />
          )}
        />
        <Route exact path="/browse/proposal/" component={DLSProposalCardView} />
      </Switch>
    );
  }
}

export default PageCard;
