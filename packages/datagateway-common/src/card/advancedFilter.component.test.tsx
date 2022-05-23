import React from 'react';
import { createShallow } from '@material-ui/core/test-utils';
import SubjectIcon from '@material-ui/icons/Subject';
import FingerprintIcon from '@material-ui/icons/Fingerprint';
import PublicIcon from '@material-ui/icons/Public';
import ConfirmationNumberIcon from '@material-ui/icons/ConfirmationNumber';
import AssessmentIcon from '@material-ui/icons/Assessment';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import ExploreIcon from '@material-ui/icons/Explore';
import SaveIcon from '@material-ui/icons/Save';
import DescriptionIcon from '@material-ui/icons/Description';
import LinkIcon from '@material-ui/icons/Link';
import PersonIcon from '@material-ui/icons/Person';
import AdvancedFilter, {
  UnmemoisedAdvancedFilter,
} from './advancedFilter.component';

describe('AdvancedFilter', () => {
  let shallow;

  beforeEach(() => {
    shallow = createShallow();
  });

  it('shows title correctly', () => {
    const wrapper = shallow(
      <UnmemoisedAdvancedFilter
        title={{
          label: 'Test',
          dataKey: 'TEST',
          filterComponent: jest.fn(),
        }}
      />
    );

    // Click on the link to show the filters.
    wrapper
      .find('[data-testid="advanced-filters-link"]')
      .first()
      .simulate('click');
    wrapper.update();

    expect(wrapper.find('[children="Test"]').exists()).toBe(true);
    expect(
      wrapper.find('[data-testid="advanced-filters-link"]').text()
    ).toEqual('advanced_filters.hide');
  });

  it('shows title correctly when no label provided', () => {
    const wrapper = shallow(
      <UnmemoisedAdvancedFilter
        title={{
          dataKey: 'TEST',
          filterComponent: jest.fn(),
        }}
      />
    );

    // Click on the link to show the filters.
    wrapper
      .find('[data-testid="advanced-filters-link"]')
      .first()
      .simulate('click');
    wrapper.update();

    expect(wrapper.find('[children="TEST"]').exists()).toBe(true);
    expect(
      wrapper.find('[data-testid="advanced-filters-link"]').text()
    ).toEqual('advanced_filters.hide');
  });

  it('shows description correctly', () => {
    const wrapper = shallow(
      <UnmemoisedAdvancedFilter
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
      .find('[data-testid="advanced-filters-link"]')
      .first()
      .simulate('click');
    wrapper.update();

    expect(wrapper.find('[children="Desc"]').exists()).toBe(true);
    expect(
      wrapper.find('[data-testid="advanced-filters-link"]').text()
    ).toEqual('advanced_filters.hide');
  });

  it('shows description correctly when no label provided', () => {
    const wrapper = shallow(
      <UnmemoisedAdvancedFilter
        title={{ dataKey: 'TEST' }}
        description={{
          dataKey: 'DESC',
          filterComponent: jest.fn(),
        }}
      />
    );

    // Click on the link to show the filters.
    wrapper
      .find('[data-testid="advanced-filters-link"]')
      .first()
      .simulate('click');
    wrapper.update();

    expect(wrapper.find('[children="DESC"]').exists()).toBe(true);
    expect(
      wrapper.find('[data-testid="advanced-filters-link"]').text()
    ).toEqual('advanced_filters.hide');
  });

  it('shows information correctly', () => {
    const wrapper = shallow(
      <UnmemoisedAdvancedFilter
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
      .find('[data-testid="advanced-filters-link"]')
      .first()
      .simulate('click');
    wrapper.update();

    expect(wrapper.find('[children="Info"]').exists()).toBe(true);
    expect(
      wrapper.find('[data-testid="advanced-filters-link"]').text()
    ).toEqual('advanced_filters.hide');
  });

  it('shows information correctly when label not provided', () => {
    const wrapper = shallow(
      <UnmemoisedAdvancedFilter
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
      .find('[data-testid="advanced-filters-link"]')
      .first()
      .simulate('click');
    wrapper.update();

    expect(wrapper.find('[children="INFO"]').exists()).toBe(true);
    expect(
      wrapper.find('[data-testid="advanced-filters-link"]').text()
    ).toEqual('advanced_filters.hide');
  });

  it('SubjectIcon displays correctly', () => {
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
      .find('[data-testid="advanced-filters-link"]')
      .first()
      .simulate('click');
    wrapper.update();
    expect(wrapper.exists(SubjectIcon)).toBeTruthy();
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
      .find('[data-testid="advanced-filters-link"]')
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
      .find('[data-testid="advanced-filters-link"]')
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
      .find('[data-testid="advanced-filters-link"]')
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
      .find('[data-testid="advanced-filters-link"]')
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
      .find('[data-testid="advanced-filters-link"]')
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
      .find('[data-testid="advanced-filters-link"]')
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
      .find('[data-testid="advanced-filters-link"]')
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
      .find('[data-testid="advanced-filters-link"]')
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
      .find('[data-testid="advanced-filters-link"]')
      .first()
      .simulate('click');
    wrapper.update();
    expect(wrapper.exists(LinkIcon)).toBeTruthy();
  });

  it('LinkIcon displays correctly', () => {
    const wrapper = shallow(
      <AdvancedFilter
        title={{
          label: 'advanced_filters.icons.person',
          dataKey: 'TEST',
          filterComponent: jest.fn(),
        }}
      />
    );
    // Click on the link to show the filters.
    wrapper
      .find('[data-testid="advanced-filters-link"]')
      .first()
      .simulate('click');
    wrapper.update();
    expect(wrapper.exists(PersonIcon)).toBeTruthy();
  });
});
