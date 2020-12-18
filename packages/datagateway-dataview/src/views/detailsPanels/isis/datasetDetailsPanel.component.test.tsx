import React from 'react';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import DatasetsDetailsPanel from './datasetDetailsPanel.component';
import { Dataset } from 'datagateway-common';

describe('Dataset details panel component', () => {
  let shallow;
  let mount;
  let rowData: Dataset;
  const detailsPanelResize = jest.fn();
  const fetchDetails = jest.fn();

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });
    mount = createMount();
    rowData = {
      ID: 1,
      NAME: 'Test 1',
      MOD_TIME: '2019-06-10',
      CREATE_TIME: '2019-06-11',
      INVESTIGATION_ID: 1,
    };
  });

  afterEach(() => {
    mount.cleanUp();
    detailsPanelResize.mockClear();
    fetchDetails.mockClear();
  });

  it('renders correctly', () => {
    const wrapper = shallow(
      <DatasetsDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
        fetchDetails={fetchDetails}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders type tab when present in the data', () => {
    rowData.DATASETTYPE = {
      ID: 7,
      NAME: 'Test type',
      DESCRIPTION: 'Test type description',
    };

    const wrapper = shallow(
      <DatasetsDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
        fetchDetails={fetchDetails}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls detailsPanelResize on load and when tabs are switched between', () => {
    rowData.DATASETTYPE = {
      ID: 7,
      NAME: 'Test type',
      DESCRIPTION: 'Test type description',
    };

    const wrapper = mount(
      <DatasetsDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
        fetchDetails={fetchDetails}
      />
    );

    expect(detailsPanelResize).toHaveBeenCalledTimes(1);

    wrapper.find('#dataset-type-tab').hostNodes().simulate('click');

    expect(detailsPanelResize).toHaveBeenCalledTimes(2);
  });

  it('detailsPanelResize not called when not provided', () => {
    rowData.DATASETTYPE = {
      ID: 7,
      NAME: 'Test type',
      DESCRIPTION: 'Test type description',
    };

    const wrapper = mount(
      <DatasetsDetailsPanel rowData={rowData} fetchDetails={fetchDetails} />
    );

    expect(detailsPanelResize).toHaveBeenCalledTimes(0);

    wrapper.find('#dataset-type-tab').hostNodes().simulate('click');

    expect(detailsPanelResize).toHaveBeenCalledTimes(0);
  });

  it('calls fetchDetails on load', () => {
    mount(
      <DatasetsDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
        fetchDetails={fetchDetails}
      />
    );

    expect(fetchDetails).toHaveBeenCalled();
    expect(fetchDetails).toHaveBeenCalledWith(1);
  });
});
