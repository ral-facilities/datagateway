import * as React from 'react';
import { render, screen, RenderResult, waitFor } from '@testing-library/react';
import { DownloadSettingsContext } from '../ConfigProvider';
import { getPercentageComplete } from '../downloadApi';
import DownloadProgressIndicator from './downloadProgressIndicator.component';
import { QueryClient, QueryClientProvider } from 'react-query';
import { mockFormattedDownloadItems, mockedSettings } from '../testData';

jest.mock('../downloadApi');

function renderComponent(): RenderResult {
  return render(
    <DownloadSettingsContext.Provider value={mockedSettings}>
      <QueryClientProvider client={new QueryClient()}>
        <DownloadProgressIndicator download={mockFormattedDownloadItems[0]} />
      </QueryClientProvider>
    </DownloadSettingsContext.Provider>
  );
}

describe('DownloadProgressIndicator', () => {
  it('should show loading bar when querying the download progress', async () => {
    (getPercentageComplete as jest.MockedFunction<
      typeof getPercentageComplete
    >).mockReturnValue(
      new Promise((_resolve) => {
        // do nothing, pretend this is loading
      })
    );

    renderComponent();

    await waitFor(async () => {
      const progressBar = await screen.findByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).not.toHaveAttribute('aria-valuenow');
    });
    expect(screen.queryByText('20%')).toBeNull();
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

  it('should show progress status if a number if the server does not return a number', async () => {
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
