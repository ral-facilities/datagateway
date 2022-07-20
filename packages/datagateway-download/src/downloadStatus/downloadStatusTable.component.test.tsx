import * as React from 'react';
import type { Download } from 'datagateway-common';
import DownloadStatusTable from './downloadStatusTable.component';
import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  applyDatePickerWorkaround,
  cleanupDatePickerWorkaround,
} from '../setupTests';
import { downloadDeleted, fetchDownloads, getDataUrl } from '../downloadApi';
import { QueryClient, QueryClientProvider } from 'react-query';
import { UserEvent } from '@testing-library/user-event/dist/types/setup';

jest.mock('../downloadApi');

const downloadItems: Download[] = [
  {
    createdAt: '2020-02-25T15:05:29Z',
    downloadItems: [{ entityId: 1, entityType: 'investigation', id: 1 }],
    email: 'test1@email.com',
    facilityName: 'LILS',
    fileName: 'test-file-1',
    fullName: 'Person 1',
    id: 1,
    isDeleted: false,
    isEmailSent: true,
    isTwoLevel: false,
    preparedId: 'test-prepared-id',
    sessionId: 'test-session-id',
    size: 1000,
    status: 'COMPLETE',
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
    isDeleted: false,
    isEmailSent: true,
    isTwoLevel: false,
    preparedId: 'test-prepared-id',
    sessionId: 'test-session-id',
    size: 2000,
    status: 'PREPARING',
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
    isDeleted: false,
    isEmailSent: true,
    isTwoLevel: false,
    preparedId: 'test-prepared-id',
    sessionId: 'test-session-id',
    size: 3000,
    status: 'RESTORING',
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
    isDeleted: false,
    isEmailSent: true,
    isTwoLevel: false,
    preparedId: 'test-prepared-id',
    sessionId: 'test-session-id',
    size: 4000,
    status: 'EXPIRED',
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
    isDeleted: false,
    isEmailSent: true,
    isTwoLevel: false,
    preparedId: 'test-prepared-id',
    sessionId: 'test-session-id',
    size: 5000,
    status: 'PAUSED',
    transport: 'globus',
    userName: 'test user',
  },
];

const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderComponent = (): RenderResult =>
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <DownloadStatusTable
        refreshTable={false}
        setRefreshTable={jest.fn()}
        setLastChecked={jest.fn()}
      />
    </QueryClientProvider>
  );

