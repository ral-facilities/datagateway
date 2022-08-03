import React from 'react';
import Preloader from './preloader.component';
import { shallow } from 'enzyme';

describe('Preloader component', () => {
  it('renders when the site is loading', () => {
    const wrapper = shallow(<Preloader loading={true} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('does not render when the site is not loading', () => {
    const wrapper = shallow(<Preloader loading={false} />);
    expect(wrapper).toMatchSnapshot();
  });
});
