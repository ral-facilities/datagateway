import React from 'react';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import TextColumnFilter, { useTextFilter } from './textColumnFilter.component';
import { Select } from '@material-ui/core';
import { act } from 'react-dom/test-utils';
import { usePushFilter } from '../../api';
import { renderHook } from '@testing-library/react-hooks';

jest.mock('../../api');
jest.useFakeTimers('modern');
const DEBOUNCE_DELAY = 250;

describe('Text filter component', () => {
  let shallow;
  let mount;

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });
    mount = createMount();
  });

  afterEach(() => {
    mount.cleanUp();
  });

  it('renders correctly', () => {
    const wrapper = shallow(
      <TextColumnFilter
        value={{ value: 'test value', type: 'include' }}
        label="test"
        onChange={jest.fn()}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls the onChange method once when input is typed while include filter type is selected and calls again by debounced function after timeout', () => {
    const onChange = jest.fn();

    const wrapper = mount(
      <TextColumnFilter
        value={{ value: 'test', type: 'include' }}
        label="test"
        onChange={onChange}
      />
    );

    // We simulate a change in the input from 'test' to 'test-again'.
    const textFilterInput = wrapper.find('input').first();

    textFilterInput.instance().value = 'test-again';
    textFilterInput.simulate('change');

    jest.advanceTimersByTime(DEBOUNCE_DELAY);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith({
      value: 'test-again',
      type: 'include',
    });
  });

  it('calls the onChange method once when input is typed while exclude filter type is selected and calls again by debounced function after timeout', () => {
    const onChange = jest.fn();

    const wrapper = mount(
      <TextColumnFilter
        value={{ value: 'test', type: 'exclude' }}
        label="test"
        onChange={onChange}
      />
    );

    // We simulate a change in the input from 'test' to 'test-again'.
    const textFilterInput = wrapper.find('input').first();

    textFilterInput.instance().value = 'test-again';
    textFilterInput.simulate('change');

    jest.advanceTimersByTime(DEBOUNCE_DELAY);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith({
      value: 'test-again',
      type: 'exclude',
    });
  });

  it('calls the onChange method once when include filter type is selected while there is input', () => {
    const onChange = jest.fn();

    const wrapper = mount(
      <TextColumnFilter
        value={{ value: 'test', type: 'exclude' }}
        label="test"
        onChange={onChange}
      />
    );

    // We simulate a change in the select from 'exclude' to 'include'.
    const textFilterSelect = wrapper.find(Select).at(0);

    act(() => {
      textFilterSelect.props().onChange({ target: { value: 'include' } });
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith({
      value: 'test',
      type: 'include',
    });
  });

  it('calls the onChange method once when exclude filter type is selected while there is input', () => {
    const onChange = jest.fn();

    const wrapper = mount(
      <TextColumnFilter
        value={{ value: 'test', type: 'include' }}
        label="test"
        onChange={onChange}
      />
    );

    // We simulate a change in the select from 'include' to 'exclude'.
    const textFilterSelect = wrapper.find(Select).at(0);

    act(() => {
      textFilterSelect.props().onChange({ target: { value: 'exclude' } });
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith({
      value: 'test',
      type: 'exclude',
    });
  });

  it('calls the onChange method once when input is cleared and calls again by debounced function after timeout', () => {
    const onChange = jest.fn();

    const wrapper = mount(
      <TextColumnFilter
        value={{ value: 'test', type: 'include' }}
        label="test"
        onChange={onChange}
      />
    );

    // We simulate a change in the input from 'test' to ''.
    const textFilterInput = wrapper.find('input').first();

    textFilterInput.instance().value = '';
    textFilterInput.simulate('change');

    jest.advanceTimersByTime(DEBOUNCE_DELAY);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('does not call the onChange method when filter type is selected while input is empty', () => {
    const onChange = jest.fn();

    const wrapper = mount(
      <TextColumnFilter
        value={{ value: '', type: 'exclude' }}
        label="test"
        onChange={onChange}
      />
    );

    // We simulate a change in the select from 'exclude' to 'include'.
    const textFilterSelect = wrapper.find(Select).at(0);

    act(() => {
      textFilterSelect.props().onChange({ target: { value: 'include' } });
    });

    expect(onChange).toHaveBeenCalledTimes(0);
  });

  it('updates the input value when the value prop changes', () => {
    const baseProps = { label: 'test', onChange: jest.fn(), value: undefined };

    const wrapper = mount(<TextColumnFilter {...baseProps} />);

    wrapper.setProps({
      ...baseProps,
      value: { value: 'changed via props', type: 'include' },
    });
    wrapper.update();

    expect(wrapper.find('input#test-filter').prop('value')).toEqual(
      'changed via props'
    );

    wrapper.setProps({
      ...baseProps,
      value: undefined,
    });
    wrapper.update();

    expect(wrapper.find('input#test-filter').prop('value')).toEqual('');
  });

  it('useTextFilter hook returns a function which can generate a working text filter', () => {
    const pushFilter = jest.fn();
    (usePushFilter as jest.Mock).mockImplementation(() => pushFilter);

    const { result } = renderHook(() => useTextFilter({}));
    let textFilter;

    act(() => {
      textFilter = result.current('Name', 'name');
    });

    const shallowWrapper = shallow(textFilter);
    expect(shallowWrapper).toMatchSnapshot();

    const mountWrapper = mount(textFilter);
    // We simulate a change in the input to 'test'.
    const textFilterInput = mountWrapper.find('input').first();

    textFilterInput.instance().value = 'test';
    textFilterInput.simulate('change');

    jest.advanceTimersByTime(DEBOUNCE_DELAY);

    expect(pushFilter).toHaveBeenCalledTimes(1);
    expect(pushFilter).toHaveBeenLastCalledWith('name', {
      value: 'test',
      type: 'include',
    });

    textFilterInput.instance().value = '';
    textFilterInput.simulate('change');

    jest.advanceTimersByTime(DEBOUNCE_DELAY);

    expect(pushFilter).toHaveBeenCalledTimes(2);
    expect(pushFilter).toHaveBeenLastCalledWith('name', null);
  });
});
