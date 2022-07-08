import React from 'react';
import { shallow } from 'enzyme';
import {
  TranslatedHomePage as HomePage,
  TranslatedHomePageStateProps,
} from './translatedHomePage.component';

describe('HomePage', () => {
  let props: TranslatedHomePageStateProps;

  beforeEach(() => {
    props = {
      pluginHost: 'test',
    };
  });

  it('translated homepage renders correctly', () => {
    const wrapper = shallow(<HomePage {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
