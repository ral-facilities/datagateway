import React from 'react';
import DownloadStatusTable from './downloadStatusTable.component';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import { flushPromises } from '../setupTests';
import { act } from 'react-dom/test-utils';
import { fetchDownloads, downloadDeleted } from '../downloadApi';
import { Download } from 'datagateway-common';

jest.mock('../downloadApi');
jest.useFakeTimers();

const RefreshHOC: React.FC<{ refresh: boolean }> = (props: {
  refresh: boolean;
}): React.ReactElement => {
  const [refreshTable, setRefreshTable] = React.useState(false);

  React.useEffect(() => {
    setRefreshTable(props.refresh);
  }, [props.refresh]);

  return (
    <DownloadStatusTable
      refreshTable={refreshTable}
      setRefreshTable={setRefreshTable}
      setLastChecked={jest.fn()}
    />
  );
};

describe('Download Status Table', () => {
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
      isDeleted: false,
      isEmailSent: true,
      isTwoLevel: false,
      preparedId: 'test-prepared-id',
      sessionId: 'test-session-id',
      size: 4000,
      status: 'EXPIRED',
      transport: 'globus',
      userName: 'test user',
    },
  ];

  (fetchDownloads as jest.Mock).mockImplementation(() =>
    Promise.resolve(downloadItems)
  );

  (downloadDeleted as jest.Mock).mockImplementation(() => Promise.resolve());

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });
    mount = createMount();
  });

  afterEach(() => {
    mount.cleanUp();

    (fetchDownloads as jest.Mock).mockClear();
    (downloadDeleted as jest.Mock).mockClear();
  });

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

  it('fetches the download items on load', async () => {
    const wrapper = mount(
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

  it('refreshes the tables when the refresh button has been clicked', async () => {
    // Use our RefreshHOC and only modify the refresh prop
    // we pass on to the DownloadStatusTable.
    const wrapper = mount(<RefreshHOC refresh={false} />);

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // Set the refresh prop to false.
    expect(wrapper.prop('refresh')).toBe(false);

    await act(async () => {
      // Set the refresh prop to true.
      wrapper.setProps({ refresh: true });

      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.prop('refresh')).toBe(true);

    // Expect the downloads to have been fetched twice (on load and on refresh).
    expect(fetchDownloads).toHaveBeenCalledTimes(2);
  });

  it('should have a link for a download item', async () => {
    const wrapper = mount(
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

    // Expect globus download items to have been disabled.
    expect(
      wrapper.exists(
        '[aria-label="Instant download not supported for test-file-2"]'
      )
    ).toBe(true);
    expect(
      wrapper
        .find(
          'button[aria-label="Instant download not supported for test-file-2"]'
        )
        .prop('disabled')
    ).toBe(true);

    // Check to see if the href contains the correct call.
    expect(
      wrapper
        .find('a[aria-label="Download test-file-3"]')
        .at(0)
        .props().href
    ).toContain('/getData');

    wrapper.find('a[aria-label="Download test-file-3"]').simulate('click');

    expect(
      wrapper
        .find('a[aria-label="Download test-file-3"] svg')
        .parent()
        .prop('color')
    ).toEqual('primary');

    await act(async () => {
      jest.runAllTimers();
      await flushPromises();
      wrapper.update();
    });
  });

  it("removes an item when said item's remove button is clicked", async () => {
    const wrapper = mount(
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

    wrapper
      .find('button[aria-label="Remove test-file-1 from downloads"]')
      .simulate('click');

    expect(
      wrapper
        .find('button[aria-label="Remove test-file-1 from downloads"] svg')
        .parent()
        .prop('color')
    ).toEqual('error');

    await act(async () => {
      jest.runAllTimers();
      await flushPromises();
      wrapper.update();
    });

    expect(downloadDeleted).toHaveBeenCalled();
    expect(downloadDeleted).toHaveBeenCalledWith('LILS', 1, true);
    expect(
      wrapper.exists('[aria-label="Remove test-file-1 from downloads"]')
    ).toBe(false);
    expect(wrapper.exists('[aria-rowcount=3]')).toBe(true);
  });

  it('sorts data when headers are clicked', async () => {
    const wrapper = mount(
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

    const firstNameCell = wrapper
      .find('[aria-colindex=1]')
      .find('p')
      .first();

    // Get the access method sort header.
    const accessMethodSortLabel = wrapper
      .find('[role="columnheader"] span[role="button"]')
      .at(1);

    accessMethodSortLabel.simulate('click');

    expect(firstNameCell.text()).toEqual('test-file-2');

    accessMethodSortLabel.simulate('click');

    expect(firstNameCell.text()).toEqual('test-file-1');

    // Get the download name sort header.
    const nameSortLabel = wrapper
      .find('[role="columnheader"] span[role="button"]')
      .at(0);

    nameSortLabel.simulate('click');

    expect(firstNameCell.text()).toEqual('test-file-1');

    nameSortLabel.simulate('click');

    expect(firstNameCell.text()).toEqual('test-file-3');

    nameSortLabel.simulate('click');

    expect(firstNameCell.text()).toEqual('test-file-1');
  });

  it('filters data when text fields are typed into', async () => {
    const wrapper = mount(
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

    const downloadNameFilterInput = wrapper.find(
      '[aria-label="Filter by Download Name"] input'
    );
    downloadNameFilterInput.instance().value = '1';
    downloadNameFilterInput.simulate('change');

    expect(wrapper.exists('[aria-rowcount=1]')).toBe(true);
    expect(
      wrapper.exists('[aria-label="Remove test-file-1 from downloads"]')
    ).toBe(true);

    const accessMethodFilterInput = wrapper.find(
      '[aria-label="Filter by Access Method"] input'
    );

    downloadNameFilterInput.instance().value = '';
    downloadNameFilterInput.simulate('change');
    accessMethodFilterInput.instance().value = 'https';
    accessMethodFilterInput.simulate('change');

    expect(wrapper.exists('[aria-rowcount=2]')).toBe(true);
    expect(
      wrapper.exists('[aria-label="Remove test-file-2 from downloads"]')
    ).toBe(false);
    expect(
      wrapper.exists('[aria-label="Remove test-file-4 from downloads"]')
    ).toBe(false);

    accessMethodFilterInput.instance().value = '';
    accessMethodFilterInput.simulate('change');

    // Test varying download availabilities.
    const availabilityFilterInput = wrapper.find(
      '[aria-label="Filter by Availability"] input'
    );

    availabilityFilterInput.instance().value = 'complete';
    availabilityFilterInput.simulate('change');

    expect(wrapper.exists('[aria-rowcount=1]')).toBe(true);
    expect(
      wrapper.exists('[aria-label="Remove test-file-1 from downloads"]')
    ).toBe(true);

    availabilityFilterInput.instance().value = '';
    availabilityFilterInput.simulate('change');

    expect(wrapper.exists('[aria-rowcount=4]')).toBe(true);
  });

  it('filters data when date filter is altered', async () => {
    const wrapper = mount(
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

    const dateFromFilterInput = wrapper.find(
      '[aria-label="Requested Date date filter from"]'
    );

    dateFromFilterInput.instance().value = '2020-01-01';
    dateFromFilterInput.simulate('change');

    expect(wrapper.exists('[aria-rowcount=4]')).toBe(true);

    const dateToFilterInput = wrapper.find(
      '[aria-label="Requested Date date filter to"]'
    );

    dateToFilterInput.instance().value = '2020-01-02';
    dateToFilterInput.simulate('change');

    expect(wrapper.exists('[aria-rowcount=0]')).toBe(true);

    dateFromFilterInput.instance().value = '2020-02-26';
    dateFromFilterInput.simulate('change');
    dateToFilterInput.instance().value = '2020-02-27';
    dateToFilterInput.simulate('change');

    expect(wrapper.exists('[aria-rowcount=2]')).toBe(true);
    expect(
      wrapper.exists('[aria-label="Remove test-file-1 from downloads"]')
    ).toBe(false);
    expect(
      wrapper.exists('[aria-label="Remove test-file-4 from downloads"]')
    ).toBe(false);

    // Test when both date inputs are empty.
    dateFromFilterInput.instance().value = '';
    dateFromFilterInput.simulate('change');

    dateToFilterInput.instance().value = '';
    dateToFilterInput.simulate('change');

    expect(wrapper.exists('[aria-rowcount=4]')).toBe(true);
  });
});
