import React from 'react';
import { shallow as enzymeShallow, mount as enzymeMount } from 'enzyme';
import createShallow from '@material-ui/core/test-utils/createShallow';
import createMount from '@material-ui/core/test-utils/createMount';
import DatafileTable from './datafileTable.component';

describe('DatafileTable component', () => {
  let shallow: typeof enzymeShallow;
  let mount: typeof enzymeMount;
  const row = {
    name: 'Test',
    location: '/test',
    size: 1,
    modTime: new Date('2019-06-10 00:00:00'),
  };

  beforeEach(() => {
    shallow = createShallow({});
    mount = createMount();
  });

  afterEach(() => {
    mount.cleanUp();
  });

  it('should render correctly', () => {
    const wrapper = shallow(<DatafileTable />);

    expect(wrapper).toMatchSnapshot();
  });

  it('should render details panel correctly', () => {
    const wrapper = shallow(<DatafileTable />);

    const detailPanel = wrapper.prop('detailPanel')(row);
    const detailPanelWrapper = shallow(detailPanel);

    expect(detailPanelWrapper).toMatchSnapshot();
  });

  it('should trigger file download when file download action pressed', () => {
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    const wrapper = shallow(<DatafileTable />);

    const actions = wrapper.prop('actions');
    const downloadAction = actions[0];

    downloadAction.onClick({}, row);
    expect(window.alert).toHaveBeenCalledWith(`Downloading ${row.location}`);
  });

  it('should trigger add to cart when add to cart action pressed', () => {
    // TODO: when enzyme supports hooks with shallow test that cart state changes
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    const wrapper = shallow(<DatafileTable />);

    const actions = wrapper.prop('actions');
    const addToCartAction = actions[1](row);

    addToCartAction.onClick({}, row);
    expect(window.alert).toHaveBeenCalledWith(
      `Added ${row.location} to download cart`
    );
  });

  it('should trigger remove from cart when remove from cart action pressed', () => {
    // TODO: when enzyme supports hooks with shallow test that cart state changes
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    const wrapper = shallow(<DatafileTable />);

    const actions = wrapper.prop('actions');
    const addToCartAction = actions[2](row);

    addToCartAction.onClick({}, row);
    expect(window.alert).toHaveBeenCalledWith(
      `Removed ${row.location} from download cart`
    );
  });
});
