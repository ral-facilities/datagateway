import React from 'react';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import DateColumnFilter from './dateColumnFilter.component';

describe('Text filter component', () => {
  let shallow;
  let mount;

  beforeEach(() => {
    shallow = createShallow();
    mount = createMount();
  });

  afterEach(() => {
    mount.cleanUp();
  });

  it('renders correctly', () => {
    const wrapper = shallow(
      <DateColumnFilter label="test" onChange={() => {}} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls the onChange method correctly when filling out startDate then endDate, then clearing startDate then endDate', () => {
    const onChange = jest.fn();

    const wrapper = mount(
      <DateColumnFilter label="test" onChange={onChange} />
    );

    const startDateFilterInput = wrapper.find('input').first();
    startDateFilterInput.instance().value = '2019-08-06';
    startDateFilterInput.simulate('change');

    expect(onChange).toHaveBeenLastCalledWith({
      startDate: '2019-08-06',
    });

    const endDateFilterInput = wrapper.find('input').last();
    endDateFilterInput.instance().value = '2019-08-06';
    endDateFilterInput.simulate('change');

    expect(onChange).toHaveBeenLastCalledWith({
      startDate: '2019-08-06',
      endDate: '2019-08-06',
    });

    startDateFilterInput.instance().value = '';
    startDateFilterInput.simulate('change');

    expect(onChange).toHaveBeenLastCalledWith({
      endDate: '2019-08-06',
    });

    endDateFilterInput.instance().value = '';
    endDateFilterInput.simulate('change');

    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('calls the onChange method correctly when filling out endDate then startDate, then clearing endDate then startDate', () => {
    const onChange = jest.fn();

    const wrapper = mount(
      <DateColumnFilter label="test" onChange={onChange} />
    );

    const endDateFilterInput = wrapper.find('input').last();
    endDateFilterInput.instance().value = '2019-08-06';
    endDateFilterInput.simulate('change');

    expect(onChange).toHaveBeenLastCalledWith({
      endDate: '2019-08-06',
    });

    const startDateFilterInput = wrapper.find('input').first();
    startDateFilterInput.instance().value = '2019-08-06';
    startDateFilterInput.simulate('change');

    expect(onChange).toHaveBeenLastCalledWith({
      startDate: '2019-08-06',
      endDate: '2019-08-06',
    });

    endDateFilterInput.instance().value = '';
    endDateFilterInput.simulate('change');

    expect(onChange).toHaveBeenLastCalledWith({
      startDate: '2019-08-06',
    });

    startDateFilterInput.instance().value = '';
    startDateFilterInput.simulate('change');

    expect(onChange).toHaveBeenLastCalledWith(null);
  });
});
