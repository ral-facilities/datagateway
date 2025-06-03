import { FiltersType } from 'datagateway-common';
import { render, screen, within } from '@testing-library/react';
import SelectedFilterChips from './selectedFilterChips.component';
import userEvent from '@testing-library/user-event';

const testFilters: FiltersType = {
  'unrelated.dimension': {
    type: 'include',
    value: 'asd',
  },
  'unrelated.dimension.2': [{ label: 'asd', key: 'key', filter: [] }],
  'investigation.type.name': ['experiment'],
  'investigationparameter.type.name': ['bcat_123'],
};

describe('selectedFilterChips', () => {
  it('renders the given filters as chips', () => {
    render(
      <SelectedFilterChips filters={testFilters} onRemoveFilter={vi.fn()} />
    );

    expect(
      screen.getByText(
        'facetDimensionLabel.investigation.type.name: experiment'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'facetDimensionLabel.investigationparameter.type.name: bcat_123'
      )
    ).toBeInTheDocument();
  });

  it('calls the given callback function when chip is removed', async () => {
    const user = userEvent.setup();
    const onRemoveFilter = vi.fn();

    render(
      <SelectedFilterChips
        filters={testFilters}
        onRemoveFilter={onRemoveFilter}
      />
    );

    await user.click(
      within(
        screen.getByRole('button', {
          name: 'facetDimensionLabel.investigation.type.name: experiment',
        })
      ).getByTestId('CancelIcon')
    );

    expect(onRemoveFilter).toHaveBeenLastCalledWith(
      'investigation.type.name',
      'experiment'
    );

    await user.click(
      within(
        screen.getByRole('button', {
          name: 'facetDimensionLabel.investigationparameter.type.name: bcat_123',
        })
      ).getByTestId('CancelIcon')
    );

    expect(onRemoveFilter).toHaveBeenLastCalledWith(
      'investigationparameter.type.name',
      'bcat_123'
    );
  });
});
