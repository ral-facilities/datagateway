import {
  render,
  RenderResult,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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

vi.mock('../downloadApi');

const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderComponent = ({
  settings = mockedSettings,
  queryClient = createTestQueryClient(),
} = {}): RenderResult =>
  render(
    <DownloadSettingsContext.Provider value={settings}>
      <QueryClientProvider client={queryClient}>
        <DownloadStatusTable
          refreshTable={false}
          setRefreshTable={vi.fn()}
          setLastCheckedTimestamp={vi.fn()}
        />
      </QueryClientProvider>
    </DownloadSettingsContext.Provider>
  );

describe('Download Status Table', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup({ delay: null });

    vi.mocked(downloadDeleted).mockImplementation(() => Promise.resolve());
    vi.mocked(fetchDownloads).mockImplementation(() =>
      Promise.resolve(mockDownloadItems)
    );
    vi.mocked(getDataUrl).mockImplementation(() => '/getData');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render correctly', async () => {
    const { asFragment } = renderComponent();

    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );

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

  it('should refresh data & download progress when required', async () => {
    vi.mocked(getPercentageComplete).mockResolvedValue(30);
    const settings = {
      ...mockedSettings,
      uiFeatures: {
        downloadProgress: true,
      },
    };

    const queryClient = createTestQueryClient();
    const { rerender } = renderComponent({ settings, queryClient });

    expect(await screen.findByText('test-file-1')).toBeInTheDocument();
    expect(await screen.findByText('test-file-2')).toBeInTheDocument();
    expect(await screen.findByText('test-file-3')).toBeInTheDocument();
    expect(await screen.findByText('test-file-4')).toBeInTheDocument();
    expect(await screen.findByText('test-file-5')).toBeInTheDocument();

    await waitFor(() => {
      for (const progressBar of screen.getAllByRole('progressbar')) {
        expect(progressBar).toBeInTheDocument();
      }
      for (const progressText of screen.getAllByText('30%')) {
        expect(progressText).toBeInTheDocument();
      }
    });

    // pretend server returned a different list (with only the restoring download)
    vi.mocked(fetchDownloads).mockReturnValueOnce([mockDownloadItems[2]]);
    // pretend the server returns an updated value
    vi.mocked(getPercentageComplete).mockResolvedValue(50);
    rerender(
      <DownloadSettingsContext.Provider value={settings}>
        <QueryClientProvider client={queryClient}>
          <DownloadStatusTable
            refreshTable
            setRefreshTable={vi.fn()}
            setLastCheckedTimestamp={vi.fn()}
          />
        </QueryClientProvider>
      </DownloadSettingsContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('test-file-3')).toBeInTheDocument();
      expect(screen.queryByText('test-file-1')).toBeNull();
      expect(screen.queryByText('test-file-2')).toBeNull();
      expect(screen.queryByText('test-file-4')).toBeNull();
      expect(screen.queryByText('test-file-5')).toBeNull();

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
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
    // use skipHover to avoid triggering sort tooltips which slow the test down
    user = userEvent.setup({ delay: null, skipHover: true });
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

    await user.keyboard('{Shift>}');
    await user.click(nameSortLabel);
    await user.keyboard('{/Shift}');

    // name should be in asc order
    rows = await screen.findAllByText(/^test-file-\d$/);
    expect(rows[0]).toHaveTextContent('test-file-1');
    expect(rows[1]).toHaveTextContent('test-file-3');
    expect(rows[2]).toHaveTextContent('test-file-2');
    expect(rows[3]).toHaveTextContent('test-file-4');
    expect(rows[4]).toHaveTextContent('test-file-5');

    await user.keyboard('{Shift>}');
    await user.click(nameSortLabel);
    await user.keyboard('{/Shift}');

    // name should be in desc order
    rows = await screen.findAllByText(/^test-file-\d$/);
    expect(rows[0]).toHaveTextContent('test-file-3');
    expect(rows[1]).toHaveTextContent('test-file-1');
    expect(rows[2]).toHaveTextContent('test-file-5');
    expect(rows[3]).toHaveTextContent('test-file-4');
    expect(rows[4]).toHaveTextContent('test-file-2');

    await user.click(accessMethodSortLabel);

    // name should be in desc order
    rows = await screen.findAllByText(/^test-file-\d$/);
    expect(rows[0]).toHaveTextContent('test-file-5');
    expect(rows[1]).toHaveTextContent('test-file-4');
    expect(rows[2]).toHaveTextContent('test-file-3');
    expect(rows[3]).toHaveTextContent('test-file-2');
    expect(rows[4]).toHaveTextContent('test-file-1');

    await user.click(accessMethodSortLabel);

    // access methods should be in asc order, globus < https
    rows = await screen.findAllByText(/^test-file-\d$/);
    expect(rows[0]).toHaveTextContent('test-file-2');
    expect(rows[1]).toHaveTextContent('test-file-4');
    expect(rows[2]).toHaveTextContent('test-file-5');
    expect(rows[3]).toHaveTextContent('test-file-1');
    expect(rows[4]).toHaveTextContent('test-file-3');
  });

  it('should filter data when text fields are typed into', async () => {
    vi.mocked(fetchDownloads).mockImplementation(() =>
      Promise.resolve([
        ...mockDownloadItems,
        { ...mockDownloadItems[0], id: 11, fileName: 'test-file-11' },
      ])
    );
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
    await user.type(fileNameFilterBox, 'test-file-1');

    // should only show file-name-1 and file-name-11
    expect(await screen.findByText('test-file-1')).toBeInTheDocument();
    expect(screen.getByText('test-file-11')).toBeInTheDocument();
    expect(screen.queryByText('test-file-2')).toBeNull();
    expect(screen.queryByText('test-file-3')).toBeNull();
    expect(screen.queryByText('test-file-4')).toBeNull();
    expect(screen.queryByText('test-file-5')).toBeNull();

    // test exclude filter

    await user.click(
      within(
        screen.getByRole('columnheader', { name: /downloadStatus.filename/ })
      ).getByLabelText('include, exclude or exact')
    );

    await user.click(
      within(await screen.findByRole('listbox')).getByText('Exclude')
    );

    expect(await screen.findByText('test-file-2')).toBeInTheDocument();
    expect(screen.queryByText('test-file-1')).toBeNull();
    expect(screen.queryByText('test-file-11')).toBeNull();
    expect(screen.getByText('test-file-3')).toBeInTheDocument();
    expect(screen.getByText('test-file-4')).toBeInTheDocument();
    expect(screen.getByText('test-file-5')).toBeInTheDocument();

    // test exact filter

    await user.click(
      within(
        screen.getByRole('columnheader', { name: /downloadStatus.filename/ })
      ).getByLabelText('include, exclude or exact')
    );

    await user.click(
      within(await screen.findByRole('listbox')).getByText('Exact')
    );

    expect(await screen.findByText('test-file-1')).toBeInTheDocument();
    expect(screen.queryByText('test-file-11')).toBeNull();
    expect(screen.queryByText('test-file-2')).toBeNull();
    expect(screen.queryByText('test-file-3')).toBeNull();
    expect(screen.queryByText('test-file-4')).toBeNull();
    expect(screen.queryByText('test-file-5')).toBeNull();

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

    // Type into date from filter textbox
    await user.type(dateFromFilterInput, '2020-01-01 00:00:00');

    // Should show all files
    expect(await screen.findByText('test-file-1')).toBeInTheDocument();
    expect(await screen.findByText('test-file-2')).toBeInTheDocument();
    expect(await screen.findByText('test-file-3')).toBeInTheDocument();
    expect(await screen.findByText('test-file-4')).toBeInTheDocument();
    expect(await screen.findByText('test-file-5')).toBeInTheDocument();

    // Type into date to filter textbox
    await user.type(dateToFilterInput, '2020-01-02 23:59:00');

    // Should show no files
    await waitFor(() => {
      expect(screen.queryByText('test-file-1')).toBeNull();
      expect(screen.queryByText('test-file-2')).toBeNull();
      expect(screen.queryByText('test-file-3')).toBeNull();
      expect(screen.queryByText('test-file-4')).toBeNull();
      expect(screen.queryByText('test-file-5')).toBeNull();
    });

    // Clear both date filter textboxes
    await user.clear(dateFromFilterInput);
    await user.clear(dateToFilterInput);
    // Type into both date filters
    await user.type(dateFromFilterInput, '2020-02-26 00:00:00');
    await user.type(dateToFilterInput, '20200227235900');

    // Should show only test-file-2 and test-file-3
    expect(await screen.findByText('test-file-2')).toBeInTheDocument();
    expect(await screen.findByText('test-file-3')).toBeInTheDocument();
    expect(screen.queryByText('test-file-1')).toBeNull();
    expect(screen.queryByText('test-file-4')).toBeNull();
    expect(screen.queryByText('test-file-5')).toBeNull();

    // Clear both date filter textboxes
    await user.clear(dateFromFilterInput);
    await user.clear(dateToFilterInput);
    // Type into only date from filter
    await user.type(dateFromFilterInput, '2020-02-27 00:00:00');

    // Should show test-file-3, test-file-4 and test-file-5
    expect(await screen.findByText('test-file-3')).toBeInTheDocument();
    expect(await screen.findByText('test-file-4')).toBeInTheDocument();
    expect(await screen.findByText('test-file-5')).toBeInTheDocument();
    expect(screen.queryByText('test-file-1')).toBeNull();
    expect(screen.queryByText('test-file-2')).toBeNull();

    // Clear date from filter textbox
    await user.click(dateFromFilterInput);
    await user.keyboard('{Control}a{/Control}');
    await user.keyboard('{Delete}');
    // await user.clear(dateFromFilterInput);
    // Type into only date to filter
    await user.type(dateToFilterInput, '2020-02-27 00:00:00');

    // Should show only test-file-1 and test-file-2
    expect(await screen.findByText('test-file-1')).toBeInTheDocument();
    expect(await screen.findByText('test-file-2')).toBeInTheDocument();
    expect(screen.queryByText('test-file-3')).toBeNull();
    expect(screen.queryByText('test-file-4')).toBeNull();
    expect(screen.queryByText('test-file-5')).toBeNull();

    // create an invalid range
    await user.type(dateFromFilterInput, '2020-02-28 00:00:00');

    // should display error
    expect(await screen.findAllByText('Invalid date-time range'));

    // Should show all files
    expect(await screen.findByText('test-file-1')).toBeInTheDocument();
    expect(await screen.findByText('test-file-2')).toBeInTheDocument();
    expect(await screen.findByText('test-file-3')).toBeInTheDocument();
    expect(await screen.findByText('test-file-4')).toBeInTheDocument();
    expect(await screen.findByText('test-file-5')).toBeInTheDocument();

    cleanupDatePickerWorkaround();
  });

  it('should display download progress ui if enabled', async () => {
    vi.mocked(getPercentageComplete).mockResolvedValue(20);

    renderComponent({
      settings: {
        ...mockedSettings,
        uiFeatures: {
          downloadProgress: true,
        },
      },
    });

    expect(
      await screen.findByText('downloadStatus.progress')
    ).toBeInTheDocument();

    await waitFor(() => {
      for (const progressBar of screen.getAllByRole('progressbar')) {
        expect(progressBar).toBeInTheDocument();
      }
      for (const progressText of screen.getAllByText('20%')) {
        expect(progressText).toBeInTheDocument();
      }
    });
  });
});
