import React from 'react';
import DatasetDetailsPanel from './datasetDetailsPanel.component';
import { QueryClient, QueryClientProvider } from 'react-query';
import { mount, ReactWrapper } from 'enzyme';
import { useDatasetDetails, useDatasetSize } from '../../api/datasets';
import { Dataset, DatasetType } from '../../app.types';

jest.mock('../../api/datasets');

describe('Dataset details panel component', () => {
  let rowData: Dataset;
  let rowDatasetType: DatasetType;
  const detailsPanelResize = jest.fn();

  const createWrapper = (): ReactWrapper => {
    return mount(
      <QueryClientProvider client={new QueryClient()}>
        <DatasetDetailsPanel
          rowData={rowData}
          detailsPanelResize={detailsPanelResize}
        />
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    rowDatasetType = {
      id: 2,
      name: 'Test 2',
    };
    rowData = {
      id: 1,
      name: 'Test 1',
      modTime: '2019-06-10',
      createTime: '2019-06-11',
      description: 'Test description',
      startDate: '2019-06-11',
      endDate: '2019-06-12',
      type: rowDatasetType,
    };

    (useDatasetDetails as jest.Mock).mockReturnValue({
      data: rowData,
    });
    (useDatasetSize as jest.Mock).mockReturnValue({
      data: 1,
      refetch: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const wrapper = createWrapper();
    expect(wrapper.find('DatasetDetailsPanel').props()).toMatchSnapshot();
  });

  it('renders type tab when present in the data', () => {
    rowData.type = {
      id: 7,
      name: 'Test type',
      description: 'Test type description',
    };

    const wrapper = createWrapper();
    expect(wrapper.find('DatasetDetailsPanel').props()).toMatchSnapshot();
  });

  it('calls useDatasetDetails and useDatasetSize hooks on load', () => {
    createWrapper();
    expect(useDatasetDetails).toHaveBeenCalledWith(rowData.id);
    expect(useDatasetSize).toHaveBeenCalledWith(rowData.id);
  });

  it('renders calculate size button when size has not been calculated', () => {
    (useDatasetSize as jest.Mock).mockReturnValueOnce({});
    const wrapper = createWrapper();
    expect(wrapper.find('#calculate-size-btn').exists()).toBeTruthy();
  });

  it('calculates size when button is clicked', () => {
    const fetchSize = jest.fn();
    (useDatasetSize as jest.Mock).mockReturnValueOnce({
      refetch: fetchSize,
    });

    const wrapper = createWrapper();
    wrapper.find('#calculate-size-btn').hostNodes().simulate('click');
    expect(fetchSize).toHaveBeenCalled();
  });

  it('calls detailsPanelResize on load and when tabs are switched between', () => {
    rowData.type = {
      id: 7,
      name: 'Test type',
      description: 'Test type description',
    };

    const wrapper = createWrapper();

    expect(detailsPanelResize).toHaveBeenCalledTimes(1);

    wrapper.find('#dataset-type-tab').hostNodes().simulate('click');

    expect(detailsPanelResize).toHaveBeenCalledTimes(2);
  });

  it('detailsPanelResize not called when not provided', () => {
    rowData.type = {
      id: 7,
      name: 'Test type',
      description: 'Test type description',
    };

    const wrapper = mount(
      <QueryClientProvider client={new QueryClient()}>
        <DatasetDetailsPanel rowData={rowData} />
      </QueryClientProvider>
    );

    expect(detailsPanelResize).not.toHaveBeenCalled();

    wrapper.find('#dataset-type-tab').hostNodes().simulate('click');

    expect(detailsPanelResize).not.toHaveBeenCalled();
  });

  it('Shows "No <field> provided" incase of a null field', () => {
    rowData = {
      id: 1,
      name: 'Test 1',
      modTime: '2019-06-10',
      createTime: '2019-06-11',
    };

    (useDatasetDetails as jest.Mock).mockReturnValueOnce({
      data: rowData,
    });

    const wrapper = createWrapper();
    expect(wrapper.html()).toContain(
      '<b>datasets.details.description not provided</b>'
    );
  });
});
