import { Download } from '@mui/icons-material';
import type { Theme } from '@mui/material';
import { useMediaQuery } from '@mui/material';
import { render, screen } from '@testing-library/react';
import * as React from 'react';
import type { DeepPartial } from 'redux';
import ToolbarButton from './toolbarButton.component';

// JSDOM doesn't support viewport resizing, so the hooks have to be stubbed for now.

jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: jest.fn(),
  useTheme: jest.fn<DeepPartial<Theme>, []>().mockReturnValue({
    breakpoints: {
      down: (_) => '',
    },
  }),
}));

describe('ToolbarButton', () => {
  it('should show a normal MUI button with the given label and icon at >=md breakpoint', () => {
    (
      useMediaQuery as jest.MockedFunction<typeof useMediaQuery>
    ).mockReturnValueOnce(false);

    render(<ToolbarButton icon={<Download />} label="Download" />);

    expect(screen.getByTestId('DownloadIcon')).toBeInTheDocument();
    expect(screen.getByText('Download')).toBeInTheDocument();
  });

  it('should only show the given icon at sub md breakpoint', () => {
    (
      useMediaQuery as jest.MockedFunction<typeof useMediaQuery>
    ).mockReturnValueOnce(true);

    render(<ToolbarButton icon={<Download />} label="Download" />);

    expect(screen.getByTestId('DownloadIcon')).toBeInTheDocument();
    expect(screen.queryByText('Download')).toBeNull();
  });
});
