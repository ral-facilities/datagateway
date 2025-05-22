import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { RenderResult } from '@testing-library/react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios, { AxiosResponse } from 'axios';
import * as React from 'react';
import {
  getDownload,
  getDownloadTypeStatus,
  useQueueVisit,
  useSubmitCart,
} from '../api/cart';
import { flushPromises } from '../setupTests';
import DownloadConfirmDialog from './downloadConfirmDialog.component';

jest.mock('../handleICATError');

const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
    // silence react-query errors
    logger: {
      log: console.log,
      warn: console.warn,
      error: jest.fn(),
    },
  });

describe('DownloadConfirmDialog', () => {
  let user: ReturnType<typeof userEvent.setup>;
  let props: React.ComponentProps<typeof DownloadConfirmDialog>;
  let downloadTypeStatusResponses: Record<
    string,
    | {
        error: false;
        payload: Awaited<ReturnType<typeof getDownloadTypeStatus>>;
      }
    | {
        error: true;
        payload: { message: string };
      }
  >;
  let getDownloadResponse:
    | {
        error: false;
        payload: Partial<Awaited<ReturnType<typeof getDownload>>>;
      }
    | {
        error: true;
        payload: { message: string };
      };

  const renderWrapper = (): RenderResult =>
    render(
      <QueryClientProvider client={createTestQueryClient()}>
        <DownloadConfirmDialog {...props} />
      </QueryClientProvider>
    );

  beforeEach(() => {
    user = userEvent.setup();
    // Cannot mock to epoch time as Britain adopted BST permanently from 1968
    // to 1971, so snapshot will be an hour out depending on the date locale.
    global.Date.now = jest.fn(() => new Date(2020, 0, 1, 1, 1, 1).getTime());

    props = {
      totalSize: 100,
      isTwoLevel: true,
      open: true,
      redirectToStatusTab: jest.fn(),
      setClose: jest.fn(),
      facilityName: 'LILS',
      downloadApiUrl: 'https://example.com/downloadApi',
      accessMethods: {
        https: {
          idsUrl: 'https://example.com/ids',
          displayName: 'HTTPS',
          description: 'Example description for <b>HTTPS</b> access method.',
        },
        globus: {
          idsUrl: 'https://example.com/ids',
          displayName: 'Globus',
          description: 'Example description for Globus access method.',
        },
      },
      submitDownloadHook: useSubmitCart,
    };

    downloadTypeStatusResponses = {
      https: {
        error: false,
        payload: {
          type: 'https',
          disabled: false,
          message: '',
        },
      },
      globus: {
        error: false,
        payload: {
          type: 'globus',
          disabled: false,
          message: '',
        },
      },
    };

    getDownloadResponse = {
      error: false,
      payload: {
        preparedId: '1',
        fileName: 'test-file-name',
        status: 'COMPLETE',
      },
    };

    axios.get = jest
      .fn()
      .mockImplementation((url: string): Promise<Partial<AxiosResponse>> => {
        if (/.*\/user\/downloads/.test(url)) {
          if (!getDownloadResponse.error) {
            return Promise.resolve({
              data: [getDownloadResponse.payload],
            });
          } else {
            return Promise.reject(getDownloadResponse.payload);
          }
        }
        const downloadTypeStatusMatches = url.match(
          /.*\/user\/downloadType\/(.*)\/status/
        );
        if (downloadTypeStatusMatches) {
          const response =
            downloadTypeStatusResponses[downloadTypeStatusMatches[1]];

          if (!response.error) {
            return Promise.resolve({
              data: response.payload,
            });
          } else {
            return Promise.reject(response.payload);
          }
        }
        return Promise.reject(`Endpoint not mocked: ${url}`);
      });

    axios.post = jest
      .fn()
      .mockImplementation((url: string): Promise<Partial<AxiosResponse>> => {
        if (/.*\/user\/cart\/.*\/submit/.test(url)) {
          return Promise.resolve({
            data: { downloadId: 123 },
          });
        }
        if (/.*\/user\/queue\/visit/.test(url)) {
          return Promise.resolve({
            data: ['123', '456'],
          });
        }
        return Promise.reject(`Endpoint not mocked: ${url}`);
      });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', async () => {
    props.isTwoLevel = false;
    // Pass in a size of 100 bytes and for the dialog to be open when mounted.
    const wrapper = renderWrapper();

    await act(async () => {
      await flushPromises();
    });

    expect(
      await wrapper.findByLabelText('downloadConfirmDialog.dialog_arialabel')
    ).toMatchSnapshot();
  });

  it('should not load the download speed/time table when isTwoLevel is true', async () => {
    props.isTwoLevel = true;
    const wrapper = renderWrapper();

    await act(async () => {
      await flushPromises();
    });

    expect(
      await wrapper.findByLabelText('downloadConfirmDialog.dialog_arialabel')
    ).toMatchSnapshot();
  });

  it('should prevent a download if a selected access method is disabled', async () => {
    // disable https method for testing
    downloadTypeStatusResponses['https'].payload = {
      type: 'https',
      disabled: true,
      message: 'Disabled for testing',
    };

    props.isTwoLevel = false;
    renderWrapper();

    await user.selectOptions(
      await screen.findByLabelText('downloadConfirmDialog.access_method_label'),
      ['https']
    );

    expect(
      await screen.findByText('downloadConfirmDialog.download')
    ).toBeDisabled();

    await user.selectOptions(
      await screen.findByLabelText('downloadConfirmDialog.access_method_label'),
      ['globus']
    );

    expect(
      await screen.findByText('downloadConfirmDialog.download')
    ).toBeEnabled();
  });

  it('should prevent a download if there are no available access methods', async () => {
    // Override default requests and return access method status'
    // as being disabled for both access methods.
    downloadTypeStatusResponses['https'].payload = {
      type: 'https',
      disabled: true,
      message: 'disabled for testing',
    };
    downloadTypeStatusResponses['globus'].payload = {
      type: 'globus',
      disabled: true,
      message: 'disabled for testing',
    };

    props.isTwoLevel = false;
    renderWrapper();

    expect(
      await screen.findByRole('button', {
        name: 'downloadConfirmDialog.download',
      })
    ).toBeDisabled();
  });

  it('should prevent download of an access method where the status was not fetched', async () => {
    // Return a response where one of the status requests has not been successful.
    downloadTypeStatusResponses['globus'] = {
      error: true,
      payload: {
        message: 'Test error message',
      },
    };

    props.isTwoLevel = false;
    renderWrapper();

    await waitFor(() => {
      expect(screen.queryByRole('option', { name: 'GLOBUS' })).toBeNull();
      expect(screen.getByRole('option', { name: 'HTTPS' })).toBeInTheDocument();
    });
  });

  it('should show successful view when download is successful', async () => {
    props.isTwoLevel = true;
    renderWrapper();
    // input an email
    await user.type(
      await screen.findByLabelText('downloadConfirmDialog.email_label'),
      'test@email.com'
    );
    // input a download name
    await user.type(
      await screen.findByLabelText('downloadConfirmDialog.download_name_label'),
      'custom download name'
    );
    // click on download button to begin download
    await user.click(await screen.findByText('downloadConfirmDialog.download'));

    // should not show error
    await waitFor(() => {
      expect(
        screen.queryByText('Your download request was unsuccessful', {
          exact: false,
        })
      ).toBeNull();
    });

    const params = new URLSearchParams();
    params.append('sessionId', '');
    params.append('transport', 'https');
    params.append('email', 'test@email.com');
    params.append('fileName', 'custom download name');
    params.append('zipType', 'ZIP');

    expect(axios.post).toHaveBeenCalledWith(
      `${props.downloadApiUrl}/user/cart/${props.facilityName}/submit`,
      params
    );
    // should show success message
    expect(
      await screen.findByText('downloadConfirmDialog.download_success')
    ).toBeInTheDocument();
    // should show confirmation email address
    expect(await screen.findByText('test@email.com')).toBeInTheDocument();
    expect(await screen.findByText('custom download name')).toBeInTheDocument();
  });

  it('should call post download success function upon successful submission of cart', async () => {
    props.isTwoLevel = true;
    props.postDownloadSuccessFn = jest.fn();
    renderWrapper();
    // click on download button to begin download
    await user.click(await screen.findByText('downloadConfirmDialog.download'));

    await waitFor(() => {
      expect(props.postDownloadSuccessFn).toHaveBeenCalledWith({
        preparedId: '1',
        fileName: 'test-file-name',
        status: 'COMPLETE',
      });
    });
  });

  it('should disable download when no download method is available', async () => {
    downloadTypeStatusResponses['https'] = {
      error: true,
      payload: {
        message: 'test error',
      },
    };
    downloadTypeStatusResponses['globus'] = {
      error: true,
      payload: {
        message: 'test error',
      },
    };

    props.isTwoLevel = true;
    renderWrapper();

    expect(
      await screen.findByText(
        'downloadConfirmDialog.access_method_helpertext_all_disabled_error'
      )
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('button', {
        name: 'downloadConfirmDialog.download',
      })
    ).toBeDisabled();
  });

  it('should show error when download has failed', async () => {
    axios.post = jest
      .fn()
      .mockImplementation((url: string): Promise<Partial<AxiosResponse>> => {
        if (/.*\/user\/cart\/.*\/submit/.test(url)) {
          return Promise.reject({
            message: 'error',
          });
        }
        return Promise.reject(`Endpoint not mocked: ${url}`);
      });

    props.isTwoLevel = true;
    renderWrapper();
    // click on download button to begin download
    await user.click(await screen.findByText('downloadConfirmDialog.download'));

    // should not show success message
    await waitFor(() => {
      expect(
        screen.queryByText('downloadConfirmDialog.download_success')
      ).toBeNull();
    });
    // should show error
    expect(
      await screen.findByText('Your download request was unsuccessful', {
        exact: false,
      })
    ).toBeInTheDocument();
  });

  it('should show error when download info is not returned', async () => {
    getDownloadResponse = {
      error: true,
      payload: {
        message: 'error',
      },
    };

    renderWrapper();
    // click on download button to begin download
    await user.click(await screen.findByText('downloadConfirmDialog.download'));

    // should not show success message
    await waitFor(() => {
      expect(
        screen.queryByText('downloadConfirmDialog.download_success')
      ).toBeNull();
    });
    // should show error
    expect(
      await screen.findByText('Your download request was unsuccessful', {
        exact: false,
      })
    ).toBeInTheDocument();
  });

  it('should prevent the submission of a download request with an invalid email', async () => {
    props.isTwoLevel = false;
    renderWrapper();

    const emailInput = await screen.findByLabelText(
      'downloadConfirmDialog.email_label'
    );

    // type in an incorrect email address
    await user.type(emailInput, 'cat-person@');

    expect(
      await screen.findByRole('button', {
        name: 'downloadConfirmDialog.download',
      })
    ).toBeDisabled();

    // Simulate correct email address entry.
    await user.clear(emailInput);
    await user.type(emailInput, 'cat@person.com');

    await waitFor(async () => {
      expect(
        await screen.findByText('downloadConfirmDialog.download')
      ).toBeEnabled();
    });

    // Simulate removing an email address completely,
    // resulting in emptying the text field.
    await user.clear(emailInput);

    await waitFor(async () => {
      expect(
        await screen.findByText('downloadConfirmDialog.download')
      ).toBeEnabled();
    });
  });

  it('should show successful view when download is successful using isQueueVisit', async () => {
    props.isTwoLevel = true;
    props.submitDownloadHook = useQueueVisit;
    props.visitId = '1';
    renderWrapper();
    // input an email
    await user.type(
      await screen.findByLabelText('downloadConfirmDialog.email_label'),
      'test@email.com'
    );
    // input a download name
    await user.type(
      await screen.findByLabelText('downloadConfirmDialog.download_name_label'),
      'custom download name'
    );
    // click on download button to begin download
    await user.click(await screen.findByText('downloadConfirmDialog.download'));

    // should not show error
    await waitFor(() => {
      expect(
        screen.queryByText('Your download request was unsuccessful', {
          exact: false,
        })
      ).toBeNull();
    });

    const params = new URLSearchParams();
    params.append('sessionId', '');
    params.append('transport', 'https');
    params.append('email', 'test@email.com');
    params.append('fileName', 'custom download name');
    params.append('visitId', '1');
    params.append('facilityName', props.facilityName);

    expect(axios.post).toHaveBeenCalledWith(
      `${props.downloadApiUrl}/user/queue/visit`,
      params
    );
    // ensure we don't try and retrieve the download
    expect(axios.get).not.toHaveBeenCalledWith(
      `${props.downloadApiUrl}/user/downloads`
    );
    // should show success message
    expect(
      await screen.findByText('downloadConfirmDialog.download_success')
    ).toBeInTheDocument();
    // should show confirmation email address
    expect(await screen.findByText('test@email.com')).toBeInTheDocument();
    expect(await screen.findByText('custom download name')).toBeInTheDocument();
  });

  it('should close the download Confirmation Dialog and successfully call the setClose function', async () => {
    const closeFunction = jest.fn();

    props.isTwoLevel = false;
    props.setClose = closeFunction;

    renderWrapper();

    await user.click(
      await screen.findByLabelText('downloadConfirmDialog.close_arialabel')
    );

    expect(closeFunction).toHaveBeenCalled();
  });

  it('shows loading status when submitting cart', async () => {
    axios.post = jest
      .fn()
      .mockImplementation((url: string): Promise<Partial<AxiosResponse>> => {
        if (/.*\/user\/cart\/.*\/submit/.test(url)) {
          return new Promise((_) => {
            // never resolve the promise to simulate loading state
          });
        }
        return Promise.reject(`Endpoint not mocked: ${url}`);
      });

    props.isTwoLevel = false;
    renderWrapper();

    // click on download button to begin download
    await user.click(
      await screen.findByRole('button', {
        name: 'downloadConfirmDialog.download',
      })
    );

    const downloadButton = await screen.findByRole('button', {
      name: 'downloadConfirmDialog.submitting_cart',
    });
    expect(downloadButton).toBeInTheDocument();
    expect(downloadButton).toBeDisabled();
  });

  describe('DownloadConfirmDialog - renders the estimated download speed/time table with varying values', () => {
    const timeWrapper = (size: number): RenderResult =>
      render(
        <QueryClientProvider client={new QueryClient()}>
          <DownloadConfirmDialog
            {...props}
            totalSize={size}
            isTwoLevel={false}
          />
        </QueryClientProvider>
      );

    // Calculate the file size required to reach the given download time (at 1 Mbps).
    const timeToSize = (
      seconds: number,
      minutes?: number,
      hours?: number,
      days?: number
    ): number => {
      // NOTE: For these tests to make it simple we use 1 Mbps for this.
      const downloadSpeed = 1; // Mbps

      // Get the all the time in seconds.
      const inSeconds =
        (days ? days * 86400 : 0) +
        (hours ? hours * 3600 : 0) +
        (minutes ? minutes * 60 : 0) +
        seconds;

      // Calculate final file size required (in bytes).
      const fileSize = inSeconds * (downloadSpeed / 8) * (1024 * 1024);

      return fileSize;
    };

    it('renders for multiple days, hours, minutes and seconds', async () => {
      // Test for 2 seconds, 2 minutes, 2 hours and 2 days.
      timeWrapper(timeToSize(2, 2, 2, 2));

      expect(
        await screen.findByText(
          '2 downloadConfirmDialog.day {count:2}, 2 downloadConfirmDialog.hour {count:2}, 2 downloadConfirmDialog.minute {count:2}, 2 downloadConfirmDialog.second {count:2}'
        )
      ).toBeInTheDocument();
    });

    it('renders for a single day, hour, minute and second', async () => {
      timeWrapper(timeToSize(1, 1, 1, 1));

      expect(
        await screen.findByText(
          '1 downloadConfirmDialog.day {count:1}, 1 downloadConfirmDialog.hour {count:1}, 1 downloadConfirmDialog.minute {count:1}, 1 downloadConfirmDialog.second {count:1}'
        )
      ).toBeInTheDocument();
    });

    describe('estimated download table renders for single time measurements', () => {
      it('renders for a single day', async () => {
        timeWrapper(timeToSize(0, 0, 0, 1));

        expect(
          await screen.findByText('1 downloadConfirmDialog.day {count:1}')
        ).toBeInTheDocument();
      });

      it('renders for a single hour', async () => {
        timeWrapper(timeToSize(0, 0, 1, 0));

        expect(
          await screen.findByText('1 downloadConfirmDialog.hour {count:1}')
        ).toBeInTheDocument();
      });

      it('renders for a single minute', async () => {
        timeWrapper(timeToSize(0, 1, 0, 0));

        expect(
          await screen.findByText('1 downloadConfirmDialog.minute {count:1}')
        ).toBeInTheDocument();
      });

      it('renders for a single second', async () => {
        timeWrapper(timeToSize(1, 0, 0, 0));

        expect(
          await screen.findByText('1 downloadConfirmDialog.second {count:1}')
        ).toBeInTheDocument();
      });
    });
  });
});
