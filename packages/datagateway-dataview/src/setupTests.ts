/* eslint-disable @typescript-eslint/no-empty-function */
import '@testing-library/jest-dom';
// Blob implementation in jsdom is not complete (https://github.com/jsdom/jsdom/issues/2555)
// blob-polyfill fills in the gap
import 'blob-polyfill';
import Enzyme from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { Action } from 'redux';
import { StateType } from './state/app.types';
import { initialState as dgDataViewInitialState } from './state/reducers/dgdataview.reducer';
import { dGCommonInitialState } from 'datagateway-common';
import { screen, within } from '@testing-library/react';

// Unofficial React 17 Enzyme adapter
Enzyme.configure({ adapter: new Adapter() });

function noOp(): void {
  // required as work-around for enzyme/jest environment not implementing window.URL.createObjectURL method
}

if (typeof window.URL.createObjectURL === 'undefined') {
  Object.defineProperty(window.URL, 'createObjectURL', { value: noOp });
}

// these are used for testing async actions
export let actions: Action[] = [];
export const resetActions = (): void => {
  actions = [];
};
export const getState = (): Partial<StateType> => ({
  dgdataview: dgDataViewInitialState,
  dgcommon: dGCommonInitialState,
});
export const dispatch = (action: Action): void | Promise<void> => {
  if (typeof action === 'function') {
    action(dispatch, getState);
    return Promise.resolve();
  } else {
    actions.push(action);
  }
};

export const flushPromises = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve));

// Mock lodash.debounce to return the function we want to call.
jest.mock('lodash.debounce', () => (fn: (args: unknown) => unknown) => fn);

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
