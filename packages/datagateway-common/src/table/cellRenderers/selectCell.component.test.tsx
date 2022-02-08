import React from 'react';
import { createShallow } from '@mui/material/test-utils';
import SelectCell from './selectCell.component';

describe('Select cell component', () => {
  let shallow;
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
    className: 'test-class',
    selectedRows: [],
    data,
    lastChecked: -1,
    setLastChecked,
    onCheck,
    onUncheck,
  };

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });
  });

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

  it('calls setLastChecked when checkbox is clicked', () => {
    const wrapper = shallow(<SelectCell {...selectCellProps} />);

    wrapper.childAt(0).prop('onClick')(new MouseEvent('click'));
    expect(setLastChecked).toHaveBeenCalledWith(2);
  });

  it('calls onCheck when the row is unselected and the checkbox is clicked', () => {
    const wrapper = shallow(<SelectCell {...selectCellProps} />);

    wrapper.childAt(0).prop('onClick')(new MouseEvent('click'));
    expect(onCheck).toHaveBeenCalledWith([3]);
  });

  it('calls onUncheck when the row is selected and the checkbox is clicked', () => {
    const wrapper = shallow(
      <SelectCell {...selectCellProps} selectedRows={[3]} />
    );

    wrapper.childAt(0).prop('onClick')(new MouseEvent('click'));
    expect(onUncheck).toHaveBeenCalledWith([3]);
  });

  it('calls onCheck when the row is selected via shift-click and the checkbox is clicked', () => {
    const wrapper = shallow(
      <SelectCell {...selectCellProps} lastChecked={0} />
    );

    wrapper.childAt(0).prop('onClick')(
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

    wrapper.childAt(0).prop('onClick')(
      new MouseEvent('click', { shiftKey: true })
    );
    expect(onUncheck).toHaveBeenCalledWith([1, 2, 3]);
  });
});
