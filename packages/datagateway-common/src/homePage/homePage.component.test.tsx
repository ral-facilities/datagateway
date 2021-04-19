import React from 'react';
import { createMount, createShallow } from '@material-ui/core/test-utils';
import { HomePageWithoutStyles, HomePageProps } from './homePage.component';

describe('Home page component', () => {
  let shallow;
  let mount;
  let props: HomePageProps;

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });
    mount = createMount();

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

  afterEach(() => {
    mount.cleanUp();
  });

  it('homepage renders correctly', () => {
    const wrapper = shallow(<HomePageWithoutStyles {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
