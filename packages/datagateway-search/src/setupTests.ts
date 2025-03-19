/* eslint-disable @typescript-eslint/no-empty-function */
import '@testing-library/jest-dom';
import { Action, AnyAction } from 'redux';
import { StateType } from './state/app.types';
import { dGCommonInitialState } from 'datagateway-common';
import { initialState as dgSearchInitialState } from './state/reducers/dgsearch.reducer';
import { screen, within } from '@testing-library/react';
import failOnConsole from 'jest-fail-on-console';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';

failOnConsole();

jest.setTimeout(20000);

function noOp(): void {
  // required as work-around for enzyme/jest environment not implementing window.URL.createObjectURL method
}

// Mock Date.toLocaleDateString so that it always uses en-GB as locale and UTC timezone
// instead of using the system default, which can be different depending on the environment.
// save a reference to the original implementation of Date.toLocaleDateString

const toLocaleDateString = Date.prototype.toLocaleDateString;

jest
  .spyOn(Date.prototype, 'toLocaleDateString')
  .mockImplementation(function (this: Date) {
    // when toLocaleDateString is called with no argument
    // pass in 'en-GB' as the locale & UTC as timezone
    // so that Date.toLocaleDateString() is equivalent to
    // Date.toLocaleDateString('en-GB', { timeZone: 'UTC' })
    return toLocaleDateString.call(this, 'en-GB', { timeZone: 'UTC' });
  });

if (typeof window.URL.createObjectURL === 'undefined') {
  Object.defineProperty(window.URL, 'createObjectURL', { value: noOp });
}

// these are used for testing async actions
export let actions: Action[] = [];
export const resetActions = (): void => {
  actions = [];
};
export const getState = (): StateType => ({
  dgsearch: dgSearchInitialState,
  dgcommon: dGCommonInitialState,
});
export const dispatch: ThunkDispatch<StateType, null, AnyAction> = (
  action: Action | ThunkAction<void, StateType, null, AnyAction>
) => {
  if (typeof action === 'function') {
    action(dispatch, getState, null);
    return Promise.resolve();
  } else {
    actions.push(action);
  }
};

export const flushPromises = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve));

// Mock lodash.debounce to return the function we want to call.
jest.mock('lodash.debounce', () => (fn: (args: unknown) => unknown) => fn);
jest.mock('@mui/utils/useId', () =>
  jest.fn().mockImplementation((id?: string) => id ?? 'mui-test-id')
);

// MUI date pickers default to mobile versions during testing and so functions
// like .simulate('change') will not work, this workaround ensures desktop
// datepickers are used in tests instead
// https://github.com/mui/material-ui-pickers/issues/2073
export const applyDatePickerWorkaround = (): void => {
  // add window.matchMedia
  // this is necessary for the date picker to be rendered in desktop mode.
  // if this is not provided, the mobile mode is rendered, which might lead to unexpected behavior
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      media: query,
      // this is the media query that @material-ui/pickers uses to determine if a device is a desktop device
      matches: query === '(pointer: fine)',
      onchange: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
};

export const cleanupDatePickerWorkaround = (): void => {
  // @ts-expect-error this is a workaround
  delete window.matchMedia;
};

/**
 * Finds the index of the column with the given name.
 */
export const findColumnIndexByName = async (
  columnName: string
): Promise<number> => {
  const columnHeaders = await screen.findAllByRole('columnheader');
  return columnHeaders.findIndex(
    (header) => within(header).queryByText(columnName) !== null
  );
};

/**
 * Find the header row of the table currently rendered.
 * This assumes that the first row is always the header row.
 */
export const findColumnHeaderByName = async (
  name: string
): Promise<HTMLElement> => {
  const columnHeaders = await screen.findAllByRole('columnheader');
  const header = columnHeaders.find(
    (header) => within(header).queryByText(name) !== null
  );
  if (!header) {
    throw new Error(`Cannot find column header by name: ${name}`);
  }
  return header;
};

/**
 * Finds all table rows except the header row.
 */
export const findAllRows = async (): Promise<HTMLElement[]> =>
  (await screen.findAllByRole('row')).slice(1);

export const queryAllRows = (): HTMLElement[] =>
  screen.queryAllByRole('row').slice(1);

/**
 * Find the table row at the given index. This assumes the first table row is always the header row.
 *
 * @param index The index of the table row, igoring the header row. For example, if the table has 2 rows and the first row is the header row,
 *              the actual row that contains the data is considered the first row, and has an index of 0.
 */
export const findRowAt = async (index: number): Promise<HTMLElement> => {
  const rows = await screen.findAllByRole('row');
  const row = rows[index + 1];
  if (!row) {
    throw new Error(`Cannot find row at index ${index}`);
  }
  return row;
};

export const findCellInRow = (
  row: HTMLElement,
  { columnIndex }: { columnIndex: number }
): HTMLElement => {
  const cells = within(row).getAllByRole('gridcell');
  const cell = cells[columnIndex];
  if (!cell) {
    throw new Error(`Cannot find cell in row.`);
  }
  return cell;
};
