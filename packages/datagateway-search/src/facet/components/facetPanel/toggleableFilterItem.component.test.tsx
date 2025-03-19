import { render, screen, within } from '@testing-library/react';
import ToggleableFilterItem from './toggleableFilterItem.component';
import userEvent from '@testing-library/user-event';

const testClassificationLabel = 'experiment';
const testCount = 123;

describe('toggleableFilterItem', () => {
  it('renders the given classification label as a toggleable filter', () => {
    render(
      <ToggleableFilterItem
        classificationLabel={testClassificationLabel}
        count={testCount}
        selected={false}
        onSelect={jest.fn()}
      />
    );

    const item = screen.getByRole('button', { name: 'Add experiment filter' });
    expect(item).toBeInTheDocument();
    expect(item).toHaveAttribute('aria-selected', 'false');
    expect(within(item).getByText('experiment')).toBeInTheDocument();
    expect(within(item).getByText('123')).toBeInTheDocument();

    const checkbox = within(item).getByRole('checkbox', {
      name: 'Add experiment filter',
    });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('renders as selected if selected is true', () => {
    render(
      <ToggleableFilterItem
        selected
        classificationLabel={testClassificationLabel}
        count={testCount}
        onSelect={jest.fn()}
      />
    );

    const item = screen.getByRole('button', {
      name: 'Remove experiment filter',
    });
    expect(item).toBeInTheDocument();
    expect(item).toHaveAttribute('aria-selected', 'true');

    const checkbox = within(item).getByRole('checkbox', {
      name: 'Remove experiment filter',
    });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toBeChecked();
  });

  it('calls the given callback when toggled', async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();

    render(
      <ToggleableFilterItem
        selected={false}
        classificationLabel={testClassificationLabel}
        count={testCount}
        onSelect={onSelect}
      />
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Add experiment filter',
      })
    );
    expect(onSelect).toHaveBeenLastCalledWith('experiment', true);

    await user.click(
      screen.getByRole('checkbox', { name: 'Add experiment filter' })
    );
    expect(onSelect).toHaveBeenLastCalledWith('experiment', true);
  });
});
