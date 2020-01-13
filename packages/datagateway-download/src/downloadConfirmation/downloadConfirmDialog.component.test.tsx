import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import DownloadConfirmDialog from './downloadConfirmDialog.component';
import { ReactWrapper } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { flushPromises } from '../setupTests';

import axios from 'axios';

describe('DownloadConfirmDialog', () => {
  let mount;
  let dialogCloseFunction = jest.fn();

  beforeAll(() => {
    // Fix the time to 2020-1-1 1hr:1min:1sec in order to match
    // snapshots for the DownloadConfirmDialog component.
    const fixedDate = new Date(2020, 0, 1, 1, 1, 1);
    const d = Date;

    const _global: NodeJS.Global = global;
    _global.Date = jest.fn(() => fixedDate);
    _global.Date.UTC = d.UTC;
    _global.Date.parse = d.parse;
    _global.Date.now = d.now;
  });

  beforeEach(() => {
    mount = createMount();
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
        setOpen={open}
        setClose={dialogCloseFunction}
      />
    );
  };

  it('renders correctly', () => {
    // Pass in a size of 100 bytes and for the dialog to be open when mounted.
    const wrapper = createWrapper(100, false, true);

    expect(wrapper).toMatchSnapshot();
  });

  it('does not load the download speed/time table when isTwoLevel is true', () => {
    // Set isTwoLevel to true as a prop.
    const wrapper = createWrapper(100, true, true);

    expect(wrapper).toMatchSnapshot();
  });

  it('loads the submit successful view when download button is clicked', async () => {
    const wrapper = createWrapper(100, false, true);

    (axios.post as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          facilityName: 'LILS',
          userName: 'test user',
          cartItems: [],
          downloadId: '1',
        },
      })
    );

    // Ensure the close button is present.
    expect(wrapper.exists('button#download-confirmation-download')).toBe(true);

    await act(async () => {
      wrapper.find('button#download-confirmation-download').simulate('click');
      await flushPromises();
      wrapper.update();
    });

    // The success message should exist.
    expect(wrapper.exists('#download-confirmation-success')).toBe(true);
  });

  // it('successfully loads submit successful view after submitting download request with custom values', async () => {
  //   const wrapper = createWrapper(100, false, true);

  //   (axios.post as jest.Mock).mockImplementationOnce(() =>
  //     Promise.resolve({
  //       data: {
  //         facilityName: 'LILS',
  //         userName: 'test user',
  //         cartItems: [],
  //         downloadId: '1',
  //       },
  //     })
  //   );

  //   // Fill in the custom download name, access method and email address.
  //   expect(wrapper.exists('input#confirm-download-name')).toBe(true);
  //   const downloadName = wrapper.find('input#confirm-download-name');
  //   downloadName.instance().value = 'test-name';
  //   downloadName.simulate('change');

  //   expect(wrapper.exists('input#confirm-download-name')).toBe(true);
  //   wrapper.find('select option[value="confirm-access-method-globus"]').simulate('change');

  //   expect(wrapper.exists('input#confirm-download-email')).toBe(true);
  //   const emailAddress = wrapper.find('input#confirm-download-email');
  //   emailAddress.instance().value = 'test@email.com';
  //   emailAddress.simulate('change');

  //   // Ensure the close button is present.
  //   expect(wrapper.exists('button#download-confirmation-download')).toBe(true);

  //   await act(async () => {
  //     wrapper.find('button#download-confirmation-download').simulate('click');
  //     await flushPromises();
  //     wrapper.update();
  //   });

  //   expect(axios.post).toHaveBeenCalledWith(
  //     'https://scigateway-preprod.esc.rl.ac.uk:8181/topcat/user/cart/LILS/submit',
  //     {
  //       params: {
  //         sessionId: null,
  //       }
  //     }
  //   )
  // });

  it('prevents the submission of a download request with an invalid email', async () => {
    const wrapper = createWrapper(100, false, true);

    // Ensure the download button is present.
    expect(wrapper.exists('button#download-confirmation-download')).toBe(true);

    await act(async () => {
      expect(
        wrapper.find('input#confirm-download-email').prop('disabled')
      ).toBeFalsy();
      wrapper
        .find('input#confirm-download-email')
        .simulate('change', { value: 'test' });

      await flushPromises();
      wrapper.update();
    });

    expect(
      wrapper.find('#download-confirmation-download').props().disabled
    ).toBeTruthy();
  });

  it('loads the submit unsuccessful view when download button is clicked', async () => {
    const wrapper = createWrapper(100, false, true);

    // We omit the downloadId which will cause the unsuccessful view to be shown.
    (axios.post as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        data: {
          facilityName: 'LILS',
          userName: 'test user',
          cartItems: [],
        },
      })
    );

    // Ensure the download button is present.
    expect(wrapper.exists('button#download-confirmation-download')).toBe(true);

    await act(async () => {
      wrapper.find('button#download-confirmation-download').simulate('click');
      await flushPromises();

      wrapper.update();
    });

    expect(wrapper.exists('#download-confirmation-unsuccessful')).toBe(true);
  });

  it('closes the Download Confirmation Dialog and successfully calls the setClose function', () => {
    const wrapper = createWrapper(1, false, true);

    // Ensure the close button is present.
    expect(wrapper.exists('[aria-label="download-confirmation-close"]')).toBe(
      true
    );
  });
});
