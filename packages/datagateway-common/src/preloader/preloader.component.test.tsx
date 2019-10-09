import React from 'react';
import Preloader from './preloader.component';
import { createShallow } from '@material-ui/core/test-utils';

describe('Preloader component', () => {
  let shallow;

  beforeEach(() => {
    shallow = createShallow({});
  });

  it('renders when the site is loading', () => {
    const wrapper = shallow(<Preloader loading={true} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('does not render when the site is not loading', () => {
    const wrapper = shallow(<Preloader loading={false} />);
    expect(wrapper).toMatchSnapshot();
  });
});
