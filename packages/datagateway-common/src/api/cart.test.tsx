import { act, renderHook } from '@testing-library/react-hooks';
import axios, { AxiosError } from 'axios';
import {
  useCart,
  useAddToCart,
  useRemoveFromCart,
  useSubmitCart,
  useDownloadTypeStatuses,
} from '.';
import { DownloadCart } from '../app.types';
import handleICATError from '../handleICATError';
import { createReactQueryWrapper } from '../setupTests';
import { QueryClient } from 'react-query';
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

      const { result, waitFor } = renderHook(() => useCart(), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => result.current.isSuccess);

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

      expect(result.current.isIdle).toBe(true);
      expect(axios.get).not.toHaveBeenCalled();
    });

    it('sends axios request to fetch cart and calls handleICATError on failure', async () => {
      (axios.get as jest.Mock).mockRejectedValue({
        message: 'Test error message',
      });

      const { result, waitFor } = renderHook(() => useCart(), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => result.current.isError);

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

      const { result, waitFor } = renderHook(() => useAddToCart('dataset'), {
        wrapper: createReactQueryWrapper(),
      });

      expect(axios.get).not.toHaveBeenCalled();
      expect(result.current.isIdle).toBe(true);

      result.current.mutate([1, 2]);

      await waitFor(() => result.current.isSuccess);

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

      const { result, waitFor } = renderHook(() => useAddToCart('dataset'), {
        wrapper: createReactQueryWrapper(),
      });

      expect(axios.post).not.toHaveBeenCalled();
      expect(result.current.isIdle).toBe(true);

      result.current.mutate([1, 2]);

      await waitFor(() => result.current.isError, { timeout: 2000 });

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

      const { result, waitFor } = renderHook(
        () => useRemoveFromCart('dataset'),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      expect(axios.get).not.toHaveBeenCalled();
      expect(result.current.isIdle).toBe(true);

      result.current.mutate([1, 2]);

      await waitFor(() => result.current.isSuccess);

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

      const { result, waitFor } = renderHook(
        () => useRemoveFromCart('dataset'),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      expect(axios.post).not.toHaveBeenCalled();
      expect(result.current.isIdle).toBe(true);

      result.current.mutate([1, 2]);

      await waitFor(() => result.current.isError, { timeout: 2000 });

      expect(result.current.failureCount).toBe(2);
      expect(handleICATError).toHaveBeenCalledTimes(1);
      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });

  describe('useSubmitCart', () => {
    it('should submit cart and clear cart on success', async () => {
      axios.post = jest.fn().mockResolvedValue({ data: 123 });
      axios.get = jest
        .fn()
        .mockResolvedValueOnce({
          data: mockData,
        })
        .mockResolvedValueOnce({ data: { cartItems: [] } });

      const { result, waitFor } = renderHook(
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
      await waitFor(() => result.current.useCart.isSuccess);
      // submit the cart
      result.current.useSubmitCart.mutate({
        emailAddress: 'cat@dog.com',
        fileName: 'test-file',
        transport: 'https',
      });
      // wait for cart submission to finish
      await waitFor(() => result.current.useSubmitCart.isSuccess);

      expect(result.current.useCart.data).toEqual([]);
    });

    it('should call handleICATError when an error is encountered', async () => {
      axios.post = jest.fn().mockRejectedValue({
        message: 'test error message',
      });
      axios.get = jest.fn().mockResolvedValueOnce({
        data: mockData,
      });

      const { result, waitFor } = renderHook(
        () => ({
          useSubmitCart: useSubmitCart(
            'LILS',
            'https://example.com/downloadApiUrl'
          ),
          useCart: useCart(),
        }),
        { wrapper: createReactQueryWrapper() }
      );

      await waitFor(() => result.current.useCart.isSuccess);
      result.current.useSubmitCart.mutate({
        emailAddress: 'a@b.c',
        fileName: 'test-file',
        transport: 'https',
      });
      await waitFor(() => result.current.useSubmitCart.isError);

      expect(handleICATError).toHaveBeenCalledWith({
        message: 'test error message',
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

      const { result, waitFor } = renderHook(
        () =>
          useDownloadTypeStatuses({
            downloadTypes,
            facilityName: 'LILS',
            downloadApiUrl: 'https://example.com/downloadApiUrl',
          }),
        { wrapper: createReactQueryWrapper() }
      );

      await waitFor(() => result.current.every((query) => query.isSuccess));

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

      const { result, waitFor } = renderHook(
        () =>
          useDownloadTypeStatuses({
            downloadTypes,
            facilityName: 'LILS',
            downloadApiUrl: 'https://example.com/downloadApiUrl',
          }),
        { wrapper: createReactQueryWrapper() }
      );

      await waitFor(() =>
        result.current.every((query) => query.isSuccess || query.isError)
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

      const { result, waitFor } = renderHook(
        () =>
          useDownloadTypeStatuses({
            downloadTypes: ['https'],
            facilityName: 'LILS',
            downloadApiUrl: 'https://example.com/downloadApiUrl',
          }),
        { wrapper }
      );

      await waitFor(() => result.current.every((query) => query.isSuccess));

      expect(result.current[0].isStale).toBe(true);
      expect(axios.get).toHaveBeenCalledTimes(1);

      await act(async () => {
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
          newResult.current.every((query) => query.isSuccess)
        );

        expect(newResult.current[0].isStale).toBe(true);
        expect(axios.get).toHaveBeenCalledTimes(2);
      });
    });
  });
});
