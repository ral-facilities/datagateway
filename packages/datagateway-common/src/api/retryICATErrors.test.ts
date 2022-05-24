import { AxiosError } from 'axios';
import retryICATErrors from './retryICATErrors';

// have to unmock here as we mock "globally" in setupTests.tsx
jest.unmock('./retryICATErrors');

describe('retryICATErrors', () => {
  let error: AxiosError;

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
      toJSON: jest.fn(),
    };
  });

  it('returns false if error code is 403', () => {
    error.response.status = 403;
    const result = retryICATErrors(0, error);
    expect(result).toBe(false);
  });

  it('returns false if SESSION appears in error response', () => {
    error.response.data = {
      message: 'Session id: test has expired',
    };
    let result = retryICATErrors(0, error);
    expect(result).toBe(false);

    error.response = undefined;
    error.message = 'Session id: test has expired';
    result = retryICATErrors(0, error);
    expect(result).toBe(false);
  });

  it('returns false if failureCount is 3 or greater', () => {
    let result = retryICATErrors(3, error);
    expect(result).toBe(false);

    result = retryICATErrors(4, error);
    expect(result).toBe(false);
  });

  it('returns true if non-auth error and failureCount is less than 3', () => {
    let result = retryICATErrors(0, error);
    expect(result).toBe(true);

    result = retryICATErrors(2, error);
    expect(result).toBe(true);
  });
});
