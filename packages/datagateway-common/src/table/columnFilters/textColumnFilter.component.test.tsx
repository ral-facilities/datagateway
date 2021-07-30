import React from 'react';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import TextColumnFilter from './textColumnFilter.component';
import { Select } from '@material-ui/core';
import { act } from 'react-dom/test-utils';

describe('Text filter component', () => {
  let shallow;
  let mount;

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });
    mount = createMount();

    jest.useRealTimers();
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

  it('calls the onChange method once when input is typed while include filter type is selected and calls again by debounced function after timeout', (done) => {
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

    // Jest timers do not co-operate with lodash.debounce, hence we use jest.useRealTimers
    // and this setTimeout function set to the actual delay of the debouncing function.
    setTimeout(() => {
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenLastCalledWith({
        value: 'test-again',
        type: 'include',
      });
      done();
    }, 250);
  });

  it('calls the onChange method once when input is typed while exclude filter type is selected and calls again by debounced function after timeout', (done) => {
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

    // Jest timers do not co-operate with lodash.debounce, hence we use jest.useRealTimers
    // and this setTimeout function set to the actual delay of the debouncing function.
    setTimeout(() => {
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenLastCalledWith({
        value: 'test-again',
        type: 'exclude',
      });
      done();
    }, 250);
  });

  it('calls the onChange method once when include filter type is selected while there is input and calls again by debounced function after timeout', (done) => {
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

    // Jest timers do not co-operate with lodash.debounce, hence we use jest.useRealTimers
    // and this setTimeout function set to the actual delay of the debouncing function.
    setTimeout(() => {
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenLastCalledWith({
        value: 'test',
        type: 'include',
      });
      done();
    }, 250);
  });

  it('calls the onChange method once when exclude filter type is selected while there is input and calls again by debounced function after timeout', (done) => {
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

    // Jest timers do not co-operate with lodash.debounce, hence we use jest.useRealTimers
    // and this setTimeout function set to the actual delay of the debouncing function.
    setTimeout(() => {
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenLastCalledWith({
        value: 'test',
        type: 'exclude',
      });
      done();
    }, 250);
  });

  it('calls the onChange method once when input is cleared and calls again by debounced function after timeout', (done) => {
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

    // Jest timers do not co-operate with lodash.debounce, hence we use jest.useRealTimers
    // and this setTimeout function set to the actual delay of the debouncing function.
    setTimeout(() => {
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenLastCalledWith(null);
      done();
    }, 250);
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
    const baseProps = { label: 'test', onChange: jest.fn() };

    const wrapper = mount(<TextColumnFilter {...baseProps} />);

    wrapper.setProps({
      ...baseProps,
      value: { value: 'changed via props', type: 'include' },
    });
    wrapper.update();

    expect(wrapper.find('input#test-filter').prop('value')).toEqual(
      'changed via props'
    );
  });
});
