import React from 'react';
import TextColumnFilter, {
  usePrincipalExperimenterFilter,
  useTextFilter,
} from './textColumnFilter.component';
import { act } from 'react-dom/test-utils';
import { usePushFilter, usePushFilters } from '../../api';
import { render, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { UserEvent } from '@testing-library/user-event/setup/setup';
import userEvent from '@testing-library/user-event';

jest.mock('../../api');
jest.useFakeTimers('modern');
const DEBOUNCE_DELAY = 250;

describe('Text filter component', () => {
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup({ delay: null });
  });

  it('renders correctly', () => {
    const { asFragment } = render(
      <TextColumnFilter
        value={{ value: 'test value', type: 'include' }}
        label="test"
        onChange={jest.fn()}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('calls the onChange method once when input is typed while include filter type is selected and calls again by debounced function after timeout', async () => {
    const onChange = jest.fn();

    render(
      <TextColumnFilter
        value={{ value: 'test', type: 'include' }}
        label="test"
        onChange={onChange}
      />
    );

    // We simulate a change in the input from 'test' to 'test-again'.
    const textFilterInput = await screen.findByRole('textbox', {
      name: 'Filter by test',
      hidden: true,
    });

    await user.clear(textFilterInput);
    await user.type(textFilterInput, 'test-again');

    jest.advanceTimersByTime(DEBOUNCE_DELAY);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith({
      value: 'test-again',
      type: 'include',
    });
  });

  it('calls the onChange method once when input is typed while exclude filter type is selected and calls again by debounced function after timeout', async () => {
    const onChange = jest.fn();

    render(
      <TextColumnFilter
        value={{ value: 'test', type: 'exclude' }}
        label="test"
        onChange={onChange}
      />
    );

    // We simulate a change in the input from 'test' to 'test-again'.
    const textFilterInput = await screen.findByRole('textbox', {
      name: 'Filter by test',
      hidden: true,
    });

    await user.clear(textFilterInput);
    await user.type(textFilterInput, 'test-again');

    jest.advanceTimersByTime(DEBOUNCE_DELAY);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith({
      value: 'test-again',
      type: 'exclude',
    });
  });

  it('calls the onChange method once when include filter type is selected while there is input', async () => {
    const onChange = jest.fn();

    render(
      <TextColumnFilter
        value={{ value: 'test', type: 'exclude' }}
        label="test"
        onChange={onChange}
      />
    );

    // We simulate a change in the select from 'exclude' to 'include'.
    await user.click(
      await screen.findByRole('button', {
        name: 'include or exclude',
        hidden: true,
      })
    );
    await user.click(await screen.findByText('Include'));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith({
      value: 'test',
      type: 'include',
    });
  });

  it('calls the onChange method once when exclude filter type is selected while there is input', async () => {
    const onChange = jest.fn();

    render(
      <TextColumnFilter
        value={{ value: 'test', type: 'include' }}
        label="test"
        onChange={onChange}
      />
    );

    // We simulate a change in the select from 'include' to 'exclude'.
    await user.click(
      await screen.findByRole('button', {
        name: 'include or exclude',
        hidden: true,
      })
    );
    await user.click(await screen.findByText('Exclude'));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith({
      value: 'test',
      type: 'exclude',
    });
  });

  it('calls the onChange method once when input is cleared and calls again by debounced function after timeout', async () => {
    const onChange = jest.fn();

    render(
      <TextColumnFilter
        value={{ value: 'test', type: 'include' }}
        label="test"
        onChange={onChange}
      />
    );

    // We simulate a change in the input from 'test' to ''.
    await user.clear(
      await screen.findByRole('textbox', {
        name: 'Filter by test',
        hidden: true,
      })
    );

    jest.advanceTimersByTime(DEBOUNCE_DELAY);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('does not call the onChange method when filter type is selected while input is empty', async () => {
    const onChange = jest.fn();

    render(
      <TextColumnFilter
        value={{ value: '', type: 'exclude' }}
        label="test"
        onChange={onChange}
      />
    );

    // We simulate a change in the select from 'exclude' to 'include'.
    await user.click(
      await screen.findByRole('button', {
        name: 'include or exclude',
        hidden: true,
      })
    );
    await user.click(await screen.findByText('Include'));

    expect(onChange).toHaveBeenCalledTimes(0);
  });

  it('updates the input value when the value prop changes', async () => {
    const baseProps = { label: 'test', onChange: jest.fn(), value: undefined };

    const { rerender } = render(<TextColumnFilter {...baseProps} />);

    rerender(
      <TextColumnFilter
        {...baseProps}
        value={{ value: 'changed via props', type: 'include' }}
      />
    );

    expect(
      await screen.findByDisplayValue('changed via props')
    ).toBeInTheDocument();

    rerender(<TextColumnFilter {...baseProps} value={undefined} />);

    expect(await screen.findByDisplayValue('')).toBeInTheDocument();
  });

  it('useTextFilter hook returns a function which can generate a working text filter', async () => {
    const pushFilter = jest.fn();
    (usePushFilter as jest.Mock).mockImplementation(() => pushFilter);

    const { result } = renderHook(() => useTextFilter({}));
    let textFilter;

    act(() => {
      textFilter = result.current('Name', 'name');
    });

    const { asFragment } = render(textFilter);
    expect(asFragment()).toMatchSnapshot();

    // We simulate a change in the input to 'test'.
    const textFilterInput = await screen.findByRole('textbox', {
      name: 'Filter by Name',
      hidden: true,
    });

    await user.clear(textFilterInput);
    await user.type(textFilterInput, 'test');

    jest.advanceTimersByTime(DEBOUNCE_DELAY);

    expect(pushFilter).toHaveBeenCalledTimes(1);
    expect(pushFilter).toHaveBeenLastCalledWith('name', {
      value: 'test',
      type: 'include',
    });

    await user.clear(textFilterInput);

    jest.advanceTimersByTime(DEBOUNCE_DELAY);

    expect(pushFilter).toHaveBeenCalledTimes(2);
    expect(pushFilter).toHaveBeenLastCalledWith('name', null);
  });

  it('usePrincipalExperimenterFilter hook returns a function which can generate a working PI filter', async () => {
    const pushFilters = jest.fn();
    (usePushFilters as jest.Mock).mockImplementation(() => pushFilters);

    const { result } = renderHook(() => usePrincipalExperimenterFilter({}));
    let piFilter;

    act(() => {
      piFilter = result.current(
        'Principal Investigator',
        'investigationUsers.user.fullName'
      );
    });

    const { asFragment } = render(piFilter);
    expect(asFragment()).toMatchSnapshot();

    // We simulate a change in the input to 'test'.
    const textFilterInput = await screen.findByRole('textbox', {
      name: 'Filter by Principal Investigator',
      hidden: true,
    });

    await user.clear(textFilterInput);
    await user.type(textFilterInput, 'test');

    jest.advanceTimersByTime(DEBOUNCE_DELAY);

    expect(pushFilters).toHaveBeenCalledTimes(1);
    expect(pushFilters).toHaveBeenLastCalledWith([
      {
        filterKey: 'investigationUsers.user.fullName',
        filter: {
          value: 'test',
          type: 'include',
        },
      },
      {
        filterKey: 'investigationUsers.role',
        filter: {
          value: 'principal_experimenter',
          type: 'include',
        },
      },
    ]);

    await user.clear(textFilterInput);

    jest.advanceTimersByTime(DEBOUNCE_DELAY);

    expect(pushFilters).toHaveBeenCalledTimes(2);
    expect(pushFilters).toHaveBeenLastCalledWith([
      {
        filterKey: 'investigationUsers.user.fullName',
        filter: null,
      },
      {
        filterKey: 'investigationUsers.role',
        filter: null,
      },
    ]);
  });
});
