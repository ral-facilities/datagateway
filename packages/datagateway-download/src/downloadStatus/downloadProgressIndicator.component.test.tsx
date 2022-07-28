import * as React from 'react';
import { render, screen, RenderResult, waitFor } from '@testing-library/react';
import type { Download } from 'datagateway-common';
import { DownloadSettingsContext } from '../ConfigProvider';
import { getDownload, getPercentageComplete } from '../downloadApi';
import DownloadProgressIndicator from './downloadProgressIndicator.component';
import { QueryClient, QueryClientProvider } from 'react-query';
import {
  mockFormattedDownloadItems,
  mockedSettings,
  mockDownloadItems,
} from '../testData';

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

function renderComponent(): RenderResult {
  return render(
    <DownloadSettingsContext.Provider value={mockedSettings}>
      <QueryClientProvider client={createTestQueryClient()}>
        <DownloadProgressIndicator
          downloadId={mockFormattedDownloadItems[0].id}
        />
      </QueryClientProvider>
    </DownloadSettingsContext.Provider>
  );
}

describe('DownloadProgressIndicator', () => {
  describe('should show calculating text', () => {
    it('when querying the download info', async () => {
      (getDownload as jest.MockedFunction<typeof getDownload>).mockReturnValue(
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

    it('when querying the download progress', async () => {
      (getDownload as jest.MockedFunction<
        typeof getDownload
      >).mockResolvedValue(mockDownload);
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

  describe('should show unavailable', () => {
    it('when download info is unavailable', async () => {
      (getDownload as jest.MockedFunction<
        typeof getDownload
      >).mockRejectedValue({
        response: {
          status: 403,
        },
      });

      renderComponent();

      await waitFor(async () => {
        expect(
          await screen.findByText('downloadStatus.progress_unavailable')
        ).toBeInTheDocument();
      });
    });

    it('when progress is unavailable', async () => {
      (getDownload as jest.MockedFunction<
        typeof getDownload
      >).mockResolvedValue(mockDownload);
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

    it('when download is not being restored', async () => {
      (getDownload as jest.MockedFunction<
        typeof getDownload
      >).mockResolvedValue({
        ...mockDownloadItems[0],
        status: 'COMPLETE',
      });

      renderComponent();

      expect(
        await screen.findByText('downloadStatus.progress_unavailable')
      ).toBeInTheDocument();
    });
  });

  it('should show progress of the given download item', async () => {
    (getDownload as jest.MockedFunction<typeof getDownload>).mockResolvedValue(
      mockDownload
    );
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

  it('should show progress status if the server does not return a number', async () => {
    (getDownload as jest.MockedFunction<typeof getDownload>).mockResolvedValue(
      mockDownload
    );
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
