import { renderHook } from '@testing-library/react-hooks';
import axios from 'axios';
import { useCart, useAddToCart, useRemoveFromCart } from '.';
import { DownloadCart } from '../app.types';
import handleICATError from '../handleICATError';
import { createReactQueryWrapper } from '../setupTests';

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
          code: '431',
          message: 'Test 431 error message',
        })
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
          code: '431',
          message: 'Test 431 error message',
        })
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
});
