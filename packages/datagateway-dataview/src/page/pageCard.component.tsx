import React from 'react';
import { Switch, Route, RouteComponentProps } from 'react-router';

import InvestigationCardView from '../views/card/investigationCardView.component';
import DatasetCardView from '../views/card/datasetCardView.component';

import ISISInstrumentsCardView from '../views/card/isis/isisInstrumentsCardView.component';
import ISISStudiesCardView from '../views/card/isis/isisStudiesCardView.component';
import ISISFacilityCyclesCardView from '../views/card/isis/isisFacilityCyclesCardView.component';
import ISISInvestigationsCardView from '../views/card/isis/isisInvestigationsCardView.component';
import ISISDatasetsCardView from '../views/card/isis/isisDatasetsCardView.component';

import DLSProposalsCardView from '../views/card/dls/dlsProposalsCardView.component';
import DLSVisitsCardView from '../views/card/dls/dlsVisitsCardView.component';
import DLSDatasetsCardView from '../views/card/dls/dlsDatasetsCardView.component';

import { paths } from './pageContainer.component';

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
          path={paths.toggle.isisInstrument}
          render={() => <ISISInstrumentsCardView studyHierarchy={false} />}
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
              studyHierarchy={false}
              instrumentId={match.params.instrumentId}
              instrumentChildId={match.params.facilityCycleId}
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
            <ISISDatasetsCardView
              studyHierarchy={false}
              instrumentId={match.params.instrumentId}
              instrumentChildId={match.params.facilityCycleId}
              investigationId={match.params.investigationId}
            />
          )}
        />

        <Route
          exact
          path={paths.studyHierarchy.toggle.isisInstrument}
          render={() => <ISISInstrumentsCardView studyHierarchy={true} />}
        />
        <Route
          exact
          path={paths.studyHierarchy.toggle.isisStudy}
          render={({
            match,
          }: RouteComponentProps<{ instrumentId: string }>) => (
            <ISISStudiesCardView instrumentId={match.params.instrumentId} />
          )}
        />
        <Route
          exact
          path={paths.studyHierarchy.toggle.isisInvestigation}
          render={({
            match,
          }: RouteComponentProps<{
            instrumentId: string;
            studyId: string;
          }>) => (
            <ISISInvestigationsCardView
              studyHierarchy={true}
              instrumentId={match.params.instrumentId}
              instrumentChildId={match.params.studyId}
            />
          )}
        />
        <Route
          exact
          path={paths.studyHierarchy.toggle.isisDataset}
          render={({
            match,
          }: RouteComponentProps<{
            instrumentId: string;
            studyId: string;
            investigationId: string;
          }>) => (
            <ISISDatasetsCardView
              studyHierarchy={true}
              instrumentId={match.params.instrumentId}
              instrumentChildId={match.params.studyId}
              investigationId={match.params.investigationId}
            />
          )}
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
            <DLSDatasetsCardView
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
      </Switch>
    );
  }
}

export default PageCard;
