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
      ID: 1,
      NAME: 'Test 1',
      LOCATION: '/test/location',
      MOD_TIME: '2019-06-10',
      CREATE_TIME: '2019-06-11',
      DATASET_ID: 1,
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
    rowData.DATAFILEPARAMETER = [
      {
        ID: 2,
        STRING_VALUE: 'String test',
        DATAFILE_ID: 1,
        PARAMETER_TYPE_ID: 3,
        PARAMETERTYPE: {
          ID: 3,
          NAME: 'String parameter',
          UNITS: 'foo/s',
          VALUETYPE: 'STRING',
        },
      },
      {
        ID: 4,
        NUMERIC_VALUE: 1337,
        DATAFILE_ID: 1,
        PARAMETER_TYPE_ID: 5,
        PARAMETERTYPE: {
          ID: 5,
          NAME: 'Numeric parameter',
          UNITS: 'bar/s',
          VALUETYPE: 'NUMERIC',
        },
      },
      {
        ID: 6,
        DATETIME_VALUE: '2019-09-10 11:48:00',
        DATAFILE_ID: 1,
        PARAMETER_TYPE_ID: 7,
        PARAMETERTYPE: {
          ID: 7,
          NAME: 'Datetime parameter',
          UNITS: 'baz/s',
          VALUETYPE: 'DATE_AND_TIME',
        },
      },
      {
        ID: 8,
        DATETIME_VALUE: '2019-09-10 11:48:00',
        DATAFILE_ID: 1,
        PARAMETER_TYPE_ID: 9,
        PARAMETERTYPE: {
          ID: 9,
          NAME: 'Invalid parameter',
          UNITS: 'n/a',
          VALUETYPE: '',
        },
      },
      {
        ID: 10,
        STRING_VALUE: 'Missing PARAMETERTYPE',
        DATAFILE_ID: 1,
        PARAMETER_TYPE_ID: 11,
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
    rowData.DATAFILEPARAMETER = [
      {
        ID: 2,
        STRING_VALUE: 'String test',
        DATAFILE_ID: 1,
        PARAMETER_TYPE_ID: 3,
        PARAMETERTYPE: {
          ID: 3,
          NAME: 'String parameter',
          UNITS: 'foo/s',
          VALUETYPE: 'STRING',
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
});
