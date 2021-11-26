import React from 'react';
import { createShallow, createMount } from '@material-ui/core/test-utils';
import AdvancedHelpDialogue from './advancedHelpDialogue';

describe('Search Button component tests', () => {
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

  it('opens help dialogue when button clicked', () => {
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
  });
});
