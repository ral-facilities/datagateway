import { renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';
import { createMemoryHistory, History } from 'history';
import { Investigation } from '../app.types';
import handleICATError from '../handleICATError';
import { createReactQueryWrapper } from '../setupTests';
import {
  downloadInvestigation,
  useInvestigation,
  useInvestigationCount,
  useInvestigationDetails,
  useInvestigationsInfinite,
  useInvestigationsPaginated,
} from './investigations';

jest.mock('../handleICATError');

describe('investigation api functions', () => {
  let mockData: Investigation[] = [];
  let history: History;
  let params: URLSearchParams;
  beforeEach(() => {
    mockData = [
      {
        id: 1,
        title: 'Test 1',
        name: 'Test 1',
        visitId: '1',
        startDate: '2021-08-12',
        endDate: '2021-08-13',
      },
      {
        id: 2,
        title: 'Test 2',
        name: 'Test 2',
        visitId: '2',
        startDate: '2021-08-12',
        endDate: '2021-08-13',
      },
      {
        id: 3,
        title: 'Test 3',
        name: 'Test 3',
        visitId: '3',
        startDate: '2021-08-12',
        endDate: '2021-08-13',
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
    jest.useRealTimers();
  });

  describe('useInvestigation', () => {
    it('sends axios request to fetch investigation by ID and returns successful response', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: [mockData[0]],
      });

      const { result } = renderHook(
        () =>
          useInvestigation(1, [
            {
              filterType: 'include',
              filterValue: JSON.stringify({
                investigationInstruments: 'instrument',
              }),
            },
          ]),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      params.append('order', JSON.stringify('id asc'));
      params.append(
        'where',
        JSON.stringify({
          id: { eq: 1 },
        })
      );
      params.append(
        'include',
        JSON.stringify({
          investigationInstruments: 'instrument',
        })
      );

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/investigations',
        expect.objectContaining({
          params,
        })
      );
      expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
        params.toString()
      );
      expect(result.current.data).toEqual([mockData[0]]);
    });

    it('sends axios request to fetch ids and calls handleICATError on failure', async () => {
      (axios.get as jest.Mock).mockRejectedValue({
        message: 'Test error',
      });
      const { result } = renderHook(() => useInvestigation(1), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(handleICATError).toHaveBeenCalledWith({ message: 'Test error' });
    });
  });

  describe('useInvestigationsPaginated', () => {
    it('sends axios request to fetch paginated investigations and returns successful response', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: mockData,
      });

      const { result, , rerender } = renderHook(
        () =>
          useInvestigationsPaginated([
            {
              filterType: 'include',
              filterValue: JSON.stringify({
                investigationInstruments: 'instrument',
              }),
            },
          ]),
        {
          wrapper: createReactQueryWrapper(history),
        }
      );

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
      params.append(
        'include',
        JSON.stringify({
          investigationInstruments: 'instrument',
        })
      );

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/investigations',
        expect.objectContaining({
          params,
        })
      );
      expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
        params.toString()
      );
      expect(result.current.data).toEqual(mockData);

      // test that order of sort object triggers new query
      history.push(
        '/?sort={"title":"desc", "name":"asc"}&filters={"name":{"value":"test","type":"include"}}&page=2&results=20'
      );
      rerender();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(axios.get as jest.Mock).toHaveBeenCalledTimes(2);
    });

    it('sends axios request to fetch paginated investigations and returns successful response when ignoreIDSort is true', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: mockData,
      });

      const { result } = renderHook(
        () =>
          useInvestigationsPaginated(
            [
              {
                filterType: 'include',
                filterValue: JSON.stringify({
                  investigationInstruments: 'instrument',
                }),
              },
            ],
            true
          ),
        {
          wrapper: createReactQueryWrapper(history),
        }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      params.append('order', JSON.stringify('name asc'));
      params.append('order', JSON.stringify('title desc'));
      params.append(
        'where',
        JSON.stringify({
          name: { ilike: 'test' },
        })
      );
      params.append('skip', JSON.stringify(20));
      params.append('limit', JSON.stringify(20));
      params.append(
        'include',
        JSON.stringify({
          investigationInstruments: 'instrument',
        })
      );

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/investigations',
        expect.objectContaining({
          params,
        })
      );
      expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
        params.toString()
      );
      expect(result.current.data).toEqual(mockData);
    });

    it('sends axios request to fetch paginated investigations and calls handleICATError on failure', async () => {
      (axios.get as jest.Mock).mockRejectedValue({
        message: 'Test error',
      });
      const { result } = renderHook(() => useInvestigationsPaginated(), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      params.append('order', JSON.stringify('id asc'));
      params.append('skip', JSON.stringify(0));
      params.append('limit', JSON.stringify(10));

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/investigations',
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

  describe('useInvestigationsInfinite', () => {
    it('sends axios request to fetch infinite investigations and returns successful response', async () => {
      (axios.get as jest.Mock).mockImplementation((url, options) =>
        options.params.get('skip') === '0'
          ? Promise.resolve({ data: mockData[0] })
          : Promise.resolve({ data: mockData[1] })
      );

      const { result, , rerender } = renderHook(
        () =>
          useInvestigationsInfinite([
            {
              filterType: 'include',
              filterValue: JSON.stringify({
                investigationInstruments: 'instrument',
              }),
            },
          ]),
        {
          wrapper: createReactQueryWrapper(history),
        }
      );

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
      params.append(
        'include',
        JSON.stringify({
          investigationInstruments: 'instrument',
        })
      );

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/investigations',
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

      await waitFor(() => expect(result.current.isFetching).toBe(false));

      expect(axios.get).toHaveBeenNthCalledWith(
        2,
        'https://example.com/api/investigations',
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

      // test that order of sort object triggers new query
      history.push(
        '/?sort={"title":"desc", "name":"asc"}&filters={"name":{"value":"test","type":"include"}}'
      );
      rerender();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(axios.get as jest.Mock).toHaveBeenCalledTimes(3);
    });

    it('sends axios request to fetch infinite investigations and returns successful response when ignoreIDSort is true', async () => {
      (axios.get as jest.Mock).mockImplementation((url, options) =>
        options.params.get('skip') === '0'
          ? Promise.resolve({ data: mockData[0] })
          : Promise.resolve({ data: mockData[1] })
      );

      const { result } = renderHook(
        () =>
          useInvestigationsInfinite(
            [
              {
                filterType: 'include',
                filterValue: JSON.stringify({
                  investigationInstruments: 'instrument',
                }),
              },
            ],
            true
          ),
        {
          wrapper: createReactQueryWrapper(history),
        }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      params.append('order', JSON.stringify('name asc'));
      params.append('order', JSON.stringify('title desc'));
      params.append(
        'where',
        JSON.stringify({
          name: { ilike: 'test' },
        })
      );
      params.append('skip', JSON.stringify(0));
      params.append('limit', JSON.stringify(50));
      params.append(
        'include',
        JSON.stringify({
          investigationInstruments: 'instrument',
        })
      );

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/investigations',
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

      await waitFor(() => expect(result.current.isFetching).toBe(false));

      expect(axios.get).toHaveBeenNthCalledWith(
        2,
        'https://example.com/api/investigations',
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

    it('sends axios request to fetch infinite investigations and calls handleICATError on failure', async () => {
      (axios.get as jest.Mock).mockRejectedValue({
        message: 'Test error',
      });
      const { result } = renderHook(() => useInvestigationsInfinite(), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      params.append('order', JSON.stringify('id asc'));
      params.append('skip', JSON.stringify(0));
      params.append('limit', JSON.stringify(50));

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/investigations',
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

  describe('useInvestigationCount', () => {
    it('sends axios request to fetch investigation count and returns successful response', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: mockData.length,
      });

      const { result } = renderHook(
        () =>
          useInvestigationCount([
            {
              filterType: 'distinct',
              filterValue: JSON.stringify(['name', 'title']),
            },
          ]),
        {
          wrapper: createReactQueryWrapper(history),
        }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      params.append(
        'where',
        JSON.stringify({
          name: { ilike: 'test' },
        })
      );
      params.append('distinct', JSON.stringify(['name', 'title']));

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/investigations/count',
        expect.objectContaining({
          params,
        })
      );
      expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
        params.toString()
      );
      expect(result.current.data).toEqual(mockData.length);
    });

    it('sends axios request to fetch investigation count and calls handleICATError on failure', async () => {
      (axios.get as jest.Mock).mockRejectedValue({
        message: 'Test error',
      });
      const { result } = renderHook(() => useInvestigationCount(), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/investigations/count',
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

  describe('useInvestigationDetails', () => {
    it('sends axios request to fetch investigation details and returns successful response', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: [mockData[0]],
      });

      const { result } = renderHook(() => useInvestigationDetails(1), {
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
        JSON.stringify([
          { investigationUsers: 'user' },
          { samples: 'type' },
          { parameters: 'type' },
          'publications',
        ])
      );

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/investigations',
        expect.objectContaining({
          params,
        })
      );
      expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
        params.toString()
      );
      expect(result.current.data).toEqual(mockData[0]);
    });

    it('sends axios request to fetch investigation details and calls handleICATError on failure', async () => {
      (axios.get as jest.Mock).mockRejectedValue({
        message: 'Test error',
      });
      const { result } = renderHook(() => useInvestigationDetails(1), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(handleICATError).toHaveBeenCalledWith({ message: 'Test error' });
    });
  });

  describe('downloadInvestigation', () => {
    it('clicks on IDS link upon downloadInvestigation action', async () => {
      jest.spyOn(document, 'createElement');
      jest.spyOn(document.body, 'appendChild');

      downloadInvestigation('https://www.example.com/ids', 1, 'test');

      expect(document.createElement).toHaveBeenCalledWith('a');
      const link = document.createElement('a');
      link.href = `https://www.example.com/ids/getData?sessionId=${null}&investigationIds=${1}&compress=${false}&zip=${true}&outname=${'test'}`;
      link.target = '_blank';
      link.style.display = 'none';
      expect(document.body.appendChild).toHaveBeenCalledWith(link);
    });
  });
});
