import * as React from 'react';
import axios, { AxiosResponse } from 'axios';
import { QueryClient, QueryClientProvider } from 'react-query';
import { render, screen, within } from '@testing-library/react';
import ParameterDateTimeSelector from './parameterDateTimeSelector.component';
import { DatasearchType, dGCommonInitialState } from 'datagateway-common';
import { UserEvent } from '@testing-library/user-event/dist/types/setup';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import createMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

describe('ParameterDateTimeSelector', () => {
  const TEST_ENTITY_NAME: DatasearchType = 'Investigation';
  const TEST_PARAMETER_NAME = 'bcat_inv_str';
  const TEST_IDS = [123, 456, 789];

  let user: UserEvent;

  function Wrapper({
    children,
  }: React.PropsWithChildren<Record<string, never>>): JSX.Element {
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

    axios.get = jest
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
      });
  });

  it('displays the list of available date time value options in a dropdown menu', async () => {
    render(
      <ParameterDateTimeSelector
        entityName={TEST_ENTITY_NAME}
        parameterName={TEST_PARAMETER_NAME}
        allIds={TEST_IDS}
        onNewFilter={jest.fn()}
        onResetFilter={jest.fn()}
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
    axios.get = jest.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          // never resolve the promise to pretend it is loading
        })
    );

    render(
      <ParameterDateTimeSelector
        entityName={TEST_ENTITY_NAME}
        parameterName={TEST_PARAMETER_NAME}
        allIds={TEST_IDS}
        onNewFilter={jest.fn()}
        onResetFilter={jest.fn()}
      />,
      { wrapper: Wrapper }
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(
      screen.getByText('parameterFilters.creator.loading')
    ).toBeInTheDocument();
  });

  it('calls onNewFilter and shows the selected option when an option is selected ', async () => {
    const onNewFilter = jest.fn();

    render(
      <ParameterDateTimeSelector
        entityName={TEST_ENTITY_NAME}
        parameterName={TEST_PARAMETER_NAME}
        allIds={TEST_IDS}
        onNewFilter={onNewFilter}
        onResetFilter={jest.fn()}
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
