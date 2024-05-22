import { renderHook, act } from '@testing-library/react-hooks';
import axios, { AxiosError, AxiosHeaders } from 'axios';
import {
  handleDOIAPIError,
  useCheckUser,
  useIsCartMintable,
  useUpdateDOI,
} from '.';
import { createReactQueryWrapper, createTestQueryClient } from '../setupTests';
import { InvalidateTokenType } from '../state/actions/actions.types';
import { setLogger } from 'react-query';
import log from 'loglevel';
import { ContributorType, DownloadCartItem } from '../app.types';

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

  describe('useUpdateDOI', () => {
    const doiMetadata = {
      title: 'Test title',
      description: 'Test description',
      creators: [{ username: '1', contributor_type: ContributorType.Minter }],
      related_items: [],
    };
    const content = {
      datafile_ids: [1],
      dataset_ids: [2],
      investigation_ids: [3],
    };
    it('should send a put request with payload indicating the updated data', async () => {
      axios.put = jest.fn().mockResolvedValue({
        data: {
          concept: { data_publication: 'new', doi: 'pid' },
          version: {
            data_publication: 'new_version',
            doi: 'new.version.pid',
          },
        },
      });

      const queryClient = createTestQueryClient();
      const resetQueriesSpy = jest.spyOn(queryClient, 'resetQueries');

      const { result } = renderHook(() => useUpdateDOI(), {
        wrapper: createReactQueryWrapper(undefined, queryClient),
      });

      await act(async () => {
        await result.current.mutateAsync({
          dataPublicationId: 'pid',
          content,
          doiMetadata,
        });
      });

      expect(result.current.data).toEqual({
        concept: { data_publication: 'new', doi: 'pid' },
        version: {
          data_publication: 'new_version',
          doi: 'new.version.pid',
        },
      });
      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining('/mint/version/update/pid'),
        {
          metadata: {
            ...doiMetadata,
            resource_type: 'Collection',
          },
          investigation_ids: [3],
          dataset_ids: [2],
          datafile_ids: [1],
        },
        { headers: { Authorization: 'Bearer null' } }
      );
      expect(resetQueriesSpy).toHaveBeenCalled();
    });

    it('handles errors correctly', async () => {
      const error = {
        message: 'Test error message',
        response: {
          status: 500,
        },
      };
      axios.put = jest.fn().mockRejectedValue(error);

      const { result, waitFor } = renderHook(() => useUpdateDOI(), {
        wrapper: createReactQueryWrapper(),
      });

      act(() => {
        result.current.mutate({
          dataPublicationId: 'pid',
          content: { ...content, investigation_ids: [] },
          doiMetadata,
        });
      });
      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(log.error).toHaveBeenCalledWith(error);
      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining('/mint/version/update/pid'),
        {
          metadata: {
            ...doiMetadata,
            resource_type: 'Dataset',
          },
          investigation_ids: [],
          dataset_ids: [2],
          datafile_ids: [1],
        },
        { headers: { Authorization: 'Bearer null' } }
      );
    });
  });

  describe('useIsCartMintable', () => {
    const mockCartItems: DownloadCartItem[] = [
      {
        entityId: 1,
        entityType: 'investigation',
        id: 1,
        name: 'INVESTIGATION 1',
        parentEntities: [],
      },
      {
        entityId: 2,
        entityType: 'investigation',
        id: 2,
        name: 'INVESTIGATION 2',
        parentEntities: [],
      },
      {
        entityId: 3,
        entityType: 'dataset',
        id: 3,
        name: 'DATASET 1',
        parentEntities: [],
      },
      {
        entityId: 4,
        entityType: 'datafile',
        id: 4,
        name: 'DATAFILE 1',
        parentEntities: [],
      },
    ];

    it('should check whether a cart is mintable', async () => {
      axios.post = jest
        .fn()
        .mockResolvedValue({ data: undefined, status: 200 });

      const { result, waitFor } = renderHook(
        () =>
          useIsCartMintable(mockCartItems, 'https://example.com/doi-minter'),
        {
          wrapper: createReactQueryWrapper(),
        }
      );
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(true);
      expect(axios.post).toHaveBeenCalledWith(
        `https://example.com/doi-minter/ismintable`,
        {
          investigation_ids: [1, 2],
          dataset_ids: [3],
          datafile_ids: [4],
        },
        { headers: { Authorization: 'Bearer null' } }
      );
    });

    it('should be disabled if doiMinterUrl is not defined', async () => {
      const { result } = renderHook(
        () => useIsCartMintable(mockCartItems, undefined),
        { wrapper: createReactQueryWrapper() }
      );

      expect(result.current.isIdle).toEqual(true);
      expect(axios.post).not.toHaveBeenCalled();
    });

    it('should return false if cart is undefined', async () => {
      const { result, waitFor } = renderHook(
        () => useIsCartMintable(undefined, 'https://example.com/doi-minter'),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(false);
      expect(axios.post).not.toHaveBeenCalled();
    });

    it('should return false if cart is empty', async () => {
      const { result, waitFor } = renderHook(
        () => useIsCartMintable([], 'https://example.com/doi-minter'),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(false);
      expect(axios.post).not.toHaveBeenCalled();
    });

    it('should not log 403 errors or retry them', async () => {
      const error = {
        message: 'Test error message',
        response: {
          status: 403,
        },
      };
      axios.post = jest.fn().mockRejectedValue(error);

      const { result, waitFor } = renderHook(
        () =>
          useIsCartMintable(mockCartItems, 'https://example.com/doi-minter'),
        {
          wrapper: createReactQueryWrapper(),
        }
      );
      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(log.error).not.toHaveBeenCalled();
      expect(axios.post).toHaveBeenCalledTimes(1);
    });
  });
});
