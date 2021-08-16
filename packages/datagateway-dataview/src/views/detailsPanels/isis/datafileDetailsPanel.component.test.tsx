import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import DatafilesDetailsPanel from './datafileDetailsPanel.component';
import { Datafile, useDatafileDetails } from 'datagateway-common';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactWrapper } from 'enzyme';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useDatafileDetails: jest.fn(),
  };
});

describe('Datafile details panel component', () => {
  let mount;
  let rowData: Datafile;
  const detailsPanelResize = jest.fn();

  const createWrapper = (): ReactWrapper => {
    return mount(
      <QueryClientProvider client={new QueryClient()}>
        <DatafilesDetailsPanel
          rowData={rowData}
          detailsPanelResize={detailsPanelResize}
        />
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    mount = createMount();
    rowData = {
      id: 1,
      name: 'Test 1',
      location: '/test/location',
      modTime: '2019-06-10',
      createTime: '2019-06-11',
      description: 'Test description',
    };

    (useDatafileDetails as jest.Mock).mockReturnValue({
      data: rowData,
    });
  });

  afterEach(() => {
    mount.cleanUp();
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('DatafileDetailsPanel').props()).toMatchSnapshot();
  });

  it('renders parameters tab when present in the data', () => {
    rowData.parameters = [
      {
        id: 2,
        stringValue: 'String test',
        type: {
          id: 3,
          name: 'String parameter',
          units: 'foo/s',
          valueType: 'STRING',
        },
      },
      {
        id: 4,
        numericValue: 1337,
        type: {
          id: 5,
          name: 'Numeric parameter',
          units: 'bar/s',
          valueType: 'NUMERIC',
        },
      },
      {
        id: 6,
        dateTimeValue: '2019-09-10 11:48:00',
        type: {
          id: 7,
          name: 'Datetime parameter',
          units: 'baz/s',
          valueType: 'DATE_AND_TIME',
        },
      },
      {
        id: 8,
        dateTimeValue: '2019-09-10 11:48:00',
        type: {
          id: 9,
          name: 'Invalid parameter',
          units: 'n/a',
          valueType: '',
        },
      },
      {
        id: 10,
        stringValue: 'Missing PARAMETERTYPE',
      },
    ];

    const wrapper = createWrapper();
    expect(wrapper.find('DatafileDetailsPanel').props()).toMatchSnapshot();
  });

  it('calls useDatafileDetails hook on load', () => {
    createWrapper();
    expect(useDatafileDetails).toHaveBeenCalledWith(rowData.id, [
      {
        filterType: 'include',
        filterValue: JSON.stringify({
          parameters: 'type',
        }),
      },
    ]);
  });

  it('calls detailsPanelResize on load and when tabs are switched between', () => {
    rowData.parameters = [
      {
        id: 2,
        stringValue: 'String test',
        type: {
          id: 3,
          name: 'String parameter',
          units: 'foo/s',
          valueType: 'STRING',
        },
      },
    ];

    const wrapper = createWrapper();

    expect(detailsPanelResize).toHaveBeenCalledTimes(1);

    wrapper.find('#datafile-parameters-tab').hostNodes().simulate('click');

    expect(detailsPanelResize).toHaveBeenCalledTimes(2);
  });

  it('does not call detailsPanelResize if not provided', () => {
    const wrapper = mount(
      <QueryClientProvider client={new QueryClient()}>
        <DatafilesDetailsPanel rowData={rowData} />
      </QueryClientProvider>
    );

    expect(detailsPanelResize).not.toHaveBeenCalled();

    wrapper.find('#datafile-parameters-tab').hostNodes().simulate('click');

    expect(detailsPanelResize).not.toHaveBeenCalled();
  });

  it('Shows "No <field> provided" incase of a null field', () => {
    rowData = {
      id: 1,
      name: 'Test 1',
      modTime: '2019-06-10',
      createTime: '2019-06-11',
    };

    (useDatafileDetails as jest.Mock).mockReturnValueOnce({
      data: rowData,
    });

    const wrapper = createWrapper();
    expect(wrapper.html()).toContain(
      '<b>datafiles.details.description not provided</b>'
    );
  });
});
