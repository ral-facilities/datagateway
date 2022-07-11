import React from 'react';
import DownloadStatusTable from './downloadStatusTable.component';
import { mount, ReactWrapper, shallow } from 'enzyme';
import {
  applyDatePickerWorkaround,
  cleanupDatePickerWorkaround,
  flushPromises,
} from '../setupTests';
import { act } from 'react-dom/test-utils';
import { downloadDeleted, fetchDownloads, getDataUrl } from '../downloadApi';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useDeleteDownload, useDownloads } from '../downloadApiHooks';

jest.mock('../downloadApi');
jest.mock('../downloadApiHooks');

const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const RefreshHOC: React.FC<{ refresh: boolean }> = (props: {
  refresh: boolean;
}): React.ReactElement => {
  const [refreshTable, setRefreshTable] = React.useState(false);
  const testQueryClient = createTestQueryClient();

  React.useEffect(() => {
    setRefreshTable(props.refresh);
  }, [props.refresh]);

  return (
    <QueryClientProvider client={testQueryClient}>
      <div id="datagateway-download">
        <DownloadStatusTable
          refreshTable={refreshTable}
          setRefreshTable={setRefreshTable}
          setLastChecked={jest.fn()}
        />
      </div>
    </QueryClientProvider>
  );
};

describe('Download Status Table', () => {
  let holder;
  const downloadItems: FormattedDownload[] = [
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
      status: 'downloadStatus.complete',
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
      status: 'downloadStatus.preparing',
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
      status: 'downloadStatus.restoring',
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
      status: 'downloadStatus.expired',
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
      status: 'downloadStatus.paused',
      transport: 'globus',
      userName: 'test user',
    },
  ];

  const createWrapper = (): ReactWrapper => {
    return mount(
      <DownloadStatusTable
        refreshTable={false}
        setRefreshTable={jest.fn()}
        setLastChecked={jest.fn()}
      />,
      { attachTo: holder }
    );
  };

  beforeEach(() => {
    //https://stackoverflow.com/questions/43694975/jest-enzyme-using-mount-document-getelementbyid-returns-null-on-componen
    holder = document.createElement('div');
    holder.setAttribute('id', 'datagateway-download');
    document.body.appendChild(holder);

    (useDownloads as jest.Mock).mockReturnValue({
      data: downloadItems,
      isLoading: false,
      isFetched: true,
      refetch: jest.fn(),
    });
    (useDeleteDownload as jest.Mock).mockReturnValue({
      isLoading: false,
      mutate: jest.fn(),
    });
    (downloadDeleted as jest.Mock).mockImplementation(() => Promise.resolve());
    (fetchDownloads as jest.Mock).mockImplementation(() =>
      Promise.resolve(downloadItems)
    );
    (getDataUrl as jest.Mock).mockImplementation(() => '/getData');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    (useDownloads as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetched: false,
      refetch: jest.fn(),
    });
    const wrapper = shallow(
      <DownloadStatusTable
        refreshTable={false}
        setRefreshTable={jest.fn()}
        setLastChecked={jest.fn()}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('translates the status strings correctly', async () => {
    const wrapper = createWrapper();

    expect(
      wrapper.find('[aria-rowindex=1]').find('[aria-colindex=3]').text()
    ).toEqual('downloadStatus.paused');
    expect(
      wrapper.find('[aria-rowindex=2]').find('[aria-colindex=3]').text()
    ).toEqual('downloadStatus.expired');
    expect(
      wrapper.find('[aria-rowindex=3]').find('[aria-colindex=3]').text()
    ).toEqual('downloadStatus.restoring');
    expect(
      wrapper.find('[aria-rowindex=4]').find('[aria-colindex=3]').text()
    ).toEqual('downloadStatus.preparing');
    expect(
      wrapper.find('[aria-rowindex=5]').find('[aria-colindex=3]').text()
    ).toEqual('downloadStatus.complete');
  });

  it('refreshes the tables when the refresh button has been clicked', async () => {
    const mockRefetch = jest.fn().mockImplementation(() => Promise.resolve());
    (useDownloads as jest.Mock).mockReturnValue({
      data: downloadItems,
      isLoading: false,
      isFetched: true,
      refetch: mockRefetch,
    });

    // Use our RefreshHOC and only modify the refresh prop
    // we pass on to the DownloadStatusTable.
    const wrapper = mount(<RefreshHOC refresh={false} />);

    // Set the refresh prop to false.
    expect(wrapper.prop('refresh')).toBe(false);

    await act(async () => {
      // Set the refresh prop to true.
      wrapper.setProps({ refresh: true });

      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.prop('refresh')).toBe(true);

    // Expect the downloads to have been fetched
    expect(mockRefetch).toHaveBeenCalledTimes(1);

    // should set refresh to false after refetching
    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    expect(wrapper.find(DownloadStatusTable).prop('refreshTable')).toBe(false);
  });

  it('should have a link for a download item', async () => {
    const wrapper = createWrapper();

    // Expect globus download items to have been disabled.
    expect(
      wrapper
        .find(
          'button[aria-label="downloadStatus.download {filename:test-file-2}"]'
        )
        .prop('disabled')
    ).toBe(true);

    // Expect HTTPS download items with non-COMPLETE status to have been disabled.
    expect(
      wrapper
        .find(
          'button[aria-label="downloadStatus.download {filename:test-file-3}"]'
        )
        .prop('disabled')
    ).toBe(true);

    // Expect complete HTTPS download items to be downloadable
    // Check to see if the href contains the correct call.
    expect(
      wrapper
        .find('a[aria-label="downloadStatus.download {filename:test-file-1}"]')
        .at(0)
        .props().href
    ).toContain('/getData');
  });

  it("removes an item when said item's remove button is clicked", async () => {
    const mockMutate = jest.fn();
    (useDeleteDownload as jest.Mock).mockReturnValue({
      isLoading: false,
      mutate: mockMutate,
    });

    const wrapper = createWrapper();

    wrapper
      .find('button[aria-label="downloadStatus.remove {filename:test-file-1}"]')
      .simulate('click');

    expect(mockMutate).toHaveBeenCalled();
    expect(mockMutate).toHaveBeenCalledWith(1);

    // pretend mutation is complete
    // remove the deleted item from downloadItems
    (useDownloads as jest.Mock).mockReturnValue({
      data: downloadItems.filter(({ id }) => id !== 1),
      isLoading: false,
      isFetched: true,
      refetch: jest.fn(),
    });
    await act(() => {
      // https://github.com/enzymejs/enzyme/issues/2169
      wrapper.update();
    });

    expect(
      wrapper.exists(
        '[aria-label="downloadStatus.remove {filename:test-file-1}"]'
      )
    ).toBe(false);
    expect(wrapper.exists('[aria-rowcount=4]')).toBe(true);
  });

  it('sorts data when headers are clicked', async () => {
    const wrapper = createWrapper();

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    // Table is sorted by createdAt desc by default
    // To keep working test, we will remove all sorts on the table beforehand
    const createdAtSortLabel = wrapper
      .find('[role="columnheader"] span[role="button"]')
      .at(3);
    createdAtSortLabel.simulate('click');

    const firstNameCell = wrapper.find('[aria-colindex=1]').find('p').first();

    // Get the access method sort header.
    const accessMethodSortLabel = wrapper
      .find('[role="columnheader"] span[role="button"]')
      .at(1);

    accessMethodSortLabel.simulate('click');

    expect(firstNameCell.text()).toEqual('test-file-5');

    accessMethodSortLabel.simulate('click');

    expect(firstNameCell.text()).toEqual('test-file-3');

    // Get the download name sort header.
    const nameSortLabel = wrapper
      .find('[role="columnheader"] span[role="button"]')
      .at(0);

    nameSortLabel.simulate('click');

    expect(firstNameCell.text()).toEqual('test-file-1');

    nameSortLabel.simulate('click');

    expect(firstNameCell.text()).toEqual('test-file-3');

    nameSortLabel.simulate('click');

    expect(firstNameCell.text()).toEqual('test-file-3');
  });

  it('filters data when text fields are typed into', async () => {
    const wrapper = createWrapper();

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    const downloadNameFilterInput = wrapper
      .find('[aria-label="Filter by downloadStatus.filename"]')
      .last();
    downloadNameFilterInput.instance().value = '1';
    downloadNameFilterInput.simulate('change');

    expect(wrapper.exists('[aria-rowcount=1]')).toBe(true);
    expect(
      wrapper.exists(
        '[aria-label="downloadStatus.remove {filename:test-file-1}"]'
      )
    ).toBe(true);

    const accessMethodFilterInput = wrapper
      .find('[aria-label="Filter by downloadStatus.transport"]')
      .last();

    downloadNameFilterInput.instance().value = '';
    downloadNameFilterInput.simulate('change');
    accessMethodFilterInput.instance().value = 'https';
    accessMethodFilterInput.simulate('change');

    expect(wrapper.exists('[aria-rowcount=2]')).toBe(true);
    expect(
      wrapper.exists(
        '[aria-label="downloadStatus.remove {filename:test-file-2}"]'
      )
    ).toBe(false);
    expect(
      wrapper.exists(
        '[aria-label="downloadStatus.remove {filename:test-file-4}"]'
      )
    ).toBe(false);

    accessMethodFilterInput.instance().value = '';
    accessMethodFilterInput.simulate('change');

    // Test varying download availabilities.
    const availabilityFilterInput = wrapper
      .find('[aria-label="Filter by downloadStatus.status"]')
      .last();

    availabilityFilterInput.instance().value = 'downloadStatus.complete';
    availabilityFilterInput.simulate('change');

    expect(wrapper.exists('[aria-rowcount=1]')).toBe(true);
    expect(
      wrapper.exists(
        '[aria-label="downloadStatus.remove {filename:test-file-1}"]'
      )
    ).toBe(true);

    availabilityFilterInput.instance().value = '';
    availabilityFilterInput.simulate('change');

    expect(wrapper.exists('[aria-rowcount=5]')).toBe(true);
  });

  it('filters data when date filter is altered', async () => {
    applyDatePickerWorkaround();

    const wrapper = createWrapper();

    await act(async () => {
      await flushPromises();
      wrapper.update();
    });

    const dateFromFilterInput = wrapper.find(
      'input[id="downloadStatus.createdAt filter from"]'
    );

    dateFromFilterInput.instance().value = '2020-01-01 00:00';
    dateFromFilterInput.simulate('change');

    expect(wrapper.exists('[aria-rowcount=5]')).toBe(true);

    const dateToFilterInput = wrapper.find(
      'input[id="downloadStatus.createdAt filter to"]'
    );

    dateToFilterInput.instance().value = '2020-01-02 23:59';
    dateToFilterInput.simulate('change');

    expect(wrapper.exists('[aria-rowcount=0]')).toBe(true);

    dateFromFilterInput.instance().value = '2020-02-26 00:00';
    dateFromFilterInput.simulate('change');
    dateToFilterInput.instance().value = '2020-02-27 23:59';
    dateToFilterInput.simulate('change');

    expect(wrapper.exists('[aria-rowcount=2]')).toBe(true);
    expect(
      wrapper.exists(
        '[aria-label="downloadStatus.remove {filename:test-file-1}"]'
      )
    ).toBe(false);
    expect(
      wrapper.exists(
        '[aria-label="downloadStatus.remove {filename:test-file-4}"]'
      )
    ).toBe(false);

    // Test when both date inputs are empty.
    dateFromFilterInput.instance().value = '';
    dateFromFilterInput.simulate('change');

    dateToFilterInput.instance().value = '';
    dateToFilterInput.simulate('change');

    expect(wrapper.exists('[aria-rowcount=5]')).toBe(true);

    cleanupDatePickerWorkaround();
  });
});
