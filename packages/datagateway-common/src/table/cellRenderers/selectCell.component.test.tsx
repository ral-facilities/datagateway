import React from 'react';
import { shallow } from 'enzyme';
import SelectCell from './selectCell.component';

describe('Select cell component', () => {
  const setLastChecked = jest.fn();
  const onCheck = jest.fn();
  const onUncheck = jest.fn();
  const data = [
    {
      id: 1,
      name: 'test 1',
    },
    {
      id: 2,
      name: 'test 2',
    },
    {
      id: 3,
      name: 'test 3',
    },
  ];
  const selectCellProps = {
    columnIndex: 1,
    dataKey: 'test',
    isScrolling: false,
    rowIndex: 2,
    rowData: data[2],
    selectedRows: [],
    data,
    lastChecked: -1,
    loading: false,
    setLastChecked,
    onCheck,
    onUncheck,
    loading: false,
  };

  afterEach(() => {
    setLastChecked.mockClear();
    onCheck.mockClear();
    onUncheck.mockClear();
  });

  it('renders correctly when unchecked', () => {
    const wrapper = shallow(<SelectCell {...selectCellProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly when checked', () => {
    const wrapper = shallow(
      <SelectCell {...selectCellProps} selectedRows={[3]} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly when selectedRows is undefined', () => {
    const wrapper = shallow(
      <SelectCell {...selectCellProps} selectedRows={undefined} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly when selectedRows loading is true', () => {
    const wrapper = shallow(
      <SelectCell
        {...selectCellProps}
        loading={true}
        selectedRows={undefined}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls setLastChecked when checkbox is clicked', () => {
    const wrapper = shallow(<SelectCell {...selectCellProps} />);

    wrapper.find('.tour-dataview-add-to-cart').prop('onClick')(
      new MouseEvent('click')
    );
    expect(setLastChecked).toHaveBeenCalledWith(2);
  });

  it('calls onCheck when the row is unselected and the checkbox is clicked', () => {
    const wrapper = shallow(<SelectCell {...selectCellProps} />);

    wrapper.find('.tour-dataview-add-to-cart').prop('onClick')(
      new MouseEvent('click')
    );
    expect(onCheck).toHaveBeenCalledWith([3]);
  });

  it('calls onUncheck when the row is selected and the checkbox is clicked', () => {
    const wrapper = shallow(
      <SelectCell {...selectCellProps} selectedRows={[3]} />
    );

    wrapper.find('.tour-dataview-add-to-cart').prop('onClick')(
      new MouseEvent('click')
    );
    expect(onUncheck).toHaveBeenCalledWith([3]);
  });

  it('calls onCheck when the row is selected via shift-click and the checkbox is clicked', () => {
    const wrapper = shallow(
      <SelectCell {...selectCellProps} lastChecked={0} />
    );

    wrapper.find('.tour-dataview-add-to-cart').prop('onClick')(
      new MouseEvent('click', { shiftKey: true })
    );
    expect(onCheck).toHaveBeenCalledWith([1, 2, 3]);
  });

  it('calls onUncheck when the row is unselected via shift-click and the checkbox is clicked', () => {
    const wrapper = shallow(
      <SelectCell
        {...selectCellProps}
        lastChecked={0}
        selectedRows={[1, 2, 3]}
      />
    );

    wrapper.find('.tour-dataview-add-to-cart').prop('onClick')(
      new MouseEvent('click', { shiftKey: true })
    );
    expect(onUncheck).toHaveBeenCalledWith([1, 2, 3]);
  });
});
