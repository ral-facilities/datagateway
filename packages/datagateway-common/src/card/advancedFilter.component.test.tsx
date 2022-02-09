import React from 'react';
import { shallow } from 'enzyme';
import TitleIcon from '@mui/icons-material/Title';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import PublicIcon from '@mui/icons-material/Public';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ExploreIcon from '@mui/icons-material/Explore';
import SaveIcon from '@mui/icons-material/Save';
import DescriptionIcon from '@mui/icons-material/Description';
import LinkIcon from '@mui/icons-material/Link';
import PersonIcon from '@mui/icons-material/Person';
import AdvancedFilter, {
  UnmemoisedAdvancedFilter,
} from './advancedFilter.component';

describe('AdvancedFilter', () => {
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
      .find('[data-testid="advanced-filters-link"]')
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
