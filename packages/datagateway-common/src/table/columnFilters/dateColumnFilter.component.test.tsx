import * as React from 'react';
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
import { render, screen } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event/setup/setup';
import userEvent from '@testing-library/user-event';

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
    const { asFragment } = render(
      <DateColumnFilter
        value={{
          startDate: '1999-01-01T00:00:00.000Z',
          endDate: '2000-01-01T00:00:00.000Z',
        }}
        label="test"
        onChange={jest.fn()}
      />
    );
    expect(asFragment()).toMatchSnapshot();
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
    let user: UserEvent;

    beforeEach(() => {
      user = userEvent.setup();
      props = {
        onClear: onClear,
      };
    });

    it('renders correctly', () => {
      const { asFragment } = render(<CustomClearButton {...props} />);
      expect(asFragment()).toMatchSnapshot();
    });

    it('calls onClear when button clicked', async () => {
      render(<CustomClearButton {...props} />);
      await user.click(await screen.findByRole('button'));
      expect(onClear).toHaveBeenCalled();
    });
  });

  describe('DatePicker functionality', () => {
    let user: UserEvent;

    beforeEach(() => {
      user = userEvent.setup();
    });

    it('calls the onChange method correctly when filling out the date inputs', async () => {
      const onChange = jest.fn();

      const baseProps = {
        label: 'test',
        onChange,
      };

      const { rerender } = render(<DateColumnFilter {...baseProps} />);

      const startDateFilterInput = await screen.findByRole('textbox', {
        name: 'test filter from',
      });
      await user.type(startDateFilterInput, '2019-08-06');

      expect(onChange).toHaveBeenLastCalledWith({
        startDate: '2019-08-06',
      });

      rerender(
        <DateColumnFilter
          {...{
            ...baseProps,
            value: { startDate: '2019-08-06' },
          }}
        />
      );

      const endDateFilterInput = await screen.findByRole('textbox', {
        name: 'test filter to',
      });
      await user.type(endDateFilterInput, '2019-08-06');

      expect(onChange).toHaveBeenLastCalledWith({
        startDate: '2019-08-06',
        endDate: '2019-08-06',
      });

      rerender(
        <DateColumnFilter
          {...baseProps}
          value={{
            startDate: '2019-08-06',
            endDate: '2019-08-06',
          }}
        />
      );

      await user.clear(startDateFilterInput);

      expect(onChange).toHaveBeenLastCalledWith({
        endDate: '2019-08-06',
      });

      rerender(
        <DateColumnFilter
          {...baseProps}
          value={{
            endDate: '2019-08-06',
          }}
        />
      );

      await user.clear(endDateFilterInput);

      expect(onChange).toHaveBeenLastCalledWith(null);
    });

    it('handles invalid date values correctly by not calling onChange, unless there was previously a value there', async () => {
      const onChange = jest.fn();

      const baseProps = {
        label: 'test',
        onChange,
      };

      const { rerender } = render(<DateColumnFilter {...baseProps} />);

      const startDateFilterInput = await screen.findByRole('textbox', {
        name: 'test filter from',
      });
      await user.type(startDateFilterInput, '2');

      expect(onChange).not.toHaveBeenCalled();

      const endDateFilterInput = await screen.findByRole('textbox', {
        name: 'test filter to',
      });
      await user.type(endDateFilterInput, '201');

      expect(onChange).not.toHaveBeenCalled();

      await user.clear(startDateFilterInput);
      await user.type(startDateFilterInput, '2019-08-06');

      expect(onChange).toHaveBeenLastCalledWith({
        startDate: '2019-08-06',
      });

      rerender(
        <DateColumnFilter {...baseProps} value={{ startDate: '2019-08-06' }} />
      );

      await user.clear(endDateFilterInput);
      await user.type(endDateFilterInput, '2019-08-07');

      expect(onChange).toHaveBeenLastCalledWith({
        startDate: '2019-08-06',
        endDate: '2019-08-07',
      });

      rerender(
        <DateColumnFilter
          {...baseProps}
          value={{
            startDate: '2019-08-06',
            endDate: '2019-08-07',
          }}
        />
      );

      await user.clear(startDateFilterInput);
      await user.type(startDateFilterInput, '2');

      expect(onChange).toHaveBeenLastCalledWith({
        endDate: '2019-08-07',
      });

      rerender(
        <DateColumnFilter
          {...baseProps}
          value={{
            endDate: '2019-08-07',
          }}
        />
      );

      await user.clear(endDateFilterInput);
      await user.type(endDateFilterInput, '201');

      expect(onChange).toHaveBeenLastCalledWith(null);
    });

    it('displays error for invalid date', async () => {
      const onChange = jest.fn();

      const baseProps = {
        label: 'test',
        onChange,
        value: {
          startDate: '2019-13-09',
          endDate: '2019-08-32',
        },
      };

      render(<DateColumnFilter {...baseProps} />);

      const errorMessages = await screen.findAllByText(
        'Date format: yyyy-MM-dd.'
      );
      for (const element of errorMessages) {
        expect(element).toBeInTheDocument();
      }
    });

    it('displays error for invalid date range', async () => {
      const onChange = jest.fn();

      const baseProps = {
        label: 'test',
        onChange,
        value: {
          startDate: '2019-08-09',
          endDate: '2019-08-08',
        },
      };

      render(<DateColumnFilter {...baseProps} />);

      const errorMessages = await screen.findAllByText('Invalid date range');
      for (const element of errorMessages) {
        expect(element).toBeInTheDocument();
      }
    });

    it('useTextFilter hook returns a function which can generate a working text filter', async () => {
      const pushFilter = jest.fn();
      (usePushFilter as jest.Mock).mockImplementation(() => pushFilter);

      const { result } = renderHook(() => useDateFilter({}));
      let dateFilter;

      act(() => {
        dateFilter = result.current('Start Date', 'startDate');
      });

      const { asFragment } = render(dateFilter);
      expect(asFragment()).toMatchSnapshot();

      const startDateFilterInput = await screen.findByRole('textbox', {
        name: 'Start Date filter from',
      });

      await user.type(startDateFilterInput, '2021-08-09');

      expect(pushFilter).toHaveBeenLastCalledWith('startDate', {
        startDate: '2021-08-09',
      });
    });
  });

  describe('DateTimePicker functionality', () => {
    let user: UserEvent;

    beforeEach(() => {
      user = userEvent.setup();
    });

    it('calls the onChange method correctly when filling out the date-time inputs', async () => {
      const onChange = jest.fn();

      const baseProps = {
        label: 'test',
        onChange,
      };

      const { rerender } = render(
        <DateColumnFilter filterByTime {...baseProps} />
      );

      const startDateFilterInput = await screen.findByRole('textbox', {
        name: 'test filter from',
      });

      await user.type(startDateFilterInput, '2019-08-06 00:00');

      expect(onChange).toHaveBeenLastCalledWith({
        startDate: '2019-08-06 00:00',
      });

      rerender(
        <DateColumnFilter
          filterByTime
          {...baseProps}
          value={{ startDate: '2019-08-06 00:00' }}
        />
      );

      const endDateFilterInput = await screen.findByRole('textbox', {
        name: 'test filter to',
      });

      await user.type(endDateFilterInput, '2019-08-06 23:59');

      expect(onChange).toHaveBeenLastCalledWith({
        startDate: '2019-08-06 00:00',
        endDate: '2019-08-06 23:59',
      });

      rerender(
        <DateColumnFilter
          filterByTime
          {...baseProps}
          value={{
            startDate: '2019-08-06 00:00',
            endDate: '2019-08-06 23:59',
          }}
        />
      );

      await user.clear(startDateFilterInput);

      expect(onChange).toHaveBeenLastCalledWith({
        endDate: '2019-08-06 23:59',
      });

      rerender(
        <DateColumnFilter
          filterByTime
          {...baseProps}
          value={{
            startDate: '2019-08-06 00:00',
            endDate: '2019-08-06 23:59',
          }}
        />
      );

      await user.clear(endDateFilterInput);

      expect(onChange).toHaveBeenLastCalledWith(null);
    });

    it('handles invalid date values correctly by not calling onChange, unless there was previously a value there', async () => {
      const onChange = jest.fn();

      const baseProps = {
        label: 'test',
        onChange,
      };

      const { rerender } = render(
        <DateColumnFilter filterByTime {...baseProps} />
      );

      const startDateFilterInput = await screen.findByRole('textbox', {
        name: 'test filter from',
      });

      await user.type(startDateFilterInput, '2');

      expect(onChange).not.toHaveBeenCalled();

      const endDateFilterInput = await screen.findByRole('textbox', {
        name: 'test filter to',
      });

      await user.type(endDateFilterInput, '201');

      expect(onChange).not.toHaveBeenCalled();

      await user.clear(startDateFilterInput);
      await user.type(startDateFilterInput, '2019-08-06 00:00');

      expect(onChange).toHaveBeenLastCalledWith({
        startDate: '2019-08-06 00:00',
      });

      rerender(
        <DateColumnFilter
          filterByTime
          {...baseProps}
          value={{ startDate: '2019-08-06 00:00' }}
        />
      );

      await user.clear(endDateFilterInput);
      await user.type(endDateFilterInput, '2019-08-07 00:00');

      expect(onChange).toHaveBeenLastCalledWith({
        startDate: '2019-08-06 00:00',
        endDate: '2019-08-07 00:00',
      });

      rerender(
        <DateColumnFilter
          filterByTime
          {...baseProps}
          value={{
            startDate: '2019-08-06 00:00',
            endDate: '2019-08-07 00:00',
          }}
        />
      );

      await user.clear(startDateFilterInput);
      await user.type(startDateFilterInput, '2');

      expect(onChange).toHaveBeenLastCalledWith({
        endDate: '2019-08-07 00:00',
      });

      rerender(
        <DateColumnFilter
          filterByTime
          {...baseProps}
          value={{
            endDate: '2019-08-07 00:00',
          }}
        />
      );

      await user.clear(endDateFilterInput);
      await user.type(endDateFilterInput, '201');

      expect(onChange).toHaveBeenLastCalledWith(null);
    });

    it('displays error for invalid date', async () => {
      const onChange = jest.fn();

      const baseProps = {
        label: 'test',
        onChange,
        value: {
          startDate: '2019-13-09 00:00',
          endDate: '2019-08-32 00:00',
        },
      };

      render(<DateColumnFilter filterByTime {...baseProps} />);

      const errorMessages = await screen.findAllByText(
        'Date-time format: yyyy-MM-dd HH:mm.'
      );
      for (const element of errorMessages) {
        expect(element).toBeInTheDocument();
      }
    });

    it('displays error for invalid time', async () => {
      const onChange = jest.fn();

      const baseProps = {
        label: 'test',
        onChange,
        value: {
          startDate: '2019-13-09 00:60',
          endDate: '2019-08-32 24:00',
        },
      };

      render(<DateColumnFilter filterByTime {...baseProps} />);

      const errorMessages = await screen.findAllByText(
        'Date-time format: yyyy-MM-dd HH:mm.'
      );
      for (const element of errorMessages) {
        expect(element).toBeInTheDocument();
      }
    });

    it('displays error for invalid date-time range', async () => {
      const onChange = jest.fn();

      const baseProps = {
        label: 'test',
        onChange,
        value: {
          startDate: '2019-08-08 12:00',
          endDate: '2019-08-08 11:00',
        },
      };

      render(<DateColumnFilter filterByTime {...baseProps} />);

      const errorMessages = await screen.findAllByText(
        'Invalid date-time range'
      );
      for (const element of errorMessages) {
        expect(element).toBeInTheDocument();
      }
    });
  });
});
