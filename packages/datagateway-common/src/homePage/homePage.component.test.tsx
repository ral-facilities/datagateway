import React from 'react';
import { createShallow } from '@material-ui/core/test-utils';
import HomePage, { HomePageProps } from './homePage.component';

describe('Home page component', () => {
  let shallow;
  let props: HomePageProps;

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });

    props = {
      title: 'test-title',
      howLabel: 'test-howLabel',
      exploreLabel: 'test-exploreLabel',
      exploreDescription: 'test-exploreDescription',
      exploreLink: 'test-exploreLink',
      discoverLabel: 'test-discoverLabel',
      discoverDescription: 'test-discoverDescription',
      discoverLink: 'test-discoverLink',
      downloadLabel: 'test-downloadLabel',
      downloadDescription: 'test-downloadDescription',
      downloadLink: 'test-downloadLink',
      logo: 'test-logo',
      backgroundImage: 'test-backgroundImage',
      exploreImage: 'test-exploreImage',
      discoverImage: 'test-discoverImage',
      downloadImage: 'test-downloadImage',
    };
  });

  it('homepage renders correctly', () => {
    const wrapper = shallow(<HomePage {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
