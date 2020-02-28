import React from 'react';
import DownloadStatusTable from './downloadStatusTable.component';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import { flushPromises } from '../setupTests';
import { act } from 'react-dom/test-utils';
import { fetchDownloads, downloadDeleted } from '../downloadApi';
import { Download } from 'datagateway-common';

jest.mock('../downloadApi');
jest.useFakeTimers();

// const RefreshHOC: React.FC<{ refresh: boolean }> = (props: {
//   refresh: boolean;
// }): React.ReactElement => {
//   const [refreshTable, setRefreshTable] = React.useState(false);

//   return (
//     <DownloadStatusTable
//       refreshTable={props.refresh}
//       setRefreshTable={setRefreshTable}
//       setLastChecked={jest.fn()}
//     />
//   );
// };

describe('Download Status Table', () => {
  let shallow;
  let mount;

  const downloadItems: Download[] = [
    {
      createdAt: '2020-02-26T15:05:29Z',
      downloadItems: [{ entityId: 1, entityType: 'investigation', id: 6130 }],
      email: 'test1@email.com',
      facilityName: 'LILS',
      fileName: 'test-file-1',
      fullName: 'Person 1',
      id: 1,
      isDeleted: false,
      isEmailSent: true,
      isTwoLevel: false,
      preparedId: 'e44acee7-2211-4aae-bffb-f6c0e417f43d',
      sessionId: '6bf8e6e4-58a9-11ea-b823-005056893dd9',
      size: 0,
      status: 'COMPLETE',
      transport: 'https',
      userName: 'simple/root',
    },
    {
      createdAt: '2020-02-26T15:05:35Z',
      downloadItems: [{ entityId: 1, entityType: 'investigation', id: 6131 }],
      email: 'test2@email.com',
      facilityName: 'LILS',
      fileName: 'test-file-2',
      fullName: 'Person 2',
      id: 2,
      isDeleted: false,
      isEmailSent: true,
      isTwoLevel: false,
      preparedId: '10d5e2b9-4c1c-4be5-8bda-8520694dd85a',
      sessionId: '6f1e3fd6-58a9-11ea-9a26-005056893dd9',
      size: 0,
      status: 'PREPARING',
      transport: 'globus',
      userName: 'simple/root',
    },
    {
      createdAt: '2020-02-26T15:57:20Z',
      downloadItems: [{ entityId: 1, entityType: 'investigation', id: 6132 }],
      email: 'test3@email.com',
      facilityName: 'LILS',
      fileName: 'test-file-3',
      fullName: 'Person 3',
      id: 3,
      isDeleted: false,
      isEmailSent: true,
      isTwoLevel: false,
      preparedId: '5e3249a5-aec6-4dd0-b602-c4a8d27f75e2',
      sessionId: 'aa6c65de-58b0-11ea-82d6-005056893dd9',
      size: 0,
      status: 'RESTORING',
      transport: 'https',
      userName: 'simple/root',
    },
    {
      createdAt: '2020-02-26T15:57:28Z',
      downloadItems: [{ entityId: 1, entityType: 'investigation', id: 6134 }],
      email: 'test4@email.com',
      facilityName: 'LILS',
      fileName: 'test-file-4',
      fullName: 'Person 4',
      id: 4,
      isDeleted: false,
      isEmailSent: true,
      isTwoLevel: false,
      preparedId: '6a226aaf-12be-48d8-86d0-9fea9e5fa8e2',
      sessionId: 'aeda386c-58b0-11ea-9a26-005056893dd9',
      size: 0,
      status: 'EXPIRED',
      transport: 'globus',
      userName: 'simple/root',
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

  // // TODO: Should this be in the downloadTab test?
  // // TODO: Also include a refresh button test in download tab.
  // it.only('refreshes the tables when the refresh button has been clicked', async () => {
  //   // const refreshTableFunction = jest.fn();

  //   // We only need to modify the refresh prop we pass to the DownloadStatusTable.

  //   // Allow for the wrapper to be created and the data to be loaded.
  //   // const wrapper = mount(
  //   //   <DownloadStatusTable
  //   //     refreshTable={false}
  //   //     setRefreshTable={refreshTableFunction}
  //   //     setLastChecked={jest.fn()}
  //   //   />
  //   // );

  //   const wrapper = mount(<RefreshHOC refreshTable={false} />);

  //   await act(async () => {
  //     await flushPromises();
  //     wrapper.update();
  //   });

  //   // Set the refresh prop to false.
  //   expect(wrapper.prop('refreshTable')).toBe(false);

  //   await act(async () => {
  //     wrapper.setProps({ refreshTable: true });
  //     await flushPromises();
  //     wrapper.update();
  //   });

  //   expect(fetchDownloads).toHaveBeenCalledTimes(2);

  //   // act(() => {
  //   //   console.log('set props');
  //   //   wrapper.setProps({ refreshTable: true });
  //   // });

  //   // await act(async () => {
  //   //   console.log('set props');

  //   //   // TODO: Settings props with a callback works.
  //   //   // wrapper.setProps({ refreshTable: true }, () =>
  //   //   //   wrapper.setProps({ refreshTable: false })
  //   //   // );
  //   //   wrapper.setProps({ refreshTable: true });
  //   //   await flushPromises();
  //   //   wrapper.update();
  //   // });

  //   // expect(refreshTableFunction).toHaveBeenCalledWith(false);

  //   // expect(wrapper.prop('refreshTable')).toBe(true);

  //   // expect(fetchDownloads).toHaveBeenCalledTimes(2);
  //   // expect(refreshTableFunction).toHaveBeenCalled();
  // });

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

    // console.log(
    //   wrapper
    //     .find('IconButton')
    //     .at(0)
    //     .props().href
    // );

    // TODO: Test to see if the href matches with what we expect it to be.

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

    // TODO: Needs more tests?
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

    // TODO: Catch 'return false' lines in sortAndFilteredData method.
    // TODO: Adjust dates for mock data.
    dateFromFilterInput.instance().value = '2020-01-01';
    dateFromFilterInput.simulate('change');

    expect(wrapper.exists('[aria-rowcount=4]')).toBe(true);

    const dateToFilterInput = wrapper.find(
      '[aria-label="Requested Date date filter to"]'
    );

    dateToFilterInput.instance().value = '2020-01-02';
    dateToFilterInput.simulate('change');

    expect(wrapper.exists('[aria-rowcount=0]')).toBe(true);

    dateToFilterInput.instance().value = new Date().toISOString().slice(0, 10);
    dateToFilterInput.simulate('change');

    expect(wrapper.exists('[aria-rowcount=4]')).toBe(true);
  });
});
