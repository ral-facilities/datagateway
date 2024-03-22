import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { Provider } from 'react-redux';
import createMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { DatasearchType, dGCommonInitialState } from 'datagateway-common';
import { QueryClient, QueryClientProvider } from 'react-query';
import NewParameterFilterCreator from './newParameterFilterCreator.component';
import axios, { AxiosResponse } from 'axios';

describe('NewParameterFilterCreator', () => {
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
    axios.get = jest
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

  it('shows parameter name and value type dropdown and a disabled add filter button initially', () => {
    render(
      <NewParameterFilterCreator
        entityName={TEST_ENTITY_NAME}
        parameterNames={TEST_PARAMETER_NAMES}
        allIds={TEST_IDS}
        onAddFilter={jest.fn()}
        onClose={jest.fn()}
      />,
      {
        wrapper: Wrapper,
      }
    );

    expect(
      screen.getByRole('button', {
        // have to use regex with case-insensitive option here instead of regular string
        // because for some reason even though testing-library *says* it can't find the element by string
        // in the actual error message it shows the matching element with the exact same label and casing
        // but somehow this works
        name: /parameterFilters.creator.labels.parameterNameSelect /i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: /parameterFilters.creator.labels.parameterValueTypeSelect /i,
      })
    ).toBeInTheDocument();

    const addFilterButton = screen.getByRole('button', {
      name: 'parameterFilters.creator.addFilter',
    });
    expect(addFilterButton).toBeInTheDocument();
    expect(addFilterButton).toBeDisabled();
  });

  it('shows help message when neither parameter name nor parameter value type is selected', () => {
    render(
      <NewParameterFilterCreator
        entityName={TEST_ENTITY_NAME}
        parameterNames={TEST_PARAMETER_NAMES}
        allIds={TEST_IDS}
        onAddFilter={jest.fn()}
        onClose={jest.fn()}
      />,
      {
        wrapper: Wrapper,
      }
    );

    expect(
      screen.getByText(
        'parameterFilters.creator.message.parameterNameAndTypeNotSelected'
      )
    ).toBeInTheDocument();
  });

  it("shows help message when parameter name is selected but parameter value type isn't", async () => {
    const user = userEvent.setup();

    render(
      <NewParameterFilterCreator
        entityName={TEST_ENTITY_NAME}
        parameterNames={TEST_PARAMETER_NAMES}
        allIds={TEST_IDS}
        onAddFilter={jest.fn()}
        onClose={jest.fn()}
      />,
      {
        wrapper: Wrapper,
      }
    );

    await user.click(
      screen.getByRole('button', {
        // have to use regex with case-insensitive option here instead of regular string
        // because for some reason even though testing-library *says* it can't find the element by string
        // in the actual error message it shows the matching element with the exact same label and casing
        // but somehow this works
        name: /parameterFilters.creator.labels.parameterNameSelect /i,
      })
    );
    await user.selectOptions(
      screen.getByRole('listbox', {
        name: 'parameterFilters.creator.labels.parameterNameSelect',
      }),
      screen.getByRole('option', { name: 'bcat_inv_str' })
    );

    expect(
      await screen.findByText(
        'parameterFilters.creator.message.parameterTypeNotSelected'
      )
    ).toBeInTheDocument();
  });

  it("shows help message when parameter type is selected but parameter name isn't", async () => {
    const user = userEvent.setup();

    render(
      <NewParameterFilterCreator
        entityName={TEST_ENTITY_NAME}
        parameterNames={TEST_PARAMETER_NAMES}
        allIds={TEST_IDS}
        onAddFilter={jest.fn()}
        onClose={jest.fn()}
      />,
      {
        wrapper: Wrapper,
      }
    );

    await user.click(
      screen.getByRole('button', {
        // have to use regex with case-insensitive option here instead of regular string
        // because for some reason even though testing-library *says* it can't find the element by string
        // in the actual error message it shows the matching element with the exact same label and casing
        // but somehow this works
        name: /parameterFilters.creator.labels.parameterValueTypeSelect /i,
      })
    );
    await user.selectOptions(
      screen.getByRole('listbox', {
        name: 'parameterFilters.creator.labels.parameterValueTypeSelect',
      }),
      screen.getByRole('option', {
        name: 'parameterFilters.valueType.dateTime',
      })
    );

    expect(
      await screen.findByText(
        'parameterFilters.creator.message.parameterNameNotSelected'
      )
    ).toBeInTheDocument();
  });

  it('shows appropriate parameter value selector depending on the selected parameter type', async () => {
    const user = userEvent.setup();

    render(
      <NewParameterFilterCreator
        entityName={TEST_ENTITY_NAME}
        parameterNames={TEST_PARAMETER_NAMES}
        allIds={TEST_IDS}
        onAddFilter={jest.fn()}
        onClose={jest.fn()}
      />,
      {
        wrapper: Wrapper,
      }
    );

    // select parameter name
    await user.click(
      screen.getByRole('button', {
        name: /parameterFilters.creator.labels.parameterNameSelect /i,
      })
    );
    await user.selectOptions(
      screen.getByRole('listbox', {
        name: 'parameterFilters.creator.labels.parameterNameSelect',
      }),
      screen.getByRole('option', { name: 'bcat_inv_str' })
    );
    // select parameter value type
    await user.click(
      screen.getByRole('button', {
        name: /parameterFilters.creator.labels.parameterValueTypeSelect /i,
      })
    );

    await user.selectOptions(
      screen.getByRole('listbox', {
        name: 'parameterFilters.creator.labels.parameterValueTypeSelect',
      }),
      screen.getByRole('option', {
        name: 'parameterFilters.valueType.dateTime',
      })
    );
    expect(
      screen.getByTestId('parameter-date-time-selector')
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: /parameterFilters.creator.labels.parameterValueTypeSelect /i,
      })
    );
    await user.selectOptions(
      screen.getByRole('listbox', {
        name: 'parameterFilters.creator.labels.parameterValueTypeSelect',
      }),
      screen.getByRole('option', {
        name: 'parameterFilters.valueType.numeric',
      })
    );
    expect(
      screen.getByTestId('parameter-numeric-range-selector')
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: /parameterFilters.creator.labels.parameterValueTypeSelect /i,
      })
    );
    await user.selectOptions(
      screen.getByRole('listbox', {
        name: 'parameterFilters.creator.labels.parameterValueTypeSelect',
      }),
      screen.getByRole('option', {
        name: 'parameterFilters.valueType.string',
      })
    );
    expect(screen.getByTestId('parameter-facet-list')).toBeInTheDocument();
  });

  it('calls onAddFilter callback when a filter is added', async () => {
    const user = userEvent.setup();
    const onAddFilter = jest.fn();

    render(
      <NewParameterFilterCreator
        entityName={TEST_ENTITY_NAME}
        parameterNames={TEST_PARAMETER_NAMES}
        allIds={TEST_IDS}
        onAddFilter={onAddFilter}
        onClose={jest.fn()}
      />,
      {
        wrapper: Wrapper,
      }
    );

    // select parameter name
    await user.click(
      screen.getByRole('button', {
        name: /parameterFilters.creator.labels.parameterNameSelect /i,
      })
    );
    await user.selectOptions(
      screen.getByRole('listbox', {
        name: 'parameterFilters.creator.labels.parameterNameSelect',
      }),
      screen.getByRole('option', { name: 'bcat_inv_str' })
    );
    // select parameter value type
    await user.click(
      screen.getByRole('button', {
        name: /parameterFilters.creator.labels.parameterValueTypeSelect /i,
      })
    );
    await user.selectOptions(
      screen.getByRole('listbox', {
        name: 'parameterFilters.creator.labels.parameterValueTypeSelect',
      }),
      screen.getByRole('option', {
        name: 'parameterFilters.valueType.string',
      })
    );

    await user.click(
      screen.getByRole('button', {
        name: /parameterFilters.creator.labels.parameterStringSelect /i,
      })
    );
    await user.selectOptions(
      screen.getByRole('listbox', {
        name: 'parameterFilters.creator.labels.parameterStringSelect',
      }),
      screen.getByRole('option', {
        name: 'Filter by PARAMETER STRING VALUE',
      })
    );

    const addFilterButton = screen.getByRole('button', {
      name: 'parameterFilters.creator.addFilter',
    });
    expect(addFilterButton).toBeEnabled();
    await user.click(addFilterButton);

    expect(onAddFilter).toHaveBeenCalledWith('InvestigationParameter', {
      key: `InvestigationParameter.stringValue.bcat_inv_str`,
      label: 'PARAMETER STRING VALUE',
      filter: [
        { field: 'stringValue', value: 'PARAMETER STRING VALUE' },
        { field: 'type.name', value: 'bcat_inv_str' },
      ],
    });
  });

  it('resets parameter filter when requested by the parameter value selector', async () => {
    const user = userEvent.setup();
    const onAddFilter = jest.fn();

    render(
      <NewParameterFilterCreator
        entityName={TEST_ENTITY_NAME}
        parameterNames={TEST_PARAMETER_NAMES}
        allIds={TEST_IDS}
        onAddFilter={onAddFilter}
        onClose={jest.fn()}
      />,
      {
        wrapper: Wrapper,
      }
    );

    // select parameter name
    await user.click(
      screen.getByRole('button', {
        name: /parameterFilters.creator.labels.parameterNameSelect /i,
      })
    );
    await user.selectOptions(
      screen.getByRole('listbox', {
        name: 'parameterFilters.creator.labels.parameterNameSelect',
      }),
      screen.getByRole('option', { name: 'run_number_range' })
    );
    // select parameter value type
    await user.click(
      screen.getByRole('button', {
        name: /parameterFilters.creator.labels.parameterValueTypeSelect /i,
      })
    );
    await user.selectOptions(
      screen.getByRole('listbox', {
        name: 'parameterFilters.creator.labels.parameterValueTypeSelect',
      }),
      screen.getByRole('option', {
        name: 'parameterFilters.valueType.numeric',
      })
    );

    // insert valid numeric range so that a filter object can be created
    await user.type(
      screen.getByRole('spinbutton', {
        name: 'parameterFilters.creator.labels.parameterNumericRange.min',
      }),
      '1'
    );
    await user.type(
      screen.getByRole('spinbutton', {
        name: 'parameterFilters.creator.labels.parameterNumericRange.max',
      }),
      '1'
    );

    expect(
      screen.getByRole('button', { name: 'parameterFilters.creator.addFilter' })
    ).toBeEnabled();

    // now insert invalid numeric range, the creator should reset the filter value and disable the add filter button
    await user.type(
      screen.getByRole('spinbutton', {
        name: 'parameterFilters.creator.labels.parameterNumericRange.min',
      }),
      '11'
    );

    expect(
      screen.getByRole('button', { name: 'parameterFilters.creator.addFilter' })
    ).toBeDisabled();
    expect(onAddFilter).not.toHaveBeenCalled();
  });
});
