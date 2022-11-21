import * as React from 'react';
import { render, screen, within } from '@testing-library/react';
import FacetPanel from './facetPanel.component';
import { FacetClassification } from '../../facet';
import userEvent from '@testing-library/user-event';

const testFacetClassification: FacetClassification = {
  'investigation.type.name': {
    experiment: 300,
    calibration: 200,
  },
  'investigationparameter.type.name': {
    bcat_inv_str: 299,
    run_number_range: 400,
  },
};

describe('facetPanel', () => {
  it('renders facets as list of accordions that expands to reveal filters', async () => {
    const user = userEvent.setup();

    render(
      <FacetPanel
        facetClassification={testFacetClassification}
        selectedFacetFilters={{}}
        onAddFilter={jest.fn()}
        onRemoveFilter={jest.fn()}
        onApplyFacetFilters={jest.fn()}
      />
    );

    expect(
      screen.getByRole('button', {
        name: 'Toggle facetDimensionLabel.investigation.type.name filter panel',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'Toggle facetDimensionLabel.investigationparameter.type.name filter panel',
      })
    ).toBeInTheDocument();

    // open investigation type filter panel
    await user.click(
      screen.getByRole('button', {
        name: 'Toggle facetDimensionLabel.investigation.type.name filter panel',
      })
    );

    const investigationTypeFilterPanel = screen.getByLabelText(
      'facetDimensionLabel.investigation.type.name filter panel'
    );
    expect(investigationTypeFilterPanel).toBeVisible();

    const experimentFilterItem = within(investigationTypeFilterPanel).getByRole(
      'button',
      { name: 'Add experiment filter' }
    );
    expect(
      within(experimentFilterItem).getByText('experiment')
    ).toBeInTheDocument();
    expect(within(experimentFilterItem).getByText('300')).toBeInTheDocument();

    const calibrationFilterItem = within(
      investigationTypeFilterPanel
    ).getByRole('button', { name: 'Add calibration filter' });
    expect(
      within(calibrationFilterItem).getByText('calibration')
    ).toBeInTheDocument();
    expect(within(calibrationFilterItem).getByText('200')).toBeInTheDocument();

    // close investigation type filter panel
    await user.click(
      screen.getByRole('button', {
        name: 'Toggle facetDimensionLabel.investigation.type.name filter panel',
      })
    );

    expect(
      screen.getByLabelText(
        'facetDimensionLabel.investigation.type.name filter panel'
      )
    ).not.toBeVisible();

    // open investigation parameter type filter panel
    await user.click(
      screen.getByRole('button', {
        name: 'Toggle facetDimensionLabel.investigationparameter.type.name filter panel',
      })
    );

    const investigationParamFilterPanel = screen.getByLabelText(
      'facetDimensionLabel.investigationparameter.type.name filter panel'
    );
    expect(investigationParamFilterPanel).toBeVisible();

    const bcatInvStrFilterItem = within(
      investigationParamFilterPanel
    ).getByRole('button', { name: 'Add bcat_inv_str filter' });
    expect(
      within(bcatInvStrFilterItem).getByText('bcat_inv_str')
    ).toBeInTheDocument();
    expect(within(bcatInvStrFilterItem).getByText('299')).toBeInTheDocument();

    const runNumberRangeFilterItem = within(
      investigationParamFilterPanel
    ).getByRole('button', { name: 'Add run_number_range filter' });
    expect(
      within(runNumberRangeFilterItem).getByText('run_number_range')
    ).toBeInTheDocument();
    expect(
      within(runNumberRangeFilterItem).getByText('400')
    ).toBeInTheDocument();

    // close investigation type filter panel
    await user.click(
      screen.getByRole('button', {
        name: 'Toggle facetDimensionLabel.investigationparameter.type.name filter panel',
      })
    );

    expect(
      screen.getByLabelText(
        'facetDimensionLabel.investigationparameter.type.name filter panel'
      )
    ).not.toBeVisible();
  });

  it('highlights selected filters', async () => {
    const user = userEvent.setup();

    render(
      <FacetPanel
        facetClassification={testFacetClassification}
        selectedFacetFilters={{
          'investigation.type.name': ['experiment'],
          'investigationparameter.type.name': ['bcat_inv_str'],
        }}
        onAddFilter={jest.fn()}
        onRemoveFilter={jest.fn()}
        onApplyFacetFilters={jest.fn()}
      />
    );

    // open investigation type filter panel
    await user.click(
      screen.getByRole('button', {
        name: 'Toggle facetDimensionLabel.investigation.type.name filter panel',
      })
    );

    const experimentFilterItem = within(
      screen.getByLabelText(
        'facetDimensionLabel.investigation.type.name filter panel'
      )
    ).getByRole('button', { name: 'Remove experiment filter' });
    expect(experimentFilterItem).toHaveAttribute('aria-selected', 'true');
    expect(within(experimentFilterItem).getByRole('checkbox')).toBeChecked();

    // open investigation parameter type filter panel
    await user.click(
      screen.getByRole('button', {
        name: 'Toggle facetDimensionLabel.investigationparameter.type.name filter panel',
      })
    );

    const bcatInvStrFilterItem = within(
      screen.getByLabelText(
        'facetDimensionLabel.investigationparameter.type.name filter panel'
      )
    ).getByRole('button', { name: 'Remove bcat_inv_str filter' });
    expect(bcatInvStrFilterItem).toHaveAttribute('aria-selected', 'true');
    expect(within(bcatInvStrFilterItem).getByRole('checkbox')).toBeChecked();
  });

  it('calls the given callback when a filter is added/removed', async () => {
    const user = userEvent.setup();
    const onAddFilter = jest.fn();
    const onRemoveFilter = jest.fn();

    render(
      <FacetPanel
        facetClassification={testFacetClassification}
        selectedFacetFilters={{
          'investigation.type.name': ['experiment'],
          'investigationparameter.type.name': ['bcat_inv_str'],
        }}
        onAddFilter={onAddFilter}
        onRemoveFilter={onRemoveFilter}
        onApplyFacetFilters={jest.fn()}
      />
    );

    // open investigation type filter panel
    await user.click(
      screen.getByRole('button', {
        name: 'Toggle facetDimensionLabel.investigation.type.name filter panel',
      })
    );
    // open investigation parameter type filter panel
    await user.click(
      screen.getByRole('button', {
        name: 'Toggle facetDimensionLabel.investigationparameter.type.name filter panel',
      })
    );

    const experimentFilterItem = within(
      screen.getByLabelText(
        'facetDimensionLabel.investigation.type.name filter panel'
      )
    ).getByRole('button', { name: 'Remove experiment filter' });
    await user.click(experimentFilterItem);

    expect(onRemoveFilter).toHaveBeenLastCalledWith(
      'investigation.type.name',
      'experiment'
    );

    const runNumberRangeFilterItem = within(
      screen.getByLabelText(
        'facetDimensionLabel.investigationparameter.type.name filter panel'
      )
    ).getByRole('button', { name: 'Add run_number_range filter' });
    await user.click(runNumberRangeFilterItem);

    expect(onAddFilter).toHaveBeenLastCalledWith(
      'investigationparameter.type.name',
      'run_number_range'
    );
  });

  it('calls the given callback when filters are applied', async () => {
    const onApplyFacetFilters = jest.fn();
    const user = userEvent.setup();

    render(
      <FacetPanel
        facetClassification={testFacetClassification}
        selectedFacetFilters={{
          'investigation.type.name': ['experiment'],
          'investigationparameter.type.name': ['bcat_inv_str'],
        }}
        onAddFilter={jest.fn()}
        onRemoveFilter={jest.fn()}
        onApplyFacetFilters={onApplyFacetFilters}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(onApplyFacetFilters).toHaveBeenCalledTimes(1);
  });
});
