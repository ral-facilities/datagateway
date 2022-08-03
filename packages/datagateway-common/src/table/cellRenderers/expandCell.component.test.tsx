import React from 'react';
import { shallow } from 'enzyme';
import ExpandCell from './expandCell.component';

describe('Expand cell component', () => {
  const setExpandedIndex = jest.fn();
  const expandCellProps = {
    columnIndex: 1,
    dataKey: 'test',
    isScrolling: false,
    rowIndex: 1,
    rowData: '',
    expandedIndex: 1,
    setExpandedIndex,
  };

  afterEach(() => {
    setExpandedIndex.mockClear();
  });

  it('renders correctly when expanded', () => {
    const wrapper = shallow(<ExpandCell {...expandCellProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('sets the expanded index to -1 when ExpandLess button is pressed', () => {
    const wrapper = shallow(<ExpandCell {...expandCellProps} />);

    wrapper.childAt(0).prop('onClick')();
    expect(setExpandedIndex).toHaveBeenCalledWith(-1);
  });

  it('renders correctly when not expanded', () => {
    const wrapper = shallow(
      <ExpandCell {...expandCellProps} expandedIndex={2} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('sets the expanded index to rowIndex when ExpandMore button is pressed', () => {
    const wrapper = shallow(
      <ExpandCell {...expandCellProps} expandedIndex={2} />
    );

    wrapper.childAt(0).prop('onClick')();
    expect(setExpandedIndex).toHaveBeenCalledWith(expandCellProps.rowIndex);
  });
});
