import React from 'react';
import { Datafile } from '../app.types';
import DatafileDetailsPanel from './datafileDetailsPanel.component';
import { render } from '@testing-library/react';

describe('Datafile details panel component', () => {
  let rowData: Datafile;
  const detailsPanelResize = vi.fn();

  beforeEach(() => {
    rowData = {
      id: 1,
      name: 'Test 1',
      location: '/test1',
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
      <DatafileDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
