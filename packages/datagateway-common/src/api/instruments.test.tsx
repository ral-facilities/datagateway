import { Instrument } from '../app.types';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createMemoryHistory, History } from 'history';
import axios from 'axios';
import handleICATError from '../handleICATError';
import { createReactQueryWrapper } from '../setupTests';
import {
  useInstrumentCount,
  useInstrumentDetails,
  useInstrumentsInfinite,
  useInstrumentsPaginated,
} from './instruments';

jest.mock('../handleICATError');

describe('instrument api functions', () => {
  let mockData: Instrument[] = [];
  let history: History;
  let params: URLSearchParams;
  beforeEach(() => {
    mockData = [
      {
        id: 1,
        name: 'Test 1',
      },
      {
        id: 2,
        name: 'Test 2',
      },
    ];
    history = createMemoryHistory({
      initialEntries: [
        '/?sort={"name":"asc","title":"desc"}&filters={"name":{"value":"test","type":"include"}}&page=2&results=20',
      ],
    });
    params = new URLSearchParams();
  });

  afterEach(() => {
    (handleICATError as jest.Mock).mockClear();
    (axios.get as jest.Mock).mockClear();
  });

  describe('useInstrumentsPaginated', () => {
    it('sends axios request to fetch paginated instruments and returns successful response', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: mockData,
      });

      const { result } = renderHook(() => useInstrumentsPaginated(), {
        wrapper: createReactQueryWrapper(history),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      params.append('order', JSON.stringify('name asc'));
      params.append('order', JSON.stringify('title desc'));
      params.append('order', JSON.stringify('id asc'));
      params.append(
        'where',
        JSON.stringify({
          name: { ilike: 'test' },
        })
      );
      params.append('skip', JSON.stringify(20));
      params.append('limit', JSON.stringify(20));

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/instruments',
        expect.objectContaining({
          params,
        })
      );
      expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
        params.toString()
      );
      expect(result.current.data).toEqual(mockData);

      act(() => {
        // test that order of sort object triggers new query
        history.push(
          '/?sort={"title":"desc", "name":"asc"}&filters={"name":{"value":"test","type":"include"}}&page=2&results=20'
        );
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(axios.get as jest.Mock).toHaveBeenCalledTimes(2);
    });

    it('sends axios request to fetch paginated instruments and calls handleICATError on failure', async () => {
      (axios.get as jest.Mock).mockRejectedValue({
        message: 'Test error',
      });
      const { result } = renderHook(
        () =>
          useInstrumentsPaginated([
            {
              filterType: 'include',
              filterValue: JSON.stringify('facility'),
            },
          ]),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() => expect(result.current.isError).toBe(true));

      params.append('order', JSON.stringify('id asc'));
      params.append('skip', JSON.stringify(0));
      params.append('limit', JSON.stringify(10));
      params.append('include', JSON.stringify('facility'));

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/instruments',
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

  describe('useInstrumentsInfinite', () => {
    it('sends axios request to fetch infinite instruments and returns successful response', async () => {
      (axios.get as jest.Mock).mockImplementation((url, options) =>
        options.params.get('skip') === '0'
          ? Promise.resolve({ data: mockData[0] })
          : Promise.resolve({ data: mockData[1] })
      );

      const { result } = renderHook(() => useInstrumentsInfinite(), {
        wrapper: createReactQueryWrapper(history),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      params.append('order', JSON.stringify('name asc'));
      params.append('order', JSON.stringify('title desc'));
      params.append('order', JSON.stringify('id asc'));
      params.append(
        'where',
        JSON.stringify({
          name: { ilike: 'test' },
        })
      );
      params.append('skip', JSON.stringify(0));
      params.append('limit', JSON.stringify(50));

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/instruments',
        expect.objectContaining({
          params,
        })
      );
      expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
        params.toString()
      );
      expect(result.current.data.pages).toStrictEqual([mockData[0]]);

      await result.current.fetchNextPage({
        pageParam: { startIndex: 50, stopIndex: 74 },
      });

      await waitFor(() => expect(result.current.isFetching).toBe(false));

      expect(axios.get).toHaveBeenNthCalledWith(
        2,
        'https://example.com/api/instruments',
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

      act(() => {
        // test that order of sort object triggers new query
        history.push(
          '/?sort={"title":"desc", "name":"asc"}&filters={"name":{"value":"test","type":"include"}}'
        );
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(axios.get as jest.Mock).toHaveBeenCalledTimes(3);
    });

    it('sends axios request to fetch infinite instruments and calls handleICATError on failure', async () => {
      (axios.get as jest.Mock).mockRejectedValue({
        message: 'Test error',
      });
      const { result } = renderHook(
        () =>
          useInstrumentsInfinite([
            {
              filterType: 'include',
              filterValue: JSON.stringify('facility'),
            },
          ]),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() => expect(result.current.isError).toBe(true));

      params.append('order', JSON.stringify('id asc'));
      params.append('skip', JSON.stringify(0));
      params.append('limit', JSON.stringify(50));
      params.append('include', JSON.stringify('facility'));

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/instruments',
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

  describe('useInstrumentCount', () => {
    it('sends axios request to fetch instrument count and returns successful response', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: mockData.length,
      });

      const { result } = renderHook(() => useInstrumentCount(), {
        wrapper: createReactQueryWrapper(history),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      params.append(
        'where',
        JSON.stringify({
          name: { ilike: 'test' },
        })
      );

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/instruments/count',
        expect.objectContaining({
          params,
        })
      );
      expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
        params.toString()
      );
      expect(result.current.data).toEqual(mockData.length);
    });

    it('sends axios request to fetch instrument count and calls handleICATError on failure', async () => {
      (axios.get as jest.Mock).mockRejectedValue({
        message: 'Test error',
      });
      const { result } = renderHook(() => useInstrumentCount(), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/instruments/count',
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

  describe('useInstrumentDetails', () => {
    it('sends axios request to fetch instrument details and returns successful response', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: [mockData[0]],
      });

      const { result } = renderHook(() => useInstrumentDetails(1), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      params.append(
        'where',
        JSON.stringify({
          id: { eq: 1 },
        })
      );
      params.append(
        'include',
        JSON.stringify({ instrumentScientists: 'user' })
      );

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/instruments',
        expect.objectContaining({
          params,
        })
      );
      expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
        params.toString()
      );
      expect(result.current.data).toEqual(mockData[0]);
    });

    it('sends axios request to fetch instrument details and calls handleICATError on failure', async () => {
      (axios.get as jest.Mock).mockRejectedValue({
        message: 'Test error',
      });
      const { result } = renderHook(() => useInstrumentDetails(1), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(handleICATError).toHaveBeenCalledWith({ message: 'Test error' });
    });
  });
});
