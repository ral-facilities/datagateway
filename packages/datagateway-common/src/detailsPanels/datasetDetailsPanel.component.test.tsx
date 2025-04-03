import * as React from 'react';
import { Dataset } from '../app.types';
import DatasetDetailsPanel from './datasetDetailsPanel.component';
import { render } from '@testing-library/react';

describe('Dataset details panel component', () => {
  let rowData: Dataset;
  const detailsPanelResize = vi.fn();

  beforeEach(() => {
    rowData = {
      id: 1,
      name: 'Test 1',
      fileSize: 1,
      modTime: '2019-07-23',
      createTime: '2019-07-23',
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    const { asFragment } = render(
      <DatasetDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
