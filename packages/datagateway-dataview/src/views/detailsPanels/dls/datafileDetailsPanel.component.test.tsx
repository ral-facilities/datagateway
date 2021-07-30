import React from 'react';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import DatafilesDetailsPanel from './datafileDetailsPanel.component';
import { Datafile } from 'datagateway-common';

describe('Datafile details panel component', () => {
  let shallow;
  let mount;
  let rowData: Datafile;
  const detailsPanelResize = jest.fn();

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });
    mount = createMount();
    rowData = {
      id: 1,
      name: 'Test 1',
      location: '/test/location',
      modTime: '2019-06-10',
      createTime: '2019-06-11',
    };
  });

  afterEach(() => {
    mount.cleanUp();
    detailsPanelResize.mockClear();
  });

  it('renders correctly', () => {
    const wrapper = shallow(
      <DatafilesDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls detailsPanelResize on load', () => {
    mount(
      <DatafilesDetailsPanel
        rowData={rowData}
        detailsPanelResize={detailsPanelResize}
      />
    );

    expect(detailsPanelResize).toHaveBeenCalledTimes();
  });
});
