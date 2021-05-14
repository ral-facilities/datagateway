import React from 'react';
import { createShallow } from '@material-ui/core/test-utils';
import {
  TranslatedHomePage as HomePage,
  TranslatedHomePageStateProps,
} from './translatedHomePage.component';

describe('HomePage', () => {
  let shallow;
  let props: TranslatedHomePageStateProps;

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });

    props = {
      pluginHostUrl: 'test',
    };
  });

  it('translated homepage renders correctly', () => {
    const wrapper = shallow(<HomePage {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
