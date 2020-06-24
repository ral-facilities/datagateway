import React, { Component } from 'react';
import * as log from 'loglevel';

import DownloadTabs from './downloadTab/downloadTab.component';

import {
  createGenerateClassName,
  StylesProvider,
  MuiThemeProvider,
} from '@material-ui/core/styles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import ConfigProvider from './ConfigProvider';
import { MicroFrontendId, SendThemeOptionsType } from 'datagateway-common';

const generateClassName = createGenerateClassName({
  productionPrefix: 'dgwd',

  // Only set disable when we are in production and not running e2e tests;
  // ensures class selectors are working on tests.
  disableGlobal:
    process.env.NODE_ENV === 'production' && !process.env.REACT_APP_E2E_TESTING,
});

// Store the parent theme options when received.
let parentThemeOptions: Theme | null = null;

// Handle theme options sent from the parent app.
document.addEventListener(MicroFrontendId, (e) => {
  const action = (e as CustomEvent).detail;
  console.log('Got action: ', action);
  if (
    action.type === SendThemeOptionsType &&
    action.payload &&
    action.payload.theme
  ) {
    console.log('Received theme options: ', action.payload);
    parentThemeOptions = action.payload.theme;
  }
});

class App extends Component<unknown, { hasError: boolean }> {
  public constructor(props: unknown) {
    super(props);
    this.state = { hasError: false };
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
          <MuiThemeProvider theme={parentThemeOptions}>
            <ConfigProvider>
              <DownloadTabs />
            </ConfigProvider>
          </MuiThemeProvider>
        </StylesProvider>
      </div>
    );
  }
}

export default App;
