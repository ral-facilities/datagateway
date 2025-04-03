/* eslint-disable @typescript-eslint/no-empty-function */
import '@testing-library/jest-dom';
import failOnConsole from 'vitest-fail-on-console';

failOnConsole();

vi.setConfig({ testTimeout: 20_000 });

// see https://github.com/testing-library/react-testing-library/issues/1197
// and https://github.com/testing-library/user-event/issues/1115
vi.stubGlobal('jest', { advanceTimersByTime: vi.advanceTimersByTime.bind(vi) });

function noOp(): void {
  // required as work-around for jsdom environment not implementing window.URL.createObjectURL method
}

if (typeof window.URL.createObjectURL === 'undefined') {
  Object.defineProperty(window.URL, 'createObjectURL', { value: noOp });
}

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
  // @ts-expect-error this is a workaround
  delete window.matchMedia;
};

vi.mock('loglevel');

// Recreate jest behaviour by mocking with __mocks__ by mocking globally here
vi.mock('axios');
vi.mock('react-i18next');

// Mock lodash.debounce to return the function we want to call.
vi.mock('lodash.debounce', () => ({
  default: (fn: (args: unknown) => unknown) => fn,
}));
