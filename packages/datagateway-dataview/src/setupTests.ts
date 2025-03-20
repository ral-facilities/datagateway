/* eslint-disable @typescript-eslint/no-empty-function */
import '@testing-library/jest-dom';
// Blob implementation in jsdom is not complete (https://github.com/jsdom/jsdom/issues/2555)
// blob-polyfill fills in the gap
import 'blob-polyfill';
import { Action, AnyAction } from 'redux';
import { StateType } from './state/app.types';
import { initialState as dgDataViewInitialState } from './state/reducers/dgdataview.reducer';
import { dGCommonInitialState } from 'datagateway-common';
import { screen, waitFor, within } from '@testing-library/react';
import failOnConsole from 'vitest-fail-on-console';
import { ThunkDispatch, ThunkAction } from 'redux-thunk';

failOnConsole();

vi.setConfig({ testTimeout: 20_000 });

function noOp(): void {
  // required as work-around for jsdom environment not implementing window.URL.createObjectURL method
}

if (typeof window.URL.createObjectURL === 'undefined') {
  Object.defineProperty(window.URL, 'createObjectURL', { value: noOp });
}

// these are used for testing async actions
export let actions: Action[] = [];
export const resetActions = (): void => {
  actions = [];
};
export const getState = (): StateType => ({
  dgdataview: dgDataViewInitialState,
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
  // @ts-expect-error it's a workaround
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

/**
 * Find the table row at the given index. This assumes the first table row is always the header row.
 *
 * @param index The index of the table row, igoring the header row. For example, if the table has 2 rows and the first row is the header row,
 *              the actual row that contains the data is considered the first row, and has an index of 0.
 */
export const findRowAt = async (index: number): Promise<HTMLElement> => {
  let rows;
  await waitFor(async () => {
    rows = await findAllRows();
    // should have 1 row in the table
    expect(rows).toHaveLength(1);
  });
  const row = rows?.[index];
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

vi.mock('loglevel');

// Recreate jest behaviour by mocking with __mocks__ by mocking globally here
vi.mock('axios');
vi.mock('react-i18next');

// Mock lodash.debounce to return the function we want to call.
vi.mock('lodash.debounce', () => ({
  default: (fn: (args: unknown) => unknown) => fn,
}));
