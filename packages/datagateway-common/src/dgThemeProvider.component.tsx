import React from 'react';
import {
  ThemeProvider,
  StyledEngineProvider,
  Theme,
  createTheme,
  CssBaseline,
} from '@mui/material';
import { MicroFrontendId } from './app.types';
import { SendThemeOptionsType } from './state/actions/actions.types';

// Store the parent theme options when received.
// Otherwise, set to an empty theme.
let parentThemeOptions: Theme = createTheme(
  import.meta.env.MODE === 'test'
    ? {
        components: {
          MuiButtonBase: {
            defaultProps: {
              // disable ripple effect in tests
              disableRipple: true,
            },
          },
          // disable animations and transitions in tests
          MuiCssBaseline: {
            styleOverrides: {
              '*, *::before, *::after': {
                transition: 'none !important',
                animation: 'none !important',
              },
            },
          },
        },
      }
    : undefined
);

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
