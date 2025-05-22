import { QueryClient } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import axios, { AxiosError } from 'axios';
import {
  getDefaultFileName,
  useAddToCart,
  useCart,
  useDownload,
  useDownloadTypeStatuses,
  useQueueAllowed,
  useQueueVisit,
  useRemoveFromCart,
  useSubmitCart,
} from '.';
import { DownloadCart } from '../app.types';
import handleICATError from '../handleICATError';
import { createReactQueryWrapper } from '../setupTests';
import { NotificationType } from '../state/actions/actions.types';

jest.mock('../handleICATError');

describe('Cart api functions', () => {
  let mockData: DownloadCart;
  const getElementByIdSpy = jest.spyOn(document, 'getElementById');

  beforeEach(() => {
    mockData = {
      cartItems: [
        {
          entityId: 1,
          entityType: 'dataset',
          id: 1,
          name: 'DATASET 1',
          parentEntities: [],
        },
      ],
      createdAt: '2019-10-15T14:11:43+01:00',
      facilityName: 'TEST',
      id: 1,
      updatedAt: '2019-10-15T14:11:43+01:00',
      userName: 'test',
    };
    const mockElement = document.createElement('div');
    getElementByIdSpy.mockReturnValue(mockElement);
  });

  afterEach(() => {
    (axios.get as jest.Mock).mockClear();
    (axios.post as jest.Mock).mockClear();
    (axios.delete as jest.Mock).mockClear();
    (handleICATError as jest.Mock).mockClear();
    (getElementByIdSpy as jest.Mock).mockClear();
  });

  describe('useCart', () => {
    it('sends axios request to fetch cart and returns successful response', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: mockData,
      });

      const { result } = renderHook(() => useCart(), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/topcat/user/cart/TEST',
        {
          params: {
            sessionId: null,
          },
        }
      );
      expect(result.current.data).toEqual(mockData.cartItems);
    });

    it("doesn't axios request to fetch cart if no plugin is found on the page", async () => {
      getElementByIdSpy.mockReturnValue(null);

      const { result } = renderHook(() => useCart(), {
        wrapper: createReactQueryWrapper(),
      });

      expect(result.current.status).toBe('loading');
      expect(result.current.fetchStatus).toBe('idle');
      expect(axios.get).not.toHaveBeenCalled();
    });

    it('sends axios request to fetch cart and calls handleICATError on failure', async () => {
      (axios.get as jest.Mock).mockRejectedValue({
        message: 'Test error message',
      });

      const { result } = renderHook(() => useCart(), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });

  describe('useAddToCart', () => {
    it('sends axios request to add item to cart once mutate function is called and returns successful response', async () => {
      (axios.post as jest.Mock).mockResolvedValue({
        data: mockData,
      });

      const { result } = renderHook(() => useAddToCart('dataset'), {
        wrapper: createReactQueryWrapper(),
      });

      expect(axios.get).not.toHaveBeenCalled();
      expect(result.current.isIdle).toBe(true);

      result.current.mutate([1, 2]);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const params = new URLSearchParams();
      params.append('sessionId', '');
      params.append('items', 'dataset 1, dataset 2');

      expect(axios.post).toHaveBeenCalledWith(
        'https://example.com/topcat/user/cart/TEST/cartItems',
        params
      );
      expect(result.current.data).toEqual(mockData.cartItems);
    });

    it('sends axios request to add item to cart once mutate function is called and calls handleICATError on failure, with a retry on code 431', async () => {
      (axios.post as jest.MockedFunction<typeof axios.post>)
        .mockRejectedValueOnce({
          response: {
            status: 431,
          },
          message: 'Test 431 error message',
        } as AxiosError)
        .mockRejectedValue({
          message: 'Test error message',
        });

      const { result } = renderHook(() => useAddToCart('dataset'), {
        wrapper: createReactQueryWrapper(),
      });

      expect(axios.post).not.toHaveBeenCalled();
      expect(result.current.isIdle).toBe(true);

      result.current.mutate([1, 2]);

      await waitFor(() => expect(result.current.isError).toBe(true), {
        timeout: 2000,
      });

      expect(result.current.failureCount).toBe(2);
      expect(handleICATError).toHaveBeenCalledTimes(1);
      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });

  describe('useRemoveFromCart', () => {
    it('sends axios request to remove item from cart once mutate function is called and returns successful response', async () => {
      (axios.post as jest.Mock).mockResolvedValue({
        data: mockData,
      });

      const { result } = renderHook(() => useRemoveFromCart('dataset'), {
        wrapper: createReactQueryWrapper(),
      });

      expect(axios.get).not.toHaveBeenCalled();
      expect(result.current.isIdle).toBe(true);

      result.current.mutate([1, 2]);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const params = new URLSearchParams();
      params.append('sessionId', '');
      params.append('items', 'dataset 1, dataset 2');
      params.append('remove', 'true');

      expect(axios.post).toHaveBeenCalledWith(
        'https://example.com/topcat/user/cart/TEST/cartItems',

        params
      );
      expect(result.current.data).toEqual(mockData.cartItems);
    });

    it('sends axios request to remove item from cart once mutate function is called and calls handleICATError on failure, with a retry on code 431', async () => {
      (axios.post as jest.MockedFunction<typeof axios.post>)
        .mockRejectedValueOnce({
          response: {
            status: 431,
          },
          message: 'Test 431 error message',
        } as AxiosError)
        .mockRejectedValue({
          message: 'Test error message',
        });

      const { result } = renderHook(() => useRemoveFromCart('dataset'), {
        wrapper: createReactQueryWrapper(),
      });

      expect(axios.post).not.toHaveBeenCalled();
      expect(result.current.isIdle).toBe(true);

      result.current.mutate([1, 2]);

      await waitFor(() => expect(result.current.isError).toBe(true), {
        timeout: 2000,
      });

      expect(result.current.failureCount).toBe(2);
      expect(handleICATError).toHaveBeenCalledTimes(1);
      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });

  describe('useSubmitCart', () => {
    it('should submit cart and clear cart on success', async () => {
      axios.post = jest.fn().mockResolvedValue({ data: { downloadId: 123 } });
      axios.get = jest
        .fn()
        .mockResolvedValueOnce({
          data: mockData,
        })
        .mockResolvedValueOnce({ data: { cartItems: [] } });

      const { result } = renderHook(
        () => ({
          useSubmitCart: useSubmitCart(
            'LILS',
            'https://example.com/downloadApiUrl'
          ),
          useCart: useCart(),
        }),
        { wrapper: createReactQueryWrapper() }
      );

      // wait for the cart to finish loading
      await waitFor(() => expect(result.current.useCart.isSuccess).toBe(true));
      // submit the cart
      result.current.useSubmitCart.mutate({
        emailAddress: 'cat@dog.com',
        fileName: 'test-file',
        transport: 'https',
      });
      // wait for cart submission to finish
      await waitFor(() =>
        expect(result.current.useSubmitCart.isSuccess).toBe(true)
      );

      expect(result.current.useCart.data).toEqual([]);
    });

    it('should error if api returns successful response with no downloadId', async () => {
      axios.post = jest.fn().mockResolvedValue({ data: {} });
      axios.get = jest.fn().mockResolvedValueOnce({
        data: mockData,
      });

      const { result } = renderHook(
        () => ({
          useSubmitCart: useSubmitCart(
            'LILS',
            'https://example.com/downloadApiUrl'
          ),
          useCart: useCart(),
        }),
        { wrapper: createReactQueryWrapper() }
      );

      // wait for the cart to finish loading
      await waitFor(() => expect(result.current.useCart.isSuccess).toBe(true));
      // submit the cart
      result.current.useSubmitCart.mutate({
        emailAddress: '',
        fileName: 'test-file',
        transport: 'https',
      });

      await waitFor(() =>
        expect(result.current.useSubmitCart.isError).toBe(true)
      );

      expect(handleICATError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'No downloadId returned from submitCart request',
        })
      );
    });

    it('should call handleICATError when an error is encountered', async () => {
      axios.post = jest.fn().mockRejectedValue({
        message: 'test error message',
      });
      axios.get = jest.fn().mockResolvedValueOnce({
        data: mockData,
      });

      const { result } = renderHook(
        () => ({
          useSubmitCart: useSubmitCart(
            'LILS',
            'https://example.com/downloadApiUrl'
          ),
          useCart: useCart(),
        }),
        { wrapper: createReactQueryWrapper() }
      );

      await waitFor(() => expect(result.current.useCart.isSuccess).toBe(true));
      result.current.useSubmitCart.mutate({
        emailAddress: 'a@b.c',
        fileName: 'test-file',
        transport: 'https',
      });
      await waitFor(() =>
        expect(result.current.useSubmitCart.isError).toBe(true)
      );

      expect(handleICATError).toHaveBeenCalledWith({
        message: 'test error message',
      });
    });
  });

  describe('useDownload', () => {
    it('sends axios request to fetch download and returns successful response', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: [{ id: 1, fileName: 'test' }],
      });

      const { result } = renderHook(
        () =>
          useDownload({
            id: 1,
            facilityName: 'TEST',
            downloadApiUrl: 'https://example.com/topcat',
          }),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/topcat/user/downloads',
        {
          params: {
            sessionId: null,
            facilityName: 'TEST',
            queryOffset: 'where download.id = 1',
          },
        }
      );
      expect(result.current.data).toEqual({ id: 1, fileName: 'test' });
    });

    it('sends axios request to fetch cart and calls handleICATError on failure', async () => {
      (axios.get as jest.Mock).mockRejectedValue({
        message: 'Test error message',
      });

      const { result } = renderHook(
        () =>
          useDownload({
            id: 1,
            facilityName: 'TEST',
            downloadApiUrl: 'https://example.com/topcat',
          }),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });

  describe('useDownloadTypeStatuses', () => {
    const downloadTypes = ['https', 'globus'];

    let queryClient: QueryClient;

    beforeAll(() => {
      queryClient = new QueryClient();
    });

    afterEach(() => {
      queryClient.clear();
    });

    it('should query statuses of download types', async () => {
      axios.get = jest.fn().mockResolvedValue({
        data: {
          disabled: false,
          message: '',
        },
      });

      const { result } = renderHook(
        () =>
          useDownloadTypeStatuses({
            downloadTypes,
            facilityName: 'LILS',
            downloadApiUrl: 'https://example.com/downloadApiUrl',
          }),
        { wrapper: createReactQueryWrapper() }
      );

      await waitFor(() =>
        expect(result.current.every((query) => query.isSuccess)).toBe(true)
      );

      console.log('result.current', result.current);

      const data = result.current.map(({ data }) => data);
      expect(data).toEqual([
        {
          type: 'https',
          disabled: false,
          message: '',
        },
        {
          type: 'globus',
          disabled: false,
          message: '',
        },
      ]);
    });

    it('should dispatch event with the error messages of download type queries with errors', async () => {
      axios.get = jest
        .fn()
        .mockResolvedValueOnce({
          data: {
            disabled: false,
            message: '',
          },
        })
        .mockImplementationOnce(() =>
          Promise.reject({
            message: 'Test error message',
          })
        );

      const dispatchEventSpy = jest.spyOn(document, 'dispatchEvent');

      const { result } = renderHook(
        () =>
          useDownloadTypeStatuses({
            downloadTypes,
            facilityName: 'LILS',
            downloadApiUrl: 'https://example.com/downloadApiUrl',
          }),
        { wrapper: createReactQueryWrapper() }
      );

      await waitFor(() =>
        expect(
          result.current.every((query) => query.isSuccess || query.isError)
        ).toBe(true)
      );

      expect((dispatchEventSpy.mock.calls[0][0] as CustomEvent).detail).toEqual(
        {
          type: NotificationType,
          payload: {
            severity: 'error',
            message:
              'downloadConfirmDialog.access_method_error {method:GLOBUS}',
          },
        }
      );
    });

    it('should refetch data on every hook call', async () => {
      axios.get = jest.fn().mockResolvedValue({
        data: {
          disabled: false,
          message: '',
        },
      });

      const wrapper = createReactQueryWrapper();

      const { result } = renderHook(
        () =>
          useDownloadTypeStatuses({
            downloadTypes: ['https'],
            facilityName: 'LILS',
            downloadApiUrl: 'https://example.com/downloadApiUrl',
          }),
        { wrapper }
      );

      await waitFor(() =>
        expect(result.current.every((query) => query.isSuccess)).toBe(true)
      );

      expect(result.current[0].isStale).toBe(true);
      expect(axios.get).toHaveBeenCalledTimes(1);

      const { result: newResult } = renderHook(
        () =>
          useDownloadTypeStatuses({
            downloadTypes: ['https'],
            facilityName: 'LILS',
            downloadApiUrl: 'https://example.com/downloadApiUrl',
          }),
        { wrapper }
      );

      await waitFor(() =>
        expect(newResult.current.every((query) => query.isSuccess)).toBe(true)
      );

      expect(newResult.current[0].isStale).toBe(true);
      expect(axios.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('useQueueAllowed', () => {
    it('sends axios request to check if the user has permission to use the queue and returns successful response', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: true,
      });

      const { result } = renderHook(() => useQueueAllowed(), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/topcat/user/queue/allowed',
        {
          params: {
            sessionId: null,
            facilityName: 'TEST',
          },
        }
      );
      expect(result.current.data).toEqual(true);
    });

    it('sends axios request to fetch cart and calls handleICATError on failure', async () => {
      (axios.get as jest.Mock).mockRejectedValue({
        message: 'Test error message',
      });

      const { result } = renderHook(() => useQueueAllowed(), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });

  describe('useQueueVisit', () => {
    it('should submit visit to the queue', async () => {
      axios.post = jest.fn().mockResolvedValue({ data: ['123', '456'] });

      const params = {
        sessionId: '',
        transport: 'https',
        email: 'cat@dog.com',
        fileName: 'test-file',
        visitId: 'VISIT_1',
        facilityName: 'TEST',
      };
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([paramName, paramValue]) => {
        searchParams.append(paramName, paramValue);
      });

      const { result } = renderHook(
        () =>
          useQueueVisit(params.facilityName, 'https://example.com/downloadApi'),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      // submit the cart
      result.current.mutate({
        emailAddress: params.email,
        fileName: params.fileName,
        transport: params.transport,
        visitId: params.visitId,
      });
      // wait for mutation to finish to finish
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(axios.post).toHaveBeenCalledWith(
        `https://example.com/downloadApi/user/queue/visit`,
        searchParams
      );
      expect(result.current.data).toEqual(['123', '456']);
    });

    it('should call handleICATError when an error is encountered', async () => {
      axios.post = jest.fn().mockRejectedValue({
        message: 'test error message',
      });

      const { result } = renderHook(
        () => useQueueVisit('LILS', 'https://example.com/downloadApi'),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      result.current.mutate({
        emailAddress: 'a@b.c',
        fileName: 'test-file',
        transport: 'https',
        visitId: 'VISIT_1',
      });
      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(handleICATError).toHaveBeenCalledWith({
        message: 'test error message',
      });
    });
  });
});

describe('getDefaultFileName', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render substitutions correctly ', async () => {
    const t = jest.fn().mockReturnValue('facilityName_visitId');
    expect(
      getDefaultFileName(t, { facilityName: 'LILS', visitId: '1' })
    ).toEqual('LILS_1');
  });

  it('should format dates if present', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2025-03-25 14:00:00'));
    const t = jest.fn().mockReturnValue('facilityName_yyyy-MM-dd_HH-mm-ss');
    expect(getDefaultFileName(t, { facilityName: 'LILS' })).toEqual(
      'LILS_2025-03-25_14-00-00'
    );
  });
});
