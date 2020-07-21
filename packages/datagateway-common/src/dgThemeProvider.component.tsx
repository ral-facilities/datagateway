import React from 'react';
import {
  MuiThemeProvider,
  Theme,
  createMuiTheme,
} from '@material-ui/core/styles';
import { MicroFrontendId } from './app.types';
import { SendThemeOptionsType } from './state/actions/actions.types';

// Store the parent theme options when received.
// Otherwise, set to an empty theme.
let parentThemeOptions: Theme = createMuiTheme({});

// Handle theme options sent from the parent app.
document.addEventListener(MicroFrontendId, (e) => {
  const action = (e as CustomEvent).detail;
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
