import React from 'react';
import { createMuiTheme } from '@material-ui/core/styles';
import DGThemeProvider from './dgThemeProvider.component';
import { createShallow } from '@material-ui/core/test-utils';
import { MicroFrontendId } from './app.types';
import { SendThemeOptionsType } from './state/actions/actions.types';

describe('DGThemeProvider', () => {
  let shallow;

  beforeEach(() => {
    shallow = createShallow();
  });

  it('receives and uses the theme options', () => {
    // Create a basic theme.
    const theme = createMuiTheme({
      palette: {
        type: 'dark',
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

    expect(wrapper.props()).toHaveProperty('theme');
    expect(wrapper.prop('theme')).toEqual(theme);
  });
});
