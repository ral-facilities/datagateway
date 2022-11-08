import type { RenderResult } from '@testing-library/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserEvent } from '@testing-library/user-event/dist/types/setup';
import { fetchDownloadCart } from 'datagateway-common';
import { createMemoryHistory } from 'history';
import * as React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Router } from 'react-router-dom';
import { DownloadSettingsContext } from '../ConfigProvider';
import {
  downloadDeleted,
  fetchDownloads,
  getDatafileCount,
  getDataUrl,
  getSize,
  removeAllDownloadCartItems,
  removeFromCart,
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
  let history;
  let holder;
  let user: UserEvent;

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
    ).mockResolvedValue(null);
    (
      removeFromCart as jest.MockedFunction<typeof removeFromCart>
    ).mockImplementation((entityType, entityIds) => {
      return Promise.resolve(
        mockCartItems.filter((item) => !entityIds.includes(item.entityId))
      );
    });

    (getSize as jest.MockedFunction<typeof getSize>).mockResolvedValue(1);
    (
      getDatafileCount as jest.MockedFunction<typeof getDatafileCount>
    ).mockResolvedValue(7);
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

  it('should render correctly', () => {
    const { asFragment } = renderComponent();
    expect(asFragment()).toMatchSnapshot();
  });

  it('shows the appropriate table when clicking between tabs', async () => {
    renderComponent();

    // go to downloads tab

    await user.click(await screen.findByText('downloadTab.downloads_tab'));

    await waitFor(async () => {
      expect(
        await screen.findByLabelText(
          'downloadTab.download_cart_panel_arialabel'
        )
      ).not.toBeVisible();
      expect(
        await screen.findByLabelText(
          'downloadTab.download_status_panel_arialabel'
        )
      ).toBeVisible();
    });

    // Return back to the cart tab.

    await user.click(await screen.findByText('downloadTab.cart_tab'));

    await waitFor(async () => {
      expect(
        await screen.findByLabelText(
          'downloadTab.download_cart_panel_arialabel'
        )
      ).toBeVisible();
      expect(
        await screen.findByLabelText(
          'downloadTab.download_status_panel_arialabel'
        )
      ).not.toBeVisible();
    });
  }, 10000);
});
