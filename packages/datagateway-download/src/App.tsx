import {
  DGThemeProvider,
  MicroFrontendId,
  Preloader,
  RequestPluginRerenderType,
} from 'datagateway-common';
import React, { Component } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import ConfigProvider from './ConfigProvider';
import AdminDownloadStatusTable from './downloadStatus/adminDownloadStatusTable.component';

import DownloadTabs from './downloadTab/downloadTab.component';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      staleTime: 300000,
    },
  },
});

/**
 * A fallback component when the app fails to render.
 */
function ErrorFallback(): JSX.Element {
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

class App extends Component<unknown, { hasError: boolean }> {
  public constructor(props: unknown) {
    super(props);
    this.state = { hasError: false };

    this.handler = this.handler.bind(this);
  }

  handler(e: Event): void {
    // attempt to re-render the plugin if we get told to
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

  public render(): React.ReactNode {
    return (
      <div className="App">
        <DGThemeProvider>
          <ConfigProvider>
            <QueryClientProvider client={queryClient}>
              <React.Suspense
                fallback={
                  <Preloader loading={true}>Finished loading</Preloader>
                }
              >
                <Router>
                  <Switch>
                    <Route path="/admin/download">
                      <AdminDownloadStatusTable />
                    </Route>
                    <Route path="/download">
                      <DownloadTabs />
                    </Route>
                  </Switch>
                </Router>
              </React.Suspense>
              <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
          </ConfigProvider>
        </DGThemeProvider>
      </div>
    );
  }
}

export default App;
export { ErrorFallback };
