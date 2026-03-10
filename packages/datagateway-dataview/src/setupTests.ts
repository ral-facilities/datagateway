import '@testing-library/jest-dom';
// Blob implementation in jsdom is not complete (https://github.com/jsdom/jsdom/issues/2555)
// node blob implementation fills in the gap
import { screen, waitFor, within } from '@testing-library/react';
import { dGCommonInitialState } from 'datagateway-common';
import { Blob as BlobPolyfill } from 'node:buffer';
import type { Action, AnyAction } from 'redux';
import type { ThunkAction, ThunkDispatch } from 'redux-thunk';
import failOnConsole from 'vitest-fail-on-console';
import type { StateType } from './state/app.types';
import { initialState as dgDataViewInitialState } from './state/reducers/dgdataview.reducer';

global.Blob = BlobPolyfill as typeof global.Blob;

failOnConsole();

vi.setConfig({ testTimeout: 20_000 });

// see https://github.com/testing-library/react-testing-library/issues/1197
// and https://github.com/testing-library/user-event/issues/1115
vi.stubGlobal('jest', { advanceTimersByTime: vi.advanceTimersByTime.bind(vi) });

function noOp(): void {
  // required as work-around for jsdom environment not implementing window.URL.createObjectURL method
}

// Add in ResizeObserver as it's not in jsdom's environment
vi.stubGlobal(
  'ResizeObserver',
  vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
);

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
  (await screen.findAllByRole('row')).filter((e) =>
    e.hasAttribute('aria-rowindex')
  );

/**
 * Find the table row at the given index.
 *
 * @param index The index of the table row to find - so the first data row of the table is 0.
 */
export const findRowAt = async (index: number): Promise<HTMLElement> => {
  let rows;
  await waitFor(async () => {
    rows = await findAllRows();
    // should have at least 1 row in the table
    expect(rows.length).toBeGreaterThan(0);
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
