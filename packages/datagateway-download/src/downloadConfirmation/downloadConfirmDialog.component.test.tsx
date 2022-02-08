import { MenuItem } from '@mui/material';
import { createMount } from '@mui/material/test-utils';
import axios from 'axios';
import { ReactWrapper } from 'enzyme';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { DownloadSettingsContext } from '../ConfigProvider';
import { flushPromises } from '../setupTests';
import DownloadConfirmDialog from './downloadConfirmDialog.component';
import { handleICATError } from 'datagateway-common';

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

  // Update the wrapper with the download confirmation dialog.
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

describe('DownloadConfirmDialog', () => {
  let mount;

  beforeEach(() => {
    mount = createMount();
    (axios.get as jest.Mock).mockImplementation(() => {
      return Promise.resolve({
        data: { disabled: false, message: '' },
      });
    });
    // Cannot mock to epoch time as Britain adopted BST permanently from 1968
    // to 1971, so snapshot will be an hour out depending on the date locale.
    global.Date.now = jest.fn(() => new Date(2020, 0, 1, 1, 1, 1).getTime());
  });

  afterEach(() => {
    mount.cleanUp();
    (axios.get as jest.Mock).mockClear();
    (axios.post as jest.Mock).mockClear();
    (handleICATError as jest.Mock).mockClear();
  });

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

  it('renders correctly', async () => {
    // Pass in a size of 100 bytes and for the dialog to be open when mounted.
    const wrapper = createWrapper(100, false, true);
    await updateDialogWrapper(wrapper);

    expect(wrapper).toMatchSnapshot();
  });

  it('does not load the download speed/time table when isTwoLevel is true', async () => {
    // Set isTwoLevel to true as a prop.
    const wrapper = createWrapper(100, true, true);
    await updateDialogWrapper(wrapper);

    expect(wrapper).toMatchSnapshot();
  });

  it.skip('prevents a download if a selected access method is disabled', async () => {
    // Override default requests and return an access method which is disabled.
    (axios.get as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: { disabled: true, message: '' },
      })
    );

    const wrapper = createWrapper(100, false, true);
    await updateDialogWrapper(wrapper);

    // Expect the download button to not be disabled for this access method
    // as it has been sorted with the disabled one at the bottom.
    expect(wrapper.exists('button#download-confirmation-download')).toBe(true);
    expect(
      wrapper.find('button#download-confirmation-download').prop('disabled')
    ).toBe(false);

    // Switch to a disabled access method.
    // Change the value of the dropdown access method list.
    expect(wrapper.exists('[role="button"]#confirm-access-method')).toBe(true);
    wrapper.find('[role="button"]#confirm-access-method').simulate('click');
    wrapper.find(MenuItem).at(1).simulate('click');

    // Ensure that the download button is disabled for the selected access method.
    expect(
      wrapper.find('button#download-confirmation-download').prop('disabled')
    ).toBe(true);
  });

  it('prevents a download if there are no available access methods', async () => {
    // Override default requests and return access method status'
    // as being disabled for both access methods.
    (axios.get as jest.Mock)
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: { disabled: true, message: 'Disabled method 1 for test' },
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          data: { disabled: true, message: 'Disabled method 2 for test' },
        })
      );

    const wrapper = createWrapper(100, false, true);
    await updateDialogWrapper(wrapper);

    // Ensure the download button is present and it is disabled.
    expect(wrapper.exists('button#download-confirmation-download')).toBe(true);
    expect(
      wrapper.find('button#download-confirmation-download').prop('disabled')
    ).toBe(true);
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

  it('loads the submit successful view when download button is clicked', async () => {
    // Axios GET responses download submission.
    (axios.get as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: [
          {
            createdAt: '2020-01-01T01:01:01Z',
            downloadItems: [
              {
                entityId: 1,
                entityType: 'investigation',
                id: 1,
              },
            ],
            facilityName: mockedSettings.facilityName,
            fileName: `${mockedSettings.facilityName}_2020-1-1_1-1-1`,
            fullName: 'simple/root',
            id: 1,
            isDeleted: false,
            isEmailSent: false,
            isTwoLevel: false,
            preparedId: 'test-id',
            sessionId: '',
            size: 0,
            status: 'COMPLETE',
            transport: 'https',
            userName: 'simple/root',
          },
        ],
      })
    );

    // Axios POST response for submitting download request.
    (axios.post as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: {
          facilityName: mockedSettings.facilityName,
          userName: 'test user',
          cartItems: [],
          downloadId: '1',
        },
      })
    );

    const wrapper = createWrapper(100, false, true);

    // Wait for the settings to load/preloader to disappear.
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    await updateDialogWrapper(wrapper);

    // Ensure the close button is present.
    expect(wrapper.exists('button#download-confirmation-download')).toBe(true);

    await act(async () => {
      wrapper.find('button#download-confirmation-download').simulate('click');
      await flushPromises();
      wrapper.update();
    });

    // The success message should exist.
    expect(wrapper.exists('#download-confirmation-success')).toBe(true);

    // Expect our status requests to have been called.
    expect(axios.get).toHaveBeenCalledTimes(3);
    expect(axios.get).toHaveBeenCalledWith(
      `${mockedSettings.downloadApiUrl}/user/downloadType/https/status`,
      {
        params: {
          sessionId: null,
          facilityName: mockedSettings.facilityName,
        },
      }
    );
    expect(axios.get).toHaveBeenCalledWith(
      `${mockedSettings.downloadApiUrl}/user/downloadType/globus/status`,
      {
        params: {
          sessionId: null,
          facilityName: mockedSettings.facilityName,
        },
      }
    );

    // Expect the posting of the download request.
    const params = new URLSearchParams();
    params.append('sessionId', '');
    params.append('transport', 'https');
    params.append('email', '');
    params.append('fileName', `${mockedSettings.facilityName}_2020-1-1_1-1-1`);
    params.append('zipType', 'ZIP');

    expect(axios.post).toHaveBeenCalled();
    expect(axios.post).toHaveBeenCalledWith(
      `${mockedSettings.downloadApiUrl}/user/cart/${mockedSettings.facilityName}/submit`,
      params
    );

    // Expect fetching of the submitted download requested.
    expect(axios.get).toHaveBeenCalledWith(
      `${mockedSettings.downloadApiUrl}/user/downloads`,
      {
        params: {
          sessionId: null,
          facilityName: mockedSettings.facilityName,
          queryOffset: 'where download.id = 1',
        },
      }
    );
  });

  it.skip('successfully loads submit successful view after submitting download request with custom values', async () => {
    (axios.post as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: {
          facilityName: mockedSettings.facilityName,
          userName: 'test user',
          cartItems: [],
          downloadId: '2',
        },
      })
    );

    const wrapper = createWrapper(100, false, true);

    // Wait for the settings to load/preloader to disappear.
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    await updateDialogWrapper(wrapper);

    // Fill in the custom download name, access method and email address.
    expect(wrapper.exists('input#confirm-download-name')).toBe(true);
    const downloadName = wrapper.find('input#confirm-download-name');
    downloadName.instance().value = 'test-name';
    downloadName.simulate('change');

    // Change the value of the dropdown access method list.
    expect(wrapper.exists('[role="button"]#confirm-access-method')).toBe(true);
    wrapper.find('[role="button"]#confirm-access-method').simulate('click');
    wrapper.find(MenuItem).at(1).simulate('click');

    expect(wrapper.exists('input#confirm-download-email')).toBe(true);
    const emailAddress = wrapper.find('input#confirm-download-email');
    emailAddress.instance().value = 'test@email.com';
    emailAddress.simulate('change');

    // Ensure the close button is present.
    expect(wrapper.exists('button#download-confirmation-download')).toBe(true);

    // Update wrapper after clicking download to show success.
    await act(async () => {
      wrapper.find('button#download-confirmation-download').simulate('click');
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.exists('#download-confirmation-success')).toBe(true);

    const params = new URLSearchParams();
    params.append('sessionId', '');
    params.append('transport', 'globus');
    params.append('email', 'test@email.com');
    params.append('fileName', 'test-name');
    params.append('zipType', 'ZIP');

    expect(axios.post).toHaveBeenCalled();
    expect(axios.post).toHaveBeenCalledWith(
      `${mockedSettings.downloadApiUrl}/user/cart/${mockedSettings.facilityName}/submit`,
      params
    );
  });

  it('prevents the submission of a download request with an invalid email', async () => {
    const wrapper = createWrapper(100, false, true);
    await updateDialogWrapper(wrapper);

    // Ensure the download button is present.
    expect(wrapper.exists('button#download-confirmation-download')).toBe(true);

    // Simulate incorrect email address entry.
    await act(async () => {
      expect(
        wrapper.find('input#confirm-download-email').prop('disabled')
      ).toBeFalsy();

      wrapper
        .find('input#confirm-download-email')
        .simulate('change', { target: { value: 'test@' } });

      await flushPromises();
      wrapper.update();
    });

    expect(
      wrapper.find('button#download-confirmation-download').props().disabled
    ).toBe(true);

    // Simulate correct email address entry.
    await act(async () => {
      wrapper
        .find('input#confirm-download-email')
        .simulate('change', { target: { value: 'test@test.com' } });

      await flushPromises();
      wrapper.update();
    });

    expect(
      wrapper.find('button#download-confirmation-download').props().disabled
    ).toBe(false);

    // Simulate removing an email address completely,
    // resulting in emptying the text field.
    await act(async () => {
      wrapper
        .find('input#confirm-download-email')
        .simulate('change', { target: { value: '' } });

      await flushPromises();
      wrapper.update();
    });

    expect(
      wrapper.find('button#download-confirmation-download').props().disabled
    ).toBe(false);
    expect(
      wrapper.find('input#confirm-download-email').instance().value
    ).toEqual('');
  });

  it('loads the submit unsuccessful view when download button is clicked', async () => {
    // We omit the downloadId which will cause the unsuccessful view to be shown.
    (axios.post as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: {
          facilityName: mockedSettings.facilityName,
          userName: 'test user',
          cartItems: [],
        },
      })
    );

    const wrapper = createWrapper(100, false, true);
    await updateDialogWrapper(wrapper);

    // Ensure the download button is present.
    expect(wrapper.exists('button#download-confirmation-download')).toBe(true);

    await act(async () => {
      wrapper.find('button#download-confirmation-download').simulate('click');
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.exists('#download-confirmation-unsuccessful')).toBe(true);

    const params = new URLSearchParams();
    params.append('sessionId', '');
    params.append('transport', 'https');
    params.append('email', '');
    params.append('fileName', `${mockedSettings.facilityName}_2020-1-1_1-1-1`);
    params.append('zipType', 'ZIP');

    expect(axios.post).toHaveBeenCalled();
    expect(axios.post).toHaveBeenCalledWith(
      `${mockedSettings.downloadApiUrl}/user/cart/${mockedSettings.facilityName}/submit`,
      params
    );
  });

  it('closes the Download Confirmation Dialog and successfully calls the setClose function', async () => {
    const closeFunction = jest.fn();

    const wrapper = mount(
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
    );
    await updateDialogWrapper(wrapper);

    // Ensure the close button is present.
    expect(
      wrapper.exists('[aria-label="downloadConfirmDialog.close_arialabel"]')
    ).toBe(true);
    expect(wrapper.prop('open')).toBe(true);

    // Close the download confirmation dialog.
    wrapper.setProps({
      children: (
        <DownloadConfirmDialog
          totalSize={1}
          isTwoLevel={false}
          // Set open prop to false to close the dialog.
          open={false}
          redirectToStatusTab={jest.fn()}
          setClose={closeFunction}
          clearCart={jest.fn()}
        />
      ),
    });
    expect(wrapper.prop('open')).toBe(false);

    // Click the close button and ensure the close function has been called.
    wrapper
      .find('button[aria-label="downloadConfirmDialog.close_arialabel"]')
      .simulate('click');

    expect(closeFunction).toHaveBeenCalled();
  });

  it('calls the clearCart function when the Download Confirmation Dialog has been closed after a successful submission', async () => {
    const clearCartFunction = jest.fn();

    (axios.post as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: {
          downloadId: '1',
        },
      })
    );

    const wrapper = mount(
      <DownloadSettingsContext.Provider value={mockedSettings}>
        <DownloadConfirmDialog
          totalSize={1}
          isTwoLevel={false}
          open={true}
          redirectToStatusTab={jest.fn()}
          setClose={jest.fn()}
          clearCart={clearCartFunction}
        />
      </DownloadSettingsContext.Provider>
    );
    await updateDialogWrapper(wrapper);

    // Click on the download button and ensure the successful confirmation is present.
    expect(wrapper.exists('button#download-confirmation-download')).toBe(true);

    await act(async () => {
      wrapper.find('button#download-confirmation-download').simulate('click');
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.exists('#download-confirmation-success')).toBe(true);

    // Ensure the close button is present.
    expect(
      wrapper.exists('[aria-label="downloadConfirmDialog.close_arialabel"]')
    ).toBe(true);
    expect(wrapper.prop('open')).toBe(true);

    // Close the download confirmation dialog.
    wrapper.setProps({
      children: (
        <DownloadConfirmDialog
          totalSize={1}
          isTwoLevel={false}
          // Set open prop to false to close the dialog.
          open={false}
          redirectToStatusTab={jest.fn()}
          setClose={jest.fn()}
          clearCart={clearCartFunction}
        />
      ),
    });
    expect(wrapper.prop('open')).toBe(false);

    // Click the close button and ensure the close function has been called.
    wrapper
      .find('button[aria-label="downloadConfirmDialog.close_arialabel"]')
      .simulate('click');

    expect(clearCartFunction).toHaveBeenCalled();
  });
});

