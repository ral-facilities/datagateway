import React from 'react';
import { createMount, createShallow } from '@material-ui/core/test-utils';
import { Download } from 'datagateway-common';
import {
  adminDownloadDeleted,
  adminDownloadStatus,
  fetchAdminDownloads,
} from '../downloadApi';
import AdminDownloadStatusTable from './adminDownloadStatusTable.component';
import { act } from 'react-dom/test-utils';
import { flushPromises } from '../setupTests';
import { Select } from '@material-ui/core';

jest.mock('../downloadApi');

describe('Admin Download Status Table', () => {
  let shallow;
  let mount;

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
      createdAt: '2020-03-01T15:57:28Z',
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
    shallow = createShallow({ untilSelector: 'div' });
    mount = createMount();
    (fetchAdminDownloads as jest.Mock).mockImplementation(() =>
      Promise.resolve(downloadItems)
    );
    (adminDownloadDeleted as jest.Mock).mockImplementation(() =>
      Promise.resolve()
    );
    (adminDownloadStatus as jest.Mock).mockImplementation(() =>
      Promise.resolve()
    );
  });

  afterEach(() => {
    mount.cleanUp();
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

  it('fetches the download items on load', async () => {
    const wrapper = mount(
      <div id="datagateway-download">
        <AdminDownloadStatusTable />
      </div>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(fetchAdminDownloads).toHaveBeenCalledTimes(2);
    expect(fetchAdminDownloads).toHaveBeenLastCalledWith(
      { downloadApiUrl: '', facilityName: '' },
      "WHERE UPPER(download.facilityName) = '' ORDER BY UPPER(download.id) ASC LIMIT 0, 50"
    );
    expect(wrapper.exists('[aria-rowcount=5]')).toBe(true);
  });

  it('translates the status strings correctly', async () => {
    const wrapper = mount(
      <div id="datagateway-download">
        <AdminDownloadStatusTable />
      </div>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(
      wrapper.find('[aria-rowindex=1]').find('[aria-colindex=4]').text()
    ).toEqual('downloadStatus.complete');
    expect(
      wrapper.find('[aria-rowindex=2]').find('[aria-colindex=4]').text()
    ).toEqual('downloadStatus.preparing');
    expect(
      wrapper.find('[aria-rowindex=3]').find('[aria-colindex=4]').text()
    ).toEqual('downloadStatus.restoring');
    expect(
      wrapper.find('[aria-rowindex=4]').find('[aria-colindex=4]').text()
    ).toEqual('downloadStatus.expired');
    expect(
      wrapper.find('[aria-rowindex=5]').find('[aria-colindex=4]').text()
    ).toEqual('downloadStatus.paused');
  });

  it('re-fetches the download items when the refresh button is clicked', async () => {
    const wrapper = mount(
      <div id="datagateway-download">
        <AdminDownloadStatusTable />
      </div>
    );

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
    expect(fetchAdminDownloads).toHaveBeenLastCalledWith(
      { downloadApiUrl: '', facilityName: '' },
      "WHERE UPPER(download.facilityName) = '' ORDER BY UPPER(download.id) ASC LIMIT 0, 50"
    );
    expect(wrapper.exists('[aria-rowcount=5]')).toBe(true);
  });

  it('sends sort request on sort', async () => {
    const wrapper = mount(
      <div id="datagateway-download">
        <AdminDownloadStatusTable />
      </div>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // Get the Username sort header
    const usernameSortLabel = wrapper
      .find('[role="columnheader"] span[role="button"]')
      .at(0);
    await act(async () => {
      usernameSortLabel.simulate('click');
      await flushPromises();
      wrapper.update();
    });

    expect(fetchAdminDownloads).toHaveBeenLastCalledWith(
      { downloadApiUrl: '', facilityName: '' },
      "WHERE UPPER(download.facilityName) = '' ORDER BY UPPER(download.userName) asc, UPPER(download.id) ASC LIMIT 0, 50"
    );

    await act(async () => {
      usernameSortLabel.simulate('click');
      await flushPromises();
      wrapper.update();
    });

    expect(fetchAdminDownloads).toHaveBeenLastCalledWith(
      { downloadApiUrl: '', facilityName: '' },
      "WHERE UPPER(download.facilityName) = '' ORDER BY UPPER(download.userName) desc, UPPER(download.id) ASC LIMIT 0, 50"
    );

    // Get the Access Method sort header.
    const accessMethodSortLabel = wrapper
      .find('[role="columnheader"] span[role="button"]')
      .at(2);
    await act(async () => {
      accessMethodSortLabel.simulate('click');
      await flushPromises();
      wrapper.update();
    });

    expect(fetchAdminDownloads).toHaveBeenLastCalledWith(
      { downloadApiUrl: '', facilityName: '' },
      "WHERE UPPER(download.facilityName) = '' ORDER BY UPPER(download.userName) desc, UPPER(download.transport) asc, UPPER(download.id) ASC LIMIT 0, 50"
    );

    await act(async () => {
      accessMethodSortLabel.simulate('click');
      await flushPromises();
      wrapper.update();
    });

    expect(fetchAdminDownloads).toHaveBeenLastCalledWith(
      { downloadApiUrl: '', facilityName: '' },
      "WHERE UPPER(download.facilityName) = '' ORDER BY UPPER(download.userName) desc, UPPER(download.transport) desc, UPPER(download.id) ASC LIMIT 0, 50"
    );

    await act(async () => {
      accessMethodSortLabel.simulate('click');
      await flushPromises();
      wrapper.update();
    });

    expect(fetchAdminDownloads).toHaveBeenLastCalledWith(
      { downloadApiUrl: '', facilityName: '' },
      "WHERE UPPER(download.facilityName) = '' ORDER BY UPPER(download.userName) desc, UPPER(download.id) ASC LIMIT 0, 50"
    );
  });

  it('sends filter request on text filter', async () => {
    const wrapper = mount(
      <div id="datagateway-download">
        <AdminDownloadStatusTable />
      </div>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // Get the Username filter input
    const usernameFilterInput = wrapper
      .find('[aria-label="Filter by downloadStatus.username"] input')
      .first();
    await act(async () => {
      usernameFilterInput.instance().value = 'test user';
      usernameFilterInput.simulate('change');
      await flushPromises();
      wrapper.update();
    });

    expect(fetchAdminDownloads).toHaveBeenLastCalledWith(
      { downloadApiUrl: '', facilityName: '' },
      "WHERE UPPER(download.facilityName) = '' AND UPPER(download.userName) LIKE CONCAT('%', 'test user', '%') ORDER BY UPPER(download.id) ASC LIMIT 0, 50"
    );
    usernameFilterInput.instance().value = '';
    usernameFilterInput.simulate('change');

    // Get the Prepared ID filter input
    const preparedIdFilterInput = wrapper
      .find('[aria-label="Filter by downloadStatus.preparedId"] input')
      .first();
    await act(async () => {
      preparedIdFilterInput.instance().value = 'test-prepared-id';
      preparedIdFilterInput.simulate('change');
      await flushPromises();
      wrapper.update();
    });

    expect(fetchAdminDownloads).toHaveBeenLastCalledWith(
      { downloadApiUrl: '', facilityName: '' },
      "WHERE UPPER(download.facilityName) = '' AND UPPER(download.preparedId) LIKE CONCAT('%', 'test-prepared-id', '%') ORDER BY UPPER(download.id) ASC LIMIT 0, 50"
    );
    preparedIdFilterInput.instance().value = '';
    preparedIdFilterInput.simulate('change');

    // Get the Access Method filter input
    const accessMethodFilterInput = wrapper
      .find('[aria-label="Filter by downloadStatus.transport"] input')
      .first();
    await act(async () => {
      accessMethodFilterInput.instance().value = 'https';
      accessMethodFilterInput.simulate('change');
      await flushPromises();
      wrapper.update();
    });

    expect(fetchAdminDownloads).toHaveBeenLastCalledWith(
      { downloadApiUrl: '', facilityName: '' },
      "WHERE UPPER(download.facilityName) = '' AND UPPER(download.transport) LIKE CONCAT('%', 'https', '%') ORDER BY UPPER(download.id) ASC LIMIT 0, 50"
    );
    accessMethodFilterInput.instance().value = '';
    accessMethodFilterInput.simulate('change');

    // Get the Availability filter input
    const availabilityFilterInput = wrapper
      .find('[aria-label="Filter by downloadStatus.status"] input')
      .first();
    await act(async () => {
      availabilityFilterInput.instance().value = 'downloadStatus.complete';
      availabilityFilterInput.simulate('change');
      await flushPromises();
      wrapper.update();
    });

    expect(fetchAdminDownloads).toHaveBeenLastCalledWith(
      { downloadApiUrl: '', facilityName: '' },
      "WHERE UPPER(download.facilityName) = '' AND UPPER(download.status) LIKE CONCAT('%', 'COMPLETE', '%') ORDER BY UPPER(download.id) ASC LIMIT 0, 50"
    );

    // We simulate a change in the select from 'include' to 'exclude'.
    const availabilityFilterSelect = wrapper.find(Select).at(3);
    await act(async () => {
      availabilityFilterSelect
        .props()
        .onChange({ target: { value: 'exclude' } });
      await flushPromises();
      wrapper.update();
    });

    expect(fetchAdminDownloads).toHaveBeenLastCalledWith(
      { downloadApiUrl: '', facilityName: '' },
      "WHERE UPPER(download.facilityName) = '' AND UPPER(download.status) NOT LIKE CONCAT('%', 'COMPLETE', '%') ORDER BY UPPER(download.id) ASC LIMIT 0, 50"
    );

    await act(async () => {
      availabilityFilterInput.instance().value = '';
      availabilityFilterInput.simulate('change');
      await flushPromises();
      wrapper.update();
    });

    expect(fetchAdminDownloads).toHaveBeenLastCalledWith(
      { downloadApiUrl: '', facilityName: '' },
      "WHERE UPPER(download.facilityName) = '' ORDER BY UPPER(download.id) ASC LIMIT 0, 50"
    );
  });

  it('sends filter request on date filter', async () => {
    const wrapper = mount(
      <div id="datagateway-download">
        <AdminDownloadStatusTable />
      </div>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // Get the Requested Data From filter input
    const dateFromFilterInput = wrapper.find(
      '[aria-label="downloadStatus.createdAt date filter from"]'
    );
    await act(async () => {
      dateFromFilterInput.instance().value = '2020-01-01';
      dateFromFilterInput.simulate('change');
      await flushPromises();
      wrapper.update();
    });

    expect(fetchAdminDownloads).toHaveBeenLastCalledWith(
      { downloadApiUrl: '', facilityName: '' },
      "WHERE UPPER(download.facilityName) = '' AND UPPER(download.createdAt) BETWEEN {ts '2020-01-01 00:00:00'} AND {ts '9999-12-31 23:59:59'} ORDER BY UPPER(download.id) ASC LIMIT 0, 50"
    );

    // Get the Requested Data To filter input
    const dateToFilterInput = wrapper.find(
      '[aria-label="downloadStatus.createdAt date filter to"]'
    );
    await act(async () => {
      dateToFilterInput.instance().value = '2020-01-02';
      dateToFilterInput.simulate('change');
      await flushPromises();
      wrapper.update();
    });

    expect(fetchAdminDownloads).toHaveBeenLastCalledWith(
      { downloadApiUrl: '', facilityName: '' },
      "WHERE UPPER(download.facilityName) = '' AND UPPER(download.createdAt) BETWEEN {ts '2020-01-01 00:00:00'} AND {ts '2020-01-02 23:59:59'} ORDER BY UPPER(download.id) ASC LIMIT 0, 50"
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
      "WHERE UPPER(download.facilityName) = '' ORDER BY UPPER(download.id) ASC LIMIT 0, 50"
    );
  });

  it('sends restore item and item status requests when restore button is clicked', async () => {
    jest.useFakeTimers();

    const wrapper = mount(
      <div id="datagateway-download">
        <AdminDownloadStatusTable />
      </div>
    );

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
      jest.runAllTimers();
      await flushPromises();
      wrapper.update();
    });

    expect(adminDownloadDeleted).toHaveBeenCalledWith(4, false, {
      downloadApiUrl: '',
      facilityName: '',
    });
    expect(fetchAdminDownloads).toHaveBeenLastCalledWith(
      { downloadApiUrl: '', facilityName: '' },
      'WHERE UPPER(download.id) = 4'
    );
    expect(
      wrapper.exists(
        '[aria-label="downloadStatus.pause {filename:test-file-4}"]'
      )
    ).toBeTruthy();
  });

  it('sends pause restore request when pause button is clicked', async () => {
    jest.useFakeTimers();
    const wrapper = mount(
      <div id="datagateway-download">
        <AdminDownloadStatusTable />
      </div>
    );

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
      jest.runAllTimers();
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
    jest.useFakeTimers();
    const wrapper = mount(
      <div id="datagateway-download">
        <AdminDownloadStatusTable />
      </div>
    );

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
      jest.runAllTimers();
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
    jest.useFakeTimers();
    const wrapper = mount(
      <div id="datagateway-download">
        <AdminDownloadStatusTable />
      </div>
    );

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    wrapper
      .find('button[aria-label="downloadStatus.delete {filename:test-file-1}"]')
      .simulate('click');

    await act(async () => {
      jest.runAllTimers();
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
