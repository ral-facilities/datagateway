import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios, { AxiosResponse } from 'axios';
import { DatasearchType, dGCommonInitialState } from 'datagateway-common';
import * as React from 'react';
import { Provider } from 'react-redux';
import createMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import ParameterDateTimeSelector from './parameterDateTimeSelector.component';

describe('ParameterDateTimeSelector', () => {
  const TEST_ENTITY_NAME: DatasearchType = 'Investigation';
  const TEST_PARAMETER_NAME = 'bcat_inv_str';
  const TEST_IDS = [123, 456, 789];

  let user: ReturnType<typeof userEvent.setup>;

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
    user = userEvent.setup();

    axios.get = vi
      .fn()
      .mockImplementation((url: string): Promise<Partial<AxiosResponse>> => {
        if (/\/facet\/documents$/.test(url)) {
          return Promise.resolve({
            data: {
              results: [],
              dimensions: {
                investigationparameters: {
                  '2020': {
                    count: 123,
                    from: 10,
                    to: 20,
                  },
                  '2021': {
                    count: 456,
                    from: 20,
                    to: 30,
                  },
                },
              },
            },
          });
        }
        return Promise.reject(`Endpoint not mocked: ${url}`);
      });
  });

  it('displays the list of available date time value options in a dropdown menu', async () => {
    render(
      <ParameterDateTimeSelector
        entityName={TEST_ENTITY_NAME}
        parameterName={TEST_PARAMETER_NAME}
        allIds={TEST_IDS}
        onNewFilter={vi.fn()}
        onResetFilter={vi.fn()}
      />,
      { wrapper: Wrapper }
    );

    await user.click(
      await screen.findByRole('button', {
        name: /parameterFilters.creator.labels.parameterDateTimeSelect /i,
      })
    );

    expect(
      screen.getByRole('listbox', {
        name: 'parameterFilters.creator.labels.parameterDateTimeSelect',
      })
    ).toBeInTheDocument();

    const option2020 = screen.getByRole('option', { name: 'Filter by 2020' });
    expect(option2020).toBeInTheDocument();
    expect(within(option2020).getByText('123')).toBeInTheDocument();

    const option2021 = screen.getByRole('option', { name: 'Filter by 2021' });
    expect(option2021).toBeInTheDocument();
    expect(within(option2021).getByText('456')).toBeInTheDocument();
  });

  it('shows loading when loading the list of available date time options', () => {
    axios.get = vi.fn().mockImplementation(
      () =>
        new Promise((_resolve) => {
          // never resolve the promise to pretend it is loading
        })
    );

    render(
      <ParameterDateTimeSelector
        entityName={TEST_ENTITY_NAME}
        parameterName={TEST_PARAMETER_NAME}
        allIds={TEST_IDS}
        onNewFilter={vi.fn()}
        onResetFilter={vi.fn()}
      />,
      { wrapper: Wrapper }
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(
      screen.getByText('parameterFilters.creator.loading')
    ).toBeInTheDocument();
  });

  it('calls onNewFilter and shows the selected option when an option is selected ', async () => {
    const onNewFilter = vi.fn();

    render(
      <ParameterDateTimeSelector
        entityName={TEST_ENTITY_NAME}
        parameterName={TEST_PARAMETER_NAME}
        allIds={TEST_IDS}
        onNewFilter={onNewFilter}
        onResetFilter={vi.fn()}
      />,
      { wrapper: Wrapper }
    );

    await user.click(
      await screen.findByRole('button', {
        name: /parameterFilters.creator.labels.parameterDateTimeSelect /i,
      })
    );

    await user.selectOptions(
      screen.getByRole('listbox', {
        name: 'parameterFilters.creator.labels.parameterDateTimeSelect',
      }),
      screen.getByRole('option', { name: 'Filter by 2020' })
    );

    expect(onNewFilter).toHaveBeenCalledWith({
      key: `InvestigationParameter.dateTimeValue.bcat_inv_str`,
      label: '2020',
      filter: [
        {
          from: 10,
          to: 20,
          key: '2020',
          field: 'dateTimeValue',
        },
        {
          field: 'type.name',
          value: 'bcat_inv_str',
        },
      ],
    });
    expect(
      screen.getByRole('button', {
        name: /parameterFilters.creator.labels.parameterDateTimeSelect 2020/i,
      })
    ).toBeInTheDocument();
  });
});
