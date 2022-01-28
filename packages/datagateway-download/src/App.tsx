import React, { Component } from 'react';
import * as log from 'loglevel';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import DownloadTabs from './downloadTab/downloadTab.component';

import {
  createGenerateClassName,
  StylesProvider,
} from '@material-ui/core/styles';
import ConfigProvider from './ConfigProvider';
import {
  MicroFrontendId,
  Preloader,
  RequestPluginRerenderType,
} from 'datagateway-common';
import { DGThemeProvider } from 'datagateway-common';
import AdminDownloadStatusTable from './downloadStatus/adminDownloadStatusTable.component';

const generateClassName = createGenerateClassName({
  productionPrefix: 'dgwd',

  // Only set disable when we are in production and not running e2e tests;
  // ensures class selectors are working on tests.
  disableGlobal:
    process.env.NODE_ENV === 'production' && !process.env.REACT_APP_E2E_TESTING,
});

class App extends Component<unknown, { hasError: boolean }> {
  public constructor(props: unknown) {
    super(props);
    this.state = { hasError: false };

    this.handler = this.handler.bind(this);
  }

  handler(e: Event): void {
    // attempt to re-render the plugin if the corresponding div is present
    const action = (e as CustomEvent).detail;
    if (action.type === RequestPluginRerenderType) {
      // This is a temporary fix for the current issue with the tab indicator
      // not updating after the size of the page has been altered.
      // This is issue is being tracked by material-ui (https://github.com/mui-org/material-ui/issues/9337).
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('resize'));
      }, 125);
      this.forceUpdate();
    }
  }

  public componentDidMount(): void {
    document.addEventListener(MicroFrontendId, this.handler);
  }

  public componentWillUnmount(): void {
    document.removeEventListener(MicroFrontendId, this.handler);
  }

  public componentDidCatch(error: Error | null): void {
    this.setState({ hasError: true });
    log.error(`datagateway-download failed with error: ${error}`);
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
    }

    return (
      <div className="App">
        <StylesProvider generateClassName={generateClassName}>
          <DGThemeProvider>
            <ConfigProvider>
              <React.Suspense
                fallback={
                  <Preloader loading={true}>Finished loading</Preloader>
                }
              >
                <Router>
                  <Switch>
                    <Route path="/admin-download">
                      <AdminDownloadStatusTable />
                    </Route>
                    <Route path="/download">
                      <DownloadTabs />
                    </Route>
                  </Switch>
                </Router>
              </React.Suspense>
            </ConfigProvider>
          </DGThemeProvider>
        </StylesProvider>
      </div>
    );
  }
}

export default App;
