import React from 'react';
import { createShallow } from '@material-ui/core/test-utils';
import HomePage, { HomePageProps } from './homePage.component';

describe('Home page component', () => {
  let shallow;
  let props: HomePageProps;

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });

    props = {
      logo: 'test-logo',
      backgroundImage: 'test-bakcgroundImage',
      greenSwirl1Image: 'test-greenSwirl1Image',
      greenSwirl2Image: 'test-greenSwirl2Image',
      decal1Image: 'test-decal1Image',
      decal2Image: 'test-decal2Image',
      decal2DarkImage: 'test-decal2DarkImage',
      decal2DarkHCImage: 'test-Decal2DarkHCImage',
      facilityImage: 'test-facilityImage',
    };
  });

  it('homepage renders correctly', () => {
    const wrapper = shallow(<HomePage {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
