import React from 'react';
import { createTheme } from '@mui/material/styles';
import DGThemeProvider from './dgThemeProvider.component';
import { shallow } from 'enzyme';
import { MicroFrontendId } from './app.types';
import { SendThemeOptionsType } from './state/actions/actions.types';

describe('DGThemeProvider', () => {
  it('receives and uses the theme options', () => {
    // Create a basic theme.
    const theme = createTheme({
      palette: {
        mode: 'dark',
      },
    });

    const wrapper = shallow(
      <DGThemeProvider>
        <div>Test</div>
      </DGThemeProvider>
    );

    // Dispatch the theme options event.
    document.dispatchEvent(
      new CustomEvent(MicroFrontendId, {
        detail: {
          type: SendThemeOptionsType,
          payload: {
            theme,
          },
        },
      })
    );

    // Force update the wrapper as the state will not
    // update since the theme options are from a global variable.
    wrapper.instance().forceUpdate();

    expect(wrapper.childAt(0).props()).toHaveProperty('theme');
    expect(wrapper.childAt(0).prop('theme')).toEqual(theme);
  });
});
