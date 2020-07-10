import React from 'react';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
// import { MicroFrontendId, SendThemeOptionsType } from 'datagateway-common';
import { MuiThemeProvider } from '@material-ui/core';
import { MicroFrontendId } from './app.types';
import { SendThemeOptionsType } from './state/actions/actions.types';

// Store the parent theme options when received.
let parentThemeOptions: Theme | null = null;

// Handle theme options sent from the parent app.
document.addEventListener(MicroFrontendId, (e) => {
  const action = (e as CustomEvent).detail;
  // console.log('Action received: ', action);
  if (
    action.type === SendThemeOptionsType &&
    action.payload &&
    action.payload.theme
  ) {
    parentThemeOptions = action.payload.theme;
  }
});

class DGThemeProvider extends React.Component<{ children: React.ReactNode }> {
  public constructor(props: { children: React.ReactNode }) {
    super(props);
  }

  public render(): React.ReactElement {
    return (
      <MuiThemeProvider theme={parentThemeOptions}>
        {this.props.children}
      </MuiThemeProvider>
    );
  }
}

export default DGThemeProvider;
