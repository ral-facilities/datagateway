import React from 'react';
import { mount, shallow } from 'enzyme';
import DataHeader from './dataHeader.component';
import TextColumnFilter from '../columnFilters/textColumnFilter.component';
import { TableSortLabel } from '@mui/material';

describe('Data column header component', () => {
  const onSort = jest.fn();
  const resizeColumn = jest.fn();
  const dataHeaderProps = {
    label: 'Test',
    labelString: 'Test',
    dataKey: 'test',
    sort: {},
    onSort,
    resizeColumn,
    icon: function Icon() {
      return <div>Test</div>;
    },
  };

  const filterComponent = (
    label: string,
    dataKey: string
  ): React.ReactElement => (
    <TextColumnFilter label={label} onChange={jest.fn()} value={undefined} />
  );

  afterEach(() => {
    onSort.mockClear();
    resizeColumn.mockClear();
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
        filterComponent={filterComponent}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly with sort and filter', () => {
    const wrapper = shallow(
      <DataHeader {...dataHeaderProps} filterComponent={filterComponent} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  describe('calls the onSort method when label is clicked', () => {
    it('sets asc order', () => {
      const wrapper = shallow(<DataHeader {...dataHeaderProps} />);

      const label = wrapper.find(TableSortLabel);

      label.simulate('click');
      expect(onSort).toHaveBeenCalledWith('test', 'asc', 'push');
    });

    it('sets desc order', () => {
      const wrapper = shallow(
        <DataHeader {...dataHeaderProps} sort={{ test: 'asc' }} />
      );

      const label = wrapper.find(TableSortLabel);

      label.simulate('click');
      expect(onSort).toHaveBeenCalledWith('test', 'desc', 'push');
    });

    it('sets null order', () => {
      const wrapper = shallow(
        <DataHeader {...dataHeaderProps} sort={{ test: 'desc' }} />
      );

      const label = wrapper.find(TableSortLabel);

      label.simulate('click');
      expect(onSort).toHaveBeenCalledWith('test', null, 'push');
    });
  });

  describe('calls the onSort method when default sort is specified', () => {
    it('sets asc order', () => {
      const wrapper = mount(
        <DataHeader {...dataHeaderProps} defaultSort="asc" />
      );
      wrapper.update();

      expect(onSort).toHaveBeenCalledWith('test', 'asc', 'replace');
    });

    it('sets desc order', () => {
      const wrapper = mount(
        <DataHeader {...dataHeaderProps} defaultSort="desc" />
      );
      wrapper.update();

      expect(onSort).toHaveBeenCalledWith('test', 'desc', 'replace');
    });
  });

  it('calls the resizeColumn method when column resizer is dragged', () => {
    const wrapper = shallow(<DataHeader {...dataHeaderProps} />);

    wrapper.find('Draggable').prop('onDrag')(null, { deltaX: 50 });

    expect(resizeColumn).toHaveBeenCalledWith('test', 50);
  });
});
