import * as React from 'react';
import { shallow } from 'enzyme';
import DownloadTabs from './downloadTab.component';
import { DownloadSettingsContext } from '../ConfigProvider';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import {
  downloadDeleted,
  fetchDownloads,
  getDatafileCount,
  getDataUrl,
  getSize,
  removeAllDownloadCartItems,
  removeFromCart,
} from '../downloadApi';
import {
  DownloadCartItem,
  fetchDownloadCart,
  FormattedDownload,
} from 'datagateway-common';
import type { RenderResult } from '@testing-library/react';
import { render, screen, waitFor } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event/dist/types/setup';
import userEvent from '@testing-library/user-event';

jest.mock('datagateway-common', () => {
  const og = jest.requireActual('datagateway-common');
  return {
    __esModule: true,
    ...og,
    fetchDownloadCart: jest.fn(),
  };
});
jest.mock('../downloadApi');

// Create our mocked datagateway-download settings file.
const mockedSettings = {
  facilityName: 'LILS',
  apiUrl: 'https://example.com/api',
  downloadApiUrl: 'https://example.com/downloadApi',
  idsUrl: 'https://example.com/ids',
  accessMethods: {
    https: {
      idsUrl: 'https://example.com/ids',
      displayName: 'HTTPS',
      description: 'Example description for HTTPS access method.',
    },
    globus: {
      idsUrl: 'https://example.com/ids',
      displayName: 'Globus',
      description: 'Example description for Globus access method.',
    },
  },
};

const downloadItems: FormattedDownload[] = [
  {
    createdAt: '2020-02-25T15:05:29Z',
    downloadItems: [{ entityId: 1, entityType: 'investigation', id: 1 }],
    email: 'test1@email.com',
    facilityName: 'LILS',
    fileName: 'test-file-1',
    fullName: 'Person 1',
    id: 1,
    isDeleted: 'No',
    isEmailSent: true,
    isTwoLevel: false,
    preparedId: 'test-prepared-id',
    sessionId: 'test-session-id',
    size: 1000,
    status: 'downloadStatus.complete',
    transport: 'https',
    userName: 'test user',
  },
  {
    createdAt: '2020-02-26T15:05:35Z',
    downloadItems: [{ entityId: 2, entityType: 'investigation', id: 2 }],
    email: 'test2@email.com',
    facilityName: 'LILS',
    fileName: 'test-file-2',
    fullName: 'Person 2',
    id: 2,
    isDeleted: 'No',
    isEmailSent: true,
    isTwoLevel: false,
    preparedId: 'test-prepared-id',
    sessionId: 'test-session-id',
    size: 2000,
    status: 'downloadStatus.preparing',
    transport: 'globus',
    userName: 'test user',
  },
  {
    createdAt: '2020-02-27T15:57:20Z',
    downloadItems: [{ entityId: 3, entityType: 'investigation', id: 3 }],
    email: 'test3@email.com',
    facilityName: 'LILS',
    fileName: 'test-file-3',
    fullName: 'Person 3',
    id: 3,
    isDeleted: 'No',
    isEmailSent: true,
    isTwoLevel: false,
    preparedId: 'test-prepared-id',
    sessionId: 'test-session-id',
    size: 3000,
    status: 'downloadStatus.restoring',
    transport: 'https',
    userName: 'test user',
  },
  {
    createdAt: '2020-02-28T15:57:28Z',
    downloadItems: [{ entityId: 4, entityType: 'investigation', id: 4 }],
    email: 'test4@email.com',
    facilityName: 'LILS',
    fileName: 'test-file-4',
    fullName: 'Person 4',
    id: 4,
    isDeleted: 'No',
    isEmailSent: true,
    isTwoLevel: false,
    preparedId: 'test-prepared-id',
    sessionId: 'test-session-id',
    size: 4000,
    status: 'downloadStatus.expired',
    transport: 'globus',
    userName: 'test user',
  },
  {
    createdAt: '2020-03-01T15:57:28Z[UTC]',
    downloadItems: [{ entityId: 5, entityType: 'investigation', id: 5 }],
    email: 'test5@email.com',
    facilityName: 'LILS',
    fileName: 'test-file-5',
    fullName: 'Person 5',
    id: 5,
    isDeleted: 'No',
    isEmailSent: true,
    isTwoLevel: false,
    preparedId: 'test-prepared-id',
    sessionId: 'test-session-id',
    size: 5000,
    status: 'downloadStatus.paused',
    transport: 'globus',
    userName: 'test user',
  },
];

const mockCartItems: DownloadCartItem[] = [
  {
    entityId: 1,
    entityType: 'investigation',
    id: 1,
    name: 'INVESTIGATION 1',
    parentEntities: [],
  },
  {
    entityId: 2,
    entityType: 'investigation',
    id: 2,
    name: 'INVESTIGATION 2',
    parentEntities: [],
  },
  {
    entityId: 3,
    entityType: 'dataset',
    id: 3,
    name: 'DATASET 1',
    parentEntities: [],
  },
  {
    entityId: 4,
    entityType: 'datafile',
    id: 4,
    name: 'DATAFILE 1',
    parentEntities: [],
  },
];

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
      Promise.resolve(downloadItems)
    );
    (getDataUrl as jest.Mock).mockImplementation(() => '/getData');
    (fetchDownloadCart as jest.MockedFunction<
      typeof fetchDownloadCart
    >).mockResolvedValue(mockCartItems);
    (removeAllDownloadCartItems as jest.MockedFunction<
      typeof removeAllDownloadCartItems
    >).mockResolvedValue(null);
    (removeFromCart as jest.MockedFunction<
      typeof removeFromCart
    >).mockImplementation((entityType, entityIds) => {
      return Promise.resolve(
        mockCartItems.filter((item) => !entityIds.includes(item.entityId))
      );
    });

    (getSize as jest.MockedFunction<typeof getSize>).mockResolvedValue(1);
    (getDatafileCount as jest.MockedFunction<
      typeof getDatafileCount
    >).mockResolvedValue(7);
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

  it('renders correctly', () => {
    const wrapper = shallow(<DownloadTabs />);
    expect(wrapper).toMatchSnapshot();
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

    await user.click(await screen.findByLabelText('downloadTab.cart_tab'));

    expect(
      await screen.findByLabelText('downloadTab.download_cart_panel_arialabel')
    ).toBeVisible();
    expect(
      await screen.findByLabelText(
        'downloadTab.download_status_panel_arialabel'
      )
    ).not.toBeVisible();
  });
});
