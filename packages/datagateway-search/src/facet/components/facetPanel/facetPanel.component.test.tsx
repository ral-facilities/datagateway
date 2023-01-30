import * as React from 'react';
import { render, screen, within } from '@testing-library/react';
import FacetPanel from './facetPanel.component';
import { FacetClassification } from '../../facet';
import userEvent from '@testing-library/user-event';
import { DatasearchType } from 'datagateway-common';

describe('facetPanel', () => {
  const TEST_FACET_CLASSIFICATION: FacetClassification = {
    'investigation.type.name': {
      experiment: 300,
      calibration: 200,
    },
    'investigationparameter.type.name': {
      bcat_inv_str: 299,
      run_number_range: 400,
    },
  };
  const TEST_ENTITY_NAME: DatasearchType = 'Investigation';
  const TEST_IDS = [123, 456, 789];

  it('renders facets as list of accordions that expands to reveal filters', async () => {
    const user = userEvent.setup();

    render(
      <FacetPanel
        entityName={TEST_ENTITY_NAME}
        allIds={TEST_IDS}
        facetClassification={TEST_FACET_CLASSIFICATION}
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
        entityName={TEST_ENTITY_NAME}
        allIds={TEST_IDS}
        facetClassification={TEST_FACET_CLASSIFICATION}
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

  it('reflects the changes when a filter is added', async () => {
    const user = userEvent.setup();
    const onAddFilter = jest.fn();

    const { rerender } = render(
      <FacetPanel
        entityName={TEST_ENTITY_NAME}
        allIds={TEST_IDS}
        facetClassification={TEST_FACET_CLASSIFICATION}
        selectedFacetFilters={{
          'investigation.type.name': ['experiment'],
          'investigationparameter.type.name': ['bcat_inv_str'],
        }}
        onAddFilter={onAddFilter}
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
    // open investigation parameter type filter panel
    await user.click(
      screen.getByRole('button', {
        name: 'Toggle facetDimensionLabel.investigationparameter.type.name filter panel',
      })
    );
    await user.click(
      within(
        screen.getByLabelText(
          'facetDimensionLabel.investigation.type.name filter panel'
        )
      ).getByRole('button', { name: 'Add calibration filter' })
    );

    rerender(
      <FacetPanel
        entityName={TEST_ENTITY_NAME}
        allIds={TEST_IDS}
        facetClassification={TEST_FACET_CLASSIFICATION}
        selectedFacetFilters={{
          'investigation.type.name': ['experiment', 'calibration'],
          'investigationparameter.type.name': ['bcat_inv_str'],
        }}
        onAddFilter={onAddFilter}
        onRemoveFilter={jest.fn()}
        onApplyFacetFilters={jest.fn()}
      />
    );

    expect(onAddFilter).toHaveBeenLastCalledWith(
      'investigation.type.name',
      'calibration'
    );

    const investigationFilterPanel = within(
      screen.getByLabelText(
        'facetDimensionLabel.investigation.type.name filter panel'
      )
    );
    expect(
      investigationFilterPanel.queryByRole('button', {
        name: 'Add calibration filter',
      })
    ).toBeNull();
    expect(
      investigationFilterPanel.getByRole('button', {
        name: 'Remove calibration filter',
      })
    ).toBeInTheDocument();
  });

  it('reflects the changes when a filter is removed', async () => {
    const user = userEvent.setup();
    const onRemoveFilter = jest.fn();

    const { rerender } = render(
      <FacetPanel
        entityName={TEST_ENTITY_NAME}
        allIds={TEST_IDS}
        facetClassification={TEST_FACET_CLASSIFICATION}
        selectedFacetFilters={{
          'investigation.type.name': ['experiment'],
          'investigationparameter.type.name': ['bcat_inv_str'],
        }}
        onAddFilter={jest.fn()}
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

    // pretend the selected filters are updated
    rerender(
      <FacetPanel
        entityName={TEST_ENTITY_NAME}
        allIds={TEST_IDS}
        facetClassification={TEST_FACET_CLASSIFICATION}
        selectedFacetFilters={{
          'investigationparameter.type.name': ['bcat_inv_str'],
        }}
        onAddFilter={jest.fn()}
        onRemoveFilter={onRemoveFilter}
        onApplyFacetFilters={jest.fn()}
      />
    );

    expect(onRemoveFilter).toHaveBeenLastCalledWith(
      'investigation.type.name',
      'experiment'
    );

    expect(
      within(
        screen.getByLabelText(
          'facetDimensionLabel.investigation.type.name filter panel'
        )
      ).queryByRole('button', { name: 'Remove experiment filter' })
    ).toBeNull();
    expect(
      within(
        screen.getByLabelText(
          'facetDimensionLabel.investigation.type.name filter panel'
        )
      ).getByRole('button', { name: 'Add experiment filter' })
    ).toBeInTheDocument();
  });

  it('calls the given callback when filters are applied', async () => {
    const onApplyFacetFilters = jest.fn();
    const user = userEvent.setup();

    render(
      <FacetPanel
        entityName={TEST_ENTITY_NAME}
        allIds={TEST_IDS}
        facetClassification={TEST_FACET_CLASSIFICATION}
        selectedFacetFilters={{
          'investigation.type.name': ['experiment'],
          'investigationparameter.type.name': ['bcat_inv_str'],
        }}
        onAddFilter={jest.fn()}
        onRemoveFilter={jest.fn()}
        onApplyFacetFilters={onApplyFacetFilters}
      />
    );

    await user.click(screen.getByRole('button', { name: 'facetPanel.apply' }));

    expect(onApplyFacetFilters).toHaveBeenCalledTimes(1);
  });

  describe('shows parameter filter', () => {
    it('for investigation parameters', async () => {
      const user = userEvent.setup();

      render(
        <FacetPanel
          entityName="Investigation"
          allIds={TEST_IDS}
          facetClassification={TEST_FACET_CLASSIFICATION}
          selectedFacetFilters={{
            'investigation.type.name': ['experiment'],
            'investigationparameter.type.name': ['bcat_inv_str'],
          }}
          onAddFilter={jest.fn()}
          onRemoveFilter={jest.fn()}
          onApplyFacetFilters={jest.fn()}
        />
      );

      // open investigation parameter type filter panel
      await user.click(
        screen.getByRole('button', {
          name: 'Toggle facetDimensionLabel.investigationparameter.type.name filter panel',
        })
      );

      expect(screen.getByTestId('parameter-filters')).toBeInTheDocument();
    });

    it('for dataset parameters', async () => {
      const user = userEvent.setup();

      render(
        <FacetPanel
          entityName="Dataset"
          allIds={TEST_IDS}
          facetClassification={{
            'datasetparameter.type.name': {
              bcat_inv_str: 299,
              run_number_range: 400,
            },
          }}
          selectedFacetFilters={{}}
          onAddFilter={jest.fn()}
          onRemoveFilter={jest.fn()}
          onApplyFacetFilters={jest.fn()}
        />
      );

      // open dataset parameter type filter panel
      await user.click(
        screen.getByRole('button', {
          name: 'Toggle facetDimensionLabel.datasetparameter.type.name filter panel',
        })
      );

      expect(screen.getByTestId('parameter-filters')).toBeInTheDocument();
    });

    it('for datafile parameters', async () => {
      const user = userEvent.setup();

      render(
        <FacetPanel
          entityName="Datafile"
          allIds={TEST_IDS}
          facetClassification={{
            'datafileparameter.type.name': {
              bcat_inv_str: 299,
              run_number_range: 400,
            },
          }}
          selectedFacetFilters={{}}
          onAddFilter={jest.fn()}
          onRemoveFilter={jest.fn()}
          onApplyFacetFilters={jest.fn()}
        />
      );

      // open datafile parameter type filter panel
      await user.click(
        screen.getByRole('button', {
          name: 'Toggle facetDimensionLabel.datafileparameter.type.name filter panel',
        })
      );

      expect(screen.getByTestId('parameter-filters')).toBeInTheDocument();
    });
  });

  it('shows selected parameter filters in the parameter name filter panel', async () => {
    const user = userEvent.setup();

    render(
      <FacetPanel
        entityName={TEST_ENTITY_NAME}
        allIds={TEST_IDS}
        facetClassification={TEST_FACET_CLASSIFICATION}
        selectedFacetFilters={{
          'investigation.type.name': ['experiment'],
          'investigationparameter.type.name': ['bcat_inv_str'],
          investigationparameter: [
            {
              filter: [],
              key: 'investigationparameter.type.stringValue.bcat_inv_str',
              label: 'Test Label',
            },
          ],
        }}
        onAddFilter={jest.fn()}
        onRemoveFilter={jest.fn()}
        onApplyFacetFilters={jest.fn()}
      />
    );

    // open datafile parameter type filter panel
    await user.click(
      screen.getByRole('button', {
        name: 'Toggle facetDimensionLabel.investigationparameter.type.name filter panel',
      })
    );

    const selectedParameterFilterList = screen.getByRole('list', {
      name: 'parameterFilters.selectedParameterFilterList',
    });
    const listItems = within(selectedParameterFilterList).getAllByRole(
      'listitem'
    );

    expect(selectedParameterFilterList).toBeInTheDocument();
    expect(listItems).toHaveLength(1);
    expect(
      within(listItems[0]).getByText('bcat_inv_str: Test Label')
    ).toBeInTheDocument();
  });
});
