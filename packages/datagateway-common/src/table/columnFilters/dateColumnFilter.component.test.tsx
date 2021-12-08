import React from 'react';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import DateColumnFilter, {
  datesEqual,
  updateFilter,
  useDateFilter,
} from './dateColumnFilter.component';
import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-test-renderer';
import { usePushFilters } from '../../api';
jest.mock('../../api');

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
      <DateColumnFilter
        value={{
          startDate: '1999-01-01T00:00:00.000Z',
          endDate: '2000-01-01T00:00:00.000Z',
        }}
        label="test"
        onChange={jest.fn()}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  describe('datesEqual function', () => {
    it('returns true if both dates are null', () => {
      const date1 = null;
      const date2 = null;
      expect(datesEqual(date1, date2)).toBe(true);
    });

    it('returns true if both dates are Invalid Date', () => {
      const date1 = new Date('');
      const date2 = new Date('');
      expect(datesEqual(date1, date2)).toBe(true);
    });

    it('returns true if one date is invalid and the other is null', () => {
      const date1 = null;
      const date2 = new Date('');
      expect(datesEqual(date1, date2)).toBe(true);
    });

    it('returns true if dates are the same date', () => {
      const date1 = new Date('2019-09-18');
      const date2 = new Date('2019-09-18');
      expect(datesEqual(date1, date2)).toBe(true);
    });

    it('returns false if dates are not the same date', () => {
      const date1 = new Date('2019-09-18');
      const date2 = new Date('2019-09-19');
      expect(datesEqual(date1, date2)).toBe(false);
    });

    it('returns false if one date is invalid and the other is valid', () => {
      const date1 = new Date('2019-09-18');
      const date2 = new Date('');
      expect(datesEqual(date1, date2)).toBe(false);
    });

    it('returns false if one date is null and the other is valid', () => {
      const date1 = null;
      const date2 = new Date('2019-09-18');
      expect(datesEqual(date1, date2)).toBe(false);
    });
  });

  describe('updateFilter function', () => {
    it("doesn't call onChange if date value hasn't updated", () => {
      const onChange = jest.fn();
      const otherDate = null;

      let prevDate = null;
      updateFilter({
        date: null,
        prevDate,
        otherDate,
        startDateOrEndDateChanged: 'startDate',
        onChange,
      });

      prevDate = new Date('');
      updateFilter({
        date: new Date(''),
        prevDate,
        otherDate,
        startDateOrEndDateChanged: 'endDate',
        onChange,
      });

      prevDate = new Date('2019-09-18');
      updateFilter({
        date: new Date('2019-09-18'),
        prevDate,
        otherDate,
        startDateOrEndDateChanged: 'startDate',
        onChange,
      });

      expect(onChange).not.toHaveBeenCalled();
    });

    it('calls onChange with null if both date and otherDate are null or invalid', () => {
      const onChange = jest.fn();
      let otherDate = null;
      const prevDate = new Date('2019-09-18');

      updateFilter({
        date: null,
        prevDate,
        otherDate,
        startDateOrEndDateChanged: 'startDate',
        onChange,
      });
      expect(onChange).toHaveBeenLastCalledWith(null);

      otherDate = new Date('');
      updateFilter({
        date: new Date(''),
        prevDate,
        otherDate,
        startDateOrEndDateChanged: 'endDate',
        onChange,
      });

      expect(onChange).toHaveBeenLastCalledWith(null);
    });

    it('calls onChange with updated filter if one of date or otherDate are valid', () => {
      const onChange = jest.fn();
      const prevDate = null;

      updateFilter({
        date: new Date('2019-09-18'),
        prevDate,
        otherDate: null,
        startDateOrEndDateChanged: 'startDate',
        onChange,
      });
      expect(onChange).toHaveBeenLastCalledWith({
        startDate: '2019-09-18',
      });

      updateFilter({
        date: new Date('2019-09-18'),
        prevDate,
        otherDate: null,
        startDateOrEndDateChanged: 'endDate',
        onChange,
      });
      expect(onChange).toHaveBeenLastCalledWith({
        endDate: '2019-09-18',
      });

      updateFilter({
        date: new Date(''),
        prevDate: new Date('2019-09-18'),
        otherDate: new Date('2019-09-18'),
        startDateOrEndDateChanged: 'startDate',
        onChange,
      });
      expect(onChange).toHaveBeenLastCalledWith({
        endDate: '2019-09-18',
      });

      updateFilter({
        date: new Date(''),
        prevDate: new Date('2019-09-18'),
        otherDate: new Date('2019-09-18'),
        startDateOrEndDateChanged: 'endDate',
        onChange,
      });
      expect(onChange).toHaveBeenLastCalledWith({
        startDate: '2019-09-18',
      });

      updateFilter({
        date: new Date('2019-09-19'),
        prevDate,
        otherDate: new Date('2019-09-18'),
        startDateOrEndDateChanged: 'endDate',
        onChange,
      });
      expect(onChange).toHaveBeenLastCalledWith({
        startDate: '2019-09-18',
        endDate: '2019-09-19',
      });
    });
  });

  it('calls the onChange method correctly when filling out the date inputs', () => {
    const onChange = jest.fn();

    const baseProps = {
      label: 'test',
      onChange,
    };

    const wrapper = mount(<DateColumnFilter {...baseProps} />);

    const startDateFilterInput = wrapper.find('input').first();
    startDateFilterInput.instance().value = '2019-08-06';
    startDateFilterInput.simulate('change');

    expect(onChange).toHaveBeenLastCalledWith({
      startDate: '2019-08-06',
    });

    wrapper.setProps({ ...baseProps, value: { startDate: '2019-08-06' } });
    const endDateFilterInput = wrapper.find('input').last();
    endDateFilterInput.instance().value = '2019-08-06';
    endDateFilterInput.simulate('change');

    expect(onChange).toHaveBeenLastCalledWith({
      startDate: '2019-08-06',
      endDate: '2019-08-06',
    });

    wrapper.setProps({
      ...baseProps,
      value: {
        startDate: '2019-08-06',
        endDate: '2019-08-06',
      },
    });
    startDateFilterInput.instance().value = '';
    startDateFilterInput.simulate('change');

    expect(onChange).toHaveBeenLastCalledWith({
      endDate: '2019-08-06',
    });

    wrapper.setProps({
      ...baseProps,
      value: {
        endDate: '2019-08-06',
      },
    });
    endDateFilterInput.instance().value = '';
    endDateFilterInput.simulate('change');

    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('handles invalid date values correctly by not calling onChange, unless there was previously a value there', () => {
    const onChange = jest.fn();

    const baseProps = {
      label: 'test',
      onChange,
    };

    const wrapper = mount(<DateColumnFilter {...baseProps} />);

    const startDateFilterInput = wrapper.find('input').first();
    startDateFilterInput.instance().value = '2';
    startDateFilterInput.simulate('change');

    expect(onChange).not.toHaveBeenCalled();

    const endDateFilterInput = wrapper.find('input').last();
    endDateFilterInput.instance().value = '201';
    endDateFilterInput.simulate('change');

    expect(onChange).not.toHaveBeenCalled();

    startDateFilterInput.instance().value = '2019-08-06';
    startDateFilterInput.simulate('change');

    expect(onChange).toHaveBeenLastCalledWith({
      startDate: '2019-08-06',
    });

    wrapper.setProps({ ...baseProps, value: { startDate: '2019-08-06' } });
    endDateFilterInput.instance().value = '2019-08-07';
    endDateFilterInput.simulate('change');

    expect(onChange).toHaveBeenLastCalledWith({
      startDate: '2019-08-06',
      endDate: '2019-08-07',
    });

    wrapper.setProps({
      ...baseProps,
      value: {
        startDate: '2019-08-06',
        endDate: '2019-08-07',
      },
    });
    startDateFilterInput.instance().value = '2';
    startDateFilterInput.simulate('change');

    expect(onChange).toHaveBeenLastCalledWith({
      endDate: '2019-08-07',
    });

    wrapper.setProps({
      ...baseProps,
      value: {
        endDate: '2019-08-07',
      },
    });
    endDateFilterInput.instance().value = '201';
    endDateFilterInput.simulate('change');

    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('displays error for invalid date', () => {
    const onChange = jest.fn();

    const baseProps = {
      label: 'test',
      onChange,
      value: {
        startDate: '2019-13-09',
        endDate: '2019-08-32',
      },
    };

    const wrapper = mount(<DateColumnFilter {...baseProps} />);

    expect(wrapper.find('p.Mui-error')).toHaveLength(2);
    expect(wrapper.find('p.Mui-error').first().text()).toEqual(
      'Please enter the date in the format yyyy-MM-dd.'
    );
  });

  it('displays error for invalid date range', () => {
    const onChange = jest.fn();

    const baseProps = {
      label: 'test',
      onChange,
      value: {
        startDate: '2019-08-09',
        endDate: '2019-08-08',
      },
    };

    const wrapper = mount(<DateColumnFilter {...baseProps} />);

    expect(wrapper.find('p.Mui-error')).toHaveLength(2);
    expect(wrapper.find('p.Mui-error').first().text()).toEqual(
      'Invalid date range'
    );
  });

  it('useTextFilter hook returns a function which can generate a working text filter', () => {
    const pushFilters = jest.fn();
    (usePushFilters as jest.Mock).mockImplementation(() => pushFilters);

    const { result } = renderHook(() => useDateFilter({}));
    let dateFilter;

    act(() => {
      dateFilter = result.current('Start Date', 'startDate');
    });

    const shallowWrapper = shallow(dateFilter);
    expect(shallowWrapper).toMatchSnapshot();

    const mountWrapper = mount(dateFilter);
    const startDateFilterInput = mountWrapper.find('input').first();
    startDateFilterInput.instance().value = '2021-08-09';
    startDateFilterInput.simulate('change');

    expect(pushFilters).toHaveBeenLastCalledWith('startDate', {
      startDate: '2021-08-09',
    });

    mountWrapper.setProps({
      ...mountWrapper.props(),
      value: { startDate: '2021-08-09' },
    });
    startDateFilterInput.instance().value = '';
    startDateFilterInput.simulate('change');

    expect(pushFilters).toHaveBeenCalledTimes(2);
    expect(pushFilters).toHaveBeenLastCalledWith('startDate', null);
  });
});
