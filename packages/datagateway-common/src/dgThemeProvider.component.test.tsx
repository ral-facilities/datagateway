import React from 'react';
import { createTheme } from '@mui/material/styles';
import DGThemeProvider from './dgThemeProvider.component';
import { render, screen } from '@testing-library/react';
import { Box } from '@mui/material';
import { MicroFrontendId } from './app.types';
import { SendThemeOptionsType } from './state/actions/actions.types';

describe('DGThemeProvider', () => {
  it('uses default theme before receiving theme event', () => {
    render(
      <DGThemeProvider>
        <Box data-testid="box" sx={{ bgcolor: 'primary.main' }}>
          test
        </Box>
      </DGThemeProvider>
    );

    // value taken from https://mui.com/material-ui/customization/default-theme/
    // (default value is #1976d2)
    // mui converts the hex value to CSS rgb expression

    expect(screen.getByTestId('box')).toHaveStyle(
      'background-color: rgb(25, 118, 210);'
    );
  });

  it('uses the theme sent through the theme event', () => {
    document.dispatchEvent(
      new CustomEvent(MicroFrontendId, {
        detail: {
          type: SendThemeOptionsType,
          payload: {
            theme: createTheme({
              palette: {
                primary: {
                  main: '#123456',
                },
              },
            }),
          },
        },
      })
    );

    render(
      <DGThemeProvider>
        <Box data-testid="box" sx={{ bgcolor: 'primary.main' }}>
          test
        </Box>
      </DGThemeProvider>
    );

    expect(screen.getByTestId('box')).toHaveStyle(
      'background-color: rgb(18, 52, 86);'
    );
  });

  it('ignores non-theme events', () => {
    document.dispatchEvent(
      new CustomEvent(MicroFrontendId, {
        detail: {
          type: SendThemeOptionsType,
          payload: {
            theme: createTheme({
              palette: {
                primary: {
                  main: '#abcdef',
                },
              },
            }),
          },
        },
      })
    );

    document.dispatchEvent(
      new CustomEvent(MicroFrontendId, {
        detail: {
          type: 'ImposterEvent',
          payload: {
            theme: createTheme(),
            yellow: 'sus',
          },
        },
      })
    );

    render(
      <DGThemeProvider>
        <Box data-testid="box" sx={{ bgcolor: 'primary.main' }}>
          test
        </Box>
      </DGThemeProvider>
    );

    // value taken from https://mui.com/material-ui/customization/default-theme/
    // (default value is #1976d2)
    // mui converts the hex value to CSS rgb expression

    // expect the dispatched theme to be used.
    expect(screen.getByTestId('box')).toHaveStyle(
      'background-color: rgb(171, 205, 239);'
    );
  });
});
