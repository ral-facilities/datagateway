import { DatasearchType, dGCommonInitialState } from 'datagateway-common';
import * as React from 'react';
import { Provider } from 'react-redux';
import createMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { QueryClient, QueryClientProvider } from 'react-query';
import userEvent from '@testing-library/user-event';
import axios, { AxiosResponse } from 'axios';
import { render, screen, within } from '@testing-library/react';
import ParameterFacetList from './parameterFacetList.component';

describe('ParameterFacetList', () => {
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

  it('displays the list of available parameter string values in a dropdown menu', async () => {
    render(
      <ParameterFacetList
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
        name: /parameterFilters.creator.labels.parameterStringSelect /i,
      })
    );

    expect(
      screen.getByRole('listbox', {
        name: 'parameterFilters.creator.labels.parameterStringSelect',
      })
    ).toBeInTheDocument();

    const option1 = screen.getByRole('option', {
      name: 'Filter by PARAMETER STRING VALUE',
    });
    expect(option1).toBeInTheDocument();
    expect(within(option1).getByText('123')).toBeInTheDocument();

    const option2 = screen.getByRole('option', {
      name: 'Filter by PARAMETER STRING VALUE 2',
    });
    expect(option2).toBeInTheDocument();
    expect(within(option2).getByText('456')).toBeInTheDocument();
  });

  it('shows loading when loading the list of available string values', () => {
    axios.get = jest.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          // never resolve the promise to pretend it is loading
        })
    );

    render(
      <ParameterFacetList
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
      <ParameterFacetList
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
        name: /parameterFilters.creator.labels.parameterStringSelect /i,
      })
    );

    await user.selectOptions(
      screen.getByRole('listbox', {
        name: 'parameterFilters.creator.labels.parameterStringSelect',
      }),
      screen.getByRole('option', { name: 'Filter by PARAMETER STRING VALUE' })
    );

    expect(onNewFilter).toHaveBeenCalledWith({
      key: `InvestigationParameter.stringValue.bcat_inv_str`,
      label: 'PARAMETER STRING VALUE',
      filter: [
        { field: 'stringValue', value: 'PARAMETER STRING VALUE' },
        { field: 'type.name', value: 'bcat_inv_str' },
      ],
    });
    expect(
      screen.getByRole('button', {
        name: /parameterFilters.creator.labels.parameterStringSelect PARAMETER STRING VALUE/i,
      })
    ).toBeInTheDocument();
  });
});
