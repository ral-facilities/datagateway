import React from 'react';
import './App.css';
import * as log from 'loglevel';
import InvestigationTable from './table/investigationTable.component';
import DatafileTable from './table/datafileTable.component';
import DatasetTable from './table/datasetTable.component';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  RouteComponentProps,
  Link,
} from 'react-router-dom';
import DessertTable from './table/dessertTable.component';
import { foodDataDemoGenerator } from './data/demo';

class App extends React.Component<{}, { hasError: boolean }> {
  public constructor(props: {}) {
    super(props);
    this.state = { hasError: false };
  }

  public componentDidCatch(error: Error | null): void {
    this.setState({ hasError: true });
    log.error(`demo_plugin failed with error: ${error}`);
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
          <Router>
            <Switch>
              <Route
                exact
                path="/"
                render={() => (
                  <Link to="/browse/investigation">Browse investigations</Link>
                )}
              />
              <Route
                exact
                path="/desserts/"
                render={() => <DessertTable rows={foodDataDemoGenerator()} />}
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
          </Router>
        </div>
      );
  }
}

export default App;
