import { Investigation } from '../app.types';
import { act, renderHook } from '@testing-library/react-hooks';
import { createMemoryHistory, History } from 'history';
import axios from 'axios';
import handleICATError from '../handleICATError';
import { createReactQueryWrapper } from '../setupTests';
import {
  downloadInvestigation,
  useInvestigation,
  useInvestigationCount,
  useInvestigationDetails,
  useInvestigationsDatasetCount,
  useInvestigationsInfinite,
  useInvestigationSize,
  useInvestigationSizes,
  useInvestigationsPaginated,
  useISISInvestigationCount,
  useISISInvestigationIds,
  useISISInvestigationsInfinite,
  useISISInvestigationsPaginated,
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
        '/?sort={"name":"asc"}&filters={"name":{"value":"test","type":"include"}}&page=2&results=20',
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

      const { result, waitFor } = renderHook(
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

      await waitFor(() => result.current.isSuccess);

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
      const { result, waitFor } = renderHook(() => useInvestigation(1), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => result.current.isError);

      expect(handleICATError).toHaveBeenCalledWith({ message: 'Test error' });
    });
  });

  describe('useInvestigationsPaginated', () => {
    it('sends axios request to fetch paginated investigations and returns successful response', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: mockData,
      });

      const { result, waitFor } = renderHook(
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

      await waitFor(() => result.current.isSuccess);

      params.append('order', JSON.stringify('name asc'));
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
    });

    it('sends axios request to fetch paginated investigations and returns successful response when ignoreIDSort is true', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: mockData,
      });

      const { result, waitFor } = renderHook(
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

      await waitFor(() => result.current.isSuccess);

      params.append('order', JSON.stringify('name asc'));
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
      const { result, waitFor } = renderHook(
        () => useInvestigationsPaginated(),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() => result.current.isError);

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

      const { result, waitFor } = renderHook(
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

      await waitFor(() => result.current.isSuccess);

      params.append('order', JSON.stringify('name asc'));
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

      await waitFor(() => result.current.isFetching);

      await waitFor(() => !result.current.isFetching);

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

    it('sends axios request to fetch infinite investigations and returns successful response when ignoreIDSort is true', async () => {
      (axios.get as jest.Mock).mockImplementation((url, options) =>
        options.params.get('skip') === '0'
          ? Promise.resolve({ data: mockData[0] })
          : Promise.resolve({ data: mockData[1] })
      );

      const { result, waitFor } = renderHook(
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

      await waitFor(() => result.current.isSuccess);

      params.append('order', JSON.stringify('name asc'));
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

      await waitFor(() => result.current.isFetching);

      await waitFor(() => !result.current.isFetching);

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
      const { result, waitFor } = renderHook(
        () => useInvestigationsInfinite(),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() => result.current.isError);

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

  describe('useInvestigationSize', () => {
    it('sends axios request to fetch investigation size once refetch function is called and returns successful response', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: 1,
      });

      const { result, waitFor } = renderHook(() => useInvestigationSize(1), {
        wrapper: createReactQueryWrapper(),
      });

      expect(axios.get).not.toHaveBeenCalled();
      expect(result.current.isIdle).toBe(true);

      result.current.refetch();

      await waitFor(() => result.current.isSuccess);

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/topcat/user/getSize',
        {
          params: {
            sessionId: null,
            facilityName: 'TEST',
            entityType: 'investigation',
            entityId: 1,
          },
        }
      );
      expect(result.current.data).toEqual(1);
    });

    it('sends axios request to fetch investigation size once refetch function is called and calls handleICATError on failure', async () => {
      (axios.get as jest.Mock).mockRejectedValue({
        message: 'Test error',
      });
      const { result, waitFor } = renderHook(() => useInvestigationSize(1), {
        wrapper: createReactQueryWrapper(),
      });

      expect(axios.get).not.toHaveBeenCalled();
      expect(result.current.isIdle).toBe(true);

      result.current.refetch();

      await waitFor(() => result.current.isError);

      expect(handleICATError).toHaveBeenCalledWith({ message: 'Test error' });
    });
  });

  describe('useInvestigationSizes', () => {
    it('sends axios request to fetch investigation sizes given paginated data and returns successful response', async () => {
      (axios.get as jest.Mock).mockImplementation((url, options) =>
        Promise.resolve({
          data: options.params.entityId ?? 0,
        })
      );

      const { result, waitFor } = renderHook(
        () => useInvestigationSizes(mockData),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() => result.current.every((query) => query.isSuccess));

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/topcat/user/getSize',
        {
          params: {
            sessionId: null,
            facilityName: 'TEST',
            entityType: 'investigation',
            entityId: 1,
          },
        }
      );
      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/topcat/user/getSize',
        {
          params: {
            sessionId: null,
            facilityName: 'TEST',
            entityType: 'investigation',
            entityId: 2,
          },
        }
      );
      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/topcat/user/getSize',
        {
          params: {
            sessionId: null,
            facilityName: 'TEST',
            entityType: 'investigation',
            entityId: 3,
          },
        }
      );
      expect(result.current.map((query) => query.data)).toEqual([1, 2, 3]);
    });

    it('sends axios request to fetch investigation sizes given infinite data and returns successful response', async () => {
      (axios.get as jest.Mock).mockImplementation((url, options) =>
        Promise.resolve({
          data: options.params.entityId ?? 0,
        })
      );

      const pagedData = { pages: [mockData], pageParams: null };
      const { result, waitFor } = renderHook(
        () => useInvestigationSizes(pagedData),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() => result.current.every((query) => query.isSuccess));

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/topcat/user/getSize',
        {
          params: {
            sessionId: null,
            facilityName: 'TEST',
            entityType: 'investigation',
            entityId: 1,
          },
        }
      );
      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/topcat/user/getSize',
        {
          params: {
            sessionId: null,
            facilityName: 'TEST',
            entityType: 'investigation',
            entityId: 2,
          },
        }
      );
      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/topcat/user/getSize',
        {
          params: {
            sessionId: null,
            facilityName: 'TEST',
            entityType: 'investigation',
            entityId: 3,
          },
        }
      );
      expect(result.current.map((query) => query.data)).toEqual([1, 2, 3]);
    });

    it('sends axios request to fetch investigation sizes and calls handleICATError on failure', async () => {
      (axios.get as jest.Mock).mockRejectedValue({
        message: 'Test error',
      });
      const { result, waitFor } = renderHook(
        () => useInvestigationSizes(mockData[0]),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() => result.current.every((query) => query.isError));

      expect(handleICATError).toHaveBeenCalledTimes(1);
      expect(handleICATError).toHaveBeenCalledWith(
        { message: 'Test error' },
        false
      );
    });

    it("doesn't send any requests if the array supplied is empty to undefined", () => {
      let data = [];
      const { result: emptyResult } = renderHook(
        () => useInvestigationSizes(data),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      expect(emptyResult.current.length).toBe(0);
      expect(axios.get).not.toHaveBeenCalled();

      data = undefined;
      const { result: undefinedResult } = renderHook(
        () => useInvestigationSizes(data),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      expect(undefinedResult.current.length).toBe(0);
      expect(axios.get).not.toHaveBeenCalled();
    });

    it('batches updates correctly & updates results correctly when data updates', async () => {
      jest.useFakeTimers();
      mockData = [
        {
          id: 1,
          title: 'Test 1',
          name: 'Test 1',
          visitId: '1',
        },
        {
          id: 2,
          title: 'Test 2',
          name: 'Test 2',
          visitId: '2',
        },
        {
          id: 3,
          title: 'Test 3',
          name: 'Test 3',
          visitId: '3',
        },
        {
          id: 4,
          title: 'Test 4',
          name: 'Test 4',
          visitId: '4',
        },
        {
          id: 5,
          title: 'Test 5',
          name: 'Test 5',
          visitId: '5',
        },
        {
          id: 6,
          title: 'Test 6',
          name: 'Test 6',
          visitId: '6',
        },
        {
          id: 7,
          title: 'Test 7',
          name: 'Test 7',
          visitId: '7',
        },
      ];
      (axios.get as jest.Mock).mockImplementation(
        (url, options) =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  data: options.params.entityId ?? 0,
                }),
              options.params.entityId * 10
            )
          )
      );

      const { result, rerender, waitForNextUpdate } = renderHook(
        () => useInvestigationSizes(mockData),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      jest.advanceTimersByTime(30);
      await act(async () => {
        await Promise.resolve();
      });
      expect(result.current.map((query) => query.data)).toEqual(
        Array(7).fill(undefined)
      );

      jest.advanceTimersByTime(40);
      await act(async () => {
        await Promise.resolve();
      });
      expect(result.current.map((query) => query.data)).toEqual([
        1,
        2,
        3,
        4,
        5,
        6,
        7,
      ]);

      mockData = [
        {
          id: 4,
          title: 'Test 4',
          name: 'Test 4',
          visitId: '4',
        },
      ];

      await act(async () => {
        rerender();
        await waitForNextUpdate();
      });

      expect(result.current.map((query) => query.data)).toEqual([4]);
    });
  });

  describe('useInvestigationsDatasetCount', () => {
    it('sends axios request to fetch investigation dataset counts given paginated data and returns successful response', async () => {
      (axios.get as jest.Mock).mockImplementation((url, options) =>
        Promise.resolve({
          data:
            JSON.parse(options.params.get('where'))['investigation.id'].eq ?? 0,
        })
      );

      const { result, waitFor } = renderHook(
        () => useInvestigationsDatasetCount(mockData),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() => result.current.every((query) => query.isSuccess));

      params.append(
        'where',
        JSON.stringify({
          'investigation.id': { eq: 1 },
        })
      );
      expect(axios.get).toHaveBeenNthCalledWith(
        1,
        'https://example.com/api/datasets/count',
        expect.objectContaining({
          params,
        })
      );
      expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
        params.toString()
      );

      params.set(
        'where',
        JSON.stringify({
          'investigation.id': { eq: 2 },
        })
      );
      expect(axios.get).toHaveBeenNthCalledWith(
        2,
        'https://example.com/api/datasets/count',
        expect.objectContaining({
          params,
        })
      );
      expect((axios.get as jest.Mock).mock.calls[1][1].params.toString()).toBe(
        params.toString()
      );

      params.set(
        'where',
        JSON.stringify({
          'investigation.id': { eq: 3 },
        })
      );
      expect(axios.get).toHaveBeenNthCalledWith(
        3,
        'https://example.com/api/datasets/count',
        expect.objectContaining({
          params,
        })
      );
      expect((axios.get as jest.Mock).mock.calls[2][1].params.toString()).toBe(
        params.toString()
      );

      expect(result.current.map((query) => query.data)).toEqual([1, 2, 3]);
    });

    it('sends axios request to fetch investigation dataset counts given infinite data and returns successful response', async () => {
      (axios.get as jest.Mock).mockImplementation((url, options) =>
        Promise.resolve({
          data:
            JSON.parse(options.params.get('where'))['investigation.id'].eq ?? 0,
        })
      );

      const pagedData = {
        pages: [mockData],
        pageParams: null,
      };
      const { result, waitFor } = renderHook(
        () => useInvestigationsDatasetCount(pagedData),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() => result.current.every((query) => query.isSuccess));

      params.append(
        'where',
        JSON.stringify({
          'investigation.id': { eq: 1 },
        })
      );
      expect(axios.get).toHaveBeenNthCalledWith(
        1,
        'https://example.com/api/datasets/count',
        expect.objectContaining({
          params,
        })
      );
      expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
        params.toString()
      );

      params.set(
        'where',
        JSON.stringify({
          'investigation.id': { eq: 2 },
        })
      );
      expect(axios.get).toHaveBeenNthCalledWith(
        2,
        'https://example.com/api/datasets/count',
        expect.objectContaining({
          params,
        })
      );
      expect((axios.get as jest.Mock).mock.calls[1][1].params.toString()).toBe(
        params.toString()
      );

      params.set(
        'where',
        JSON.stringify({
          'investigation.id': { eq: 3 },
        })
      );
      expect(axios.get).toHaveBeenNthCalledWith(
        3,
        'https://example.com/api/datasets/count',
        expect.objectContaining({
          params,
        })
      );
      expect((axios.get as jest.Mock).mock.calls[2][1].params.toString()).toBe(
        params.toString()
      );

      expect(result.current.map((query) => query.data)).toEqual([1, 2, 3]);
    });

    it('sends axios request to fetch investigation dataset counts once refetch function is called and calls handleICATError on failure', async () => {
      (axios.get as jest.Mock).mockRejectedValue({
        message: 'Test error',
      });
      const { result, waitFor } = renderHook(
        () => useInvestigationsDatasetCount(mockData[0]),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      // for some reason we need to flush promise queue in this test
      await act(async () => {
        await Promise.resolve();
      });

      await waitFor(() => result.current.every((query) => query.isError));

      expect(handleICATError).toHaveBeenCalledTimes(1);
      expect(handleICATError).toHaveBeenCalledWith(
        { message: 'Test error' },
        false
      );
    });

    it("doesn't send any requests if the array supplied is empty to undefined", () => {
      let data = [];
      const { result: emptyResult } = renderHook(
        () => useInvestigationsDatasetCount(data),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      expect(emptyResult.current.length).toBe(0);
      expect(axios.get).not.toHaveBeenCalled();

      data = undefined;
      const { result: undefinedResult } = renderHook(
        () => useInvestigationsDatasetCount(data),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      expect(undefinedResult.current.length).toBe(0);
      expect(axios.get).not.toHaveBeenCalled();
    });

    it('batches updates correctly & updates results correctly when data updates', async () => {
      jest.useFakeTimers();
      mockData = [
        {
          id: 1,
          title: 'Test 1',
          name: 'Test 1',
          visitId: '1',
        },
        {
          id: 2,
          title: 'Test 2',
          name: 'Test 2',
          visitId: '2',
        },
        {
          id: 3,
          title: 'Test 3',
          name: 'Test 3',
          visitId: '3',
        },
        {
          id: 4,
          title: 'Test 4',
          name: 'Test 4',
          visitId: '4',
        },
        {
          id: 5,
          title: 'Test 5',
          name: 'Test 5',
          visitId: '5',
        },
        {
          id: 6,
          title: 'Test 6',
          name: 'Test 6',
          visitId: '6',
        },
        {
          id: 7,
          title: 'Test 7',
          name: 'Test 7',
          visitId: '7',
        },
      ];
      (axios.get as jest.Mock).mockImplementation(
        (url, options) =>
          new Promise((resolve) => {
            const id = JSON.parse(options.params.get('where'))[
              'investigation.id'
            ].eq;
            return setTimeout(
              () =>
                resolve({
                  data: id ?? 0,
                }),
              id * 10
            );
          })
      );

      const { result, rerender, waitForNextUpdate } = renderHook(
        () => useInvestigationsDatasetCount(mockData),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      jest.advanceTimersByTime(30);
      await act(async () => {
        await Promise.resolve();
      });
      expect(result.current.map((query) => query.data)).toEqual(
        Array(7).fill(undefined)
      );

      jest.advanceTimersByTime(40);
      await act(async () => {
        await Promise.resolve();
      });
      expect(result.current.map((query) => query.data)).toEqual([
        1,
        2,
        3,
        4,
        5,
        6,
        7,
      ]);

      mockData = [
        {
          id: 4,
          title: 'Test 4',
          name: 'Test 4',
          visitId: '4',
        },
      ];

      await act(async () => {
        rerender();
        await waitForNextUpdate();
      });

      expect(result.current.map((query) => query.data)).toEqual([4]);
    });
  });

  describe('useInvestigationCount', () => {
    it('sends axios request to fetch investigation count and returns successful response', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: mockData.length,
      });

      const { result, waitFor } = renderHook(
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

      await waitFor(() => result.current.isSuccess);

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

    it('sends axios request to fetch investigation count and returns successful response using stored filters', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: mockData.length,
      });

      const { result, waitFor } = renderHook(
        () =>
          useInvestigationCount(
            [
              {
                filterType: 'distinct',
                filterValue: JSON.stringify(['name', 'title']),
              },
            ],
            {
              name: { value: 'test2', type: 'include' },
            },
            'datafile'
          ),
        {
          wrapper: createReactQueryWrapper(history),
        }
      );

      await waitFor(() => result.current.isSuccess);

      params.append(
        'where',
        JSON.stringify({
          name: { ilike: 'test2' },
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
      const { result, waitFor } = renderHook(() => useInvestigationCount(), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => result.current.isError);

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

      const { result, waitFor } = renderHook(() => useInvestigationDetails(1), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => result.current.isSuccess);

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
          'samples',
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
      const { result, waitFor } = renderHook(() => useInvestigationDetails(1), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => result.current.isError);

      expect(handleICATError).toHaveBeenCalledWith({ message: 'Test error' });
    });
  });

  describe('ISIS Investigations', () => {
    describe('useISISInvestigationsPaginated', () => {
      it('sends axios request to fetch paginated ISIS investigations in facility cycle hierarchy and returns successful response', async () => {
        (axios.get as jest.Mock).mockResolvedValue({
          data: mockData,
        });

        const { result, waitFor } = renderHook(
          () => useISISInvestigationsPaginated(1, 2, false),
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
            name: { ilike: 'test' },
          })
        );
        params.append('skip', JSON.stringify(20));
        params.append('limit', JSON.stringify(20));
        params.append(
          'include',
          JSON.stringify([
            { investigationInstruments: 'instrument' },
            { studyInvestigations: 'study' },
            { investigationUsers: 'user' },
          ])
        );

        expect(axios.get).toHaveBeenCalledWith(
          'https://example.com/api/instruments/1/facilitycycles/2/investigations',
          expect.objectContaining({
            params,
          })
        );
        expect(
          (axios.get as jest.Mock).mock.calls[0][1].params.toString()
        ).toBe(params.toString());
        expect(result.current.data).toEqual(mockData);
      });

      it('sends axios request to fetch paginated ISIS investigations in study hierarchy and returns successful response', async () => {
        (axios.get as jest.Mock).mockResolvedValue({
          data: mockData,
        });

        const { result, waitFor } = renderHook(
          () => useISISInvestigationsPaginated(1, 2, true),
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
            name: { ilike: 'test' },
          })
        );
        params.append('skip', JSON.stringify(20));
        params.append('limit', JSON.stringify(20));
        params.append(
          'where',
          JSON.stringify({
            'investigationInstruments.instrument.id': { eq: 1 },
          })
        );
        params.append(
          'where',
          JSON.stringify({
            'studyInvestigations.study.id': { eq: 2 },
          })
        );
        params.append(
          'include',
          JSON.stringify([
            { investigationInstruments: 'instrument' },
            { studyInvestigations: 'study' },
            { investigationUsers: 'user' },
          ])
        );

        expect(axios.get).toHaveBeenCalledWith(
          'https://example.com/api/investigations',
          expect.objectContaining({
            params,
          })
        );
        expect(
          (axios.get as jest.Mock).mock.calls[0][1].params.toString()
        ).toBe(params.toString());
        expect(result.current.data).toEqual(mockData);
      });

      it('sends axios request to fetch paginated ISIS investigations and calls handleICATError on failure', async () => {
        (axios.get as jest.Mock).mockRejectedValue({
          message: 'Test error',
        });
        const { result, waitFor } = renderHook(
          () => useISISInvestigationsPaginated(1, 2, false),
          {
            wrapper: createReactQueryWrapper(),
          }
        );

        await waitFor(() => result.current.isError);

        params.append('order', JSON.stringify('id asc'));
        params.append('skip', JSON.stringify(0));
        params.append('limit', JSON.stringify(10));
        params.append(
          'include',
          JSON.stringify([
            { investigationInstruments: 'instrument' },
            { studyInvestigations: 'study' },
            { investigationUsers: 'user' },
          ])
        );

        expect(axios.get).toHaveBeenCalledWith(
          'https://example.com/api/instruments/1/facilitycycles/2/investigations',
          expect.objectContaining({
            params,
          })
        );
        expect(
          (axios.get as jest.Mock).mock.calls[0][1].params.toString()
        ).toBe(params.toString());
        expect(handleICATError).toHaveBeenCalledWith({ message: 'Test error' });
      });
    });

    describe('useISISInvestigationsInfinite', () => {
      it('sends axios request to fetch infinite ISIS investigations in facility hierarchy and returns successful response', async () => {
        (axios.get as jest.Mock).mockImplementation((url, options) =>
          options.params.get('skip') === '0'
            ? Promise.resolve({ data: mockData[0] })
            : Promise.resolve({ data: mockData[1] })
        );

        const { result, waitFor } = renderHook(
          () => useISISInvestigationsInfinite(1, 2, false),
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
            name: { ilike: 'test' },
          })
        );
        params.append('skip', JSON.stringify(0));
        params.append('limit', JSON.stringify(50));
        params.append(
          'include',
          JSON.stringify([
            { investigationInstruments: 'instrument' },
            { studyInvestigations: 'study' },
            { investigationUsers: 'user' },
          ])
        );

        expect(axios.get).toHaveBeenCalledWith(
          'https://example.com/api/instruments/1/facilitycycles/2/investigations',
          expect.objectContaining({
            params,
          })
        );
        expect(
          (axios.get as jest.Mock).mock.calls[0][1].params.toString()
        ).toBe(params.toString());
        expect(result.current.data.pages).toStrictEqual([mockData[0]]);

        result.current.fetchNextPage({
          pageParam: { startIndex: 50, stopIndex: 74 },
        });

        await waitFor(() => result.current.isFetching);

        await waitFor(() => !result.current.isFetching);

        expect(axios.get).toHaveBeenNthCalledWith(
          2,
          'https://example.com/api/instruments/1/facilitycycles/2/investigations',
          expect.objectContaining({
            params,
          })
        );
        params.set('skip', JSON.stringify(50));
        params.set('limit', JSON.stringify(25));
        expect(
          (axios.get as jest.Mock).mock.calls[1][1].params.toString()
        ).toBe(params.toString());

        expect(result.current.data.pages).toStrictEqual([
          mockData[0],
          mockData[1],
        ]);
      });

      it('sends axios request to fetch infinite ISIS investigations in study hierarchy and returns successful response', async () => {
        (axios.get as jest.Mock).mockImplementation((url, options) =>
          options.params.get('skip') === '0'
            ? Promise.resolve({ data: mockData[0] })
            : Promise.resolve({ data: mockData[1] })
        );

        const { result, waitFor } = renderHook(
          () => useISISInvestigationsInfinite(1, 2, true),
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
            name: { ilike: 'test' },
          })
        );
        params.append('skip', JSON.stringify(0));
        params.append('limit', JSON.stringify(50));
        params.append(
          'where',
          JSON.stringify({
            'investigationInstruments.instrument.id': { eq: 1 },
          })
        );
        params.append(
          'where',
          JSON.stringify({
            'studyInvestigations.study.id': { eq: 2 },
          })
        );
        params.append(
          'include',
          JSON.stringify([
            { investigationInstruments: 'instrument' },
            { studyInvestigations: 'study' },
            { investigationUsers: 'user' },
          ])
        );

        expect(axios.get).toHaveBeenCalledWith(
          'https://example.com/api/investigations',
          expect.objectContaining({
            params,
          })
        );
        expect(
          (axios.get as jest.Mock).mock.calls[0][1].params.toString()
        ).toBe(params.toString());
        expect(result.current.data.pages).toStrictEqual([mockData[0]]);

        result.current.fetchNextPage({
          pageParam: { startIndex: 50, stopIndex: 74 },
        });

        await waitFor(() => result.current.isFetching);

        await waitFor(() => !result.current.isFetching);

        expect(axios.get).toHaveBeenNthCalledWith(
          2,
          'https://example.com/api/investigations',
          expect.objectContaining({
            params,
          })
        );
        params.set('skip', JSON.stringify(50));
        params.set('limit', JSON.stringify(25));
        expect(
          (axios.get as jest.Mock).mock.calls[1][1].params.toString()
        ).toBe(params.toString());

        expect(result.current.data.pages).toStrictEqual([
          mockData[0],
          mockData[1],
        ]);
      });

      it('sends axios request to fetch infinite ISIS investigations and calls handleICATError on failure', async () => {
        (axios.get as jest.Mock).mockRejectedValue({
          message: 'Test error',
        });
        const { result, waitFor } = renderHook(
          () => useISISInvestigationsInfinite(1, 2, false),
          {
            wrapper: createReactQueryWrapper(),
          }
        );

        await waitFor(() => result.current.isError);

        params.append('order', JSON.stringify('id asc'));
        params.append('skip', JSON.stringify(0));
        params.append('limit', JSON.stringify(50));
        params.append(
          'include',
          JSON.stringify([
            { investigationInstruments: 'instrument' },
            { studyInvestigations: 'study' },
            { investigationUsers: 'user' },
          ])
        );

        expect(axios.get).toHaveBeenCalledWith(
          'https://example.com/api/instruments/1/facilitycycles/2/investigations',
          expect.objectContaining({
            params,
          })
        );
        expect(
          (axios.get as jest.Mock).mock.calls[0][1].params.toString()
        ).toBe(params.toString());
        expect(handleICATError).toHaveBeenCalledWith({ message: 'Test error' });
      });
    });

    describe('useISISInvestigationCount', () => {
      it('sends axios request to fetch ISIS investigation count in facility cycle hierarchy and returns successful response', async () => {
        (axios.get as jest.Mock).mockResolvedValue({
          data: mockData.length,
        });

        const { result, waitFor } = renderHook(
          () => useISISInvestigationCount(1, 2, false),
          {
            wrapper: createReactQueryWrapper(history),
          }
        );

        await waitFor(() => result.current.isSuccess);

        params.append(
          'where',
          JSON.stringify({
            name: { ilike: 'test' },
          })
        );

        expect(axios.get).toHaveBeenCalledWith(
          'https://example.com/api/instruments/1/facilitycycles/2/investigations/count',
          expect.objectContaining({
            params,
          })
        );
        expect(
          (axios.get as jest.Mock).mock.calls[0][1].params.toString()
        ).toBe(params.toString());
        expect(result.current.data).toEqual(mockData.length);
      });

      it('sends axios request to fetch ISIS investigation count in study hierarchy and returns successful response', async () => {
        (axios.get as jest.Mock).mockResolvedValue({
          data: mockData.length,
        });

        const { result, waitFor } = renderHook(
          () => useISISInvestigationCount(1, 2, true),
          {
            wrapper: createReactQueryWrapper(history),
          }
        );

        await waitFor(() => result.current.isSuccess);

        params.append(
          'where',
          JSON.stringify({
            name: { ilike: 'test' },
          })
        );
        params.append(
          'where',
          JSON.stringify({
            'investigationInstruments.instrument.id': { eq: 1 },
          })
        );
        params.append(
          'where',
          JSON.stringify({
            'studyInvestigations.study.id': { eq: 2 },
          })
        );

        expect(axios.get).toHaveBeenCalledWith(
          'https://example.com/api/investigations/count',
          expect.objectContaining({
            params,
          })
        );
        expect(
          (axios.get as jest.Mock).mock.calls[0][1].params.toString()
        ).toBe(params.toString());
        expect(result.current.data).toEqual(mockData.length);
      });

      it('sends axios request to fetch ISIS investigation count and calls handleICATError on failure', async () => {
        (axios.get as jest.Mock).mockRejectedValue({
          message: 'Test error',
        });
        const { result, waitFor } = renderHook(
          () => useISISInvestigationCount(1, 2, false),
          {
            wrapper: createReactQueryWrapper(),
          }
        );

        await waitFor(() => result.current.isError);

        expect(axios.get).toHaveBeenCalledWith(
          'https://example.com/api/instruments/1/facilitycycles/2/investigations/count',
          expect.objectContaining({
            params,
          })
        );
        expect(
          (axios.get as jest.Mock).mock.calls[0][1].params.toString()
        ).toBe(params.toString());
        expect(handleICATError).toHaveBeenCalledWith({ message: 'Test error' });
      });
    });

    describe('useISISInvestigationIds', () => {
      it('sends axios request to fetch ISIS investigation ids in facilityCycle hierarchy and returns successful response', async () => {
        (axios.get as jest.Mock).mockResolvedValue({
          data: mockData,
        });

        const { result, waitFor } = renderHook(
          () => useISISInvestigationIds(1, 2, false),
          {
            wrapper: createReactQueryWrapper(history),
          }
        );

        await waitFor(() => result.current.isSuccess);

        params.append('order', JSON.stringify('id asc'));
        params.append(
          'where',
          JSON.stringify({
            name: { ilike: 'test' },
          })
        );

        expect(axios.get).toHaveBeenCalledWith(
          'https://example.com/api/instruments/1/facilitycycles/2/investigations',
          expect.objectContaining({
            params,
          })
        );
        expect(
          (axios.get as jest.Mock).mock.calls[0][1].params.toString()
        ).toBe(params.toString());
        expect(result.current.data).toEqual([1, 2, 3]);
      });

      it('sends axios request to fetch ISIS investigation ids in study hierarchy and returns successful response', async () => {
        (axios.get as jest.Mock).mockResolvedValue({
          data: mockData,
        });

        const { result, waitFor } = renderHook(
          () => useISISInvestigationIds(1, 2, true),
          {
            wrapper: createReactQueryWrapper(history),
          }
        );

        await waitFor(() => result.current.isSuccess);

        params.append('order', JSON.stringify('id asc'));
        params.append(
          'where',
          JSON.stringify({
            name: { ilike: 'test' },
          })
        );
        params.append(
          'where',
          JSON.stringify({
            'investigationInstruments.instrument.id': { eq: 1 },
          })
        );
        params.append(
          'where',
          JSON.stringify({
            'studyInvestigations.study.id': { eq: 2 },
          })
        );
        params.append('distinct', JSON.stringify('id'));

        expect(axios.get).toHaveBeenCalledWith(
          'https://example.com/api/investigations',
          expect.objectContaining({
            params,
          })
        );
        expect(
          (axios.get as jest.Mock).mock.calls[0][1].params.toString()
        ).toBe(params.toString());
        expect(result.current.data).toEqual([1, 2, 3]);
      });

      it('does not send axios request to fetch ids when set to disabled', async () => {
        const { result } = renderHook(
          () => useISISInvestigationIds(1, 2, false, false),
          {
            wrapper: createReactQueryWrapper(history),
          }
        );

        expect(result.current.isIdle).toBe(true);
        expect(axios.get).not.toHaveBeenCalled();
      });

      it('sends axios request to fetch ISIS investigation ids and calls handleICATError on failure', async () => {
        (axios.get as jest.Mock).mockRejectedValue({
          message: 'Test error',
        });
        const { result, waitFor } = renderHook(
          () => useISISInvestigationIds(1, 2, false),
          {
            wrapper: createReactQueryWrapper(),
          }
        );

        await waitFor(() => result.current.isError);

        expect(handleICATError).toHaveBeenCalledWith({ message: 'Test error' });
      });
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
