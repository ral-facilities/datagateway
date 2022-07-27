import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserEvent } from '@testing-library/user-event/dist/types/setup';
import * as React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import {
  downloadDeleted,
  fetchDownloads,
  getDataUrl,
  getPercentageComplete,
} from '../downloadApi';
import {
  applyDatePickerWorkaround,
  cleanupDatePickerWorkaround,
} from '../setupTests';
import DownloadStatusTable from './downloadStatusTable.component';
import { mockDownloadItems, mockedSettings } from '../testData';
import { DownloadSettingsContext } from '../ConfigProvider';

jest.mock('../downloadApi');

const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderComponent = ({ settings = mockedSettings } = {}): RenderResult =>
  render(
    <DownloadSettingsContext.Provider value={settings}>
      <QueryClientProvider client={createTestQueryClient()}>
        <DownloadStatusTable
          refreshTable={false}
          setRefreshTable={jest.fn()}
          setLastChecked={jest.fn()}
        />
      </QueryClientProvider>
    </DownloadSettingsContext.Provider>
  );

describe('Download Status Table', () => {
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();

    (downloadDeleted as jest.Mock).mockImplementation(() => Promise.resolve());
    (fetchDownloads as jest.Mock).mockImplementation(() =>
      Promise.resolve(mockDownloadItems)
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
    expect(screen.getByText('test-file-3')).toBeInTheDocument();
    expect(screen.queryByText('test-file-2')).toBeNull();
    expect(screen.queryByText('test-file-4')).toBeNull();

    // Test varying download availabilities.
    await user.type(downloadStatusFilterBox, 'downloadStatus.complete');

    expect(await screen.findByText('test-file-1')).toBeInTheDocument();
    expect(screen.queryByText('test-file-3')).toBeNull();

    await user.clear(downloadMethodFilterBox);
    await user.clear(downloadStatusFilterBox);

    expect(await screen.findByText('test-file-1')).toBeInTheDocument();
    expect(screen.getByText('test-file-2')).toBeInTheDocument();
    expect(screen.getByText('test-file-3')).toBeInTheDocument();
    expect(screen.getByText('test-file-4')).toBeInTheDocument();
    expect(screen.getByText('test-file-5')).toBeInTheDocument();
  }, 10000);

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
  }, 10000);

  it('should show download progress ui if enabled', async () => {
    (getPercentageComplete as jest.MockedFunction<
      typeof getPercentageComplete
    >).mockResolvedValue(20);

    renderComponent({
      settings: {
        ...mockedSettings,
        uiFeatures: ['DOWNLOAD_PROGRESS'],
      },
    });

    expect(
      await screen.findByText('downloadStatus.progress')
    ).toBeInTheDocument();
    expect(screen.getAllByRole('progressbar')).toHaveLength(
      mockDownloadItems.length
    );
    expect(screen.getAllByText('20%')).toHaveLength(mockDownloadItems.length);
  });
});
