import { Download } from '@mui/icons-material';
import type { useTheme } from '@mui/material';
import { useMediaQuery } from '@mui/material';
import { render, screen } from '@testing-library/react';
import ToolbarButton from './toolbarButton.component';

// JSDOM doesn't support viewport resizing, so the hooks have to be stubbed for now.

vi.mock('@mui/material', async () => ({
  ...(await vi.importActual('@mui/material')),
  useMediaQuery: vi.fn(),
  useTheme: vi.fn<typeof useTheme>().mockReturnValue({
    breakpoints: {
      down: (_: unknown) => '',
    },
  }),
}));

describe('ToolbarButton', () => {
  it('should show a normal MUI button with the given label and icon at >=md breakpoint', () => {
    vi.mocked(useMediaQuery).mockReturnValueOnce(false);

    render(<ToolbarButton icon={<Download />} label="Download" />);

    expect(screen.getByTestId('DownloadIcon')).toBeInTheDocument();
    expect(screen.getByText('Download')).toBeInTheDocument();
  });

  it('should only show the given icon at sub md breakpoint', () => {
    vi.mocked(useMediaQuery).mockReturnValueOnce(true);

    render(<ToolbarButton icon={<Download />} label="Download" />);

    expect(screen.getByTestId('DownloadIcon')).toBeInTheDocument();
    expect(screen.queryByText('Download')).toBeNull();
  });
});
