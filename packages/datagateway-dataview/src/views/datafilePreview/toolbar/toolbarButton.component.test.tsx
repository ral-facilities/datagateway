import Download from '@mui/icons-material/Download';
import { render, screen } from '@testing-library/react';
import ToolbarButton from './toolbarButton.component';

describe('ToolbarButton', () => {
  let mediaQueryShouldMatch = false;
  beforeEach(() => {
    // JSDOM doesn't support matchMedia, so mock it
    // see: https://mui.com/material-ui/react-use-media-query/#testing
    function createMatchMedia(_width: number) {
      return (_query: string): MediaQueryList => ({
        matches: mediaQueryShouldMatch,
        media: '',
        addListener: vi.fn(),
        removeListener: vi.fn(),
        onchange: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(() => true),
      });
    }
    // mock matchMedia for useMediaQuery to work properly
    window.matchMedia = createMatchMedia(window.innerWidth);
  });

  it('should show a normal MUI button with the given label and icon at >=md breakpoint', () => {
    mediaQueryShouldMatch = false;

    render(<ToolbarButton icon={<Download />} label="Download" />);

    expect(screen.getByTestId('DownloadIcon')).toBeInTheDocument();
    expect(screen.getByText('Download')).toBeInTheDocument();
  });

  it('should only show the given icon at sub md breakpoint', () => {
    mediaQueryShouldMatch = true;

    render(<ToolbarButton icon={<Download />} label="Download" />);

    expect(screen.getByTestId('DownloadIcon')).toBeInTheDocument();
    expect(screen.queryByText('Download')).toBeNull();
  });
});
