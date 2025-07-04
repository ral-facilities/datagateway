import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios, { AxiosResponse } from 'axios';
import { DatasearchType, dGCommonInitialState } from 'datagateway-common';
import * as React from 'react';
import { Provider } from 'react-redux';
import createMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import ParameterFilters from './parameterFilters.component';

describe('ParameterFilters', () => {
  const TEST_ENTITY_NAME: DatasearchType = 'Investigation';
  const TEST_PARAMETER_NAMES = ['bcat_inv_str', 'run_number_range'];
  const TEST_IDS = [123, 456, 789];

  function Wrapper({
    children,
  }: React.PropsWithChildren<unknown>): React.ReactElement {
    return (
      <Provider
        store={createMockStore([thunk])({
          dgcommon: dGCommonInitialState,
        })}
      >
        <QueryClientProvider client={new QueryClient()}>
          {children}
        </QueryClientProvider>
      </Provider>
    );
  }

  beforeEach(() => {
    axios.get = vi
      .fn()
      .mockImplementation((url: string): Promise<Partial<AxiosResponse>> => {
        if (/\/facet\/documents$/.test(url)) {
          return Promise.resolve({
            data: {
              results: [],
              dimensions: {
                investigationparameters: {
                  'PARAMETER STRING VALUE': 123,
                  'PARAMETER STRING VALUE 2': 456,
                },
              },
            },
          });
        }
        return Promise.reject(`Endpoint not mocked: ${url}`);
      });
  });

  it('shows selected parameter filters as a list and has a button to add a new filter', () => {
    render(
      <ParameterFilters
        entityName={TEST_ENTITY_NAME}
        parameterNames={TEST_PARAMETER_NAMES}
        allIds={TEST_IDS}
        selectedFilters={[
          {
            filter: [],
            key: 'InvestigationParameter.type.stringValue.bcat_inv_str',
            label: 'Test Label',
          },
        ]}
        onAddParameterFilter={vi.fn()}
        onRemoveParameterFilter={vi.fn()}
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

    // the add filter button should be shown
    expect(
      screen.getByRole('button', { name: 'parameterFilters.addFilter' })
    ).toBeInTheDocument();
  });

  it('shows an empty message when no parameter filters are selected', () => {
    render(
      <ParameterFilters
        entityName={TEST_ENTITY_NAME}
        parameterNames={TEST_PARAMETER_NAMES}
        allIds={TEST_IDS}
        selectedFilters={[
          'string-filter',
          { field: 'unrelated', from: 0, to: 1 },
        ]}
        onAddParameterFilter={vi.fn()}
        onRemoveParameterFilter={vi.fn()}
      />,
      {
        wrapper: Wrapper,
      }
    );

    expect(
      screen.queryByRole('list', {
        name: 'parameterFilters.selectedParameterFilterList',
      })
    ).toBeNull();
    expect(screen.getByText('parameterFilters.noFilters')).toBeInTheDocument();
  });

  it('shows/closes UI for creating new parameter filter', async () => {
    const user = userEvent.setup();

    render(
      <ParameterFilters
        entityName={TEST_ENTITY_NAME}
        parameterNames={TEST_PARAMETER_NAMES}
        allIds={TEST_IDS}
        selectedFilters={[]}
        onAddParameterFilter={vi.fn()}
        onRemoveParameterFilter={vi.fn()}
      />,
      {
        wrapper: Wrapper,
      }
    );

    expect(screen.queryByTestId('new-parameter-filter')).toBeNull();

    await user.click(
      screen.getByRole('button', { name: 'parameterFilters.addFilter' })
    );
    expect(screen.getByTestId('new-parameter-filter')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'parameterFilters.creator.close' })
    );
    expect(screen.queryByTestId('new-parameter-filter')).toBeNull();
  });

  it('updates parameter filter list when a new parameter filter is added', async () => {
    const user = userEvent.setup();
    const onAddParameterFilter = vi.fn();

    const { rerender } = render(
      <ParameterFilters
        entityName={TEST_ENTITY_NAME}
        parameterNames={TEST_PARAMETER_NAMES}
        allIds={TEST_IDS}
        selectedFilters={[]}
        onAddParameterFilter={onAddParameterFilter}
        onRemoveParameterFilter={vi.fn()}
      />,
      {
        wrapper: Wrapper,
      }
    );

    expect(
      screen.queryByRole('list', {
        name: 'parameterFilters.selectedParameterFilterList',
      })
    ).toBeNull();
    expect(screen.getByText('parameterFilters.noFilters')).toBeInTheDocument();

    // click on add filter button
    await user.click(
      screen.getByRole('button', { name: 'parameterFilters.addFilter' })
    );
    // open parameter name dropdown
    await user.click(
      screen.getByRole('button', {
        name: /parameterFilters.creator.labels.parameterNameSelect /i,
      })
    );
    // select bcat_inv_str as parameter name
    await user.selectOptions(
      screen.getByRole('listbox', {
        name: 'parameterFilters.creator.labels.parameterNameSelect',
      }),
      screen.getByRole('option', { name: 'bcat_inv_str' })
    );
    // open parameter value type dropdown
    await user.click(
      screen.getByRole('button', {
        name: /parameterFilters.creator.labels.parameterValueTypeSelect /i,
      })
    );
    // select string as value type
    await user.selectOptions(
      screen.getByRole('listbox', {
        name: 'parameterFilters.creator.labels.parameterValueTypeSelect',
      }),
      screen.getByRole('option', {
        name: 'parameterFilters.valueType.string',
      })
    );
    // open parameter string value dropdown
    await user.click(
      await screen.findByRole('button', {
        name: /parameterFilters.creator.labels.parameterStringSelect /i,
      })
    );
    // select PARAMETER STRING VALUE as the filter value
    await user.selectOptions(
      screen.getByRole('listbox', {
        name: 'parameterFilters.creator.labels.parameterStringSelect',
      }),
      screen.getByRole('option', { name: 'Filter by PARAMETER STRING VALUE' })
    );
    // click the add filter button
    await user.click(
      screen.getByRole('button', {
        name: 'parameterFilters.creator.addFilter',
      })
    );

    expect(onAddParameterFilter).toHaveBeenCalledWith(
      'InvestigationParameter',
      {
        key: `InvestigationParameter.stringValue.bcat_inv_str`,
        label: 'PARAMETER STRING VALUE',
        filter: [
          { field: 'stringValue', value: 'PARAMETER STRING VALUE' },
          { field: 'type.name', value: 'bcat_inv_str' },
        ],
      }
    );

    // rerender component to pretend the filter is added
    rerender(
      <ParameterFilters
        entityName={TEST_ENTITY_NAME}
        parameterNames={TEST_PARAMETER_NAMES}
        allIds={TEST_IDS}
        selectedFilters={[
          {
            filter: [],
            key: 'InvestigationParameter.stringValue.bcat_inv_str',
            label: 'PARAMETER STRING VALUE',
          },
        ]}
        onAddParameterFilter={onAddParameterFilter}
        onRemoveParameterFilter={vi.fn()}
      />
    );

    const selectedParameterFilterList = screen.getByRole('list', {
      name: 'parameterFilters.selectedParameterFilterList',
    });
    const parameterFilterItems = within(
      selectedParameterFilterList
    ).getAllByRole('listitem');

    expect(selectedParameterFilterList).toBeInTheDocument();
    expect(parameterFilterItems).toHaveLength(1);
    expect(
      within(parameterFilterItems[0]).getByText(
        'bcat_inv_str: PARAMETER STRING VALUE'
      )
    ).toBeInTheDocument();
  });

  it('updates parameter filter list when a parameter filter is removed', async () => {
    const user = userEvent.setup();
    const onRemoveParameterFilter = vi.fn();

    const { rerender } = render(
      <ParameterFilters
        entityName={TEST_ENTITY_NAME}
        parameterNames={TEST_PARAMETER_NAMES}
        allIds={TEST_IDS}
        selectedFilters={[
          {
            filter: [],
            key: 'InvestigationParameter.stringValue.bcat_inv_str',
            label: 'PARAMETER STRING VALUE',
          },
        ]}
        onAddParameterFilter={vi.fn()}
        onRemoveParameterFilter={onRemoveParameterFilter}
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

    expect(parameterFilterItems).toHaveLength(1);

    await user.click(
      within(parameterFilterItems[0]).getByRole('button', {
        name: 'parameterFilters.removeFilter {filterLabel:bcat_inv_str: PARAMETER STRING VALUE}',
      })
    );

    expect(onRemoveParameterFilter).toHaveBeenCalledWith(
      'InvestigationParameter',
      {
        filter: [],
        key: 'InvestigationParameter.stringValue.bcat_inv_str',
        label: 'PARAMETER STRING VALUE',
      }
    );

    rerender(
      <ParameterFilters
        entityName={TEST_ENTITY_NAME}
        parameterNames={TEST_PARAMETER_NAMES}
        allIds={TEST_IDS}
        selectedFilters={[]}
        onAddParameterFilter={vi.fn()}
        onRemoveParameterFilter={onRemoveParameterFilter}
      />
    );

    expect(
      screen.queryByRole('list', {
        name: 'parameterFilters.selectedParameterFilterList',
      })
    ).toBeNull();
    expect(screen.getByText('parameterFilters.noFilters')).toBeInTheDocument();
  });
});
