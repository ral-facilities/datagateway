import React from 'react';
import './App.css';
import * as log from 'loglevel';
import thunk, { ThunkDispatch } from 'redux-thunk';
import { createStore, applyMiddleware, compose, AnyAction } from 'redux';
import AppReducer from './state/reducers/app.reducer';
import { Provider, connect } from 'react-redux';
import { createLogger } from 'redux-logger';
import { ConnectedRouter, routerMiddleware } from 'connected-react-router';
// history package is part of react-router, which we depend on
// eslint-disable-next-line import/no-extraneous-dependencies
import { createBrowserHistory } from 'history';
import { Switch, Route, RouteComponentProps } from 'react-router';
import DGTableMiddleware, {
  listenToMessages,
} from './state/middleware/dgtable.middleware';
import { RegisterRouteType } from './state/actions/actions.types';
import InvestigationTable from './table/investigationTable.component';
import DatafileTable from './table/datafileTable.component';
import DatasetTable from './table/datasetTable.component';
import { Link } from 'react-router-dom';
import { configureApp } from './state/actions';
import { StateType } from './state/app.types';
import { Preloader } from 'datagateway-common';
import DLSProposalsTable from './dls/tables/dlsProposalsTable.component';
import DLSVisitsTable from './dls/tables/dlsVisitsTable.component';
import DLSDatasetsTable from './dls/tables/dlsDatasetsTable.component';
import DLSDatafilesTable from './dls/tables/dlsDatafilesTable.component';
import ISISInstrumentsTable from './isis/tables/isisInstrumentsTable.component';
import ISISFacilityCyclesTable from './isis/tables/isisFacilityCyclesTable.component';
import ISISInvestigationsTable from './isis/tables/isisInvestigationsTable.component';
import ISISDatasetsTable from './isis/tables/isisDatasetsTable.component';
import ISISDatafilesTable from './isis/tables/isisDatafilesTable.component';

import {
  createGenerateClassName,
  StylesProvider,
} from '@material-ui/core/styles';
import PageBreadcrumbs from './breadcrumbs.component';

const generateClassName = createGenerateClassName({
  productionPrefix: 'dgwt',
});

const history = createBrowserHistory();
const middleware = [thunk, routerMiddleware(history), DGTableMiddleware];

if (process.env.NODE_ENV === `development`) {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const logger = (createLogger as any)();
  middleware.push(logger);
}

/* eslint-disable no-underscore-dangle, @typescript-eslint/no-explicit-any */
const composeEnhancers =
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
/* eslint-enable */

const store = createStore(
  AppReducer(history),
  composeEnhancers(applyMiddleware(...middleware))
);

listenToMessages(store.dispatch);

const dispatch = store.dispatch as ThunkDispatch<StateType, null, AnyAction>;
dispatch(configureApp());

const registerRouteAction = {
  type: RegisterRouteType,
  payload: {
    section: 'Data',
    link: '/browse/investigation',
    plugin: 'datagateway-table',
    displayName: 'DataGateway Table',
    order: 0,
    helpText: 'TODO: write some help text for the user tour',
  },
};

document.dispatchEvent(
  new CustomEvent('daaas-frontend', { detail: registerRouteAction })
);

function mapPreloaderStateToProps(state: StateType): { loading: boolean } {
  return {
    loading: !state.dgtable.settingsLoaded,
  };
}

export const ConnectedPreloader = connect(mapPreloaderStateToProps)(Preloader);

class App extends React.Component<{}, { hasError: boolean }> {
  public constructor(props: {}) {
    super(props);
    this.state = { hasError: false };
  }

  public componentDidCatch(error: Error | null): void {
    this.setState({ hasError: true });
    log.error(`datagateway_table failed with error: ${error}`);
  }

