import React from 'react';
import { createShallow } from '@material-ui/core/test-utils';
import SelectHeader from './selectHeader.component';

describe('Select column header component', () => {
  let shallow;
  const setLastChecked = jest.fn();
  const onCheck = jest.fn();
  const onUncheck = jest.fn();
  const data = [
    {
      ID: 1,
      NAME: 'test 1',
    },
    {
      ID: 2,
      NAME: 'test 2',
    },
    {
      ID: 3,
      NAME: 'test 3',
    },
  ];
  const selectHeaderProps = {
    dataKey: 'test',
    className: 'test-class',
    selectedRows: [],
    data,
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

  it('calls onCheck when not all rows are selected and the checkbox is clicked', () => {
    const wrapper = shallow(
      <SelectHeader {...selectHeaderProps} selectedRows={[1]} />
    );

    wrapper.childAt(0).prop('onClick')();
    expect(onCheck).toHaveBeenCalledWith([1, 2, 3]);
  });

  it('calls onUncheck when all rows are selected and the checkbox is clicked', () => {
    const wrapper = shallow(
      <SelectHeader {...selectHeaderProps} selectedRows={[1, 2, 3]} />
    );

    wrapper.childAt(0).prop('onClick')();
    expect(onUncheck).toHaveBeenCalledWith([1, 2, 3]);
  });
});
