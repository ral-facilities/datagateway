import { MenuItem } from '@mui/material';
import axios from 'axios';
import { mount, ReactWrapper } from 'enzyme';
import * as React from 'react';
import { act } from 'react-dom/test-utils';
import { DownloadSettingsContext } from '../ConfigProvider';
import { flushPromises } from '../setupTests';
import DownloadConfirmDialog from './downloadConfirmDialog.component';
import { handleICATError } from 'datagateway-common';
import type { RenderResult } from '@testing-library/react';
import { render, screen, waitFor } from '@testing-library/react';
import { getDownloadTypeStatus, submitCart } from '../downloadApi';
import userEvent from '@testing-library/user-event';
import type { UserEvent } from '@testing-library/user-event/dist/types/setup';
import { QueryClient, QueryClientProvider } from 'react-query';

jest.mock('../downloadApi');
jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    handleICATError: jest.fn(),
  };
});

const updateDialogWrapper = async (wrapper: ReactWrapper): Promise<void> => {
  // Update the wrapper with the loading dialog.
  await act(async () => {
    await flushPromises();
    wrapper.update();
  });
};

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
      description: 'Example description for <b>HTTPS</b> access method.',
    },
    globus: {
      idsUrl: 'https://example.com/ids',
      displayName: 'Globus',
      description: 'Example description for Globus access method.',
    },
  },
};

const createWrapper = (
  size: number,
  isTwoLevel: boolean,
  open: boolean
): ReactWrapper => {
  return mount(
    <DownloadSettingsContext.Provider value={mockedSettings}>
      <DownloadConfirmDialog
        totalSize={size}
        isTwoLevel={isTwoLevel}
        open={open}
        redirectToStatusTab={jest.fn()}
        setClose={jest.fn()}
        clearCart={jest.fn()}
      />
    </DownloadSettingsContext.Provider>
  );
};

const renderWrapper = (
  size: number,
  isTwoLevel: boolean,
  open: boolean
): RenderResult =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <DownloadSettingsContext.Provider value={mockedSettings}>
        <DownloadConfirmDialog
          totalSize={size}
          isTwoLevel={isTwoLevel}
          open={open}
          redirectToStatusTab={jest.fn()}
          setClose={jest.fn()}
          clearCart={jest.fn()}
        />
      </DownloadSettingsContext.Provider>
    </QueryClientProvider>
  );

