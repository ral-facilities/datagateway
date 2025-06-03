import { AxiosError } from 'axios';
import { useRetryICATErrors } from './retryICATErrors';
import { renderHook } from '@testing-library/react';
import { createReactQueryWrapper } from '../setupTests';
import { QueryClient } from '@tanstack/react-query';

// have to unmock here as we mock "globally" in setupTests.tsx
vi.unmock('./retryICATErrors');

describe('retryICATErrors', () => {
  let error: AxiosError;
  const testQueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 0,
      },
    },
  });

  beforeEach(() => {
    error = {
      isAxiosError: true,
      config: {},
      response: {
        data: { message: 'Test error message (response data)' },
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        config: {},
      },
      name: 'Test error name',
      message: 'Test error message',
      toJSON: vi.fn(),
    };
  });

  it('returns false if error code is 403', () => {
    error.response.status = 403;

    const {
      result: { current: retryICATErrors },
    } = renderHook(() => useRetryICATErrors(), {
      wrapper: createReactQueryWrapper(undefined, testQueryClient),
    });

    const result = retryICATErrors(0, error);

    expect(result).toBe(false);
  });

  it('returns false if SESSION appears in error response', () => {
    error.response.data = {
      message: 'Session id: test has expired',
    };
    const {
      result: { current: retryICATErrors },
    } = renderHook(() => useRetryICATErrors(), {
      wrapper: createReactQueryWrapper(undefined, testQueryClient),
    });

    let result = retryICATErrors(0, error);
    expect(result).toBe(false);

    error.response = undefined;
    error.message = 'Session id: test has expired';
    result = retryICATErrors(0, error);
    expect(result).toBe(false);
  });

  it('returns false if failureCount is greater than or equal to retry', () => {
    testQueryClient.setDefaultOptions({ queries: { retry: 1 } });
    const {
      result: { current: retryICATErrors },
    } = renderHook(() => useRetryICATErrors(), {
      wrapper: createReactQueryWrapper(undefined, testQueryClient),
    });

    let result = retryICATErrors(1, error);
    expect(result).toBe(false);

    result = retryICATErrors(2, error);
    expect(result).toBe(false);
  });

  it('returns true if non-auth error and failureCount is less than retry', () => {
    testQueryClient.setDefaultOptions({ queries: { retry: 2 } });

    const {
      result: { current: retryICATErrors },
    } = renderHook(() => useRetryICATErrors(), {
      wrapper: createReactQueryWrapper(undefined, testQueryClient),
    });

    let result = retryICATErrors(0, error);
    expect(result).toBe(true);

    result = retryICATErrors(1, error);
    expect(result).toBe(true);

    result = retryICATErrors(2, error);
    expect(result).toBe(false);
  });

  it('defaults to a query retry of 3 if retry is not set', () => {
    testQueryClient.setDefaultOptions({ queries: { retry: undefined } });

    const {
      result: { current: retryICATErrors },
    } = renderHook(() => useRetryICATErrors(), {
      wrapper: createReactQueryWrapper(undefined, testQueryClient),
    });

    let result = retryICATErrors(2, error);
    expect(result).toBe(true);

    result = retryICATErrors(3, error);
    expect(result).toBe(false);
  });
});
