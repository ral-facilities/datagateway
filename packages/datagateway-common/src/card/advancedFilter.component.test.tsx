import * as React from 'react';
import AdvancedFilter, {
  UnmemoisedAdvancedFilter,
} from './advancedFilter.component';
import { render, screen } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event/setup/setup';
import userEvent from '@testing-library/user-event';

describe('AdvancedFilter', () => {
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('shows title correctly', async () => {
    render(
      <UnmemoisedAdvancedFilter
        title={{
          label: 'Test',
          dataKey: 'TEST',
          filterComponent: jest.fn(),
        }}
      />
    );

    // Click on the link to show the filters.
    await user.click(
      await screen.findByRole('button', { name: 'advanced_filters.show' })
    );

    expect(await screen.findByText('Test')).toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: 'advanced_filters.hide' })
    ).toBeInTheDocument();
  });

  it('shows title correctly when no label provided', async () => {
    render(
      <UnmemoisedAdvancedFilter
        title={{
          dataKey: 'TEST',
          filterComponent: jest.fn(),
        }}
      />
    );

    // Click on the link to show the filters.
    await user.click(
      await screen.findByRole('button', { name: 'advanced_filters.show' })
    );

    expect(await screen.findByText('TEST')).toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: 'advanced_filters.hide' })
    ).toBeInTheDocument();
  });

  it('shows description correctly', async () => {
    render(
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
    await user.click(
      await screen.findByRole('button', { name: 'advanced_filters.show' })
    );

    expect(await screen.findByText('Desc')).toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: 'advanced_filters.hide' })
    ).toBeInTheDocument();
  });

  it('shows description correctly when no label provided', async () => {
    render(
      <UnmemoisedAdvancedFilter
        title={{ dataKey: 'TEST' }}
        description={{
          dataKey: 'DESC',
          filterComponent: jest.fn(),
        }}
      />
    );

    // Click on the link to show the filters.
    await user.click(
      await screen.findByRole('button', { name: 'advanced_filters.show' })
    );

    expect(await screen.findByText('DESC')).toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: 'advanced_filters.hide' })
    ).toBeInTheDocument();
  });

  it('shows information correctly', async () => {
    render(
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
    await user.click(
      await screen.findByRole('button', { name: 'advanced_filters.show' })
    );

    expect(await screen.findByText('Info')).toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: 'advanced_filters.hide' })
    ).toBeInTheDocument();
  });

  it('shows information correctly when label not provided', async () => {
    render(
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
    await user.click(
      await screen.findByRole('button', { name: 'advanced_filters.show' })
    );

    expect(await screen.findByText('INFO')).toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: 'advanced_filters.hide' })
    ).toBeInTheDocument();
  });

  it('SubjectIcon displays correctly', async () => {
    render(
      <AdvancedFilter
        title={{
          label: 'advanced_filters.icons.title',
          dataKey: 'TEST',
          filterComponent: jest.fn(),
        }}
      />
    );

    // Click on the link to show the filters.
    await user.click(
      await screen.findByRole('button', { name: 'advanced_filters.show' })
    );

    expect(await screen.findByTestId('SubjectIcon')).toBeInTheDocument();
  });

  it('FingerprintIcon displays correctly', async () => {
    render(
      <AdvancedFilter
        title={{
          label: 'advanced_filters.icons.fingerprint',
          dataKey: 'TEST',
          filterComponent: jest.fn(),
        }}
      />
    );

    // Click on the link to show the filters.
    await user.click(
      await screen.findByRole('button', { name: 'advanced_filters.show' })
    );

    expect(await screen.findByTestId('FingerprintIcon')).toBeInTheDocument();
  });

  it('PublicIcon displays correctly', async () => {
    render(
      <AdvancedFilter
        title={{
          label: 'advanced_filters.icons.public',
          dataKey: 'TEST',
          filterComponent: jest.fn(),
        }}
      />
    );

    // Click on the link to show the filters.
    // Click on the link to show the filters.
    await user.click(
      await screen.findByRole('button', { name: 'advanced_filters.show' })
    );

    expect(await screen.findByTestId('PublicIcon')).toBeInTheDocument();
  });

  it('ConfirmationNumberIcon displays correctly', async () => {
    render(
      <AdvancedFilter
        title={{
          label: 'advanced_filters.icons.confirmation_number',
          dataKey: 'TEST',
          filterComponent: jest.fn(),
        }}
      />
    );

    // Click on the link to show the filters.
    await user.click(
      await screen.findByRole('button', { name: 'advanced_filters.show' })
    );

    expect(
      await screen.findByTestId('ConfirmationNumberIcon')
    ).toBeInTheDocument();
  });

  it('AssessmentIcon displays correctly', async () => {
    render(
      <AdvancedFilter
        title={{
          label: 'advanced_filters.icons.assessment',
          dataKey: 'TEST',
          filterComponent: jest.fn(),
        }}
      />
    );

    // Click on the link to show the filters.
    await user.click(
      await screen.findByRole('button', { name: 'advanced_filters.show' })
    );

    expect(await screen.findByTestId('AssessmentIcon')).toBeInTheDocument();
  });

  it('CalendarTodayIcon displays correctly', async () => {
    render(
      <AdvancedFilter
        title={{
          label: 'advanced_filters.icons.calendar_today',
          dataKey: 'TEST',
          filterComponent: jest.fn(),
        }}
      />
    );

    // Click on the link to show the filters.
    await user.click(
      await screen.findByRole('button', { name: 'advanced_filters.show' })
    );

    expect(await screen.findByTestId('CalendarTodayIcon')).toBeInTheDocument();
  });

  it('ExploreIcon displays correctly', async () => {
    render(
      <AdvancedFilter
        title={{
          label: 'advanced_filters.icons.explore',
          dataKey: 'TEST',
          filterComponent: jest.fn(),
        }}
      />
    );

    // Click on the link to show the filters.
    await user.click(
      await screen.findByRole('button', { name: 'advanced_filters.show' })
    );

    expect(await screen.findByTestId('ExploreIcon')).toBeInTheDocument();
  });

  it('SaveIcon displays correctly', async () => {
    render(
      <AdvancedFilter
        title={{
          label: 'advanced_filters.icons.save',
          dataKey: 'TEST',
          filterComponent: jest.fn(),
        }}
      />
    );

    // Click on the link to show the filters.
    await user.click(
      await screen.findByRole('button', { name: 'advanced_filters.show' })
    );

    expect(await screen.findByTestId('SaveIcon')).toBeInTheDocument();
  });

  it('DescriptionIcon displays correctly', async () => {
    render(
      <AdvancedFilter
        title={{
          label: 'advanced_filters.icons.description',
          dataKey: 'TEST',
          filterComponent: jest.fn(),
        }}
      />
    );

    // Click on the link to show the filters.
    // Click on the link to show the filters.
    await user.click(
      await screen.findByRole('button', { name: 'advanced_filters.show' })
    );

    expect(await screen.findByTestId('DescriptionIcon')).toBeInTheDocument();
  });

  it('LinkIcon displays correctly', async () => {
    render(
      <AdvancedFilter
        title={{
          label: 'advanced_filters.icons.link',
          dataKey: 'TEST',
          filterComponent: jest.fn(),
        }}
      />
    );

    // Click on the link to show the filters.
    await user.click(
      await screen.findByRole('button', { name: 'advanced_filters.show' })
    );

    expect(await screen.findByTestId('LinkIcon')).toBeInTheDocument();
  });

  it('LinkIcon displays correctly', async () => {
    render(
      <AdvancedFilter
        title={{
          label: 'advanced_filters.icons.person',
          dataKey: 'TEST',
          filterComponent: jest.fn(),
        }}
      />
    );

    // Click on the link to show the filters.
    await user.click(
      await screen.findByRole('button', { name: 'advanced_filters.show' })
    );

    expect(await screen.findByTestId('PersonIcon')).toBeInTheDocument();
  });
});
