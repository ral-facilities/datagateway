import React from 'react';
import { shallow } from 'enzyme';
import { Datafile } from '../app.types';
import DatafileDetailsPanel from './datafileDetailsPanel.component';

describe('Datafile details panel component', () => {
  let rowData: Datafile;
  const detailsPanelResize = jest.fn();

  beforeEach(() => {
    rowData = [
      {
        id: 1,
        name: 'Test 1',
        location: '/test1',
        fileSize: 1,
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
      <DatafileDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
