import { renderHook, act } from '@testing-library/react-hooks';
import axios, { AxiosError, AxiosHeaders } from 'axios';
import { handleDOIAPIError, useCheckUser } from '.';
import { createReactQueryWrapper } from '../setupTests';
import { InvalidateTokenType } from '../state/actions/actions.types';
import { setLogger } from 'react-query';
import log from 'loglevel';

// silence react-query errors
setLogger({
  log: console.log,
  warn: console.warn,
  error: jest.fn(),
});

jest.mock('loglevel');

describe('handleDOIAPIError', () => {
  const localStorageGetItemMock = jest.spyOn(
    window.localStorage.__proto__,
    'getItem'
  );
  let events: CustomEvent<{
    detail: { type: string; payload?: unknown };
  }>[] = [];
  let error: AxiosError;

  beforeEach(() => {
    events = [];

    document.dispatchEvent = (e: Event) => {
      events.push(
        e as CustomEvent<{ detail: { type: string; payload?: unknown } }>
      );
      return true;
    };

    const headers = {} as AxiosHeaders;
    const config = {
      url: 'https://example.com',
      headers,
    };
    error = {
      isAxiosError: true,
      config,
      response: {
        data: { message: 'Test error message (response data)' },
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config,
      },
      name: 'Test error name',
      message: 'Test error message',
      toJSON: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorageGetItemMock.mockReset();
  });

  it('should handle 401 by broadcasting an invalidate token message with autologin being true', async () => {
    localStorageGetItemMock.mockImplementation((name) => {
      return name === 'autoLogin' ? 'true' : null;
    });

    handleDOIAPIError(error);

    expect(log.error).toHaveBeenCalledWith(error);
    expect(events.length).toBe(1);
    expect(events[0].detail).toEqual({
      type: InvalidateTokenType,
      payload: {
        severity: 'error',
        message: 'Your session has expired, please reload the page',
      },
    });
  });

  it('should handle 401 by broadcasting an invalidate token message with autologin being false & not log if false logging condition given', async () => {
    localStorageGetItemMock.mockImplementation((name) => {
      return name === 'autoLogin' ? 'false' : null;
    });

    handleDOIAPIError(error, undefined, undefined, false);

    expect(log.error).not.toHaveBeenCalled();
    expect(events.length).toBe(1);
    expect(events[0].detail).toEqual({
      type: InvalidateTokenType,
      payload: {
        severity: 'error',
        message: 'Your session has expired, please login again',
      },
    });
  });

  it('should handle other errors by not broadcasting a message & log if true logging condition given', async () => {
    localStorageGetItemMock.mockImplementation((name) => {
      return name === 'autoLogin' ? 'false' : null;
    });

    if (error.response) error.response.status = 400;
    handleDOIAPIError(error, undefined, undefined, true);

    expect(log.error).toHaveBeenCalledWith(error);
    expect(events.length).toBe(0);
  });
});

describe('doi api functions', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('useCheckUser', () => {
    it('should check whether a user exists in ICAT', async () => {
      axios.get = jest
        .fn()
        .mockResolvedValue({ data: { id: 1, name: 'user 1' } });

      const { result, waitFor } = renderHook(
        () => useCheckUser('user 1', '/doi-minter'),
        {
          wrapper: createReactQueryWrapper(),
        }
      );
      expect(result.current.isIdle).toBe(true);
      act(() => {
        result.current.refetch();
      });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual({ id: 1, name: 'user 1' });
      expect(axios.get).toHaveBeenCalledWith('/doi-minter/user/user 1', {
        headers: { Authorization: 'Bearer null' },
      });
    });

    it('should not retry 401 errors', async () => {
      const error = {
        message: 'Test error message',
        response: {
          status: 401,
        },
      };
      axios.get = jest.fn().mockRejectedValue(error);

      const { result, waitFor } = renderHook(
        () => useCheckUser('user 1', '/doi-minter'),
        {
          wrapper: createReactQueryWrapper(),
        }
      );
      expect(result.current.isIdle).toBe(true);
      act(() => {
        result.current.refetch();
      });
      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(log.error).toHaveBeenCalledWith(error);
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    it('should not retry 404 errors', async () => {
      const error = {
        message: 'Test error message',
        response: {
          status: 404,
        },
      };
      axios.get = jest.fn().mockRejectedValue(error);

      const { result, waitFor } = renderHook(
        () => useCheckUser('user 1', '/doi-minter'),
        {
          wrapper: createReactQueryWrapper(),
        }
      );
      expect(result.current.isIdle).toBe(true);
      act(() => {
        result.current.refetch();
      });
      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(log.error).toHaveBeenCalledWith(error);
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    it('should not retry 422 errors', async () => {
      const error = {
        message: 'Test error message',
        response: {
          status: 422,
        },
      };
      axios.get = jest.fn().mockRejectedValue(error);

      const { result, waitFor } = renderHook(
        () => useCheckUser('user 1', '/doi-minter'),
        {
          wrapper: createReactQueryWrapper(),
        }
      );
      expect(result.current.isIdle).toBe(true);
      act(() => {
        result.current.refetch();
      });
      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(log.error).toHaveBeenCalledWith(error);
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    it('should retry other errors', async () => {
      const error = {
        message: 'Test error message',
        response: {
          status: 400,
        },
      };
      axios.get = jest.fn().mockRejectedValue(error);

      const { result, waitFor } = renderHook(
        () => useCheckUser('user 1', '/doi-minter'),
        {
          wrapper: createReactQueryWrapper(),
        }
      );
      expect(result.current.isIdle).toBe(true);
      act(() => {
        result.current.refetch();
      });
      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(log.error).toHaveBeenCalledWith(error);
      expect(axios.get).toHaveBeenCalledTimes(4);
    });
  });
});
