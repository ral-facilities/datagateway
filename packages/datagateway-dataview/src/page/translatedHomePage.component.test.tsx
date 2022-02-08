import React from 'react';
import { createShallow } from '@mui/material/test-utils';
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
      pluginHost: 'test',
    };
  });

  it('translated homepage renders correctly', () => {
    const wrapper = shallow(<HomePage {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
