import React from 'react';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import AdvancedHelpDialogue from './advancedHelpDialogue';

describe('Advanced help dialogue component tests', () => {
  let shallow;
  let mount;

  beforeEach(() => {
    shallow = createShallow({ untilSelector: 'div' });
    mount = createMount();
  });

  it('renders correctly', () => {
    const wrapper = shallow(<AdvancedHelpDialogue />);
    expect(wrapper).toMatchSnapshot();
  });

  it('can open and close help dialogue', () => {
    const wrapper = mount(<AdvancedHelpDialogue />);
    wrapper
      .find('[aria-label="advanced_search_help.advanced_button_arialabel"]')
      .first()
      .simulate('click');
    expect(
      wrapper
        .find('[aria-labelledby="advanced-search-dialog-title"]')
        .first()
        .prop('open')
    ).toBe(true);
    wrapper
      .find('[aria-label="advanced_search_help.close_button_arialabel"]')
      .first()
      .simulate('click');
    expect(
      wrapper
        .find('[aria-labelledby="advanced-search-dialog-title"]')
        .first()
        .prop('open')
    ).toBe(false);
  });
});
