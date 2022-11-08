import React from 'react';
import { shallow, mount } from 'enzyme';
import DateColumnFilter, {
  CustomClearButton,
  datesEqual,
  updateFilter,
  useDateFilter,
} from './dateColumnFilter.component';
import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-test-renderer';
import { usePushFilter } from '../../api';
import {
  applyDatePickerWorkaround,
  cleanupDatePickerWorkaround,
} from '../../setupTests';
import { PickersActionBarProps } from '@mui/x-date-pickers/PickersActionBar';

jest.mock('../../api');

describe('Date filter component', () => {
  beforeEach(() => {
    applyDatePickerWorkaround();
  });

  afterEach(() => {
    cleanupDatePickerWorkaround();
    jest.clearAllMocks();
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

  describe('CustomClearButton', () => {
    const onClear = jest.fn();
    let props: PickersActionBarProps;

    beforeEach(() => {
      props = {
        onClear: onClear,
      };
    });

    it('renders correctly', () => {
      const wrapper = shallow(<CustomClearButton {...props} />);
      expect(wrapper).toMatchSnapshot();
    });

    it('calls onClear when button clicked', () => {
      const wrapper = shallow(<CustomClearButton {...props} />);
      const button = wrapper.find('[role="button"]');
      button.simulate('click');
      expect(onClear).toHaveBeenCalled();
    });
  });

  describe('DatePicker functionality', () => {
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
        'Date format: yyyy-MM-dd.'
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
      const pushFilter = jest.fn();
      (usePushFilter as jest.Mock).mockImplementation(() => pushFilter);

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

      expect(pushFilter).toHaveBeenLastCalledWith('startDate', {
        startDate: '2021-08-09',
      });

      mountWrapper.setProps({
        ...mountWrapper.props(),
        value: { startDate: '2021-08-09' },
      });
      startDateFilterInput.instance().value = '';
      startDateFilterInput.simulate('change');

      expect(pushFilter).toHaveBeenCalledTimes(2);
      expect(pushFilter).toHaveBeenLastCalledWith('startDate', null);
    });
  });

  describe('DateTimePicker functionality', () => {
    it('calls the onChange method correctly when filling out the date-time inputs', () => {
      const onChange = jest.fn();

      const baseProps = {
        label: 'test',
        onChange,
      };

      const wrapper = mount(<DateColumnFilter filterByTime {...baseProps} />);

      const startDateFilterInput = wrapper.find('input').first();
      startDateFilterInput.instance().value = '2019-08-06 00:00:00';
      startDateFilterInput.simulate('change');

      expect(onChange).toHaveBeenLastCalledWith({
        startDate: '2019-08-06 00:00:00',
      });

      wrapper.setProps({
        ...baseProps,
        value: { startDate: '2019-08-06 00:00:00' },
      });
      const endDateFilterInput = wrapper.find('input').last();
      endDateFilterInput.instance().value = '2019-08-06 23:59:00';
      endDateFilterInput.simulate('change');

      expect(onChange).toHaveBeenLastCalledWith({
        startDate: '2019-08-06 00:00:00',
        endDate: '2019-08-06 23:59:00',
      });

      wrapper.setProps({
        ...baseProps,
        value: {
          startDate: '2019-08-06 00:00:00',
          endDate: '2019-08-06 23:59:00',
        },
      });
      startDateFilterInput.instance().value = '';
      startDateFilterInput.simulate('change');

      expect(onChange).toHaveBeenLastCalledWith({
        endDate: '2019-08-06 23:59:00',
      });

      wrapper.setProps({
        ...baseProps,
        value: {
          endDate: '2019-08-06 23:59:00',
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

      const wrapper = mount(<DateColumnFilter filterByTime {...baseProps} />);

      const startDateFilterInput = wrapper.find('input').first();
      startDateFilterInput.instance().value = '2';
      startDateFilterInput.simulate('change');

      expect(onChange).not.toHaveBeenCalled();

      const endDateFilterInput = wrapper.find('input').last();
      endDateFilterInput.instance().value = '201';
      endDateFilterInput.simulate('change');

      expect(onChange).not.toHaveBeenCalled();

      startDateFilterInput.instance().value = '2019-08-06 00:00:00';
      startDateFilterInput.simulate('change');

      expect(onChange).toHaveBeenLastCalledWith({
        startDate: '2019-08-06 00:00:00',
      });

      wrapper.setProps({
        ...baseProps,
        value: { startDate: '2019-08-06 00:00:00' },
      });
      endDateFilterInput.instance().value = '2019-08-07 00:00:00';
      endDateFilterInput.simulate('change');

      expect(onChange).toHaveBeenLastCalledWith({
        startDate: '2019-08-06 00:00:00',
        endDate: '2019-08-07 00:00:00',
      });

      wrapper.setProps({
        ...baseProps,
        value: {
          startDate: '2019-08-06 00:00:00',
          endDate: '2019-08-07 00:00:00',
        },
      });
      startDateFilterInput.instance().value = '2';
      startDateFilterInput.simulate('change');

      expect(onChange).toHaveBeenLastCalledWith({
        endDate: '2019-08-07 00:00:00',
      });

      wrapper.setProps({
        ...baseProps,
        value: {
          endDate: '2019-08-07 00:00:00',
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
          startDate: '2019-13-09 00:00:00',
          endDate: '2019-08-32 00:00:00',
        },
      };

      const wrapper = mount(<DateColumnFilter filterByTime {...baseProps} />);

      expect(wrapper.find('p.Mui-error')).toHaveLength(2);
      expect(wrapper.find('p.Mui-error').first().text()).toEqual(
        'Date-time format: yyyy-MM-dd HH:mm:ss.'
      );
    });

    it('displays error for invalid time', () => {
      const onChange = jest.fn();

      const baseProps = {
        label: 'test',
        onChange,
        value: {
          startDate: '2019-13-09 00:60:00',
          endDate: '2019-08-32 24:00:00',
        },
      };

      const wrapper = mount(<DateColumnFilter filterByTime {...baseProps} />);

      expect(wrapper.find('p.Mui-error')).toHaveLength(2);
      expect(wrapper.find('p.Mui-error').first().text()).toEqual(
        'Date-time format: yyyy-MM-dd HH:mm:ss.'
      );
    });

    it('displays error for invalid date-time range', () => {
      const onChange = jest.fn();

      const baseProps = {
        label: 'test',
        onChange,
        value: {
          startDate: '2019-08-08 12:00:00',
          endDate: '2019-08-08 11:00:00',
        },
      };

      const wrapper = mount(<DateColumnFilter filterByTime {...baseProps} />);

      expect(wrapper.find('p.Mui-error')).toHaveLength(2);
      expect(wrapper.find('p.Mui-error').first().text()).toEqual(
        'Invalid date-time range'
      );
    });

    // I don't believe this works with date+time due to time values not appearing in URL params
    // TODO remove this?
    it.skip('useTextFilter hook returns a function which can generate a working text filter', () => {
      const pushFilter = jest.fn();
      (usePushFilter as jest.Mock).mockImplementation(() => pushFilter);

      const { result } = renderHook(() => useDateFilter({}));
      let dateFilter;

      act(() => {
        dateFilter = result.current('Start Date', 'startDate');
      });

      const shallowWrapper = shallow(dateFilter);
      expect(shallowWrapper).toMatchSnapshot();

      const mountWrapper = mount(dateFilter);
      const startDateFilterInput = mountWrapper.find('input').first();
      startDateFilterInput.instance().value = '2021-08-09 00:00:00';
      startDateFilterInput.simulate('change');

      expect(pushFilter).toHaveBeenLastCalledWith('startDate', {
        startDate: '2021-08-09 00:00:00',
      });

      mountWrapper.setProps({
        ...mountWrapper.props(),
        value: { startDate: '2021-08-09 00:00:00' },
      });
      startDateFilterInput.instance().value = '';
      startDateFilterInput.simulate('change');

      expect(pushFilter).toHaveBeenCalledTimes(2);
      expect(pushFilter).toHaveBeenLastCalledWith('startDate', null);
    });
  });
});