describe('DownloadConfirmDialog - renders the estimated download speed/time table with varying values', () => {
  let timeMount;

  const timeWrapper = (size: number): ReactWrapper => {
    return timeMount(
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
    );
  };

  beforeEach(() => {
    timeMount = createMount();
    (axios.get as jest.Mock).mockImplementation(() => {
      return Promise.resolve({
        data: { disabled: false, message: '' },
      });
    });
  });

  afterEach(() => {
    timeMount.cleanUp();
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
    const wrapper = timeWrapper(timeToSize(2, 2, 2, 2));
    await updateDialogWrapper(wrapper);

    expect(wrapper.exists('#download-table')).toBe(true);
    expect(wrapper.find('#download-table-one').text()).toEqual(
      '2 downloadConfirmDialog.day {count:2}, 2 downloadConfirmDialog.hour {count:2}, 2 downloadConfirmDialog.minute {count:2}, 2 downloadConfirmDialog.second {count:2}'
    );
  });

  it('renders for a single day, hour, minute and second', async () => {
    const wrapper = timeWrapper(timeToSize(1, 1, 1, 1));
    await updateDialogWrapper(wrapper);

    expect(wrapper.exists('#download-table')).toBe(true);
    expect(wrapper.find('#download-table-one').text()).toEqual(
      '1 downloadConfirmDialog.day {count:1}, 1 downloadConfirmDialog.hour {count:1}, 1 downloadConfirmDialog.minute {count:1}, 1 downloadConfirmDialog.second {count:1}'
    );
  });

  describe('estimated download table renders for single time measurements', () => {
    it('renders for a single day', async () => {
      const wrapper = timeWrapper(timeToSize(0, 0, 0, 1));
      await updateDialogWrapper(wrapper);

      expect(wrapper.exists('#download-table')).toBe(true);
      expect(wrapper.find('#download-table-one').text()).toEqual(
        '1 downloadConfirmDialog.day {count:1}'
      );
    });

    it('renders for a single hour', async () => {
      const wrapper = timeWrapper(timeToSize(0, 0, 1, 0));
      await updateDialogWrapper(wrapper);

      expect(wrapper.exists('#download-table')).toBe(true);
      expect(wrapper.find('#download-table-one').text()).toEqual(
        '1 downloadConfirmDialog.hour {count:1}'
      );
    });

    it('renders for a single minute', async () => {
      const wrapper = timeWrapper(timeToSize(0, 1, 0, 0));
      await updateDialogWrapper(wrapper);

      expect(wrapper.exists('#download-table')).toBe(true);
      expect(wrapper.find('#download-table-one').text()).toEqual(
        '1 downloadConfirmDialog.minute {count:1}'
      );
    });

    it('renders for a single second', async () => {
      const wrapper = timeWrapper(timeToSize(1, 0, 0, 0));
      await updateDialogWrapper(wrapper);

      expect(wrapper.exists('#download-table')).toBe(true);
      expect(wrapper.find('#download-table-one').text()).toEqual(
        '1 downloadConfirmDialog.second {count:1}'
      );
    });
  });
});