  public render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="error">
          <div
            style={{
              padding: 20,
              background: 'red',
              color: 'white',
              margin: 5,
            }}
          >
            Something went wrong...
          </div>
        </div>
      );
    } else
      return (
        <div className="App">
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <StylesProvider generateClassName={generateClassName}>
                <ConnectedPreloader>
                  <PageBreadcrumbs />
                  <Switch>
                    <Route
                      exact
                      path="/"
                      render={() => (
                        <Link to="/browse/investigation">
                          Browse investigations
                        </Link>
                      )}
                    />
                    <Route
                      exact
                      path="/browse/proposal/"
                      component={DLSProposalsTable}
                    />
                    <Route
                      exact
                      path="/browse/proposal/:proposalName/investigation"
                      render={({
                        match,
                      }: RouteComponentProps<{ proposalName: string }>) => (
                        <DLSVisitsTable
                          proposalName={match.params.proposalName}
                        />
                      )}
                    />
                    <Route
                      exact
                      path="/browse/proposal/:proposalName/investigation/:investigationId/dataset"
                      render={({
                        match,
                      }: RouteComponentProps<{
                        proposalName: string;
                        investigationId: string;
                      }>) => (
                        <DLSDatasetsTable
                          proposalName={match.params.proposalName}
                          investigationId={match.params.investigationId}
                        />
                      )}
                    />
                    <Route
                      exact
                      path="/browse/proposal/:proposalName/investigation/:investigationId/dataset/:datasetId/datafile"
                      render={({
                        match,
                      }: RouteComponentProps<{
                        proposalName: string;
                        investigationId: string;
                        datasetId: string;
                      }>) => (
                        <DLSDatafilesTable datasetId={match.params.datasetId} />
                      )}
                    />
                    <Route
                      exact
                      path="/browse/instrument/"
                      component={ISISInstrumentsTable}
                    />
                    <Route
                      exact
                      path="/browse/instrument/:instrumentId/facilityCycle"
                      render={({
                        match,
                      }: RouteComponentProps<{ instrumentId: string }>) => (
                        <ISISFacilityCyclesTable
                          instrumentId={match.params.instrumentId}
                        />
                      )}
                    />
                    <Route
                      exact
                      path="/browse/instrument/:instrumentId/facilityCycle/:facilityCycleId/investigation"
                      render={({
                        match,
                      }: RouteComponentProps<{
                        instrumentId: string;
                        facilityCycleId: string;
                      }>) => (
                        <ISISInvestigationsTable
                          instrumentId={match.params.instrumentId}
                          facilityCycleId={match.params.facilityCycleId}
                        />
                      )}
                    />
                    <Route
                      exact
                      path="/browse/instrument/:instrumentId/facilityCycle/:facilityCycleId/investigation/:investigationId/dataset"
                      render={({
                        match,
                      }: RouteComponentProps<{
                        instrumentId: string;
                        facilityCycleId: string;
                        investigationId: string;
                      }>) => (
                        <ISISDatasetsTable
                          instrumentId={match.params.instrumentId}
                          facilityCycleId={match.params.facilityCycleId}
                          investigationId={match.params.investigationId}
                        />
                      )}
                    />
                    <Route
                      exact
                      path="/browse/instrument/:instrumentId/facilityCycle/:facilityCycleId/investigation/:investigationId/dataset/:datasetId/datafile"
                      render={({
                        match,
                      }: RouteComponentProps<{
                        datasetId: string;
                      }>) => {
                        return (
                          <ISISDatafilesTable
                            datasetId={match.params.datasetId}
                          />
                        );
                      }}
                    />
                    <Route
                      exact
                      path="/browse/investigation/"
                      component={InvestigationTable}
                    />
                    <Route
                      exact
                      path="/browse/investigation/:investigationId/dataset"
                      render={({
                        match,
                      }: RouteComponentProps<{ investigationId: string }>) => (
                        <DatasetTable
                          investigationId={match.params.investigationId}
                        />
                      )}
                    />
                    <Route
                      exact
                      path="/browse/investigation/:investigationId/dataset/:datasetId/datafile"
                      render={({
                        match,
                      }: RouteComponentProps<{ datasetId: string }>) => (
                        <DatafileTable datasetId={match.params.datasetId} />
                      )}
                    />
                  </Switch>
                </ConnectedPreloader>
              </StylesProvider>
            </ConnectedRouter>
          </Provider>
        </div>
      );
  }
}

export default App;
