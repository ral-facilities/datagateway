import { RenderResult } from '@testing-library/react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fetchDownloadCart } from 'datagateway-common';
import { createMemoryHistory, History } from 'history';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router } from 'react-router-dom';
import { DownloadSettingsContext } from '../ConfigProvider';
import {
  downloadDeleted,
  fetchDownloads,
  getDataUrl,
  getFileSizeAndCount,
  removeAllDownloadCartItems,
  removeFromCart,
  isCartMintable,
  getIsTwoLevel,
} from '../downloadApi';
import { mockCartItems, mockDownloadItems, mockedSettings } from '../testData';
import DownloadTabs from './downloadTab.component';

vi.mock('datagateway-common', async () => {
  const og = await vi.importActual('datagateway-common');
  return {
    __esModule: true,
    ...og,
    fetchDownloadCart: vi.fn(),
  };
});
vi.mock('../downloadApi');

describe('DownloadTab', () => {
  let history: History;
  let holder;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    history = createMemoryHistory();
    user = userEvent.setup();

    holder = document.createElement('div');
    holder.setAttribute('id', 'datagateway-download');
    document.body.appendChild(holder);

    vi.mocked(downloadDeleted).mockImplementation(() => Promise.resolve());
    vi.mocked(fetchDownloads).mockImplementation(() =>
      Promise.resolve(mockDownloadItems)
    );
    vi.mocked(getDataUrl).mockImplementation(() => '/getData');
    vi.mocked(fetchDownloadCart).mockResolvedValue(mockCartItems);
    vi.mocked(removeAllDownloadCartItems).mockResolvedValue();
    vi.mocked(removeFromCart).mockImplementation((_entityType, entityIds) => {
      return Promise.resolve(
        mockCartItems.filter((item) => !entityIds.includes(item.entityId))
      );
    });

    vi.mocked(getFileSizeAndCount).mockResolvedValue({
      fileSize: 1,
      fileCount: 7,
    });
    vi.mocked(isCartMintable).mockResolvedValue(true);
    vi.mocked(getIsTwoLevel).mockResolvedValue(false);
  });

  const renderComponent = (): RenderResult => {
    const queryClient = new QueryClient();
    return render(
      <Router history={history}>
        <DownloadSettingsContext.Provider value={mockedSettings}>
          <QueryClientProvider client={queryClient}>
            <DownloadTabs />
          </QueryClientProvider>
        </DownloadSettingsContext.Provider>
      </Router>
    );
  };

  it('shows the appropriate table when clicking between tabs', async () => {
    renderComponent();

    // go to downloads tab

    await user.click(await screen.findByText('downloadTab.downloads_tab'));

    expect(
      await screen.findByLabelText('downloadTab.download_cart_panel_arialabel')
    ).not.toBeVisible();
    expect(
      await screen.findByLabelText(
        'downloadTab.download_status_panel_arialabel'
      )
    ).toBeVisible();

    // Return back to the cart tab.

    await user.click(await screen.findByText('downloadTab.cart_tab'));

    expect(
      await screen.findByLabelText('downloadTab.download_cart_panel_arialabel')
    ).toBeVisible();
    expect(
      await screen.findByLabelText(
        'downloadTab.download_status_panel_arialabel'
      )
    ).not.toBeVisible();
  });

  it('refreshes downloads when the refresh button is clicked', async () => {
    const mockedDate = new Date(Date.UTC(2025, 4, 14, 14, 0, 0)).toUTCString();
    global.Date.prototype.toLocaleString = vi.fn(() => mockedDate);

    renderComponent();

    let resolve: (v: Awaited<ReturnType<typeof fetchDownloads>>) => void = (
      _
    ) => {
      // no-op
    };

    vi.mocked(fetchDownloads).mockImplementation(
      () =>
        new Promise((res) => {
          // do nothing, simulating pending promise
          // to test refreshing state that we can resolve
          // whenever we want by calling resolve function
          resolve = res;
        })
    );

    // go to downloads tab

    await user.click(await screen.findByText('downloadTab.downloads_tab'));

    expect(
      await screen.findByText('downloadTab.refreshing_downloads')
    ).toBeInTheDocument();

    act(() => {
      resolve([]);
    });

    expect(
      await screen.findByText(mockedDate.toLocaleString())
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: 'downloadTab.refresh_download_status_arialabel',
      })
    );

    expect(
      await screen.findByText('downloadTab.refreshing_downloads')
    ).toBeInTheDocument();
  });
});
