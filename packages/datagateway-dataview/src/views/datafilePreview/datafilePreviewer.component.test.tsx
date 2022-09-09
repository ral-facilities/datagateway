import {
  act,
  fireEvent,
  render,
  type RenderResult,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event/setup/setup';
import axios, { type AxiosRequestConfig } from 'axios';
import { downloadDatafile } from 'datagateway-common';
import type { Datafile } from 'datagateway-common/lib/app.types';
import * as React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { combineReducers, createStore, type Store } from 'redux';
import DGDataViewReducer from '../../state/reducers/dgdataview.reducer';
import DatafilePreviewer from './datafilePreviewer.component';
import { mockDatafile, mockTxtFileContent } from './testData';

jest.mock('datagateway-common', () => ({
  ...jest.requireActual('datagateway-common'),
  downloadDatafile: jest.fn(),
}));

function createMockStore(): Store {
  return createStore(
    combineReducers({
      // a mock dgcommon reducer that always produce the same dgcommon state
      dgcommon: (_, __) => ({
        urls: {
          idsUrl: 'idsUrl',
          apiUrl: '',
        },
      }),
      dgdataview: DGDataViewReducer,
    })
  );
}

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

function renderComponent(): RenderResult {
  const store = createMockStore();

  return render(
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter>
        <Provider store={store}>
          <DatafilePreviewer datafileId={mockDatafile.id} />
        </Provider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('DatafilePreviewer', () => {
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();
    axios.get = jest
      .fn()
      .mockImplementation((url: string, config: AxiosRequestConfig) => {
        if (/.*\/datafiles$/.test(url)) {
          // this is fetch datafile query, resolve with the mock datafile
          return Promise.resolve({
            data: [mockDatafile],
          });
        }
        if (/.*\/getData$/.test(url)) {
          config.onDownloadProgress(
            new ProgressEvent('progress', {
              loaded: 10,
              total: 10,
            })
          );
          // this is download datafile content query, resolve with mock datafile content
          return Promise.resolve({
            data: mockTxtFileContent,
          });
        }
      });
  });

  describe('should show a message saying the datafile is invalid', () => {
    it('when the given datafile id is not a number', async () => {
      render(
        <QueryClientProvider client={createQueryClient()}>
          <Provider store={createMockStore()}>
            <DatafilePreviewer datafileId={NaN} />
          </Provider>
        </QueryClientProvider>
      );

      expect(
        await screen.findByText('datafiles.preview.invalid_datafile')
      ).toBeInTheDocument();
    });

    it('when the datafile query returns null', async () => {
      // pretend the server returns an empty array for the datafile query.
      axios.get = jest.fn().mockResolvedValueOnce({
        data: [],
      });

      renderComponent();

      expect(
        await screen.findByText('datafiles.preview.invalid_datafile')
      ).toBeInTheDocument();
    });
  });

  it('should show a message saying the datafile metadata is unavailable when the datafile query fails', async () => {
    axios.get = jest.fn().mockImplementation(() =>
      Promise.reject({
        response: { status: 403 },
        message: 'Cannot fetch datafile',
      })
    );

    renderComponent();

    expect(
      await screen.findByText('datafiles.preview.cannot_load_metadata')
    ).toBeInTheDocument();
    expect(screen.getByText('Cannot fetch datafile')).toBeInTheDocument();
  });

  it('should show a message saying the datafile metadata is being fetched when the datafile metadata query is loading', async () => {
    axios.get = jest.fn().mockReturnValue(
      new Promise((_) => {
        // never resolve this promise to pretend the queries are still loading
      })
    );

    renderComponent();

    expect(
      await screen.findByText('datafiles.preview.loading_metadata')
    ).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should show a message saying the datafile content is unavailable when the previewer failed to download the content', async () => {
    axios.get = jest.fn().mockImplementation((url: string) => {
      if (/.*\/datafiles$/.test(url)) {
        // this is fetch datafile query, resolve normally
        return Promise.resolve({
          data: [mockDatafile],
        });
      }
      if (/.*\/getData$/.test(url)) {
        // this is query for downloading datafile content
        // fail this deliberately to test behavior
        return Promise.reject({
          message: 'Cannot download content',
        });
      }
    });

    renderComponent();

    expect(
      await screen.findByText('datafiles.preview.cannot_load_content')
    ).toBeInTheDocument();
    expect(screen.getByText('Cannot download content')).toBeInTheDocument();

    // should still show the details of the datafile
    expect(screen.getByText(mockDatafile.name)).toBeInTheDocument();
    expect(screen.getByText(mockDatafile.description)).toBeInTheDocument();
    expect(screen.getByText(mockDatafile.location)).toBeInTheDocument();
    // formatted size of the datafile
    expect(screen.getByText('100 B')).toBeInTheDocument();
    expect(screen.getByText(mockDatafile.modTime)).toBeInTheDocument();
    expect(screen.getByText(mockDatafile.createTime)).toBeInTheDocument();
  });

  it('should show the current progress of downloading datafile content', async () => {
    axios.get = jest
      .fn()
      .mockImplementation((url: string, config: AxiosRequestConfig) => {
        if (/.*\/datafiles$/.test(url)) {
          // this is fetch datafile query, resolve normally
          return Promise.resolve({
            data: [mockDatafile],
          });
        }
        if (/.*\/getData$/.test(url)) {
          // call the given onDownloadProgress with a fake download progress
          config.onDownloadProgress(
            new ProgressEvent('progress', {
              loaded: 2,
              total: 10,
            })
          );
          return new Promise((_) => {
            // never resolve the promise to pretend it is loading
          });
        }
      });

    renderComponent();

    expect(await screen.findByText('20%')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // should still show the details of the datafile
    // when the content is loading
    expect(screen.getByText(mockDatafile.name)).toBeInTheDocument();
    expect(screen.getByText(mockDatafile.description)).toBeInTheDocument();
    expect(screen.getByText(mockDatafile.location)).toBeInTheDocument();
    // formatted size of the datafile
    expect(screen.getByText('100 B')).toBeInTheDocument();
    expect(screen.getByText(mockDatafile.modTime)).toBeInTheDocument();
    expect(screen.getByText(mockDatafile.createTime)).toBeInTheDocument();
  });

  it('should show a message saying the datafile cannot be previewed if the datafile extension is not supported', async () => {
    // make a new datafile with an unsupported file extension
    const unsupportedDatafile: Datafile = {
      ...mockDatafile,
      name: 'Datafile.exe',
    };

    axios.get = jest.fn().mockResolvedValueOnce({
      data: [unsupportedDatafile],
    });

    renderComponent();

    expect(
      await screen.findByText('datafiles.preview.cannot_preview')
    ).toBeInTheDocument();
    expect(
      screen.getByText('datafiles.preview.unsupported')
    ).toBeInTheDocument();

    // should still show the details of the datafile
    // even if it cannot be previewed
    expect(screen.getByText(unsupportedDatafile.name)).toBeInTheDocument();
    expect(
      screen.getByText(unsupportedDatafile.description)
    ).toBeInTheDocument();
    expect(screen.getByText(unsupportedDatafile.location)).toBeInTheDocument();
    // formatted size of the datafile
    expect(screen.getByText('100 B')).toBeInTheDocument();
    expect(screen.getByText(unsupportedDatafile.modTime)).toBeInTheDocument();
    expect(
      screen.getByText(unsupportedDatafile.createTime)
    ).toBeInTheDocument();
  });

  it('should show a message saying the datafile has an unknown extension if its name does not have a file extension', async () => {
    // make a new datafile with an unsupported file extension
    const unsupportedDatafile: Datafile = {
      ...mockDatafile,
      name: 'Datafile',
    };

    axios.get = jest.fn().mockResolvedValueOnce({
      data: [unsupportedDatafile],
    });

    renderComponent();

    expect(
      await screen.findByText('datafiles.preview.cannot_preview')
    ).toBeInTheDocument();
    expect(
      screen.getByText('datafiles.preview.unknown_type')
    ).toBeInTheDocument();

    // should still show the details of the datafile
    // even if it cannot be previewed
    expect(screen.getByText(unsupportedDatafile.name)).toBeInTheDocument();
    expect(
      screen.getByText(unsupportedDatafile.description)
    ).toBeInTheDocument();
    expect(screen.getByText(unsupportedDatafile.location)).toBeInTheDocument();
    // formatted size of the datafile
    expect(screen.getByText('100 B')).toBeInTheDocument();
    expect(screen.getByText(unsupportedDatafile.modTime)).toBeInTheDocument();
    expect(
      screen.getByText(unsupportedDatafile.createTime)
    ).toBeInTheDocument();
  });

  it('should display the preview of the datafile if it is supported', async () => {
    renderComponent();

    // should be able to see the text file content
    expect(
      await screen.findByLabelText('datafiles.preview.txt.file_content_label')
    ).toBeInTheDocument();
    expect(screen.getByText('First line')).toBeInTheDocument();
    expect(screen.getByText('Second line')).toBeInTheDocument();
    expect(screen.getByText('Third line')).toBeInTheDocument();
  });

  describe('should have a details pane toggle that', () => {
    it('is on by default allowing details pane to be shown', async () => {
      renderComponent();

      expect(
        await screen.findByRole('checkbox', {
          name: 'datafiles.preview.toolbar.show_details',
        })
      ).toBeChecked();
      // should be able to see the details of the datafile
      expect(await screen.findByText(mockDatafile.name)).toBeInTheDocument();
      expect(screen.getByText(mockDatafile.description)).toBeInTheDocument();
      expect(screen.getByText(mockDatafile.location)).toBeInTheDocument();
      // formatted size of the datafile
      expect(screen.getByText('100 B')).toBeInTheDocument();
      expect(screen.getByText(mockDatafile.modTime)).toBeInTheDocument();
      expect(screen.getByText(mockDatafile.createTime)).toBeInTheDocument();
    });

    it('hides the details pane when it is switched off', async () => {
      renderComponent();

      await user.click(
        await screen.findByRole('checkbox', {
          name: 'datafiles.preview.toolbar.show_details',
        })
      );

      expect(
        await screen.findByRole('checkbox', {
          name: 'datafiles.preview.toolbar.show_details',
        })
      ).not.toBeChecked();
      // should not be able to see the datafile details
      await waitFor(() => {
        expect(screen.queryByText(mockDatafile.name)).toBeNull();
        expect(screen.queryByText(mockDatafile.description)).toBeNull();
        expect(screen.queryByText(mockDatafile.location)).toBeNull();
        // formatted size of the datafile
        expect(screen.queryByText('100 B')).toBeNull();
        expect(screen.queryByText(mockDatafile.modTime)).toBeNull();
        expect(screen.queryByText(mockDatafile.createTime)).toBeNull();
      });
    });

    it('shows the details pane when it is switched back on', async () => {
      renderComponent();

      // click on the toggle twice to switch it off and back on
      // to test if the datafile details will still be visible
      await user.click(
        await screen.findByRole('checkbox', {
          name: 'datafiles.preview.toolbar.show_details',
        })
      );
      await user.click(
        await screen.findByRole('checkbox', {
          name: 'datafiles.preview.toolbar.show_details',
        })
      );

      expect(
        await screen.findByRole('checkbox', {
          name: 'datafiles.preview.toolbar.show_details',
        })
      ).toBeChecked();
      // should be able to see the details of the datafile
      expect(await screen.findByText(mockDatafile.name)).toBeInTheDocument();
      expect(screen.getByText(mockDatafile.description)).toBeInTheDocument();
      expect(screen.getByText(mockDatafile.location)).toBeInTheDocument();
      // formatted size of the datafile
      expect(screen.getByText('100 B')).toBeInTheDocument();
      expect(screen.getByText(mockDatafile.modTime)).toBeInTheDocument();
      expect(screen.getByText(mockDatafile.createTime)).toBeInTheDocument();
    });
  });

  it('should have a download button that downloads the datafile being previewed when clicked', async () => {
    renderComponent();

    await user.click(
      await screen.findByRole('button', { name: 'buttons.download' })
    );

    expect(downloadDatafile).toHaveBeenCalledWith(
      'idsUrl',
      mockDatafile.id,
      mockDatafile.location,
      new Blob([mockTxtFileContent])
    );
  });

  it('should have a copy link button that copies the link to the current datafile when clicked', async () => {
    const ogLocation = window.location;
    const mockLocation = new URL(
      `https://www.example.com/datafile/${mockDatafile.id}`
    );
    delete window.location;
    window.location = mockLocation;
    const writeTextSpy = jest
      .spyOn(navigator.clipboard, 'writeText')
      .mockReturnValueOnce(Promise.resolve());

    renderComponent();

    await user.click(
      await screen.findByRole('button', {
        name: 'datafiles.preview.toolbar.copy_link',
      })
    );

    expect(writeTextSpy).toHaveBeenCalledWith(
      `https://www.example.com/datafile/${mockDatafile.id}`
    );

    delete window.location;
    window.location = ogLocation;
  });

  describe('when the link to the current datafile is successfully copied to the clipboard, should show a successful message', () => {
    let ogLocation: Location;

    beforeEach(() => {
      ogLocation = window.location;
      const mockLocation = new URL(
        `https://www.example.com/datafile/${mockDatafile.id}`
      );
      delete window.location;
      window.location = mockLocation;
    });

    afterEach(() => {
      delete window.location;
      window.location = ogLocation;
    });

    it('that is dismissed automatically after some duration', async () => {
      jest.useFakeTimers();

      user = userEvent.setup({
        advanceTimers: jest.advanceTimersByTime,
      });

      renderComponent();

      await user.click(
        await screen.findByRole('button', {
          name: 'datafiles.preview.toolbar.copy_link',
        })
      );

      expect(
        await screen.findByText('datafiles.preview.link_copied')
      ).toBeInTheDocument();

      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(screen.queryByText('datafiles.preview.link_copied')).toBeNull();
      });

      jest.useRealTimers();
    });

    it('that can be dismissed manually', async () => {
      renderComponent();

      await user.click(
        await screen.findByRole('button', {
          name: 'datafiles.preview.toolbar.copy_link',
        })
      );

      expect(
        await screen.findByText('datafiles.preview.link_copied')
      ).toBeInTheDocument();

      await user.click(await screen.findByRole('button', { name: 'Close' }));

      await waitFor(() => {
        expect(screen.queryByText('datafiles.preview.link_copied')).toBeNull();
      });
    });
  });

  it('should have a zoom in button that increases the size of the datafile preview', async () => {
    renderComponent();

    await user.click(
      await screen.findByRole('button', {
        name: 'datafiles.preview.toolbar.zoom_in',
      })
    );

    expect(await screen.findByText('110%')).toBeInTheDocument();
    expect(
      screen.getByLabelText('datafiles.preview.txt.file_content_label')
    ).toHaveStyle({
      'font-size': '13px',
    });

    await user.click(
      await screen.findByRole('button', {
        name: 'datafiles.preview.toolbar.zoom_in',
      })
    );

    expect(await screen.findByText('120%')).toBeInTheDocument();
    expect(
      screen.getByLabelText('datafiles.preview.txt.file_content_label')
    ).toHaveStyle({
      'font-size': '14px',
    });
  });

  it('should allow users to increase the size of the datafile preview by scrolling up on the zoom level chip', async () => {
    renderComponent();

    expect(
      await screen.findByLabelText('datafiles.preview.txt.file_content_label')
    ).toBeInTheDocument();

    // pretend user is scrolling up on the zoom level chip
    fireEvent.wheel(await screen.findByText('100%'), {
      deltaY: -100,
    });

    expect(await screen.findByText('110%')).toBeInTheDocument();
    expect(
      screen.getByLabelText('datafiles.preview.txt.file_content_label')
    ).toHaveStyle({
      'font-size': '13px',
    });

    // pretend user is scrolling up on the zoom level chip
    fireEvent.wheel(await screen.findByText('110%'), {
      deltaY: -100,
    });

    expect(await screen.findByText('120%')).toBeInTheDocument();
    expect(
      screen.getByLabelText('datafiles.preview.txt.file_content_label')
    ).toHaveStyle({
      'font-size': '14px',
    });
  }, 10000);

  it('should have a zoom out button that decreases the size of the datafile preview when clicked', async () => {
    renderComponent();

    await user.click(
      await screen.findByRole('button', {
        name: 'datafiles.preview.toolbar.zoom_out',
      })
    );

    expect(await screen.findByText('90%')).toBeInTheDocument();
    expect(
      await screen.findByLabelText('datafiles.preview.txt.file_content_label')
    ).toHaveStyle({
      'font-size': '11px',
    });

    await user.click(
      await screen.findByRole('button', {
        name: 'datafiles.preview.toolbar.zoom_out',
      })
    );

    expect(await screen.findByText('80%')).toBeInTheDocument();
    expect(
      screen.getByLabelText('datafiles.preview.txt.file_content_label')
    ).toHaveStyle({
      'font-size': '10px',
    });
  });

  it('should allow users to decrease the size of the datafile preview by scrolling down on the zoom level chip', async () => {
    renderComponent();

    // pretend user is scrolling down on the zoom level chip
    fireEvent.wheel(await screen.findByText('100%'), {
      deltaY: 100,
    });

    expect(await screen.findByText('90%')).toBeInTheDocument();
    expect(
      await screen.findByLabelText('datafiles.preview.txt.file_content_label')
    ).toHaveStyle({
      'font-size': '11px',
    });

    // pretend user is scrolling up on the zoom level chip
    fireEvent.wheel(await screen.findByText('90%'), {
      deltaY: 100,
    });

    expect(await screen.findByText('80%')).toBeInTheDocument();
    expect(
      screen.getByLabelText('datafiles.preview.txt.file_content_label')
    ).toHaveStyle({
      'font-size': '10px',
    });
  });

  it('should have a reset zoom button that resets the datafile preview content size to default when clicked', async () => {
    renderComponent();

    // reset zoom button should not be present initially
    await waitFor(() => {
      expect(
        screen.queryByRole('button', {
          name: 'datafiles.preview.toolbar.reset_zoom',
        })
      ).toBeNull();
    });

    // zoom in the content
    await user.click(
      await screen.findByRole('button', {
        name: 'datafiles.preview.toolbar.zoom_in',
      })
    );

    expect(await screen.findByText('110%')).toBeInTheDocument();
    expect(
      screen.getByLabelText('datafiles.preview.txt.file_content_label')
    ).toHaveStyle({
      'font-size': '13px',
    });

    // now reset the zoom
    await user.click(
      await screen.findByRole('button', {
        name: 'datafiles.preview.toolbar.reset_zoom',
      })
    );

    expect(await screen.findByText('100%')).toBeInTheDocument();
    expect(
      screen.getByLabelText('datafiles.preview.txt.file_content_label')
    ).toHaveStyle({
      'font-size': '12px',
    });
    // reset zoom button should not be present anymore
    // because zoom level is already at the default value
    await waitFor(() => {
      expect(
        screen.queryByRole('button', {
          name: 'datafiles.preview.toolbar.reset_zoom',
        })
      ).toBeNull();
    });
  });

  it('should show a tooltip telling users they can scroll to zoom when the mouse is hovered over the zoom level chip', async () => {
    renderComponent();

    await user.hover(await screen.findByText('100%'));

    expect(
      await screen.findByText('datafiles.preview.toolbar.scroll_to_zoom')
    ).toBeInTheDocument();
  });
});