describe('DownloadConfirmDialog', () => {
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();
    // Cannot mock to epoch time as Britain adopted BST permanently from 1968
    // to 1971, so snapshot will be an hour out depending on the date locale.
    global.Date.now = jest.fn(() => new Date(2020, 0, 1, 1, 1, 1).getTime());

    (getDownloadTypeStatus as jest.Mock).mockImplementation((type, _) =>
      Promise.resolve({
        type,
        disabled: false,
        message: '',
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', async () => {
    // Pass in a size of 100 bytes and for the dialog to be open when mounted.
    const wrapper = renderWrapper(100, false, true);

    expect(
      await wrapper.findByLabelText('downloadConfirmDialog.dialog_arialabel')
    ).toMatchSnapshot();
  });

  it('should not load the download speed/time table when isTwoLevel is true', async () => {
    // Set isTwoLevel to true as a prop.
    const wrapper = renderWrapper(100, true, true);

    expect(
      await wrapper.findByLabelText('downloadConfirmDialog.dialog_arialabel')
    ).toMatchSnapshot();
  });

  it('should prevent a download if a selected access method is disabled', async () => {
    // disable https method for testing
    (getDownloadTypeStatus as jest.Mock).mockImplementation((type, _) =>
      Promise.resolve(
        type === 'https'
          ? {
              type,
              disabled: true,
              message: 'Disabled for testing',
            }
          : { type, disabled: false, message: '' }
      )
    );

    renderWrapper(100, false, true);

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
    (getDownloadTypeStatus as jest.Mock).mockImplementation((type, _) => ({
      type,
      disabled: true,
      message: 'disabled for testing',
    }));

    renderWrapper(100, false, true);

    expect(
      await screen.findByText('downloadConfirmDialog.download')
    ).toBeDisabled();
  });

  it.skip('prevent download of an access method where the status was not fetched', async () => {
    // Return a response where one of the status requests has not been successful.
    (axios.get as jest.Mock)
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: { disabled: true, message: '' },
        })
      )
      .mockImplementationOnce(() =>
        Promise.reject({
          message: 'Test error message',
        })
      );

    const wrapper = createWrapper(100, false, true);
    await updateDialogWrapper(wrapper);

    // Ensure the access method for which we did not receive a status response has been disabled.
    expect(wrapper.exists('[role="button"]#confirm-access-method')).toBe(true);
    wrapper.find('[role="button"]#confirm-access-method').simulate('click');
    expect(wrapper.find(MenuItem).at(1).prop('disabled')).toBe(true);

    // Ensure the download button is present and it is disabled.
    expect(wrapper.exists('button#download-confirmation-download')).toBe(true);
    expect(
      wrapper.find('button#download-confirmation-download').prop('disabled')
    ).toBe(true);

    expect(handleICATError).toHaveBeenCalled();
    expect(handleICATError).toHaveBeenCalledWith({
      message: 'Test error message',
    });
  });

  it('should show successful view when download is successful', async () => {
    (submitCart as jest.Mock).mockResolvedValue(123);
    (getDownloadTypeStatus as jest.Mock).mockImplementation((type, _) =>
      Promise.resolve({
        type,
        disabled: false,
        message: '',
      })
    );

    renderWrapper(100, true, true);
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

    expect(submitCart).toHaveBeenCalledWith(
      'https',
      'test@email.com',
      'custom download name',
      {
        facilityName: mockedSettings.facilityName,
        downloadApiUrl: mockedSettings.downloadApiUrl,
      },
      undefined
    );
    // should show success message
    expect(
      await screen.findByText('downloadConfirmDialog.download_success')
    ).toBeInTheDocument();
    // should show confirmation email address
    expect(await screen.findByText('test@email.com')).toBeInTheDocument();
    expect(await screen.findByText('custom download name')).toBeInTheDocument();
  });

  it('should show error when download has failed', async () => {
    (submitCart as jest.Mock).mockRejectedValue({
      message: 'error',
    });

    renderWrapper(100, true, true);
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
    renderWrapper(100, false, true);

    const emailInput = await screen.findByLabelText(
      'downloadConfirmDialog.email_label'
    );

    // type in an incorrect email address
    await user.type(emailInput, 'cat-person@');

    await waitFor(async () => {
      expect(
        await screen.findByText('downloadConfirmDialog.download')
      ).toBeDisabled();
    });
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

  it('should close the download Confirmation Dialog and successfully call the setClose function', async () => {
    const closeFunction = jest.fn();

    render(
      <QueryClientProvider client={new QueryClient()}>
        <DownloadSettingsContext.Provider value={mockedSettings}>
          <DownloadConfirmDialog
            totalSize={1}
            isTwoLevel={false}
            open={true}
            redirectToStatusTab={jest.fn()}
            setClose={closeFunction}
            clearCart={jest.fn()}
          />
        </DownloadSettingsContext.Provider>
      </QueryClientProvider>
    );

    await user.click(
      await screen.findByLabelText('downloadConfirmDialog.close_arialabel')
    );

    expect(closeFunction).toHaveBeenCalled();
  });
});

describe('DownloadConfirmDialog - renders the estimated download speed/time table with varying values', () => {
  const timeWrapper = (size: number): RenderResult =>
    render(
      <QueryClientProvider client={new QueryClient()}>
        <DownloadSettingsContext.Provider value={mockedSettings}>
          <DownloadConfirmDialog
            totalSize={size}
            isTwoLevel={false}
            open={true}
            setClose={jest.fn()}
            redirectToStatusTab={jest.fn()}
            clearCart={jest.fn()}
          />
        </DownloadSettingsContext.Provider>
      </QueryClientProvider>
    );

  beforeEach(() => {
    (getDownloadTypeStatus as jest.Mock).mockImplementation((type, _) =>
      Promise.resolve({
        type,
        disabled: false,
        message: '',
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

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
