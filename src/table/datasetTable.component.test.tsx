import React from 'react';
import { shallow as enzymeShallow } from 'enzyme';
import createShallow from '@material-ui/core/test-utils/createShallow';
import DatasetTable from './datasetTable.component';

describe('DatasetTable component', () => {
  let shallow: typeof enzymeShallow;

  beforeEach(() => {
    shallow = createShallow({});
  });

  it('should render correctly', () => {
    const wrapper = shallow(<DatasetTable />);

    expect(wrapper).toMatchSnapshot();
  });

  it('should render details panel correctly', () => {
    const row = {
      name: 'Test',
      size: 1,
      createTime: new Date('2019-06-10 00:00:00'),
      modTime: new Date('2019-06-10 00:00:00'),
    };
    const wrapper = shallow(<DatasetTable />);

    const detailPanel = wrapper.prop('detailPanel')(row);
    const detailPanelWrapper = shallow(detailPanel);

    expect(detailPanelWrapper).toMatchSnapshot();
  });
});
