import React from 'react';
import { createShallow } from '@material-ui/core/test-utils';
import SelectHeader from './selectHeader.component';

describe('Select column header component', () => {
  let shallow;
  const setLastChecked = jest.fn();
  const onCheck = jest.fn();
  const onUncheck = jest.fn();
  const selectHeaderProps = {
    dataKey: 'test',
    className: 'test-class',
    selectedRows: [],
    totalRowCount: 3,
    onCheck,
    onUncheck,
    allIds: [1, 2, 3],
    loading: false,
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
    const wrapper = shallow(<SelectHeader {...selectHeaderProps} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly when indeterminate', () => {
    const wrapper = shallow(
      <SelectHeader {...selectHeaderProps} selectedRows={[1]} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly when checked', () => {
    const wrapper = shallow(
      <SelectHeader {...selectHeaderProps} selectedRows={[1, 2, 3]} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly when selectedRows is undefined', () => {
    const wrapper = shallow(
      <SelectHeader {...selectHeaderProps} selectedRows={undefined} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly when loading is true', () => {
    const wrapper = shallow(
      <SelectHeader
        {...selectHeaderProps}
        loading={true}
        selectedRows={undefined}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onCheck when not all rows are selected and the checkbox is clicked', () => {
    const wrapper = shallow(
      <SelectHeader {...selectHeaderProps} selectedRows={[1]} />
    );

    console.log(wrapper.debug());
    wrapper.childAt(0).childAt(0).childAt(0).prop('onClick')();
    expect(onCheck).toHaveBeenCalledWith([1, 2, 3]);
  });

  it('calls onUncheck when all rows are selected and the checkbox is clicked', () => {
    const wrapper = shallow(
      <SelectHeader {...selectHeaderProps} selectedRows={[1, 2, 3]} />
    );

    wrapper.childAt(0).childAt(0).childAt(0).prop('onClick')();
    expect(onUncheck).toHaveBeenCalledWith([1, 2, 3]);
  });
});
