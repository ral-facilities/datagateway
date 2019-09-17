import React from 'react';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import DateColumnFilter from './dateColumnFilter.component';

describe('Date filter component', () => {
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

  it('handles invalid date values correctly', () => {
    const onChange = jest.fn();

    const wrapper = mount(
      <DateColumnFilter label="test" onChange={onChange} />
    );

    const startDateFilterInput = wrapper.find('input').first();
    startDateFilterInput.instance().value = '2';
    startDateFilterInput.simulate('change');

    expect(onChange).toHaveBeenLastCalledWith(null);

    const endDateFilterInput = wrapper.find('input').last();
    endDateFilterInput.instance().value = '201';
    endDateFilterInput.simulate('change');

    expect(onChange).toHaveBeenLastCalledWith(null);

    startDateFilterInput.instance().value = '201';
    startDateFilterInput.simulate('change');

    expect(onChange).toHaveBeenLastCalledWith(null);

    startDateFilterInput.instance().value = '2019-08-06';
    startDateFilterInput.simulate('change');

    expect(onChange).toHaveBeenLastCalledWith({
      startDate: '2019-08-06',
    });

    endDateFilterInput.instance().value = '2019-08-06';
    endDateFilterInput.simulate('change');

    expect(onChange).toHaveBeenLastCalledWith({
      startDate: '2019-08-06',
      endDate: '2019-08-06',
    });

    startDateFilterInput.instance().value = '2';
    startDateFilterInput.simulate('change');
    endDateFilterInput.instance().value = '2019-08-07';
    endDateFilterInput.simulate('change');

    expect(onChange).toHaveBeenLastCalledWith({
      endDate: '2019-08-07',
    });
  });

  it('displays error for invalid date range', () => {
    const onChange = jest.fn();

    const wrapper = mount(
      <DateColumnFilter label="test" onChange={onChange} />
    );

    const startDateFilterInput = wrapper.find('input').first();
    startDateFilterInput.instance().value = '2019-08-09';
    startDateFilterInput.simulate('change');

    const endDateFilterInput = wrapper.find('input').last();
    endDateFilterInput.instance().value = '2019-08-08';
    endDateFilterInput.simulate('change');

    expect(wrapper.find('p.Mui-error')).toHaveLength(2);
    expect(
      wrapper
        .find('p.Mui-error')
        .first()
        .text()
    ).toEqual('Invalid date range');
  });

  it('displays tooltips when user hovers over text inputs', () => {
    const wrapper = mount(
      <DateColumnFilter label="test" onChange={() => {}} />
    );

    interface Global extends NodeJS.Global {
      document: Document;
      window: Window;
    }

    (global as Global).document.createRange = () => ({
      setStart: () => {},
      setEnd: () => {},
      // @ts-ignore
      commonAncestorContainer: {
        nodeName: 'BODY',
        ownerDocument: document,
      },
    });

    wrapper
      .find('input')
      .first()
      .simulate('mouseOver');

    expect(wrapper.find('[role="tooltip"]').exists()).toBe(true);
    expect(wrapper.find('[role="tooltip"] div').text()).toEqual(
      'Filter from a date in yyyy-MM-dd format'
    );

    wrapper
      .find('input')
      .last()
      .simulate('mouseOver');

    expect(wrapper.find('[role="tooltip"]')).toHaveLength(2);
    expect(
      wrapper
        .find('[role="tooltip"] div')
        .at(1)
        .text()
    ).toEqual('Filter to a date in yyyy-MM-dd format');
  });
});
