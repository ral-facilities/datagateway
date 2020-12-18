import React from 'react';
import { createShallow } from '@material-ui/core/test-utils';
import AdvancedFilter from './advancedFilter.component';

describe('AdvancedFilter', () => {
  let shallow;

  beforeEach(() => {
    shallow = createShallow();
  });

  it('shows title correctly', () => {
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
      'advanced_filters.hide'
    );
  });

  it('shows title correctly when no label provided', () => {
    const wrapper = shallow(
      <AdvancedFilter
        title={{
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

    expect(wrapper.find('[aria-label="title-label"]').text()).toEqual('TEST');
    expect(wrapper.find('[aria-label="advanced-filters-link"]').text()).toEqual(
      'advanced_filters.hide'
    );
  });

  it('shows description correctly', () => {
    const wrapper = shallow(
      <AdvancedFilter
        title={{ dataKey: 'TEST' }}
        description={{
          label: 'Desc',
          dataKey: 'DESC',
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

    expect(wrapper.find('[aria-label="description-label"]').text()).toEqual(
      'Desc'
    );
    expect(wrapper.find('[aria-label="advanced-filters-link"]').text()).toEqual(
      'advanced_filters.hide'
    );
  });

  it('shows description correctly when no label provided', () => {
    const wrapper = shallow(
      <AdvancedFilter
        title={{ dataKey: 'TEST' }}
        description={{
          dataKey: 'DESC',
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

    expect(wrapper.find('[aria-label="description-label"]').text()).toEqual(
      'DESC'
    );
    expect(wrapper.find('[aria-label="advanced-filters-link"]').text()).toEqual(
      'advanced_filters.hide'
    );
  });

  it('shows information correctly', () => {
    const wrapper = shallow(
      <AdvancedFilter
        title={{ dataKey: 'TEST' }}
        information={[
          {
            label: 'Info',
            dataKey: 'INFO',
            filterComponent: jest.fn(),
          },
        ]}
      />
    );

    // Click on the link to show the filters.
    wrapper
      .find('[aria-label="advanced-filters-link"]')
      .first()
      .simulate('click');
    wrapper.update();

    expect(wrapper.find('[aria-label="information-label"]').text()).toEqual(
      'Info'
    );
    expect(wrapper.find('[aria-label="advanced-filters-link"]').text()).toEqual(
      'advanced_filters.hide'
    );
  });

  it('shows information correctly when label not provided', () => {
    const wrapper = shallow(
      <AdvancedFilter
        title={{ dataKey: 'TEST' }}
        information={[
          {
            dataKey: 'INFO',
            filterComponent: jest.fn(),
          },
        ]}
      />
    );

    // Click on the link to show the filters.
    wrapper
      .find('[aria-label="advanced-filters-link"]')
      .first()
      .simulate('click');
    wrapper.update();

    expect(wrapper.find('[aria-label="information-label"]').text()).toEqual(
      'INFO'
    );
    expect(wrapper.find('[aria-label="advanced-filters-link"]').text()).toEqual(
      'advanced_filters.hide'
    );
  });
});
