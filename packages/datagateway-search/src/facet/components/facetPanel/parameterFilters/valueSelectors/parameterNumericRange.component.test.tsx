import { DatasearchType } from 'datagateway-common';
import { UserEvent } from '@testing-library/user-event/dist/types/setup';
import * as React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import ParameterNumericRange from './parameterNumericRange.component';

describe('ParameterNumericRange', () => {
  const TEST_ENTITY_NAME: DatasearchType = 'Investigation';
  const TEST_PARAMETER_NAME = 'bcat_inv_str';
  const TEST_IDS = [123, 456, 789];

  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('shows min, max, and unit text field', () => {
    render(
      <ParameterNumericRange
        entityName={TEST_ENTITY_NAME}
        parameterName={TEST_PARAMETER_NAME}
        allIds={TEST_IDS}
        onNewFilter={jest.fn()}
        onResetFilter={jest.fn()}
      />
    );

    expect(
      screen.getByRole('spinbutton', {
        name: 'parameterFilters.creator.labels.parameterNumericRange.min',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('spinbutton', {
        name: 'parameterFilters.creator.labels.parameterNumericRange.max',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', {
        name: 'parameterFilters.creator.labels.parameterNumericRange.unit',
      })
    ).toBeInTheDocument();
  });

  it('constructs new filter object and pass it to onNewFilter when min and max are set', async () => {
    const onNewFilter = jest.fn();

    render(
      <ParameterNumericRange
        entityName={TEST_ENTITY_NAME}
        parameterName={TEST_PARAMETER_NAME}
        allIds={TEST_IDS}
        onNewFilter={onNewFilter}
        onResetFilter={jest.fn()}
      />
    );

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
      '10'
    );

    expect(onNewFilter).toHaveBeenCalledWith({
      label: '1 to 10',
      key: `investigationparameter.numericValue.bcat_inv_str`,
      filter: [
        {
          field: 'numericValue',
          from: 1,
          to: 10,
          key: '1 to 10',
        },
        { field: 'type.name', value: 'bcat_inv_str' },
      ],
    });
  });

  it('constructs new filter object and pass it to onNewFilter when min, max and unit are set', async () => {
    const onNewFilter = jest.fn();

    render(
      <ParameterNumericRange
        entityName={TEST_ENTITY_NAME}
        parameterName={TEST_PARAMETER_NAME}
        allIds={TEST_IDS}
        onNewFilter={onNewFilter}
        onResetFilter={jest.fn()}
      />
    );

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
      '10'
    );
    await user.type(
      screen.getByRole('textbox', {
        name: 'parameterFilters.creator.labels.parameterNumericRange.unit',
      }),
      'cm'
    );

    expect(onNewFilter).toHaveBeenLastCalledWith({
      label: '1 to 10 (cm)',
      key: `investigationparameter.numericValue.bcat_inv_str`,
      filter: [
        {
          field: 'numericValue',
          from: 1,
          to: 10,
          units: 'cm',
          key: '1 to 10 (cm)',
        },
        { field: 'type.name', value: 'bcat_inv_str' },
      ],
    });
  });

  it('resets filters when the numeric range becomes invalid', async () => {
    const onNewFilter = jest.fn();
    const onResetFilter = jest.fn();

    render(
      <ParameterNumericRange
        entityName={TEST_ENTITY_NAME}
        parameterName={TEST_PARAMETER_NAME}
        allIds={TEST_IDS}
        onNewFilter={onNewFilter}
        onResetFilter={onResetFilter}
      />
    );

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
      '10'
    );

    expect(onNewFilter).toHaveBeenCalledTimes(2);
    // 1: initial call from useEffect
    // 2: max === '' when typing '1' to min box -> call from useEffect
    expect(onResetFilter).toHaveBeenCalledTimes(2);

    await user.clear(
      screen.getByRole('spinbutton', {
        name: 'parameterFilters.creator.labels.parameterNumericRange.min',
      })
    );

    expect(onResetFilter).toHaveBeenCalledTimes(3);
  });
});
