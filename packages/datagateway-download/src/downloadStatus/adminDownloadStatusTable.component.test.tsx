import {
  adminDownloadDeleted,
  adminDownloadStatus,
  fetchAdminDownloads,
  getDownload,
  getPercentageComplete,
} from '../downloadApi';
import AdminDownloadStatusTable from './adminDownloadStatusTable.component';
import { flushPromises } from '../setupTests';
import userEvent from '@testing-library/user-event';
import {
  act,
  render,
  RenderResult,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mockDownloadItems, mockedSettings } from '../testData';
import { DownloadSettingsContext } from '../ConfigProvider';
import { DGThemeProvider } from 'datagateway-common';

vi.mock('../downloadApi');

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
    // wrap in theme provider to ensure no ripples end up in snapshots
    <DGThemeProvider>
      <DownloadSettingsContext.Provider value={settings}>
        <QueryClientProvider client={createTestQueryClient()}>
          <AdminDownloadStatusTable />
        </QueryClientProvider>
      </DownloadSettingsContext.Provider>
    </DGThemeProvider>
  );

describe('Admin Download Status Table', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup({ delay: null });

    vi.mocked(getDownload).mockImplementation((id, _) =>
      Promise.resolve(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        mockDownloadItems.find((download) => download.id === id)!
      )
    );
    vi.mocked(fetchAdminDownloads).mockImplementation(
      (
        _settings: { facilityName: string; downloadApiUrl: string },
        queryOffset?: string
      ) => {
        //Only return the 5 results when initialy requesting so that only a total
        //of 5 results will be loaded
        if (queryOffset?.endsWith('LIMIT 0, 50'))
          return Promise.resolve(mockDownloadItems);
        else return Promise.resolve([]);
      }
    );
    vi.mocked(adminDownloadDeleted).mockImplementation(() => Promise.resolve());
    vi.mocked(adminDownloadStatus).mockImplementation(() => Promise.resolve());
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('should render correctly', async () => {
    const mockedDate = new Date(Date.UTC(2020, 1, 1, 0, 0, 0));

    vi.useFakeTimers({ toFake: ['Date'] }).setSystemTime(mockedDate);

    const origDate = global.Date.prototype.toLocaleString;
    vi.spyOn(global.Date.prototype, 'toLocaleString').mockImplementation(
      function (this: Date) {
        return origDate.call(this, 'en-GB');
      }
    );

    const { asFragment } = renderComponent();

    // wait for data to finish loading
    expect(
      await screen.findByText('downloadTab.last_checked', { exact: false })
    ).toBeInTheDocument();

    expect(asFragment()).toMatchSnapshot();
  });

  it('should fetch the download items and sorts by download requested time desc on load', async () => {
    renderComponent();

    const rows = await screen.findAllByRole('gridcell', { name: /^\d$/ });
    expect(rows).toHaveLength(5);
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

  it('should re-fetch the download items when the refresh button is clicked', async () => {
    renderComponent();

    expect(await screen.findAllByText(/^\d$/)).toHaveLength(
      mockDownloadItems.length
    );

    vi.mocked(fetchAdminDownloads).mockImplementation(
      (
        _settings: { facilityName: string; downloadApiUrl: string },
        queryOffset?: string
      ) => {
        //Only return the 5 results when initialy requesting so that only a total
        //of 5 results will be loaded
        if (queryOffset?.endsWith('LIMIT 0, 50'))
          return Promise.resolve(
            mockDownloadItems.slice(0, mockDownloadItems.length - 1)
          );
        return Promise.resolve([]);
      }
    );

    await user.click(
      screen.getByRole('button', {
        name: 'downloadTab.refresh_download_status_arialabel',
      })
    );

    await waitFor(() => {
      expect(screen.queryAllByText(/^\d$/)).toHaveLength(
        mockDownloadItems.length - 1
      );
    });
  });

  it('should send sort request on sort', async () => {
    // use skipHover to avoid triggering sort tooltips which slow the test down
    user = userEvent.setup({ delay: null, skipHover: true });
    renderComponent();

    // Table is sorted by createdAt desc by default
    // To keep working test, we will remove all sorts on the table beforehand
    await user.click(await screen.findByText('downloadStatus.createdAt'));

    // Get the Username sort header
    const usernameSortLabel = await screen.findByText(
      'downloadStatus.username'
    );

    await user.click(usernameSortLabel);

    expect(fetchAdminDownloads).toHaveBeenCalledWith(
      {
        downloadApiUrl: mockedSettings.downloadApiUrl,
        facilityName: mockedSettings.facilityName,
      },
      `WHERE download.facilityName = '${mockedSettings.facilityName}' ORDER BY download.userName asc, download.id ASC LIMIT 0, 50`
    );

    // Get the Access Method sort header.
    const accessMethodSortLabel = await screen.findByText(
      'downloadStatus.transport'
    );

    // should replace the sort by username with sort by access method
    await user.click(accessMethodSortLabel);
    expect(fetchAdminDownloads).toHaveBeenCalledWith(
      {
        downloadApiUrl: mockedSettings.downloadApiUrl,
        facilityName: mockedSettings.facilityName,
      },
      `WHERE download.facilityName = '${mockedSettings.facilityName}' ORDER BY download.transport asc, download.id ASC LIMIT 0, 50`
    );

    // should append sort if shift key is pressed
    await user.keyboard('{Shift>}');
    await user.click(usernameSortLabel);
    await user.keyboard('{/Shift}');

    expect(fetchAdminDownloads).toHaveBeenCalledWith(
      {
        downloadApiUrl: mockedSettings.downloadApiUrl,
        facilityName: mockedSettings.facilityName,
      },
      `WHERE download.facilityName = '${mockedSettings.facilityName}' ORDER BY download.transport asc, download.userName asc, download.id ASC LIMIT 0, 50`
    );

    await user.keyboard('{Shift>}');
    await user.click(accessMethodSortLabel);
    await user.keyboard('{/Shift}');

    expect(fetchAdminDownloads).toHaveBeenCalledWith(
      {
        downloadApiUrl: mockedSettings.downloadApiUrl,
        facilityName: mockedSettings.facilityName,
      },
      `WHERE download.facilityName = '${mockedSettings.facilityName}' ORDER BY download.transport desc, download.userName asc, download.id ASC LIMIT 0, 50`
    );

    await user.click(accessMethodSortLabel);
    expect(fetchAdminDownloads).toHaveBeenCalledWith(
      {
        downloadApiUrl: mockedSettings.downloadApiUrl,
        facilityName: mockedSettings.facilityName,
      },
      `WHERE download.facilityName = '${mockedSettings.facilityName}' ORDER BY download.userName asc, download.id ASC LIMIT 0, 50`
    );
  });

  describe('text filters', () => {
    it('should filter username properly', async () => {
      // use skipHover to avoid triggering sort tooltips which slow the test down
      user = userEvent.setup({ delay: null, skipHover: true });

      renderComponent();

      await act(async () => {
        await flushPromises();
      });

      // Table is sorted by createdAt desc by default
      // To keep working test, we will remove all sorts on the table beforehand
      await user.click(await screen.findByText('downloadStatus.createdAt'));

      // Get the Username filter input
      const usernameFilterInput = await screen.findByLabelText(
        'Filter by downloadStatus.username'
      );

      await user.type(usernameFilterInput, "test user'");

      // test exact filter
      await user.click(
        within(
          screen.getByRole('columnheader', { name: /downloadStatus.username/ })
        ).getByLabelText('include, exclude or exact')
      );
      // click on exclude option
      await user.click(
        within(await screen.findByRole('listbox')).getByText('Exact')
      );

      await act(async () => {
        await flushPromises();
      });

      expect(fetchAdminDownloads).toHaveBeenCalledWith(
        {
          downloadApiUrl: mockedSettings.downloadApiUrl,
          facilityName: mockedSettings.facilityName,
        },
        `WHERE download.facilityName = '${mockedSettings.facilityName}' AND download.userName = 'test user''' ORDER BY download.id ASC LIMIT 0, 50`
      );

      await user.clear(usernameFilterInput);

      await act(async () => {
        await flushPromises();
      });

      expect(fetchAdminDownloads).toHaveBeenCalledWith(
        {
          downloadApiUrl: mockedSettings.downloadApiUrl,
          facilityName: mockedSettings.facilityName,
        },
        `WHERE download.facilityName = '${mockedSettings.facilityName}' ORDER BY download.id ASC LIMIT 0, 50`
      );
    });

    it('should filter download availability properly', async () => {
      // use skipHover to avoid triggering sort tooltips which slow the test down
      user = userEvent.setup({ delay: null, skipHover: true });

      renderComponent();

      await act(async () => {
        await flushPromises();
      });

      // Table is sorted by createdAt desc by default
      // To keep working test, we will remove all sorts on the table beforehand
      await user.click(await screen.findByText('downloadStatus.createdAt'));

      // Get the Availability filter input
      const availabilityFilterInput = screen.getByLabelText(
        'Filter by downloadStatus.status'
      );

      await user.type(availabilityFilterInput, "downloadStatus.complete'");

      await act(async () => {
        await flushPromises();
      });

      // test include filter
      expect(fetchAdminDownloads).toHaveBeenCalledWith(
        {
          downloadApiUrl: mockedSettings.downloadApiUrl,
          facilityName: mockedSettings.facilityName,
        },
        `WHERE download.facilityName = '${mockedSettings.facilityName}' AND UPPER(download.status) LIKE CONCAT('%', 'COMPLETE''', '%') ORDER BY download.id ASC LIMIT 0, 50`
      );

      // We simulate a change in the select from 'include' to 'exclude'.
      // click on the select box
      await user.click(
        within(
          screen.getByRole('columnheader', { name: /downloadStatus.status/ })
        ).getByLabelText('include, exclude or exact')
      );
      // click on exclude option
      await user.click(
        within(await screen.findByRole('listbox')).getByText('Exclude')
      );

      await act(async () => {
        await flushPromises();
      });

      expect(fetchAdminDownloads).toHaveBeenCalledWith(
        {
          downloadApiUrl: mockedSettings.downloadApiUrl,
          facilityName: mockedSettings.facilityName,
        },
        `WHERE download.facilityName = '${mockedSettings.facilityName}' AND UPPER(download.status) NOT LIKE CONCAT('%', 'COMPLETE''', '%') ORDER BY download.id ASC LIMIT 0, 50`
      );

      await user.clear(availabilityFilterInput);

      await act(async () => {
        await flushPromises();
      });

      expect(fetchAdminDownloads).toHaveBeenCalledWith(
        {
          downloadApiUrl: mockedSettings.downloadApiUrl,
          facilityName: mockedSettings.facilityName,
        },
        `WHERE download.facilityName = '${mockedSettings.facilityName}' ORDER BY download.id ASC LIMIT 0, 50`
      );
    });
  });

  it('sends filter request on date filter', async () => {
    // use skipHover to avoid triggering sort tooltips which slow the test down
    user = userEvent.setup({ delay: null, skipHover: true });

    renderComponent();

    await act(async () => {
      await flushPromises();
    });

    // Table is sorted by createdAt desc by default
    // To keep working test, we will remove all sorts on the table beforehand
    await user.click(await screen.findByText('downloadStatus.createdAt'));

    await act(async () => {
      await flushPromises();
    });

    // Get the Requested Data From filter input
    const dateFromFilterInput = screen.getByRole('textbox', {
      name: 'downloadStatus.createdAt filter from',
    });
    await user.type(dateFromFilterInput, '2020-01-01_00:00:00');

    await act(async () => {
      await flushPromises();
    });

    expect(fetchAdminDownloads).toHaveBeenCalledWith(
      {
        downloadApiUrl: mockedSettings.downloadApiUrl,
        facilityName: mockedSettings.facilityName,
      },
      `WHERE download.facilityName = '${mockedSettings.facilityName}' AND download.createdAt BETWEEN {ts '2020-01-01 00:00:00'} AND {ts '9999-12-31 23:59:00'} ORDER BY download.id ASC LIMIT 0, 50`
    );

    // Get the Requested Data To filter input
    const dateToFilterInput = screen.getByRole('textbox', {
      name: 'downloadStatus.createdAt filter to',
    });

    // in v6 of date-picker spaces are considered to be a '0'
    // 20200102235900 is equivalent to 2020-01-02 03:59:00
    await user.type(dateToFilterInput, '2020-01-02_23:59:00');

    await act(async () => {
      await flushPromises();
    });

    expect(fetchAdminDownloads).toHaveBeenCalledWith(
      {
        downloadApiUrl: mockedSettings.downloadApiUrl,
        facilityName: mockedSettings.facilityName,
      },
      `WHERE download.facilityName = '${mockedSettings.facilityName}' AND download.createdAt BETWEEN {ts '2020-01-01 00:00:00'} AND {ts '2020-01-02 23:59:00'} ORDER BY download.id ASC LIMIT 0, 50`
    );

    vi.mocked(fetchAdminDownloads).mockClear();

    await user.clear(dateFromFilterInput);
    await user.clear(dateToFilterInput);

    await act(async () => {
      await flushPromises();
    });

    expect(fetchAdminDownloads).toHaveBeenCalledWith(
      {
        downloadApiUrl: mockedSettings.downloadApiUrl,
        facilityName: mockedSettings.facilityName,
      },
      `WHERE download.facilityName = '${mockedSettings.facilityName}' ORDER BY download.id ASC LIMIT 0, 50`
    );
  });

  it('should filter deleted properly', async () => {
    renderComponent();

    // Table is sorted by createdAt desc by default
    // To keep working test, we will remove all sorts on the table beforehand
    await user.click(await screen.findByText('downloadStatus.createdAt'));
    await act(async () => {
      await flushPromises();
    });

    // Get the is deleted filter
    const isDeletedFilter = await screen.findByRole('button', {
      name: /Filter by downloadStatus\.deleted/,
    });

    await user.click(isDeletedFilter);

    await user.click(await screen.findByRole('option', { name: 'No' }));

    await act(async () => {
      await flushPromises();
    });

    expect(fetchAdminDownloads).toHaveBeenCalledWith(
      {
        downloadApiUrl: mockedSettings.downloadApiUrl,
        facilityName: mockedSettings.facilityName,
      },
      `WHERE download.facilityName = '${mockedSettings.facilityName}' AND download.isDeleted = 'false' ORDER BY download.id ASC LIMIT 0, 50`
    );

    await user.click(isDeletedFilter);

    await user.click(await screen.findByRole('option', { name: 'Yes' }));

    await act(async () => {
      await flushPromises();
    });

    expect(fetchAdminDownloads).toHaveBeenCalledWith(
      {
        downloadApiUrl: mockedSettings.downloadApiUrl,
        facilityName: mockedSettings.facilityName,
      },
      `WHERE download.facilityName = '${mockedSettings.facilityName}' AND download.isDeleted = 'true' ORDER BY download.id ASC LIMIT 0, 50`
    );

    await user.click(isDeletedFilter);

    await user.click(await screen.findByRole('option', { name: 'Either' }));

    await act(async () => {
      await flushPromises();
    });

    expect(fetchAdminDownloads).toHaveBeenCalledWith(
      {
        downloadApiUrl: mockedSettings.downloadApiUrl,
        facilityName: mockedSettings.facilityName,
      },
      `WHERE download.facilityName = '${mockedSettings.facilityName}' ORDER BY download.id ASC LIMIT 0, 50`
    );
  });

  it('should send restore item and item status requests when restore button is clicked', async () => {
    renderComponent();

    // wait for data to finish loading
    expect(
      await screen.findByText('downloadTab.last_checked', { exact: false })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: 'downloadStatus.restore {filename:test-file-4}',
      })
    ).toBeInTheDocument();

    vi.mocked(fetchAdminDownloads).mockImplementation(
      (
        _settings: { facilityName: string; downloadApiUrl: string },
        queryOffset?: string
      ) => {
        //Only return the 5 results when initialy requesting so that only a total
        //of 5 results will be loaded
        if (queryOffset?.endsWith('LIMIT 0, 50'))
          return Promise.resolve(
            mockDownloadItems.map((d) =>
              d.id === 4
                ? {
                    ...d,
                    isDeleted: false,
                    status: 'RESTORING',
                  }
                : d
            )
          );
        return Promise.resolve([]);
      }
    );

    await user.click(
      screen.getByRole('button', {
        name: 'downloadStatus.restore {filename:test-file-4}',
      })
    );

    await act(async () => {
      await flushPromises();
    });

    expect(
      await screen.findByRole('button', {
        name: 'downloadStatus.pause {filename:test-file-4}',
      })
    ).toBeInTheDocument();
  });

  it('should send pause restore request when pause button is clicked', async () => {
    renderComponent();

    // wait for data to finish loading
    expect(
      await screen.findByText('downloadTab.last_checked', { exact: false })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: 'downloadStatus.pause {filename:test-file-3}',
      })
    ).toBeInTheDocument();

    vi.mocked(fetchAdminDownloads).mockImplementation(
      (
        _settings: { facilityName: string; downloadApiUrl: string },
        queryOffset?: string
      ) => {
        //Only return the 5 results when initialy requesting so that only a total
        //of 5 results will be loaded
        if (queryOffset?.endsWith('LIMIT 0, 50'))
          return Promise.resolve(
            mockDownloadItems.map((d) =>
              d.id === 3
                ? {
                    ...d,
                    isDeleted: false,
                    status: 'PAUSED',
                  }
                : d
            )
          );
        return Promise.resolve([]);
      }
    );

    await user.click(
      screen.getByRole('button', {
        name: 'downloadStatus.pause {filename:test-file-3}',
      })
    );

    await act(async () => {
      await flushPromises();
    });

    expect(
      await screen.findByRole('button', {
        name: 'downloadStatus.resume {filename:test-file-3}',
      })
    ).toBeInTheDocument();
  });

  it('should send resume restore request when resume button is clicked', async () => {
    renderComponent();

    // wait for data to finish loading
    expect(
      await screen.findByText('downloadTab.last_checked', { exact: false })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: 'downloadStatus.resume {filename:test-file-5}',
      })
    ).toBeInTheDocument();

    vi.mocked(fetchAdminDownloads).mockImplementation(
      (
        _settings: { facilityName: string; downloadApiUrl: string },
        queryOffset?: string
      ) => {
        //Only return the 5 results when initialy requesting so that only a total
        //of 5 results will be loaded
        if (queryOffset?.endsWith('LIMIT 0, 50'))
          return Promise.resolve(
            mockDownloadItems.map((d) =>
              d.id === 5
                ? {
                    ...d,
                    isDeleted: false,
                    status: 'RESTORING',
                  }
                : d
            )
          );
        return Promise.resolve([]);
      }
    );

    await user.click(
      screen.getByRole('button', {
        name: 'downloadStatus.resume {filename:test-file-5}',
      })
    );

    await act(async () => {
      await flushPromises();
    });

    expect(
      await screen.findByRole('button', {
        name: 'downloadStatus.pause {filename:test-file-5}',
      })
    ).toBeInTheDocument();
  });

  it('should send delete item request when delete button is clicked', async () => {
    renderComponent();

    // wait for data to finish loading
    expect(
      await screen.findByText('downloadTab.last_checked', { exact: false })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: 'downloadStatus.delete {filename:test-file-1}',
      })
    ).toBeInTheDocument();

    vi.mocked(fetchAdminDownloads).mockImplementation(
      (
        _settings: { facilityName: string; downloadApiUrl: string },
        queryOffset?: string
      ) => {
        //Only return the 5 results when initialy requesting so that only a total
        //of 5 results will be loaded
        if (queryOffset?.endsWith('LIMIT 0, 50'))
          return Promise.resolve(
            mockDownloadItems.map((d) =>
              d.id === 1
                ? {
                    ...d,
                    isDeleted: true,
                  }
                : d
            )
          );
        return Promise.resolve([]);
      }
    );

    await user.click(
      screen.getByRole('button', {
        name: 'downloadStatus.delete {filename:test-file-1}',
      })
    );

    expect(
      await screen.findByRole('button', {
        name: 'downloadStatus.restore {filename:test-file-1}',
      })
    ).toBeInTheDocument();
  });

  it('should display progress ui if enabled', async () => {
    vi.mocked(getPercentageComplete).mockResolvedValue(30);

    renderComponent({
      settings: {
        ...mockedSettings,
        uiFeatures: {
          downloadProgress: true,
        },
      },
    });

    await waitFor(() => {
      for (const progressBar of screen.getAllByRole('progressbar', {
        value: { now: 30 },
      })) {
        expect(progressBar).toBeInTheDocument();
      }
      for (const progressText of screen.getAllByText('30%')) {
        expect(progressText).toBeInTheDocument();
      }
    });
  });

  it('should refresh download progress when refresh button is clicked', async () => {
    vi.mocked(getPercentageComplete).mockResolvedValue(30);

    renderComponent({
      settings: {
        ...mockedSettings,
        uiFeatures: {
          downloadProgress: true,
        },
      },
    });

    await waitFor(() => {
      for (const progressBar of screen.getAllByRole('progressbar', {
        value: { now: 30 },
      })) {
        expect(progressBar).toBeInTheDocument();
      }
      for (const progressText of screen.getAllByText('30%')) {
        expect(progressText).toBeInTheDocument();
      }
    });

    // pretend the server returns an updated value
    vi.mocked(getPercentageComplete).mockResolvedValue(50);

    await user.click(
      screen.getByRole('button', {
        name: 'downloadTab.refresh_download_status_arialabel',
      })
    );

    await waitFor(() => {
      for (const progressBar of screen.getAllByRole('progressbar')) {
        expect(progressBar).toBeInTheDocument();
      }
      for (const progressText of screen.getAllByText('50%')) {
        expect(progressText).toBeInTheDocument();
      }
    });
  });
});
