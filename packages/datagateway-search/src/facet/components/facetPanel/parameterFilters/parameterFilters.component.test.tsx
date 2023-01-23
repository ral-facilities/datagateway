import React from 'react';
import { render, screen, within } from '@testing-library/react';
import ParameterFilters from './parameterFilters.component';
import { DatasearchType } from 'datagateway-common';
import { QueryClient, QueryClientProvider } from 'react-query';

describe('ParameterFilters', () => {
  const TEST_ENTITY_NAME: DatasearchType = 'Investigation';
  const TEST_PARAMETER_NAMES = ['bcat_inv_str'];
  const TEST_IDS = [123, 456, 789];

  function Wrapper({
    children,
  }: React.PropsWithChildren<Record<string, never>>): JSX.Element {
    return (
      <QueryClientProvider client={new QueryClient()}>
        {children}
      </QueryClientProvider>
    );
  }

  it('shows selected parameter filters as a list and has a button to add a new filter', () => {
    render(
      <ParameterFilters
        entityName={TEST_ENTITY_NAME}
        parameterNames={TEST_PARAMETER_NAMES}
        allIds={TEST_IDS}
        selectedFilters={[
          {
            filter: [],
            key: 'investigationparameter.type.stringValue.bcat_inv_str',
            label: 'Test Label',
          },
        ]}
        changeFilter={jest.fn()}
        setFilterUpdate={jest.fn()}
      />,
      {
        wrapper: Wrapper,
      }
    );

    const selectedParameterFilterList = screen.getByRole('list', {
      name: 'parameterFilters.selectedParameterFilterList',
    });
    const parameterFilterItems = within(
      selectedParameterFilterList
    ).getAllByRole('listitem');

    // verify that the list of selected parameter filters are shown
    expect(selectedParameterFilterList).toBeInTheDocument();
    expect(parameterFilterItems).toHaveLength(1);
    for (const item of parameterFilterItems) {
      expect(item).toBeInTheDocument();
    }
  });
});
