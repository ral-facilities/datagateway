import React from 'react';
import { createShallow } from '@material-ui/core/test-utils';
import { Dataset } from '../app.types';
import DatasetDetailsPanel from './datasetDetailsPanel.component';

describe('Dataset details panel component', () => {
  let shallow;
  let rowData: Dataset;
  const detailsPanelResize = jest.fn();

  beforeEach(() => {
    shallow = createShallow();
    rowData = [
      {
        id: 1,
        name: 'Test 1',
        size: 1,
        modTime: '2019-07-23',
        createTime: '2019-07-23',
      },
    ];
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const wrapper = shallow(
      <DatasetDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
