import React from 'react';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import TextColumnFilter from './textColumnFilter.component';

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
      <TextColumnFilter label="test" onChange={() => {}} />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls the onChange method when input is typed into', () => {
    const onChange = jest.fn();

    const wrapper = mount(
      <TextColumnFilter label="test" onChange={onChange} />
    );

    const textFilterInput = wrapper.find('input');
    textFilterInput.instance().value = 'test';
    textFilterInput.simulate('change');

    expect(onChange).toHaveBeenCalledWith('test');
  });
});
