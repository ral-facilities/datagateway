import React from 'react';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import TextColumnFilter from './textColumnFilter.component';

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
      <TextColumnFilter label="test" onChange={jest.fn()} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls the onChange method once when input is typed and calls again by debounced function after timeout', (done) => {
    const onChange = jest.fn();

    const wrapper = mount(
      <TextColumnFilter label="test" onChange={onChange} />
    );

    // We simulate a change in the input from 'test' to 'test-again'.
    const textFilterInput = wrapper.find('input');

    textFilterInput.instance().value = 'test';
    textFilterInput.simulate('change');

    textFilterInput.instance().value = 'test-again';
    textFilterInput.simulate('change');

    // Jest timers do not co-operate with lodash.debounce, hence we use jest.useRealTimers
    // and this setTimeout function set to the actual delay of the debouncing function.
    setTimeout(() => {
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenLastCalledWith('test-again');
      done();
    }, 250);
  });
});
