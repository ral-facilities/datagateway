import React from 'react';
import { createShallow } from '@material-ui/core/test-utils';
import HomePage, { HomePageProps } from './homePage.component';

describe('Home page component', () => {
  let shallow;
  let props: HomePageProps;

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });

    props = {
      classes: {
        bigImage: 'bigImage-class',
        howItWorks: 'howItWorks-class',
        howItWorksTitle: 'howItWorksTitle-class',
        howItWorksGridItem: 'howItWorksGridItem-class',
        howItWorksGridItemTitle: 'howItWorksGridItemTitle-class',
        howItWorksGridItemImage: 'howItWorksGridItemImage-class',
        howItWorksGridItemCaption: 'howItWorksGridItemCaption-class',
      },
    };
  });

  it('homepage renders correctly', () => {
    const wrapper = shallow(<HomePage {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