describe('Download Status Table', () => {
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();

    (downloadDeleted as jest.Mock).mockImplementation(() => Promise.resolve());
    (fetchDownloads as jest.Mock).mockImplementation(() =>
      Promise.resolve(downloadItems)
    );
    (getDataUrl as jest.Mock).mockImplementation(() => '/getData');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    const { asFragment } = renderComponent();
    expect(asFragment()).toMatchSnapshot();
  });

  it('should translate the status strings correctly', async () => {
    renderComponent();

    expect(
      await screen.findByText('downloadStatus.paused')
    ).toBeInTheDocument();
    expect(
      await screen.findByText('downloadStatus.expired')
    ).toBeInTheDocument();
    expect(
      await screen.findByText('downloadStatus.restoring')
    ).toBeInTheDocument();
    expect(
      await screen.findByText('downloadStatus.preparing')
    ).toBeInTheDocument();
    expect(
      await screen.findByText('downloadStatus.complete')
    ).toBeInTheDocument();
  });

  it('should refresh data when required', async () => {
    const queryClient = createTestQueryClient();
    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <DownloadStatusTable
          refreshTable={false}
          setRefreshTable={jest.fn()}
          setLastChecked={jest.fn()}
        />
      </QueryClientProvider>
    );

    expect(await screen.findByText('test-file-1')).toBeInTheDocument();
    expect(await screen.findByText('test-file-2')).toBeInTheDocument();
    expect(await screen.findByText('test-file-3')).toBeInTheDocument();
    expect(await screen.findByText('test-file-4')).toBeInTheDocument();
    expect(await screen.findByText('test-file-5')).toBeInTheDocument();

    // pretend server returned a different list
    (fetchDownloads as jest.Mock).mockReturnValueOnce([]);
    rerender(
      <QueryClientProvider client={queryClient}>
        <DownloadStatusTable
          refreshTable
          setRefreshTable={jest.fn()}
          setLastChecked={jest.fn()}
        />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('test-file-1')).toBeNull();
      expect(screen.queryByText('test-file-2')).toBeNull();
      expect(screen.queryByText('test-file-3')).toBeNull();
      expect(screen.queryByText('test-file-4')).toBeNull();
      expect(screen.queryByText('test-file-5')).toBeNull();
    });
  });

  it('should have a link for a download item', async () => {
    renderComponent();

    // Expect globus download items to have been disabled.
    expect(
      await screen.findByRole('button', {
        name: 'downloadStatus.download {filename:test-file-2}',
      })
    ).toBeDisabled();

    // Expect HTTPS download items with non-COMPLETE status to have been disabled.
    expect(
      await screen.findByRole('button', {
        name: 'downloadStatus.download {filename:test-file-3}',
      })
    ).toBeDisabled();

    // Expect complete HTTPS download items to be downloadable
    // Check to see if the href contains the correct call.
    expect(
      await screen.findByRole('link', {
        name: 'downloadStatus.download {filename:test-file-1}',
      })
    ).toHaveAttribute('href', '/getData');
  });

  it("should remove an item when said item's remove button is clicked", async () => {
    // downloadStatus.remove {filename:test-file-1}
    renderComponent();

    expect(await screen.findByText('test-file-1')).toBeInTheDocument();

    await user.click(
      await screen.findByRole('button', {
        name: 'downloadStatus.remove {filename:test-file-1}',
      })
    );

    await waitFor(() => {
      expect(screen.queryByText('test-file-1')).toBeNull();
    });
  });

  it('should sort data when headers are clicked', async () => {
    renderComponent();

    // Table is sorted by createdAt desc by default
    // To keep working test, we will remove all sorts on the table beforehand
    await user.click(await screen.findByText('downloadStatus.createdAt'));

    // Get the access method sort header.
    const accessMethodSortLabel = screen.getByText('downloadStatus.transport');

    await user.click(accessMethodSortLabel);

    // access methods should be in asc order, globus < https
    let rows = await screen.findAllByText(/^test-file-\d$/);
    expect(rows[0]).toHaveTextContent('test-file-2');
    expect(rows[1]).toHaveTextContent('test-file-4');
    expect(rows[2]).toHaveTextContent('test-file-5');
    expect(rows[3]).toHaveTextContent('test-file-1');
    expect(rows[4]).toHaveTextContent('test-file-3');

    await user.click(accessMethodSortLabel);

    // access methods should be in desc order, globus < https
    rows = await screen.findAllByText(/^test-file-\d$/);
    expect(rows[0]).toHaveTextContent('test-file-1');
    expect(rows[1]).toHaveTextContent('test-file-3');
    expect(rows[2]).toHaveTextContent('test-file-2');
    expect(rows[3]).toHaveTextContent('test-file-4');
    expect(rows[4]).toHaveTextContent('test-file-5');

    // Get the download name sort header.
    const nameSortLabel = screen.getByText('downloadStatus.filename');

    await user.click(nameSortLabel);

    // name should be in asc order
    rows = await screen.findAllByText(/^test-file-\d$/);
    expect(rows[0]).toHaveTextContent('test-file-1');
    expect(rows[1]).toHaveTextContent('test-file-3');
    expect(rows[2]).toHaveTextContent('test-file-2');
    expect(rows[3]).toHaveTextContent('test-file-4');
    expect(rows[4]).toHaveTextContent('test-file-5');

    await user.click(nameSortLabel);

    // name should be in desc order
    rows = await screen.findAllByText(/^test-file-\d$/);
    expect(rows[0]).toHaveTextContent('test-file-3');
    expect(rows[1]).toHaveTextContent('test-file-1');
    expect(rows[2]).toHaveTextContent('test-file-5');
    expect(rows[3]).toHaveTextContent('test-file-4');
    expect(rows[4]).toHaveTextContent('test-file-2');
  });

  it('should filter data when text fields are typed into', async () => {
    renderComponent();

    const fileNameFilterBox = await screen.findByLabelText(
      'Filter by downloadStatus.filename'
    );
    const downloadMethodFilterBox = await screen.findByLabelText(
      'Filter by downloadStatus.transport'
    );
    const downloadStatusFilterBox = await screen.findByLabelText(
      'Filter by downloadStatus.status'
    );

    // type into file name filter textbox
    await user.type(fileNameFilterBox, '1');

    // should only show file-name-1
    expect(await screen.findByText('test-file-1')).toBeInTheDocument();
    expect(screen.queryByText('test-file-2')).toBeNull();
    expect(screen.queryByText('test-file-2')).toBeNull();
    expect(screen.queryByText('test-file-2')).toBeNull();

    // clear file name filter textbox
    await user.clear(fileNameFilterBox);
    // type into download method filter textbox
    await user.type(downloadMethodFilterBox, 'https');

    expect(await screen.findByText('test-file-1')).toBeInTheDocument();
    expect(await screen.findByText('test-file-3')).toBeInTheDocument();
    expect(screen.queryByText('test-file-2')).toBeNull();
    expect(screen.queryByText('test-file-4')).toBeNull();

    // Test varying download availabilities.
    await user.type(downloadStatusFilterBox, 'downloadStatus.complete');

    expect(await screen.findByText('test-file-1')).toBeInTheDocument();
    expect(screen.queryByText('test-file-3')).toBeNull();

    await user.clear(downloadMethodFilterBox);
    await user.clear(downloadStatusFilterBox);

    expect(await screen.findByText('test-file-1')).toBeInTheDocument();
    expect(await screen.findByText('test-file-2')).toBeInTheDocument();
    expect(await screen.findByText('test-file-3')).toBeInTheDocument();
    expect(await screen.findByText('test-file-4')).toBeInTheDocument();
    expect(await screen.findByText('test-file-5')).toBeInTheDocument();
  });

  it('should filter data when date filter is altered', async () => {
    applyDatePickerWorkaround();
    renderComponent();

    const dateFromFilterInput = await screen.findByRole('textbox', {
      name: 'downloadStatus.createdAt filter from',
    });
    const dateToFilterInput = await screen.findByRole('textbox', {
      name: 'downloadStatus.createdAt filter to',
    });

    await user.type(dateFromFilterInput, '2020-01-01 00:00');

    expect(await screen.findByText('test-file-1')).toBeInTheDocument();
    expect(await screen.findByText('test-file-2')).toBeInTheDocument();
    expect(await screen.findByText('test-file-3')).toBeInTheDocument();
    expect(await screen.findByText('test-file-4')).toBeInTheDocument();
    expect(await screen.findByText('test-file-5')).toBeInTheDocument();

    await user.type(dateToFilterInput, '2020-01-02 23:59');

    await waitFor(() => {
      expect(screen.queryByText('test-file-1')).toBeNull();
      expect(screen.queryByText('test-file-2')).toBeNull();
      expect(screen.queryByText('test-file-3')).toBeNull();
      expect(screen.queryByText('test-file-4')).toBeNull();
      expect(screen.queryByText('test-file-5')).toBeNull();
    });

    await user.clear(dateFromFilterInput);
    await user.clear(dateToFilterInput);
    await user.type(dateFromFilterInput, '2020-02-26 00:00');
    await user.type(dateToFilterInput, '2020-02-27 23:59');

    expect(await screen.findByText('test-file-2')).toBeInTheDocument();
    expect(await screen.findByText('test-file-3')).toBeInTheDocument();
    expect(screen.queryByText('test-file-1')).toBeNull();
    expect(screen.queryByText('test-file-4')).toBeNull();
    expect(screen.queryByText('test-file-5')).toBeNull();

    cleanupDatePickerWorkaround();
  });
});
