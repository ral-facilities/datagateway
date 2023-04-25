import React from 'react';
import {
  ThemeProvider,
  StyledEngineProvider,
  Theme,
  createTheme,
} from '@mui/material/styles';
import { MicroFrontendId } from './app.types';
import { SendThemeOptionsType } from './state/actions/actions.types';
import { CssBaseline } from '@mui/material';

// Store the parent theme options when received.
// Otherwise, set to an empty theme.
let parentThemeOptions: Theme = createTheme();

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
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={parentThemeOptions}>
          {/* Technically CssBaseline isn't needed in plugins as it's in scigateway and it's global
              but it's useful to ensure consistency when developing a plugin independently */}
          <CssBaseline enableColorScheme />
          {this.props.children}
        </ThemeProvider>
      </StyledEngineProvider>
    );
  }
}

export default DGThemeProvider;
