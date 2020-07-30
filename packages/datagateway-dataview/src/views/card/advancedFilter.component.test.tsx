import React from 'react';
import { createShallow } from '@material-ui/core/test-utils';
import AdvancedFilter from './advancedFilter.component';

describe('AdvancedFilter', () => {
  let shallow;

  beforeEach(() => {
    shallow = createShallow();
  });

  it('renders correctly', () => {
    const wrapper = shallow(
      <AdvancedFilter
        title={{
          label: 'Test',
          dataKey: 'TEST',
          filterComponent: jest.fn(),
        }}
      />
    );

    // Click on the link to show the filters.
    wrapper
      .find('[aria-label="advanced-filters-link"]')
      .first()
      .simulate('click');
    wrapper.update();

    expect(wrapper.find('[aria-label="title-label"]').text()).toEqual('Test');
    expect(wrapper.find('[aria-label="advanced-filters-link"]').text()).toEqual(
      'Hide Advanced Search'
    );
  });

  it.skip('shows description correctly');

  it.skip('shows information correctly');
});
