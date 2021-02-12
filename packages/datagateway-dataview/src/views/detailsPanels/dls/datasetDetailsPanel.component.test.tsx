import React from 'react';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import DatasetDetailsPanel from './datasetDetailsPanel.component';
import { Dataset } from 'datagateway-common';

describe('Dataset details panel component', () => {
  let shallow;
  let mount;
  let rowData: Dataset;
  const detailsPanelResize = jest.fn();
  const fetchDetails = jest.fn();
  const fetchSize = jest.fn();

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });
    mount = createMount();
    rowData = {
      id: 1,
      name: 'Test 1',
      modTime: '2019-06-10',
      createTime: '2019-06-11',
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
      <DatasetDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
        fetchDetails={fetchDetails}
        fetchSize={fetchSize}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders type tab when present in the data', () => {
    rowData.DATASETTYPE = {
      id: 7,
      name: 'Test type',
      description: 'Test type description',
    };

    const wrapper = shallow(
      <DatasetDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
        fetchDetails={fetchDetails}
        fetchSize={fetchSize}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders calculate size button when size has not been calculated', () => {
    const { size, ...rowDataWithoutSize } = rowData;

    const wrapper = shallow(
      <DatasetDetailsPanel
        rowData={rowDataWithoutSize}
        detailsPanelResize={detailsPanelResize}
        fetchDetails={fetchDetails}
        fetchSize={fetchSize}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calculates size when button is clicked', () => {
    const { size, ...rowDataWithoutSize } = rowData;

    const wrapper = mount(
      <DatasetDetailsPanel
        rowData={rowDataWithoutSize}
        detailsPanelResize={detailsPanelResize}
        fetchDetails={fetchDetails}
        fetchSize={fetchSize}
      />
    );

    wrapper.find('#dataset-details-panel button').simulate('click');

    expect(fetchSize).toHaveBeenCalled();
    expect(fetchSize).toHaveBeenCalledWith(1);
  });

  it('calls detailsPanelResize on load and when tabs are switched between', () => {
    rowData.DATASETTYPE = {
      id: 7,
      name: 'Test type',
      description: 'Test type description',
    };

    const wrapper = mount(
      <DatasetDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
        fetchDetails={fetchDetails}
        fetchSize={fetchSize}
      />
    );

    expect(detailsPanelResize).toHaveBeenCalledTimes(1);

    wrapper.find('#dataset-type-tab').hostNodes().simulate('click');

    expect(detailsPanelResize).toHaveBeenCalledTimes(2);
  });

  it('detailsPanelResize not called when not provided', () => {
    rowData.DATASETTYPE = {
      id: 7,
      name: 'Test type',
      description: 'Test type description',
    };

    const wrapper = mount(
      <DatasetDetailsPanel
        rowData={rowData}
        fetchDetails={fetchDetails}
        fetchSize={fetchSize}
      />
    );

    expect(detailsPanelResize).toHaveBeenCalledTimes(0);

    wrapper.find('#dataset-type-tab').hostNodes().simulate('click');

    expect(detailsPanelResize).toHaveBeenCalledTimes(0);
  });

  it('calls fetchDetails on load', () => {
    mount(
      <DatasetDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
        fetchDetails={fetchDetails}
        fetchSize={fetchSize}
      />
    );

    expect(fetchDetails).toHaveBeenCalled();
    expect(fetchDetails).toHaveBeenCalledWith(1);
  });
});
