import React from 'react';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import DataHeader from './dataHeader.component';
import TextColumnFilter from '../columnFilters/textColumnFilter.component';
import { TableSortLabel } from '@material-ui/core';

describe('Data column header component', () => {
  let shallow;
  let mount;
  const onSort = jest.fn();
  const resizeColumn = jest.fn();
  const dataHeaderProps = {
    label: 'Test',
    dataKey: 'test',
    className: 'test-class',
    sort: {},
    onSort,
    resizeColumn,
  };

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });
    mount = createMount();
  });

  it('renders correctly without sort or filter', () => {
    const wrapper = shallow(
      <DataHeader {...dataHeaderProps} disableSort={true} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with sort but no filter', () => {
    const wrapper = shallow(<DataHeader {...dataHeaderProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with filter but no sort', () => {
    const wrapper = shallow(
      <DataHeader
        {...dataHeaderProps}
        disableSort={true}
        filterComponent={<TextColumnFilter label="test" onChange={() => {}} />}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with sort and filter', () => {
    const wrapper = shallow(
      <DataHeader
        {...dataHeaderProps}
        filterComponent={<TextColumnFilter label="test" onChange={() => {}} />}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  describe('calls the onSort method when label is clicked', () => {
    it('sets asc order', () => {
      const wrapper = shallow(<DataHeader {...dataHeaderProps} />);

      const label = wrapper.find(TableSortLabel);

      label.simulate('click');
      expect(onSort).toHaveBeenCalledWith('test', 'asc');
    });

    it('sets desc order', () => {
      const wrapper = shallow(
        <DataHeader {...dataHeaderProps} sort={{ test: 'asc' }} />
      );

      const label = wrapper.find(TableSortLabel);

      label.simulate('click');
      expect(onSort).toHaveBeenCalledWith('test', 'desc');
    });

    it('sets null order', () => {
      const wrapper = shallow(
        <DataHeader {...dataHeaderProps} sort={{ test: 'desc' }} />
      );

      const label = wrapper.find(TableSortLabel);

      label.simulate('click');
      expect(onSort).toHaveBeenCalledWith('test', null);
    });
  });

  it('calls the resizeColumn method when column resizer is dragged', () => {
    const wrapper = shallow(<DataHeader {...dataHeaderProps} />);

    wrapper.find('Draggable').prop('onDrag')(null, { deltaX: 50 });

    expect(resizeColumn).toHaveBeenCalledWith(50);
  });
});
