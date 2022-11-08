import * as React from 'react';
import { UserEvent } from '@testing-library/user-event/dist/types/setup';
import {
  adminDownloadDeleted,
  adminDownloadStatus,
  fetchAdminDownloads,
  getDownload,
  getPercentageComplete,
} from '../downloadApi';
import AdminDownloadStatusTable from './adminDownloadStatusTable.component';
import {
  applyDatePickerWorkaround,
  cleanupDatePickerWorkaround,
  flushPromises,
} from '../setupTests';
import userEvent from '@testing-library/user-event';
import {
  render,
  RenderResult,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
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
        <AdminDownloadStatusTable />
      </QueryClientProvider>
    </DownloadSettingsContext.Provider>
  );

describe('Admin Download Status Table', () => {
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup({ delay: null });

    (getDownload as jest.MockedFunction<typeof getDownload>).mockImplementation(
      (id, _) =>
        Promise.resolve(
          mockDownloadItems.find((download) => download.id === id)
        )
    );
    (fetchAdminDownloads as jest.Mock).mockImplementation(
      (
        settings: { facilityName: string; downloadApiUrl: string },
        queryOffset?: string
      ) => {
        //Only return the 5 results when initialy requesting so that only a total
        //of 5 results will be loaded
        if (queryOffset?.endsWith('LIMIT 0, 50'))
          return Promise.resolve(mockDownloadItems);
        else return Promise.resolve([]);
      }
    );
    (adminDownloadDeleted as jest.Mock).mockImplementation(() =>
      Promise.resolve()
    );
    (adminDownloadStatus as jest.Mock).mockImplementation(() =>
      Promise.resolve()
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', async () => {
    const mockedDate = new Date(Date.UTC(2020, 1, 1, 0, 0, 0)).toUTCString();
    global.Date.prototype.toLocaleString = jest.fn(() => mockedDate);

    const { asFragment } = renderComponent();

    // wait for data to finish loading
    expect(
      await screen.findByText(mockedDate.toLocaleString())
    ).toBeInTheDocument();

    expect(asFragment()).toMatchSnapshot();
  });

  it('should fetch the download items and sorts by download requested time desc on load', async () => {
    renderComponent();

    const rows = await screen.findAllByText(/^\d$/);
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

    (fetchAdminDownloads as jest.Mock).mockImplementation(
      (
        settings: { facilityName: string; downloadApiUrl: string },
        queryOffset?: string
      ) => {
        //Only return the 5 results when initialy requesting so that only a total
        //of 5 results will be loaded
        if (queryOffset?.endsWith('LIMIT 0, 50'))
          return mockDownloadItems.slice(0, mockDownloadItems.length - 1);
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

    await user.click(accessMethodSortLabel);
    expect(fetchAdminDownloads).toHaveBeenCalledWith(
      {
        downloadApiUrl: mockedSettings.downloadApiUrl,
        facilityName: mockedSettings.facilityName,
      },
      `WHERE download.facilityName = '${mockedSettings.facilityName}' ORDER BY download.userName asc, download.transport asc, download.id ASC LIMIT 0, 50`
    );

    await user.click(accessMethodSortLabel);
    expect(fetchAdminDownloads).toHaveBeenCalledWith(
      {
        downloadApiUrl: mockedSettings.downloadApiUrl,
        facilityName: mockedSettings.facilityName,
      },
      `WHERE download.facilityName = '${mockedSettings.facilityName}' ORDER BY download.userName asc, download.transport desc, download.id ASC LIMIT 0, 50`
    );

    await user.click(accessMethodSortLabel);
    expect(fetchAdminDownloads).toHaveBeenCalledWith(
      {
        downloadApiUrl: mockedSettings.downloadApiUrl,
        facilityName: mockedSettings.facilityName,
      },
      `WHERE download.facilityName = '${mockedSettings.facilityName}' ORDER BY download.userName asc, download.id ASC LIMIT 0, 50`
    );
  }, 10000);

  describe('text filters', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should filter username properly', async () => {
      jest.useFakeTimers();
      renderComponent();

      // Table is sorted by createdAt desc by default
      // To keep working test, we will remove all sorts on the table beforehand
      await user.click(await screen.findByText('downloadStatus.createdAt'));

      // Get the Username filter input
      const usernameFilterInput = await screen.findByLabelText(
        'Filter by downloadStatus.username'
      );

      await user.type(usernameFilterInput, 'test user');
      jest.runAllTimers();

      expect(fetchAdminDownloads).toHaveBeenCalledWith(
        {
          downloadApiUrl: mockedSettings.downloadApiUrl,
          facilityName: mockedSettings.facilityName,
        },
        `WHERE download.facilityName = '${mockedSettings.facilityName}' AND UPPER(download.userName) LIKE CONCAT('%', 'TEST USER', '%') ORDER BY download.id ASC LIMIT 0, 50`
      );

      await user.clear(usernameFilterInput);
      jest.runAllTimers();

      expect(fetchAdminDownloads).toHaveBeenCalledWith(
        {
          downloadApiUrl: mockedSettings.downloadApiUrl,
          facilityName: mockedSettings.facilityName,
        },
        `WHERE download.facilityName = '${mockedSettings.facilityName}' ORDER BY download.id ASC LIMIT 0, 50`
      );

      jest.useRealTimers();
    }, 10000);

    it('should filter download availability properly', async () => {
      jest.useFakeTimers();
      renderComponent();

      // Table is sorted by createdAt desc by default
      // To keep working test, we will remove all sorts on the table beforehand
      await user.click(await screen.findByText('downloadStatus.createdAt'));

      // Get the Availability filter input
      const availabilityFilterInput = screen.getByLabelText(
        'Filter by downloadStatus.status'
      );

      await user.type(availabilityFilterInput, 'downloadStatus.complete');
      jest.runAllTimers();

      expect(fetchAdminDownloads).toHaveBeenCalledWith(
        {
          downloadApiUrl: mockedSettings.downloadApiUrl,
          facilityName: mockedSettings.facilityName,
        },
        `WHERE download.facilityName = '${mockedSettings.facilityName}' AND UPPER(download.status) LIKE CONCAT('%', 'COMPLETE', '%') ORDER BY download.id ASC LIMIT 0, 50`
      );

      // We simulate a change in the select from 'include' to 'exclude'.
      // click on the select box
      await user.click(screen.getAllByLabelText('include or exclude')[5]);
      // click on exclude option
      await user.click(
        within(await screen.findByRole('listbox')).getByText('Exclude')
      );
      jest.runAllTimers();

      expect(fetchAdminDownloads).toHaveBeenCalledWith(
        {
          downloadApiUrl: mockedSettings.downloadApiUrl,
          facilityName: mockedSettings.facilityName,
        },
        `WHERE download.facilityName = '${mockedSettings.facilityName}' AND UPPER(download.status) NOT LIKE CONCAT('%', 'COMPLETE', '%') ORDER BY download.id ASC LIMIT 0, 50`
      );

      await user.clear(availabilityFilterInput);
      jest.runAllTimers();

      expect(fetchAdminDownloads).toHaveBeenCalledWith(
        {
          downloadApiUrl: mockedSettings.downloadApiUrl,
          facilityName: mockedSettings.facilityName,
        },
        `WHERE download.facilityName = '${mockedSettings.facilityName}' ORDER BY download.id ASC LIMIT 0, 50`
      );

      jest.useRealTimers();
    }, 10000);
  });

  it('sends filter request on date filter', async () => {
    applyDatePickerWorkaround();
    renderComponent();

    // Table is sorted by createdAt desc by default
    // To keep working test, we will remove all sorts on the table beforehand
    await user.click(await screen.findByText('downloadStatus.createdAt'));

    // Get the Requested Data From filter input
    const dateFromFilterInput = screen.getByRole('textbox', {
      name: 'downloadStatus.createdAt filter from',
    });
    await user.type(dateFromFilterInput, '2020-01-01 00:00:00');

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
    await user.type(dateToFilterInput, '2020-01-02 23:59:00');

    // have to wrap the expect in a waitFor because for some reason
    // await user.type doesn't wait until the full thing is typed in before resolving
    // causing fetchAdminDownloads to be called with partial values
    await waitFor(() => {
      expect(fetchAdminDownloads).toHaveBeenCalledWith(
        {
          downloadApiUrl: mockedSettings.downloadApiUrl,
          facilityName: mockedSettings.facilityName,
        },
        `WHERE download.facilityName = '${mockedSettings.facilityName}' AND download.createdAt BETWEEN {ts '2020-01-01 00:00:00'} AND {ts '2020-01-02 23:59:00'} ORDER BY download.id ASC LIMIT 0, 50`
      );
    });

    await user.clear(dateFromFilterInput);
    await user.clear(dateToFilterInput);

    expect(fetchAdminDownloads).toHaveBeenCalledWith(
      {
        downloadApiUrl: mockedSettings.downloadApiUrl,
        facilityName: mockedSettings.facilityName,
      },
      `WHERE download.facilityName = '${mockedSettings.facilityName}' ORDER BY download.id ASC LIMIT 0, 50`
    );

    cleanupDatePickerWorkaround();
  }, 10000);

  it('should send restore item and item status requests when restore button is clicked', async () => {
    renderComponent();

    await flushPromises();

    // without waitFor,
    // toBeInTheDocument will complain it can't find the element
    // even though findBy didn't throw...
    // (it throws when the elemenet actually doesn't exist)
    await waitFor(async () => {
      expect(
        await screen.findByRole('button', {
          name: 'downloadStatus.restore {filename:test-file-4}',
        })
      ).toBeInTheDocument();
    });

    (fetchAdminDownloads as jest.Mock).mockImplementation(
      (
        settings: { facilityName: string; downloadApiUrl: string },
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

    await flushPromises();

    expect(
      await screen.findByRole('button', {
        name: 'downloadStatus.pause {filename:test-file-4}',
      })
    ).toBeInTheDocument();
  }, 10000);

  it('should send pause restore request when pause button is clicked', async () => {
    renderComponent();

    await flushPromises();

    expect(
      await screen.findByRole('button', {
        name: 'downloadStatus.pause {filename:test-file-3}',
      })
    ).toBeInTheDocument();

    (fetchAdminDownloads as jest.Mock).mockImplementation(
      (
        settings: { facilityName: string; downloadApiUrl: string },
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

    await flushPromises();

    expect(
      await screen.findByRole('button', {
        name: 'downloadStatus.resume {filename:test-file-3}',
      })
    ).toBeInTheDocument();
  }, 10000);

  it('should send resume restore request when resume button is clicked', async () => {
    renderComponent();

    await flushPromises();

    expect(
      screen.getByRole('button', {
        name: 'downloadStatus.resume {filename:test-file-5}',
      })
    ).toBeInTheDocument();

    (fetchAdminDownloads as jest.Mock).mockImplementation(
      (
        settings: { facilityName: string; downloadApiUrl: string },
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

    await flushPromises();

    expect(
      await screen.findByRole('button', {
        name: 'downloadStatus.pause {filename:test-file-5}',
      })
    ).toBeInTheDocument();
  }, 10000);

  it('should send delete item request when delete button is clicked', async () => {
    renderComponent();

    await flushPromises();

    await waitFor(async () => {
      expect(
        await screen.findByRole('button', {
          name: 'downloadStatus.delete {filename:test-file-1}',
        })
      ).toBeInTheDocument();
    });

    (fetchAdminDownloads as jest.Mock).mockImplementation(
      (
        settings: { facilityName: string; downloadApiUrl: string },
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
      await screen.findByRole('button', {
        name: 'downloadStatus.delete {filename:test-file-1}',
      })
    );

    expect(
      await screen.findByRole('button', {
        name: 'downloadStatus.restore {filename:test-file-1}',
      })
    ).toBeInTheDocument();
  }, 10000);

  it('should display progress ui if enabled', async () => {
    (
      getPercentageComplete as jest.MockedFunction<typeof getPercentageComplete>
    ).mockResolvedValue(30);

    renderComponent({
      settings: {
        ...mockedSettings,
        uiFeatures: {
          downloadProgress: true,
        },
      },
    });

    await waitFor(() => {
      for (const progressBar of screen.getAllByRole('progressbar')) {
        expect(progressBar).toBeInTheDocument();
      }
      for (const progressText of screen.getAllByText('30%')) {
        expect(progressText).toBeInTheDocument();
      }
    });
  });

  it('should refresh download progress when refresh button is clicked', async () => {
    (
      getPercentageComplete as jest.MockedFunction<typeof getPercentageComplete>
    ).mockResolvedValue(30);

    renderComponent({
      settings: {
        ...mockedSettings,
        uiFeatures: {
          downloadProgress: true,
        },
      },
    });

    await waitFor(() => {
      for (const progressBar of screen.getAllByRole('progressbar')) {
        expect(progressBar).toBeInTheDocument();
      }
      for (const progressText of screen.getAllByText('30%')) {
        expect(progressText).toBeInTheDocument();
      }
    });

    // pretend the server returns an updated value
    (
      getPercentageComplete as jest.MockedFunction<typeof getPercentageComplete>
    ).mockResolvedValue(50);

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
  }, 10000);
});
