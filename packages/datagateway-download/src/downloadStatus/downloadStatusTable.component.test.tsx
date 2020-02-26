import React from 'react';
import DownloadStatusTable from './downloadStatusTable.component';
import { createShallow } from '@material-ui/core/test-utils';
import { flushPromises } from '../setupTests';
import { act } from 'react-dom/test-utils';
import { fetchDownloads } from '../downloadApi';
// import { Download } from 'datagateway-common';

describe('Download Status Table', () => {
  let shallow;

  //   const downloadItems: Download[] = [
  //       {

  //       }
  //   ]

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });
  });

  //   afterEach(() => {
  //   });

  it('renders correctly', () => {
    const wrapper = shallow(
      <DownloadStatusTable
        refreshTable={false}
        setRefreshTable={jest.fn()}
        setLastChecked={jest.fn()}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('fetches downloads on load', async () => {
    const wrapper = shallow(
      <DownloadStatusTable
        refreshTable={false}
        setRefreshTable={jest.fn()}
        setLastChecked={jest.fn()}
      />
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(fetchDownloads).toHaveBeenCalled();
  });

  // TODO: Should this be in the downloadTab test?
  //it('refreshes the tables when the refresh button has been clicked');

  //   it('starts a download when the download button is clicked');

  //   it("removes an item when said item's remove button is clicked");

  //   it('sorts data when headers are clicked');

  //   it('filters data when text fields are typed into');

  //   it('filters data when date filter is altered');
});
