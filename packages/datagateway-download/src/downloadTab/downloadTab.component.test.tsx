import { RenderResult } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fetchDownloadCart } from 'datagateway-common';
import { createMemoryHistory, History } from 'history';
import * as React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
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
} from '../downloadApi';
import { mockCartItems, mockDownloadItems, mockedSettings } from '../testData';
import DownloadTabs from './downloadTab.component';

jest.mock('datagateway-common', () => {
  const og = jest.requireActual('datagateway-common');
  return {
    __esModule: true,
    ...og,
    fetchDownloadCart: jest.fn(),
  };
});
jest.mock('../downloadApi');

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

    (downloadDeleted as jest.Mock).mockImplementation(() => Promise.resolve());
    (fetchDownloads as jest.Mock).mockImplementation(() =>
      Promise.resolve(mockDownloadItems)
    );
    (getDataUrl as jest.Mock).mockImplementation(() => '/getData');
    (
      fetchDownloadCart as jest.MockedFunction<typeof fetchDownloadCart>
    ).mockResolvedValue(mockCartItems);
    (
      removeAllDownloadCartItems as jest.MockedFunction<
        typeof removeAllDownloadCartItems
      >
    ).mockResolvedValue();
    (
      removeFromCart as jest.MockedFunction<typeof removeFromCart>
    ).mockImplementation((entityType, entityIds) => {
      return Promise.resolve(
        mockCartItems.filter((item) => !entityIds.includes(item.entityId))
      );
    });

    (
      getFileSizeAndCount as jest.MockedFunction<typeof getFileSizeAndCount>
    ).mockResolvedValue({ fileSize: 1, fileCount: 7 });
    (
      isCartMintable as jest.MockedFunction<typeof isCartMintable>
    ).mockResolvedValue(true);
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
    renderComponent();

    (
      fetchDownloads as jest.MockedFunction<typeof fetchDownloads>
    ).mockImplementation(
      () =>
        new Promise((_) => {
          // do nothing, simulating pending promise
          // to test refreshing state
        })
    );

    // go to downloads tab

    await user.click(await screen.findByText('downloadTab.downloads_tab'));

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
