import React from 'react';
import TextColumnFilter, {
  usePrincipalExperimenterFilter,
  useTextFilter,
  DEBOUNCE_DELAY,
} from './textColumnFilter.component';
import { usePushFilter, usePushFilters } from '../../api';
import { render, renderHook, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../../api');
vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });

describe('Text filter component', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup({ delay: null });
  });

  it('renders correctly', () => {
    const { asFragment } = render(
      <TextColumnFilter
        value={{ value: 'test value', type: 'include' }}
        label="test"
        onChange={vi.fn()}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with default value', () => {
    const { asFragment } = render(
      <TextColumnFilter
        value={{ value: undefined, type: 'include' }}
        defaultFilter={{ value: 'test default value', type: 'include' }}
        label="test"
        onChange={vi.fn()}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('calls the onChange method once when input is typed while include filter type is selected and calls again by debounced function after timeout', async () => {
    const onChange = vi.fn();

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
    });

    await user.clear(textFilterInput);
    await user.type(textFilterInput, 'test-again');

    vi.advanceTimersByTime(DEBOUNCE_DELAY);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith({
      value: 'test-again',
      type: 'include',
    });
  });

  it('calls the onChange method once when input is typed while exclude filter type is selected and calls again by debounced function after timeout', async () => {
    const onChange = vi.fn();

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
    });

    await user.clear(textFilterInput);
    await user.type(textFilterInput, 'test-again');

    vi.advanceTimersByTime(DEBOUNCE_DELAY);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith({
      value: 'test-again',
      type: 'exclude',
    });
  });

  it('calls the onChange method once when input is typed while exact filter type is selected and calls again by debounced function after timeout', async () => {
    const onChange = vi.fn();

    render(
      <TextColumnFilter
        value={{ value: 'test', type: 'exact' }}
        label="test"
        onChange={onChange}
      />
    );

    // We simulate a change in the input from 'test' to 'test-again'.
    const textFilterInput = await screen.findByRole('textbox', {
      name: 'Filter by test',
    });

    await user.clear(textFilterInput);
    await user.type(textFilterInput, 'test-again');

    vi.advanceTimersByTime(DEBOUNCE_DELAY);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith({
      value: 'test-again',
      type: 'exact',
    });
  });

  it('calls the onChange method once when include filter type is selected while there is input', async () => {
    const onChange = vi.fn();

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
        name: 'include, exclude or exact',
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
    const onChange = vi.fn();

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
        name: 'include, exclude or exact',
      })
    );
    await user.click(await screen.findByText('Exclude'));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith({
      value: 'test',
      type: 'exclude',
    });
  });

  it('calls the onChange method once when exact filter type is selected while there is input', async () => {
    const onChange = vi.fn();

    render(
      <TextColumnFilter
        value={{ value: 'test', type: 'include' }}
        label="test"
        onChange={onChange}
      />
    );

    // We simulate a change in the select from 'include' to 'exact'.
    await user.click(
      await screen.findByRole('button', {
        name: 'include, exclude or exact',
      })
    );
    await user.click(await screen.findByText('Exact'));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith({
      value: 'test',
      type: 'exact',
    });
  });

  it('calls the onChange method once when input is cleared and calls again by debounced function after timeout', async () => {
    const onChange = vi.fn();

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
      })
    );

    vi.advanceTimersByTime(DEBOUNCE_DELAY);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('does not call the onChange method when filter type is selected while input is empty', async () => {
    const onChange = vi.fn();

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
        name: 'include, exclude or exact',
      })
    );
    await user.click(await screen.findByText('Include'));

    expect(onChange).toHaveBeenCalledTimes(0);
  });

  it('updates the input value when the value prop changes', async () => {
    const baseProps = { label: 'test', onChange: vi.fn(), value: undefined };

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
    const pushFilter = vi.fn();
    vi.mocked(usePushFilter).mockImplementation(() => pushFilter);

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
    });

    await user.clear(textFilterInput);
    await user.type(textFilterInput, 'test');

    vi.advanceTimersByTime(DEBOUNCE_DELAY);

    expect(pushFilter).toHaveBeenCalledTimes(1);
    expect(pushFilter).toHaveBeenLastCalledWith('name', {
      value: 'test',
      type: 'include',
    });

    await user.clear(textFilterInput);

    vi.advanceTimersByTime(DEBOUNCE_DELAY);

    expect(pushFilter).toHaveBeenCalledTimes(2);
    expect(pushFilter).toHaveBeenLastCalledWith('name', null);
  });

  it('usePrincipalExperimenterFilter hook returns a function which can generate a working PI filter', async () => {
    const pushFilters = vi.fn();
    vi.mocked(usePushFilters).mockImplementation(() => pushFilters);

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
    });

    await user.clear(textFilterInput);
    await user.type(textFilterInput, 'test');

    vi.advanceTimersByTime(DEBOUNCE_DELAY);

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

    vi.advanceTimersByTime(DEBOUNCE_DELAY);

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
