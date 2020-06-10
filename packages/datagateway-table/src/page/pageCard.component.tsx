import React from 'react';
import { Switch, Route, RouteComponentProps } from 'react-router';

import InvestigationCardView from '../card/investigationCardView.component';
import DatasetCardView from '../card/datasetCardView.component';

import ISISInstrumentsCardView from '../card/isis/isisInstrumentsCardView.component';
import ISISFacilityCyclesCardView from '../card/isis/isisFacilityCyclesCardView.component';
import ISISInvestigationsCardView from '../card/isis/isisInvestigationCardView.component';
import ISISDatasetsCardView from '../card/isis/isisDatasetsCardView.component';

import DLSProposalsCardView from '../card/dls/dlsProposalsCardView.component';
import DLSVisitsCardView from '../card/dls/dlsVisitsCardView.component';
import DLSDatasetsCardView from '../card/dls/dlsDatasetsCardView.component';

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
  dlsVisit: '/browse/proposal/:proposalName/investigation',
  dlsDataset:
    '/browse/proposal/:proposalName/investigation/:investigationId/dataset',
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
        <Route
          exact
          path={supportedPaths['dlsProposal']}
          component={DLSProposalsCardView}
        />
        <Route
          exact
          path={supportedPaths['dlsVisit']}
          render={({
            match,
          }: RouteComponentProps<{ proposalName: string }>) => (
            <DLSVisitsCardView proposalName={match.params.proposalName} />
          )}
        />
        <Route
          exact
          path={supportedPaths['dlsDataset']}
          render={({
            match,
          }: RouteComponentProps<{
            proposalName: string;
            investigationId: string;
          }>) => (
            <DLSDatasetsCardView
              proposalName={match.params.proposalName}
              investigationId={match.params.investigationId}
            />
          )}
        />
      </Switch>
    );
  }
}

export default PageCard;
