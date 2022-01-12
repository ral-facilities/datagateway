import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import DatasetDetailsPanel from './datasetDetailsPanel.component';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactWrapper } from 'enzyme';
import { Dataset, DatasetType } from '../../app.types';
import { useDatasetDetails } from '../../api/datasets';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    useDatasetDetails: jest.fn(),
  };
});

describe('Dataset details panel component', () => {
  let mount;
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
    mount = createMount();
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
      type: rowDatasetType,
    };

    (useDatasetDetails as jest.Mock).mockReturnValue({
      data: rowData,
    });
  });

  afterEach(() => {
    mount.cleanUp();
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

  it('calls useDatasetDetails hook on load', () => {
    createWrapper();
    expect(useDatasetDetails).toHaveBeenCalledWith(rowData.id);
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

  it('calls datafile view if view datafiles tab clicked', () => {
    const viewDatafiles = jest.fn();
    const wrapper = mount(
      <QueryClientProvider client={new QueryClient()}>
        <DatasetDetailsPanel
          rowData={rowData}
          detailsPanelResize={detailsPanelResize}
          viewDatafiles={viewDatafiles}
        />
      </QueryClientProvider>
    );

    expect(viewDatafiles).not.toHaveBeenCalled();
    wrapper.find('#dataset-datafiles-tab').hostNodes().simulate('click');
    expect(viewDatafiles).toHaveBeenCalled();
  });
});
