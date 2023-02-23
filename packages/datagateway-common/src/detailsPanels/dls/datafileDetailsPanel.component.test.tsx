import React from 'react';
import DatafileDetailsPanel from './datafileDetailsPanel.component';
import { QueryClient, QueryClientProvider } from 'react-query';
import { mount, ReactWrapper } from 'enzyme';
import { Datafile } from '../../app.types';
import { useDatafileDetails } from '../../api/datafiles';

jest.mock('../../api/datafiles');

describe('Datafile details panel component', () => {
  let rowData: Datafile;
  const detailsPanelResize = jest.fn();

  const createWrapper = (): ReactWrapper => {
    return mount(
      <QueryClientProvider client={new QueryClient()}>
        <DatafileDetailsPanel
          rowData={rowData}
          detailsPanelResize={detailsPanelResize}
        />
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    rowData = {
      id: 1,
      name: 'Test 1',
      location: '/test/location',
      modTime: '2019-06-10',
      createTime: '2019-06-11',
    };

    (useDatafileDetails as jest.Mock).mockReturnValue({
      data: rowData,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('DatafileDetailsPanel').props()).toMatchSnapshot();
  });

  it('calls useDatafileDetails hook on load', () => {
    createWrapper();
    expect(useDatafileDetails).toHaveBeenCalledWith(rowData.id);
  });

  it('calls detailsPanelResize on load', () => {
    createWrapper();
    expect(detailsPanelResize).toHaveBeenCalled();
  });

  it('does not call detailsPanelResize if not provided', () => {
    mount(
      <QueryClientProvider client={new QueryClient()}>
        <DatafileDetailsPanel rowData={rowData} />
      </QueryClientProvider>
    );

    expect(detailsPanelResize).not.toHaveBeenCalled();
  });
});
