import React from 'react';
import { mount, ReactWrapper, shallow } from 'enzyme';
import { Download } from 'datagateway-common';
import {
  adminDownloadDeleted,
  adminDownloadStatus,
  fetchAdminDownloads,
} from '../downloadApi';
import AdminDownloadStatusTable from './adminDownloadStatusTable.component';
import { act } from 'react-dom/test-utils';
import {
  applyDatePickerWorkaround,
  cleanupDatePickerWorkaround,
  flushPromises,
} from '../setupTests';
import { Select } from '@mui/material';

jest.mock('../downloadApi');

describe('Admin Download Status Table', () => {
  let holder;

  const createWrapper = (): ReactWrapper => {
    return mount(<AdminDownloadStatusTable />, { attachTo: holder });
  };

  const downloadItems: Download[] = [
    {
      createdAt: '2020-02-25T15:05:29Z',
      downloadItems: [{ entityId: 1, entityType: 'investigation', id: 1 }],
      email: 'test1@email.com',
      facilityName: 'LILS',
      fileName: 'test-file-1',
      fullName: 'Person 1',
      id: 1,
      isDeleted: false,
      isEmailSent: true,
      isTwoLevel: false,
      preparedId: 'test-prepared-id',
      sessionId: 'test-session-id',
      size: 1000,
      status: 'COMPLETE',
      transport: 'https',
      userName: 'test user',
    },
    {
      createdAt: '2020-02-26T15:05:35Z',
      downloadItems: [{ entityId: 2, entityType: 'investigation', id: 2 }],
      email: 'test2@email.com',
      facilityName: 'LILS',
      fileName: 'test-file-2',
      fullName: 'Person 2',
      id: 2,
      isDeleted: false,
      isEmailSent: true,
      isTwoLevel: false,
      preparedId: 'test-prepared-id',
      sessionId: 'test-session-id',
      size: 2000,
      status: 'PREPARING',
      transport: 'globus',
      userName: 'test user',
    },
    {
      createdAt: '2020-02-27T15:57:20Z',
      downloadItems: [{ entityId: 3, entityType: 'investigation', id: 3 }],
      email: 'test3@email.com',
      facilityName: 'LILS',
      fileName: 'test-file-3',
      fullName: 'Person 3',
      id: 3,
      isDeleted: false,
      isEmailSent: true,
      isTwoLevel: false,
      preparedId: 'test-prepared-id',
      sessionId: 'test-session-id',
      size: 3000,
      status: 'RESTORING',
      transport: 'https',
      userName: 'test user',
    },
    {
      createdAt: '2020-02-28T15:57:28Z',
      downloadItems: [{ entityId: 4, entityType: 'investigation', id: 4 }],
      email: 'test4@email.com',
      facilityName: 'LILS',
      fileName: 'test-file-4',
      fullName: 'Person 4',
      id: 4,
      isDeleted: true,
      isEmailSent: true,
      isTwoLevel: false,
      preparedId: 'test-prepared-id',
      sessionId: 'test-session-id',
      size: 4000,
      status: 'EXPIRED',
      transport: 'globus',
      userName: 'test user',
    },
    {
      createdAt: '2020-03-01T15:57:28Z[UTC]',
      downloadItems: [{ entityId: 5, entityType: 'investigation', id: 5 }],
      email: 'test5@email.com',
      facilityName: 'LILS',
      fileName: 'test-file-5',
      fullName: 'Person 5',
      id: 5,
      isDeleted: false,
      isEmailSent: true,
      isTwoLevel: false,
      preparedId: 'test-prepared-id',
      sessionId: 'test-session-id',
      size: 5000,
      status: 'PAUSED',
      transport: 'globus',
      userName: 'test user',
    },
  ];

  beforeEach(() => {
    //https://stackoverflow.com/questions/43694975/jest-enzyme-using-mount-document-getelementbyid-returns-null-on-componen
    holder = document.createElement('div');
    holder.setAttribute('id', 'datagateway-download');
    document.body.appendChild(holder);

    (fetchAdminDownloads as jest.Mock).mockImplementation(
      (
        settings: { facilityName: string; downloadApiUrl: string },
        queryOffset?: string
      ) => {
        //Only return the 5 results when initialy requesting so that only a total
        //of 5 results will be loaded
        if (queryOffset?.endsWith('LIMIT 0, 50'))
          return Promise.resolve(downloadItems);
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
    (fetchAdminDownloads as jest.Mock).mockClear();
    (adminDownloadDeleted as jest.Mock).mockClear();
    (adminDownloadStatus as jest.Mock).mockClear();
  });

  it('renders correctly', () => {
    const mockedDate = new Date(Date.UTC(2020, 1, 1, 0, 0, 0)).toUTCString();
    global.Date.prototype.toLocaleString = jest.fn(() => mockedDate);

    const wrapper = shallow(<AdminDownloadStatusTable />);
    expect(wrapper).toMatchSnapshot();
  });

  it('fetches the download items and sorts by download requested time desc on load ', async () => {
    const wrapper = createWrapper();

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(fetchAdminDownloads).toHaveBeenCalledTimes(2);
    expect(fetchAdminDownloads).toHaveBeenNthCalledWith(
      1,
      { downloadApiUrl: '', facilityName: '' },
      "WHERE download.facilityName = '' ORDER BY download.createdAt desc, download.id ASC LIMIT 0, 50"
    );
    expect(wrapper.exists('[aria-rowcount=5]')).toBe(true);
  });

  it('fetches more download items when loadMoreRows is called', async () => {
    const wrapper = createWrapper();

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    await act(async () => {
      wrapper.find('VirtualizedTable').prop('loadMoreRows')({
        startIndex: 5,
        stopIndex: 9,
      });

      await flushPromises();
      wrapper.update();
    });

    expect(fetchAdminDownloads).toHaveBeenCalledTimes(3);
    expect(fetchAdminDownloads).toHaveBeenLastCalledWith(
      { downloadApiUrl: '', facilityName: '' },
      "WHERE download.facilityName = '' ORDER BY download.createdAt desc, download.id ASC LIMIT 5, 5"
    );
    expect(wrapper.exists('[aria-rowcount=5]')).toBe(true);
  });

  it('translates the status strings correctly', async () => {
    const wrapper = createWrapper();

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(
      wrapper.find('[aria-rowindex=1]').find('[aria-colindex=6]').text()
    ).toEqual('downloadStatus.complete');
    expect(
      wrapper.find('[aria-rowindex=2]').find('[aria-colindex=6]').text()
    ).toEqual('downloadStatus.preparing');
    expect(
      wrapper.find('[aria-rowindex=3]').find('[aria-colindex=6]').text()
    ).toEqual('downloadStatus.restoring');
    expect(
      wrapper.find('[aria-rowindex=4]').find('[aria-colindex=6]').text()
    ).toEqual('downloadStatus.expired');
    expect(
      wrapper.find('[aria-rowindex=5]').find('[aria-colindex=6]').text()
    ).toEqual('downloadStatus.paused');
  });

  it('re-fetches the download items when the refresh button is clicked', async () => {
    const wrapper = createWrapper();

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    await act(async () => {
      wrapper
        .find(
          'button[aria-label="downloadTab.refresh_download_status_arialabel"]'
        )
        .simulate('click');
      await flushPromises();
      wrapper.update();
    });

    expect(fetchAdminDownloads).toHaveBeenCalledTimes(3);
    expect(fetchAdminDownloads).toHaveBeenNthCalledWith(
      3,
      { downloadApiUrl: '', facilityName: '' },
      "WHERE download.facilityName = '' ORDER BY download.createdAt desc, download.id ASC LIMIT 0, 50"
    );
    expect(wrapper.exists('[aria-rowcount=5]')).toBe(true);
  });

  it('sends sort request on sort', async () => {
    const wrapper = createWrapper();

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // Table is sorted by createdAt desc by default
    // To keep working test, we will remove all sorts on the table beforehand
    const createdAtSortLabel = wrapper
      .find('[role="columnheader"] span[role="button"]')
      .at(6);
    await act(async () => {
      createdAtSortLabel.simulate('click');
      await flushPromises();
      wrapper.update();
    });

    // Get the Username sort header
    const usernameSortLabel = wrapper
      .find('[role="columnheader"] span[role="button"]')
      .at(2);
    await act(async () => {
      usernameSortLabel.simulate('click');
      await flushPromises();
      wrapper.update();
    });

    expect(fetchAdminDownloads).toHaveBeenLastCalledWith(
      { downloadApiUrl: '', facilityName: '' },
      "WHERE download.facilityName = '' ORDER BY download.userName asc, download.id ASC LIMIT 0, 50"
    );

    // Get the Access Method sort header.
    const accessMethodSortLabel = wrapper
      .find('[role="columnheader"] span[role="button"]')
      .at(4);
    await act(async () => {
      accessMethodSortLabel.simulate('click');
      await flushPromises();
      wrapper.update();
    });

    expect(fetchAdminDownloads).toHaveBeenLastCalledWith(
      { downloadApiUrl: '', facilityName: '' },
      "WHERE download.facilityName = '' ORDER BY download.userName asc, download.transport asc, download.id ASC LIMIT 0, 50"
    );

    await act(async () => {
      accessMethodSortLabel.simulate('click');
      await flushPromises();
      wrapper.update();
    });

    expect(fetchAdminDownloads).toHaveBeenLastCalledWith(
      { downloadApiUrl: '', facilityName: '' },
      "WHERE download.facilityName = '' ORDER BY download.userName asc, download.transport desc, download.id ASC LIMIT 0, 50"
    );

    await act(async () => {
      accessMethodSortLabel.simulate('click');
      await flushPromises();
      wrapper.update();
    });

    expect(fetchAdminDownloads).toHaveBeenLastCalledWith(
      { downloadApiUrl: '', facilityName: '' },
      "WHERE download.facilityName = '' ORDER BY download.userName asc, download.id ASC LIMIT 0, 50"
    );
  }, 10000);

  it('sends filter request on text filter', async () => {
    const wrapper = createWrapper();

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // Table is sorted by createdAt desc by default
    // To keep working test, we will remove all sorts on the table beforehand
    const createdAtSortLabel = wrapper
      .find('[role="columnheader"] span[role="button"]')
      .at(6);
    await act(async () => {
      createdAtSortLabel.simulate('click');
      await flushPromises();
      wrapper.update();
    });

    // Get the Username filter input
    const usernameFilterInput = wrapper
      .find('[aria-label="Filter by downloadStatus.username"]')
      .last();
    await act(async () => {
      usernameFilterInput.instance().value = 'test user';
      usernameFilterInput.simulate('change');
      await flushPromises();
      wrapper.update();
    });

    expect(fetchAdminDownloads).toHaveBeenLastCalledWith(
      { downloadApiUrl: '', facilityName: '' },
      "WHERE download.facilityName = '' AND UPPER(download.userName) LIKE CONCAT('%', 'TEST USER', '%') ORDER BY download.id ASC LIMIT 0, 50"
    );
    usernameFilterInput.instance().value = '';
    usernameFilterInput.simulate('change');

    // Get the Availability filter input
    const availabilityFilterInput = wrapper
      .find('[aria-label="Filter by downloadStatus.status"]')
      .last();
    await act(async () => {
      availabilityFilterInput.instance().value = 'downloadStatus.complete';
      availabilityFilterInput.simulate('change');
      await flushPromises();
      wrapper.update();
    });

    expect(fetchAdminDownloads).toHaveBeenLastCalledWith(
      { downloadApiUrl: '', facilityName: '' },
      "WHERE download.facilityName = '' AND UPPER(download.status) LIKE CONCAT('%', 'COMPLETE', '%') ORDER BY download.id ASC LIMIT 0, 50"
    );

    // We simulate a change in the select from 'include' to 'exclude'.
    const availabilityFilterSelect = wrapper.find(Select).at(5);
    await act(async () => {
      availabilityFilterSelect
        .props()
        .onChange({ target: { value: 'exclude' } });
      await flushPromises();
      wrapper.update();
    });

    expect(fetchAdminDownloads).toHaveBeenLastCalledWith(
      { downloadApiUrl: '', facilityName: '' },
      "WHERE download.facilityName = '' AND UPPER(download.status) NOT LIKE CONCAT('%', 'COMPLETE', '%') ORDER BY download.id ASC LIMIT 0, 50"
    );

    await act(async () => {
      availabilityFilterInput.instance().value = '';
      availabilityFilterInput.simulate('change');
      await flushPromises();
      wrapper.update();
    });

    expect(fetchAdminDownloads).toHaveBeenLastCalledWith(
      { downloadApiUrl: '', facilityName: '' },
      "WHERE download.facilityName = '' ORDER BY download.id ASC LIMIT 0, 50"
    );
  }, 10000);

  it('sends filter request on date filter', async () => {
    applyDatePickerWorkaround();

    const wrapper = createWrapper();

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // Table is sorted by createdAt desc by default
    // To keep working test, we will remove all sorts on the table beforehand
    const createdAtSortLabel = wrapper
      .find('[role="columnheader"] span[role="button"]')
      .at(6);
    await act(async () => {
      createdAtSortLabel.simulate('click');
      await flushPromises();
      wrapper.update();
    });

    // Get the Requested Data From filter input
    const dateFromFilterInput = wrapper.find(
      'input[id="downloadStatus.createdAt filter from"]'
    );
    await act(async () => {
      dateFromFilterInput.instance().value = '2020-01-01 00:00';
      dateFromFilterInput.simulate('change');
      await flushPromises();
      wrapper.update();
    });

    expect(fetchAdminDownloads).toHaveBeenLastCalledWith(
      { downloadApiUrl: '', facilityName: '' },
      "WHERE download.facilityName = '' AND download.createdAt BETWEEN {ts '2020-01-01 00:00'} AND {ts '9999-12-31 23:59'} ORDER BY download.id ASC LIMIT 0, 50"
    );

    // Get the Requested Data To filter input
    const dateToFilterInput = wrapper.find(
      'input[id="downloadStatus.createdAt filter to"]'
    );
    await act(async () => {
      dateToFilterInput.instance().value = '2020-01-02 23:59';
      dateToFilterInput.simulate('change');
      await flushPromises();
      wrapper.update();
    });

    expect(fetchAdminDownloads).toHaveBeenLastCalledWith(
      { downloadApiUrl: '', facilityName: '' },
      "WHERE download.facilityName = '' AND download.createdAt BETWEEN {ts '2020-01-01 00:00'} AND {ts '2020-01-02 23:59'} ORDER BY download.id ASC LIMIT 0, 50"
    );

    dateFromFilterInput.instance().value = '';
    dateFromFilterInput.simulate('change');
    dateToFilterInput.instance().value = '';
    dateToFilterInput.simulate('change');
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(fetchAdminDownloads).toHaveBeenLastCalledWith(
      { downloadApiUrl: '', facilityName: '' },
      "WHERE download.facilityName = '' ORDER BY download.id ASC LIMIT 0, 50"
    );

    cleanupDatePickerWorkaround();
  }, 10000);

  it('sends restore item and item status requests when restore button is clicked', async () => {
    const wrapper = createWrapper();

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    (fetchAdminDownloads as jest.Mock).mockImplementation(() =>
      Promise.resolve([
        { ...downloadItems[0], isDeleted: false, status: 'RESTORING' },
      ])
    );

    await act(async () => {
      wrapper
        .find(
          'button[aria-label="downloadStatus.restore {filename:test-file-4}"]'
        )
        .simulate('click');
      await flushPromises();
      wrapper.update();
    });

    expect(adminDownloadDeleted).toHaveBeenCalledWith(4, false, {
      downloadApiUrl: '',
      facilityName: '',
    });
    expect(fetchAdminDownloads).toHaveBeenLastCalledWith(
      { downloadApiUrl: '', facilityName: '' },
      'WHERE download.id = 4'
    );
    expect(
      wrapper.exists(
        '[aria-label="downloadStatus.pause {filename:test-file-4}"]'
      )
    ).toBeTruthy();
  });

  it('sends pause restore request when pause button is clicked', async () => {
    const wrapper = createWrapper();

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    await act(async () => {
      wrapper
        .find(
          'button[aria-label="downloadStatus.pause {filename:test-file-3}"]'
        )
        .simulate('click');
      await flushPromises();
      wrapper.update();
    });

    expect(adminDownloadStatus).toHaveBeenCalledWith(3, 'PAUSED', {
      downloadApiUrl: '',
      facilityName: '',
    });
    expect(
      wrapper.exists(
        '[aria-label="downloadStatus.resume {filename:test-file-3}"]'
      )
    ).toBeTruthy();
  });

  it('sends resume restore request when resume button is clicked', async () => {
    const wrapper = createWrapper();

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    await act(async () => {
      wrapper
        .find(
          'button[aria-label="downloadStatus.resume {filename:test-file-5}"]'
        )
        .simulate('click');
      await flushPromises();
      wrapper.update();
    });

    expect(adminDownloadStatus).toHaveBeenCalledWith(5, 'RESTORING', {
      downloadApiUrl: '',
      facilityName: '',
    });
    expect(
      wrapper.exists(
        '[aria-label="downloadStatus.pause {filename:test-file-5}"]'
      )
    ).toBeTruthy();
  });

  it('sends delete item request when delete button is clicked', async () => {
    const wrapper = createWrapper();

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    wrapper
      .find('button[aria-label="downloadStatus.delete {filename:test-file-1}"]')
      .simulate('click');

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(adminDownloadDeleted).toHaveBeenCalledWith(1, true, {
      downloadApiUrl: '',
      facilityName: '',
    });
    expect(
      wrapper.exists(
        '[aria-label="downloadStatus.restore {filename:test-file-1}"]'
      )
    ).toBeTruthy();
  });
});
