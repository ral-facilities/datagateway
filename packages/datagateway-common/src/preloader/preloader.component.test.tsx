import React from 'react';
import Preloader from './preloader.component';
import { createMount } from '@material-ui/core/test-utils';

describe('Preloader component', () => {
  let mount;

  beforeEach(() => {
    mount = createMount();
  });

  it('renders when the site is loading', () => {
    const wrapper = mount(<Preloader loading={true} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('does not render when the site is not loading', () => {
    const wrapper = mount(<Preloader loading={false} />);
    expect(wrapper).toMatchSnapshot();
  });
});
