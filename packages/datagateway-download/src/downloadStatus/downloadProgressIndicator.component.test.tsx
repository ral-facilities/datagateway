import * as React from 'react';
import { render, screen, RenderResult, waitFor } from '@testing-library/react';
import type { Download } from 'datagateway-common';
import { DownloadSettingsContext } from '../ConfigProvider';
import { getDownload, getPercentageComplete } from '../downloadApi';
import DownloadProgressIndicator from './downloadProgressIndicator.component';
import { QueryClient, QueryClientProvider } from 'react-query';
import { mockedSettings, mockDownloadItems } from '../testData';

jest.mock('../downloadApi');

const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
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
  describe('should show calculating text', () => {
    it('when querying the download progress', async () => {
      (getPercentageComplete as jest.MockedFunction<
        typeof getPercentageComplete
      >).mockReturnValue(
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
      (getDownload as jest.MockedFunction<
        typeof getDownload
      >).mockResolvedValue({
        ...mockDownloadItems[0],
        status: 'COMPLETE',
      });

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
      (getDownload as jest.MockedFunction<
        typeof getDownload
      >).mockResolvedValue({
        ...mockDownloadItems[0],
        status: 'EXPIRED',
      });

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
  });

  describe('should show unavailable', () => {
    it('when progress is unavailable', async () => {
      (getPercentageComplete as jest.MockedFunction<
        typeof getPercentageComplete
      >).mockRejectedValue({
        message: 'test error',
      });

      renderComponent();

      expect(
        await screen.findByText('downloadStatus.progress_unavailable')
      ).toBeInTheDocument();
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

  it('should show progress of the given download item', async () => {
    (getPercentageComplete as jest.MockedFunction<
      typeof getPercentageComplete
    >).mockResolvedValue(20);

    renderComponent();

    await waitFor(async () => {
      const progressBar = await screen.findByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '20');
    });
    expect(screen.getByText('20%')).toBeInTheDocument();
  });

  it('should show progress at 99% if the download is being restored but server returns 100% progress', async () => {
    (getPercentageComplete as jest.MockedFunction<
      typeof getPercentageComplete
    >).mockResolvedValue(100);

    renderComponent();

    const progressBar = await screen.findByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '99');
    expect(screen.getByText('99%')).toBeInTheDocument();
  });

  it('should show progress status if the server does not return a number', async () => {
    (getPercentageComplete as jest.MockedFunction<
      typeof getPercentageComplete
    >).mockResolvedValue('INVALID');

    renderComponent();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).toBeNull();
    });
    expect(await screen.findByText('INVALID')).toBeInTheDocument();
  });
});
