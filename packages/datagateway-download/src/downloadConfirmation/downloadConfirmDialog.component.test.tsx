import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import DownloadConfirmDialog from './downloadConfirmDialog.component';
import { ReactWrapper } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { flushPromises } from '../setupTests';

import axios from 'axios';
import { MenuItem } from '@material-ui/core';
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

describe('DownloadConfirmDialog', () => {
  let mount;

  beforeAll(() => {
    // Fix the time to 2020-1-1 1hr:1min:1sec in order to match
    // snapshots for the DownloadConfirmDialog component.
    const fixedDate = new Date(2020, 0, 1, 1, 1, 1);
    const d = Date;

    const _global: NodeJS.Global = global;
    _global.Date = jest.fn(() => fixedDate);
    _global.Date.parse = d.parse;
    _global.Date.UTC = d.UTC;
    _global.Date.now = d.now;

    // Axios GET responses download submission.
    (axios.get as jest.Mock).mockImplementation(() => {
      return Promise.resolve({
        data: { disabled: false, message: '' },
      });
    });
  });

  beforeEach(() => {
    mount = createMount();
  });

  afterEach(() => {
    mount.cleanUp();

    (axios.get as jest.Mock).mockClear();
    (axios.post as jest.Mock).mockClear();
    (handleICATError as jest.Mock).mockClear();
  });

  afterAll(() => {
    global.Date = Date;
  });

  const createWrapper = (
    size: number,
    isTwoLevel: boolean,
    open: boolean
  ): ReactWrapper => {
    return mount(
      <DownloadConfirmDialog
        totalSize={size}
        isTwoLevel={isTwoLevel}
        open={open}
        setClose={jest.fn()}
        clearCart={jest.fn()}
      />
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

  it('prevents a download if a selected access method is disabled', async () => {
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
    wrapper
      .find(MenuItem)
      .at(1)
      .simulate('click');

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

  it('prevent download of an access method where the status was not fetched', async () => {
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
    expect(
      wrapper
        .find(MenuItem)
        .at(1)
        .prop('disabled')
    ).toBe(true);

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
            facilityName: 'LILS',
            fileName: 'LILS_2020-1-1_1-1-1',
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
          facilityName: 'LILS',
          userName: 'test user',
          cartItems: [],
          downloadId: '1',
        },
      })
    );

    const wrapper = createWrapper(100, false, true);
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
      'https://scigateway-preprod.esc.rl.ac.uk:8181/topcat/user/downloadType/https/status',
      {
        params: {
          sessionId: null,
          facilityName: 'LILS',
        },
      }
    );
    expect(axios.get).toHaveBeenCalledWith(
      'https://scigateway-preprod.esc.rl.ac.uk:8181/topcat/user/downloadType/globus/status',
      {
        params: {
          sessionId: null,
          facilityName: 'LILS',
        },
      }
    );

    // Expect the posting of the download request.
    const params = new URLSearchParams();
    params.append('sessionId', '');
    params.append('transport', 'https');
    params.append('email', '');
    params.append('fileName', 'LILS_2020-1-1_1-1-1');
    params.append('zipType', 'ZIP');

    expect(axios.post).toHaveBeenCalled();
    expect(axios.post).toHaveBeenCalledWith(
      'https://scigateway-preprod.esc.rl.ac.uk:8181/topcat/user/cart/LILS/submit',
      params
    );

    // Expect fetching of the submitted download requested.
    expect(axios.get).toHaveBeenCalledWith(
      'https://scigateway-preprod.esc.rl.ac.uk:8181/topcat/user/downloads',
      {
        params: {
          sessionId: null,
          facilityName: 'LILS',
          queryOffset: 'where download.id = 1',
        },
      }
    );
  });

  it('successfully loads submit successful view after submitting download request with custom values', async () => {
    (axios.post as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        data: {
          facilityName: 'LILS',
          userName: 'test user',
          cartItems: [],
          downloadId: '2',
        },
      })
    );

    const wrapper = createWrapper(100, false, true);
    await updateDialogWrapper(wrapper);

    // Fill in the custom download name, access method and email address.
    expect(wrapper.exists('input#confirm-download-name')).toBe(true);
    const downloadName = wrapper.find('input#confirm-download-name');
    downloadName.instance().value = 'test-name';
    downloadName.simulate('change');

    // Change the value of the dropdown access method list.
    expect(wrapper.exists('[role="button"]#confirm-access-method')).toBe(true);
    wrapper.find('[role="button"]#confirm-access-method').simulate('click');
    wrapper
      .find(MenuItem)
      .at(1)
      .simulate('click');

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
      'https://scigateway-preprod.esc.rl.ac.uk:8181/topcat/user/cart/LILS/submit',
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
          facilityName: 'LILS',
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
    params.append('fileName', 'LILS_2020-1-1_1-1-1');
    params.append('zipType', 'ZIP');

    expect(axios.post).toHaveBeenCalled();
    expect(axios.post).toHaveBeenCalledWith(
      'https://scigateway-preprod.esc.rl.ac.uk:8181/topcat/user/cart/LILS/submit',
      params
    );
  });

  it('closes the Download Confirmation Dialog and successfully calls the setClose function', async () => {
    let openDialog = true;
    const closeFunction = jest.fn();

    const wrapper = mount(
      <DownloadConfirmDialog
        totalSize={1}
        isTwoLevel={false}
        open={openDialog}
        setClose={closeFunction}
        clearCart={jest.fn()}
      />
    );
    await updateDialogWrapper(wrapper);

    // Ensure the close button is present.
    expect(wrapper.exists('[aria-label="download-confirmation-close"]')).toBe(
      true
    );
    expect(wrapper.prop('open')).toBe(true);

    // Close the download confirmation dialog.
    wrapper.setProps({ open: false });
    expect(wrapper.prop('open')).toBe(false);

    // Click the close button and ensure the close function has been called.
    wrapper
      .find('button[aria-label="download-confirmation-close"]')
      .simulate('click');

    expect(closeFunction).toHaveBeenCalled();
  });
});

