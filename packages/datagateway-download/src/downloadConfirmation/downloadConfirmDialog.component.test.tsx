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

  beforeEach(() => {
    mount = createMount();
  });

  const createWrapper = (size: number, open: boolean): ReactWrapper => {
    return mount(
      <DownloadConfirmDialog
        totalSize={size}
        setOpen={open}
        setClose={dialogCloseFunction}
      />
    );
  };

  it('renders correctly', () => {
    // Pass in a size of 100 bytes and for the dialog to be open when mounted.
    const wrapper = createWrapper(100, true);

    expect(wrapper).toMatchSnapshot();
  });

  it('loads the submit successful view when download button is clicked', async () => {
    const wrapper = createWrapper(100, true);

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
    expect(wrapper.exists('#download-confirmation-success-default')).toBe(true);
  });

  it('loads the submit unsuccessful view when download button is clicked', async () => {
    const wrapper = createWrapper(100, true);

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

    // Ensure the close button is present.
    expect(wrapper.exists('button#download-confirmation-download')).toBe(true);

    await act(async () => {
      wrapper.find('button#download-confirmation-download').simulate('click');
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.exists('#download-confirmation-unsuccessful')).toBe(true);
  });

  // it('closes the Download Confirmation Dialog and successfully calls the setClose function', () => {
  //     const wrapper = createWrapper(1, true);

  //     // Ensure the close button is present.
  //     expect(wrapper.exists('[aria-label="download-confirmation-close"]')).toBe(true);
  // });
});
