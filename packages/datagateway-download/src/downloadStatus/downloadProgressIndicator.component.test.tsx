import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RenderResult, render, screen, waitFor } from '@testing-library/react';
import { type Download } from 'datagateway-common';
import { DownloadSettingsContext } from '../ConfigProvider';
import { getPercentageComplete } from '../downloadApi';
import { mockDownloadItems, mockedSettings } from '../testData';
import DownloadProgressIndicator from './downloadProgressIndicator.component';

vi.mock('../downloadApi');

const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
    // silence react-query errors
    logger: {
      log: console.log,
      warn: console.warn,
      error: vi.fn(),
    },
  });

const mockDownload: Download = {
  ...mockDownloadItems[0],
  status: 'RESTORING',
};

function renderComponent({ download = mockDownload } = {}): RenderResult {
  return render(
    <DownloadSettingsContext.Provider value={mockedSettings}>
      <QueryClientProvider client={createTestQueryClient()}>
        <DownloadProgressIndicator download={download} />
      </QueryClientProvider>
    </DownloadSettingsContext.Provider>
  );
}

describe('DownloadProgressIndicator', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('should show calculating text', () => {
    it('when querying the download progress', async () => {
      vi.mocked(getPercentageComplete).mockReturnValue(
        new Promise(() => {
          // do nothing, pretend this is loading
        })
      );

      renderComponent();

      expect(
        await screen.findByText('downloadStatus.calculating_progress')
      ).toBeInTheDocument();
      expect(screen.queryByText('20%')).toBeNull();
    });
  });

  describe('should show the progress as complete', () => {
    it('when download is completed', async () => {
      renderComponent({
        download: {
          ...mockDownload,
          status: 'COMPLETE',
        },
      });

      expect(
        await screen.findByText('downloadStatus.progress_complete')
      ).toBeInTheDocument();
      // should not show progress bar
      expect(screen.queryByRole('progressbar')).toBeNull();
    });

    it('when download is expired', async () => {
      renderComponent({
        download: {
          ...mockDownload,
          status: 'EXPIRED',
        },
      });

      expect(
        await screen.findByText('downloadStatus.progress_complete')
      ).toBeInTheDocument();
      // should not show progress bar
      expect(screen.queryByRole('progressbar')).toBeNull();
    });

    it('when download is deleted', async () => {
      renderComponent({
        download: {
          ...mockDownload,
          isDeleted: true,
        },
      });

      expect(
        await screen.findByText('downloadStatus.progress_complete')
      ).toBeInTheDocument();
      // should not show progress bar
      expect(screen.queryByRole('progressbar')).toBeNull();
    });
  });

  describe('should show unavailable', () => {
    it('when progress is unavailable', async () => {
      vi.mocked(getPercentageComplete).mockRejectedValue({
        message: 'test error',
      });

      renderComponent();

      expect(
        await screen.findByText('downloadStatus.progress_unavailable')
      ).toBeInTheDocument();
    });

    it('when download has no preparedId', async () => {
      renderComponent({
        download: {
          ...mockDownload,
          preparedId: undefined,
        },
      });

      expect(
        await screen.findByText('downloadStatus.progress_unavailable')
      ).toBeInTheDocument();
      expect(getPercentageComplete).not.toHaveBeenCalled();
    });
  });

  it('should show progress at 0% when the download is being prepared', async () => {
    renderComponent({
      download: {
        ...mockDownload,
        status: 'PREPARING',
      },
    });

    const progressBar = await screen.findByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should show queued when download is queued', async () => {
    renderComponent({
      download: {
        ...mockDownload,
        status: 'QUEUED',
      },
    });

    expect(
      await screen.findByText('downloadStatus.progress_queued')
    ).toBeInTheDocument();
    expect(getPercentageComplete).not.toHaveBeenCalled();
  });

  it('should not call getPercentageComplete if preparedId is undefined', async () => {
    renderComponent({
      download: {
        ...mockDownload,
        status: 'RESTORING',
        preparedId: undefined,
      },
    });

    expect(getPercentageComplete).not.toHaveBeenCalled();
  });

  it('should show progress of the given download item', async () => {
    vi.mocked(getPercentageComplete).mockResolvedValue(20);

    renderComponent();

    await waitFor(async () => {
      const progressBar = await screen.findByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '20');
    });
    expect(screen.getByText('20%')).toBeInTheDocument();
  });

  it('should show progress at 99% if the download is being restored but server returns 100% progress', async () => {
    vi.mocked(getPercentageComplete).mockResolvedValue(100);

    renderComponent();

    const progressBar = await screen.findByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '99');
    expect(screen.getByText('99%')).toBeInTheDocument();
  });

  it('should show progress status if the server does not return a number', async () => {
    vi.mocked(getPercentageComplete).mockResolvedValue('INVALID');

    renderComponent();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).toBeNull();
    });
    expect(await screen.findByText('INVALID')).toBeInTheDocument();
  });
});
