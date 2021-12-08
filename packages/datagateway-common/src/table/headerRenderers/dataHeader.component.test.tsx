import React from 'react';
import { createMount, createShallow } from '@material-ui/core/test-utils';
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
    labelString: 'Test',
    dataKey: 'test',
    className: 'test-class',
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

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });
    mount = createMount();
  });

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

  it('sends a columnResize event when column resizer is finished dragging', () => {
    const mockDispatchEvent = jest
      .spyOn(window, 'dispatchEvent')
      .mockImplementationOnce(() => true);

    const wrapper = shallow(<DataHeader {...dataHeaderProps} />);

    wrapper.find('Draggable').prop('onStop')();

    expect(mockDispatchEvent).toHaveBeenCalledWith(expect.any(Event));
    expect(mockDispatchEvent.mock.calls[0][0].type).toBe('columnResize');
  });
});
