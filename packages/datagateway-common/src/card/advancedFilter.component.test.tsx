import React from 'react';
import { createShallow } from '@material-ui/core/test-utils';
import TitleIcon from '@material-ui/icons/Title';
import FingerprintIcon from '@material-ui/icons/Fingerprint';
import PublicIcon from '@material-ui/icons/Public';
import ConfirmationNumberIcon from '@material-ui/icons/ConfirmationNumber';
import AssessmentIcon from '@material-ui/icons/Assessment';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import ExploreIcon from '@material-ui/icons/Explore';
import SaveIcon from '@material-ui/icons/Save';
import DescriptionIcon from '@material-ui/icons/Description';
import LinkIcon from '@material-ui/icons/Link';
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

  it('TitleIcon displays correctly', () => {
    const wrapper = shallow(
      <AdvancedFilter
        title={{
          label: 'advanced_filters.icons.title',
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
    expect(wrapper.exists(TitleIcon)).toBeTruthy();
  });

  it('FingerprintIcon displays correctly', () => {
    const wrapper = shallow(
      <AdvancedFilter
        title={{
          label: 'advanced_filters.icons.fingerprint',
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
    expect(wrapper.exists(FingerprintIcon)).toBeTruthy();
  });

  it('PublicIcon displays correctly', () => {
    const wrapper = shallow(
      <AdvancedFilter
        title={{
          label: 'advanced_filters.icons.public',
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
    expect(wrapper.exists(PublicIcon)).toBeTruthy();
  });

  it('ConfirmationNumberIcon displays correctly', () => {
    const wrapper = shallow(
      <AdvancedFilter
        title={{
          label: 'advanced_filters.icons.confirmation_number',
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
    expect(wrapper.exists(ConfirmationNumberIcon)).toBeTruthy();
  });

  it('AssessmentIcon displays correctly', () => {
    const wrapper = shallow(
      <AdvancedFilter
        title={{
          label: 'advanced_filters.icons.assessment',
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
    expect(wrapper.exists(AssessmentIcon)).toBeTruthy();
  });

  it('CalendarTodayIcon displays correctly', () => {
    const wrapper = shallow(
      <AdvancedFilter
        title={{
          label: 'advanced_filters.icons.calendar_today',
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
    expect(wrapper.exists(CalendarTodayIcon)).toBeTruthy();
  });

  it('ExploreIcon displays correctly', () => {
    const wrapper = shallow(
      <AdvancedFilter
        title={{
          label: 'advanced_filters.icons.explore',
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
    expect(wrapper.exists(ExploreIcon)).toBeTruthy();
  });

  it('SaveIcon displays correctly', () => {
    const wrapper = shallow(
      <AdvancedFilter
        title={{
          label: 'advanced_filters.icons.save',
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
    expect(wrapper.exists(SaveIcon)).toBeTruthy();
  });

  it('DescriptionIcon displays correctly', () => {
    const wrapper = shallow(
      <AdvancedFilter
        title={{
          label: 'advanced_filters.icons.description',
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
    expect(wrapper.exists(DescriptionIcon)).toBeTruthy();
  });

  it('LinkIcon displays correctly', () => {
    const wrapper = shallow(
      <AdvancedFilter
        title={{
          label: 'advanced_filters.icons.link',
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
    expect(wrapper.exists(LinkIcon)).toBeTruthy();
  });
});
