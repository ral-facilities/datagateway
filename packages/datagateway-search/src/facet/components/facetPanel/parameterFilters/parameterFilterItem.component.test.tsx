import * as React from 'react';
import { NestedFilter } from 'datagateway-common';
import { render, screen } from '@testing-library/react';
import ParameterFilterItem from './parameterFilterItem.component';
import userEvent from '@testing-library/user-event';

describe('ParameterFilterItem', () => {
  const TEST_PARAMETER_FILTER: NestedFilter = {
    filter: [],
    key: 'investigationparameter.stringValue.bcat_inv_str',
    label: 'Team ROQ - RAL',
  };

  it('shows the label of the given parameter filter and a remove button to remove the filter', () => {
    render(
      <ParameterFilterItem
        filter={TEST_PARAMETER_FILTER}
        onRemove={jest.fn()}
      />
    );

    expect(
      screen.getByText('bcat_inv_str: Team ROQ - RAL')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'parameterFilters.removeFilter {filterLabel:bcat_inv_str: Team ROQ - RAL}',
      })
    );
  });

  it('calls onRemove callback when the remove button is clicked', async () => {
    const user = userEvent.setup();
    const onRemove = jest.fn();

    render(
      <ParameterFilterItem filter={TEST_PARAMETER_FILTER} onRemove={onRemove} />
    );

    await user.click(
      screen.getByRole('button', {
        name: 'parameterFilters.removeFilter {filterLabel:bcat_inv_str: Team ROQ - RAL}',
      })
    );

    expect(onRemove).toHaveBeenCalledWith(TEST_PARAMETER_FILTER);
  });
});
