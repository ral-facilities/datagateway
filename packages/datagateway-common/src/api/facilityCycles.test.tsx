import { FacilityCycle } from '../app.types';
import { renderHook } from '@testing-library/react-hooks';
import { createMemoryHistory, History } from 'history';
import axios from 'axios';
import handleICATError from '../handleICATError';
import { createReactQueryWrapper } from '../setupTests';
import {
  useAllFacilityCycles,
  useFacilityCycleCount,
  useFacilityCyclesInfinite,
  useFacilityCyclesPaginated,
} from './facilityCycles';

jest.mock('../handleICATError');

describe('facility cycle api functions', () => {
  let mockData: FacilityCycle[] = [];
  let history: History;
  let params: URLSearchParams;
  beforeEach(() => {
    mockData = [
      {
        id: 1,
        name: 'Test 1',
        description: 'Test 1',
        startDate: '2019-07-03',
        endDate: '2019-07-04',
      },
      {
        id: 2,
        name: 'Test 2',
        description: 'Test 2',
        startDate: '2019-07-03',
        endDate: '2019-07-04',
      },
    ];
    history = createMemoryHistory({
      initialEntries: [
        '/?sort={"name":"asc"}&filters={"name":{"value":"test","type":"include"}}&page=2&results=20',
      ],
    });
    params = new URLSearchParams();
  });

  afterEach(() => {
    (handleICATError as jest.Mock).mockClear();
    (axios.get as jest.Mock).mockClear();
  });

  describe('useAllFacilityCycles', () => {
    it('sends axios request to fetch all facility cycles and returns successful response', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: mockData,
      });

      const { result, waitFor } = renderHook(() => useAllFacilityCycles(), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => result.current.isSuccess);

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/facilitycycles',
        {
          headers: { Authorization: 'Bearer null' },
        }
      );
      expect(result.current.data).toEqual(mockData);
    });

    it('sends axios request to fetch all facility cycles and calls handleICATError on failure', async () => {
      (axios.get as jest.Mock).mockRejectedValue({
        message: 'Test error',
      });
      const { result, waitFor } = renderHook(() => useAllFacilityCycles(), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => result.current.isError);

      expect(handleICATError).toHaveBeenCalledWith({ message: 'Test error' });
    });
  });

  describe('useFacilityCyclesPaginated', () => {
    it('sends axios request to fetch paginated facility cycles and returns successful response', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: mockData,
      });

      const { result, waitFor } = renderHook(
        () => useFacilityCyclesPaginated(1),
        {
          wrapper: createReactQueryWrapper(history),
        }
      );

      await waitFor(() => result.current.isSuccess);

      params.append('order', JSON.stringify('name asc'));
      params.append('order', JSON.stringify('id asc'));
      params.append(
        'where',
        JSON.stringify({
          name: { like: 'test' },
        })
      );
      params.append('skip', JSON.stringify(20));
      params.append('limit', JSON.stringify(20));

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/instruments/1/facilitycycles',
        expect.objectContaining({
          params,
        })
      );
      expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
        params.toString()
      );
      expect(result.current.data).toEqual(mockData);
    });

    it('sends axios request to fetch paginated facility cycles and calls handleICATError on failure', async () => {
      (axios.get as jest.Mock).mockRejectedValue({
        message: 'Test error',
      });
      const { result, waitFor } = renderHook(
        () => useFacilityCyclesPaginated(1),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() => result.current.isError);

      params.append('order', JSON.stringify('id asc'));
      params.append('skip', JSON.stringify(0));
      params.append('limit', JSON.stringify(10));

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/instruments/1/facilitycycles',
        expect.objectContaining({
          params,
        })
      );
      expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
        params.toString()
      );
      expect(handleICATError).toHaveBeenCalledWith({ message: 'Test error' });
    });
  });

  describe('useFacilityCyclesInfinite', () => {
    it('sends axios request to fetch infinite facility cycles and returns successful response', async () => {
      (axios.get as jest.Mock).mockImplementation((url, options) =>
        options.params.get('skip') === '0'
          ? Promise.resolve({ data: mockData[0] })
          : Promise.resolve({ data: mockData[1] })
      );

      const { result, waitFor } = renderHook(
        () => useFacilityCyclesInfinite(1),
        {
          wrapper: createReactQueryWrapper(history),
        }
      );

      await waitFor(() => result.current.isSuccess);

      params.append('order', JSON.stringify('name asc'));
      params.append('order', JSON.stringify('id asc'));
      params.append(
        'where',
        JSON.stringify({
          name: { like: 'test' },
        })
      );
      params.append('skip', JSON.stringify(0));
      params.append('limit', JSON.stringify(50));

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/instruments/1/facilitycycles',
        expect.objectContaining({
          params,
        })
      );
      expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
        params.toString()
      );
      expect(result.current.data.pages).toStrictEqual([mockData[0]]);

      result.current.fetchNextPage({
        pageParam: { startIndex: 50, stopIndex: 74 },
      });

      await waitFor(() => result.current.isFetching);

      await waitFor(() => !result.current.isFetching);

      expect(axios.get).toHaveBeenNthCalledWith(
        2,
        'https://example.com/api/instruments/1/facilitycycles',
        expect.objectContaining({
          params,
        })
      );
      params.set('skip', JSON.stringify(50));
      params.set('limit', JSON.stringify(25));
      expect((axios.get as jest.Mock).mock.calls[1][1].params.toString()).toBe(
        params.toString()
      );

      expect(result.current.data.pages).toStrictEqual([
        mockData[0],
        mockData[1],
      ]);
    });

    it('sends axios request to fetch infinite facility cycles and calls handleICATError on failure', async () => {
      (axios.get as jest.Mock).mockRejectedValue({
        message: 'Test error',
      });
      const { result, waitFor } = renderHook(
        () => useFacilityCyclesInfinite(1),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() => result.current.isError);

      params.append('order', JSON.stringify('id asc'));
      params.append('skip', JSON.stringify(0));
      params.append('limit', JSON.stringify(50));

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/instruments/1/facilitycycles',
        expect.objectContaining({
          params,
        })
      );
      expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
        params.toString()
      );
      expect(handleICATError).toHaveBeenCalledWith({ message: 'Test error' });
    });
  });

  describe('useFacilityCycleCount', () => {
    it('sends axios request to fetch facility cycle count and returns successful response', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: mockData.length,
      });

      const { result, waitFor } = renderHook(() => useFacilityCycleCount(1), {
        wrapper: createReactQueryWrapper(history),
      });

      await waitFor(() => result.current.isSuccess);

      params.append(
        'where',
        JSON.stringify({
          name: { like: 'test' },
        })
      );

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/instruments/1/facilitycycles/count',
        expect.objectContaining({
          params,
        })
      );
      expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
        params.toString()
      );
      expect(result.current.data).toEqual(mockData.length);
    });

    it('sends axios request to fetch facility cycle count and calls handleICATError on failure', async () => {
      (axios.get as jest.Mock).mockRejectedValue({
        message: 'Test error',
      });
      const { result, waitFor } = renderHook(() => useFacilityCycleCount(1), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => result.current.isError);

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/instruments/1/facilitycycles/count',
        expect.objectContaining({
          params,
        })
      );
      expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
        params.toString()
      );
      expect(handleICATError).toHaveBeenCalledWith({ message: 'Test error' });
    });
  });
});
