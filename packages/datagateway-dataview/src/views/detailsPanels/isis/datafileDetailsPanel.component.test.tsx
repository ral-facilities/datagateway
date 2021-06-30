import React from 'react';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import DatafilesDetailsPanel from './datafileDetailsPanel.component';
import { Datafile } from 'datagateway-common';

describe('Datafile details panel component', () => {
  let shallow;
  let mount;
  let rowData: Datafile;
  const detailsPanelResize = jest.fn();
  const fetchDetails = jest.fn();

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });
    mount = createMount();
    rowData = {
      id: 1,
      name: 'Test 1',
      location: '/test/location',
      modTime: '2019-06-10',
      createTime: '2019-06-11',
      description: 'Test description',
    };
  });

  afterEach(() => {
    mount.cleanUp();
    detailsPanelResize.mockClear();
    fetchDetails.mockClear();
  });

  it('renders correctly', () => {
    const wrapper = shallow(
      <DatafilesDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
        fetchDetails={fetchDetails}
      />
    );
    expect(wrapper).toMatchSnapshot();
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

    const wrapper = shallow(
      <DatafilesDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
        fetchDetails={fetchDetails}
      />
    );
    expect(wrapper).toMatchSnapshot();
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

    const wrapper = mount(
      <DatafilesDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
        fetchDetails={fetchDetails}
      />
    );

    expect(detailsPanelResize).toHaveBeenCalledTimes(1);

    wrapper.find('#datafile-parameters-tab').hostNodes().simulate('click');

    expect(detailsPanelResize).toHaveBeenCalledTimes(2);
  });

  it('calls fetchDetails on load', () => {
    mount(
      <DatafilesDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
        fetchDetails={fetchDetails}
      />
    );

    expect(fetchDetails).toHaveBeenCalled();
    expect(fetchDetails).toHaveBeenCalledWith(1);
  });

  it('Shows "No description provided" instead of a null field', () => {
    rowData = {
      id: 1,
      name: 'Test 1',
      location: '/test/location',
      modTime: '2019-06-10',
      createTime: '2019-06-11',
    };

    const wrapper = shallow(
      <DatafilesDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
        fetchDetails={fetchDetails}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