describe('DownloadConfirmDialog - renders the estimated download speed/time table with varying values', () => {
  let timeMount;

  const timeWrapper = (size: number): ReactWrapper => {
    return timeMount(
      <DownloadConfirmDialog
        totalSize={size}
        isTwoLevel={false}
        open={true}
        setClose={jest.fn()}
        clearCart={jest.fn()}
      />
    );
  };

  beforeAll(() => {
    // Axios GET responses download submission.
    (axios.get as jest.Mock).mockImplementation(() => {
      return Promise.resolve({
        data: { disabled: false, message: '' },
      });
    });
  });

  beforeEach(() => {
    timeMount = createMount();
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
    let downloadSpeed = 1; // Mbps

    // Get the all the time in seconds.
    let inSeconds =
      (days ? days * 86400 : 0) +
      (hours ? hours * 3600 : 0) +
      (minutes ? minutes * 60 : 0) +
      seconds;

    // Calculate final file size required (in bytes).
    let fileSize = inSeconds * (downloadSpeed / 8) * (1024 * 1024);

    return fileSize;
  };

  it('renders for multiple days, hours, minutes and seconds', async () => {
    // Test for 2 seconds, 2 minutes, 2 hours and 2 days.
    const wrapper = timeWrapper(timeToSize(2, 2, 2, 2));
    await updateDialogWrapper(wrapper);

    expect(wrapper.exists('[aria-label="download-table"]')).toBe(true);
    expect(wrapper.find('[aria-label="download-table-one"]').text()).toEqual(
      '2 days, 2 hours, 2 min, 2 sec'
    );
  });

  it('renders for a single day, hour, minute and second', async () => {
    const wrapper = timeWrapper(timeToSize(1, 1, 1, 1));
    await updateDialogWrapper(wrapper);

    expect(wrapper.exists('[aria-label="download-table"]')).toBe(true);
    expect(wrapper.find('[aria-label="download-table-one"]').text()).toEqual(
      '1 day, 1 hour, 1 min, 1 sec'
    );
  });

  describe('estimated download table renders for single time measurements', () => {
    it('renders for a single day', async () => {
      const wrapper = timeWrapper(timeToSize(0, 0, 0, 1));
      await updateDialogWrapper(wrapper);

      expect(wrapper.exists('[aria-label="download-table"]')).toBe(true);
      expect(wrapper.find('[aria-label="download-table-one"]').text()).toEqual(
        '1 day'
      );
    });

    it('renders for a single hour', async () => {
      const wrapper = timeWrapper(timeToSize(0, 0, 1, 0));
      await updateDialogWrapper(wrapper);

      expect(wrapper.exists('[aria-label="download-table"]')).toBe(true);
      expect(wrapper.find('[aria-label="download-table-one"]').text()).toEqual(
        '1 hour'
      );
    });

    it('renders for a single minute', async () => {
      const wrapper = timeWrapper(timeToSize(0, 1, 0, 0));
      await updateDialogWrapper(wrapper);

      expect(wrapper.exists('[aria-label="download-table"]')).toBe(true);
      expect(wrapper.find('[aria-label="download-table-one"]').text()).toEqual(
        '1 min'
      );
    });

    it('renders for a single second', async () => {
      const wrapper = timeWrapper(timeToSize(1, 0, 0, 0));
      await updateDialogWrapper(wrapper);

      expect(wrapper.exists('[aria-label="download-table"]')).toBe(true);
      expect(wrapper.find('[aria-label="download-table-one"]').text()).toEqual(
        '1 sec'
      );
    });
  });
});
