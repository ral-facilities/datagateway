import { Dataset } from '../app.types';
import { renderHook } from '@testing-library/react-hooks';
import { createMemoryHistory, History } from 'history';
import axios from 'axios';
import handleICATError from '../handleICATError';
import { createReactQueryWrapper } from '../setupTests';
import {
  downloadDataset,
  useDataset,
  useDatasetCount,
  useDatasetDetails,
  useDatasetsDatafileCount,
  useDatasetsInfinite,
  useDatasetSize,
  useDatasetSizes,
  useDatasetsPaginated,
} from './datasets';

jest.mock('../handleICATError');

describe('dataset api functions', () => {
  let mockData: Dataset[] = [];
  let history: History;
  let params: URLSearchParams;
  beforeEach(() => {
    mockData = [
      {
        id: 1,
        name: 'Test 1',
        modTime: '2019-06-10',
        createTime: '2019-06-11',
      },
      {
        id: 2,
        name: 'Test 2',
        modTime: '2019-06-10',
        createTime: '2019-06-12',
      },
      {
        id: 3,
        name: 'Test 3',
        modTime: '2019-06-10',
        createTime: '2019-06-12',
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

  describe('useDataset', () => {
    it('sends axios request to fetch dataset by ID and returns successful response', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: [mockData[0]],
      });

      const { result, waitFor } = renderHook(
        () =>
          useDataset(1, [
            {
              filterType: 'include',
              filterValue: JSON.stringify({
                datasetInstruments: 'instrument',
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
          datasetInstruments: 'instrument',
        })
      );

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/datasets',
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
      const { result, waitFor } = renderHook(() => useDataset(1), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => result.current.isError);

      expect(handleICATError).toHaveBeenCalledWith({ message: 'Test error' });
    });
  });

  describe('useDatasetsPaginated', () => {
    it('sends axios request to fetch paginated datasets and returns successful response', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: mockData,
      });

      const { result, waitFor } = renderHook(
        () =>
          useDatasetsPaginated([
            {
              filterType: 'include',
              filterValue: JSON.stringify({
                datasetInstruments: 'instrument',
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
          datasetInstruments: 'instrument',
        })
      );

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/datasets',
        expect.objectContaining({
          params,
        })
      );
      expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
        params.toString()
      );
      expect(result.current.data).toEqual(mockData);
    });

    it('sends axios request to fetch paginated datasets and calls handleICATError on failure', async () => {
      (axios.get as jest.Mock).mockRejectedValue({
        message: 'Test error',
      });
      const { result, waitFor } = renderHook(() => useDatasetsPaginated(), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => result.current.isError);

      params.append('order', JSON.stringify('id asc'));
      params.append('skip', JSON.stringify(0));
      params.append('limit', JSON.stringify(10));

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/datasets',
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

  describe('useDatasetsInfinite', () => {
    it('sends axios request to fetch infinite datasets and returns successful response', async () => {
      (axios.get as jest.Mock).mockImplementation((url, options) =>
        options.params.get('skip') === '0'
          ? Promise.resolve({ data: mockData[0] })
          : Promise.resolve({ data: mockData[1] })
      );

      const { result, waitFor } = renderHook(
        () =>
          useDatasetsInfinite([
            {
              filterType: 'include',
              filterValue: JSON.stringify({
                datasetInstruments: 'instrument',
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
          datasetInstruments: 'instrument',
        })
      );

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/datasets',
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
        'https://example.com/api/datasets',
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

    it('sends axios request to fetch infinite datasets and calls handleICATError on failure', async () => {
      (axios.get as jest.Mock).mockRejectedValue({
        message: 'Test error',
      });
      const { result, waitFor } = renderHook(() => useDatasetsInfinite(), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => result.current.isError);

      params.append('order', JSON.stringify('id asc'));
      params.append('skip', JSON.stringify(0));
      params.append('limit', JSON.stringify(50));

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/datasets',
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

  describe('useDatasetSize', () => {
    it('sends axios request to fetch dataset size once refetch function is called and returns successful response', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: 1,
      });

      const { result, waitFor } = renderHook(() => useDatasetSize(1), {
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
            entityType: 'dataset',
            entityId: 1,
          },
        }
      );
      expect(result.current.data).toEqual(1);
    });

    it('sends axios request to fetch dataset size once refetch function is called and calls handleICATError on failure', async () => {
      (axios.get as jest.Mock).mockRejectedValue({
        message: 'Test error',
      });
      const { result, waitFor } = renderHook(() => useDatasetSize(1), {
        wrapper: createReactQueryWrapper(),
      });

      expect(axios.get).not.toHaveBeenCalled();
      expect(result.current.isIdle).toBe(true);

      result.current.refetch();

      await waitFor(() => result.current.isError);

      expect(handleICATError).toHaveBeenCalledWith({ message: 'Test error' });
    });
  });

  describe('useDatasetSizes', () => {
    it('sends axios request to fetch dataset sizes given paginated data and returns successful response', async () => {
      (axios.get as jest.Mock).mockImplementation((url, options) =>
        Promise.resolve({
          data: options.params.entityId ?? 0,
        })
      );

      const { result, waitFor } = renderHook(() => useDatasetSizes(mockData), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => result.current.every((query) => query.isSuccess));

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/topcat/user/getSize',
        {
          params: {
            sessionId: null,
            facilityName: 'TEST',
            entityType: 'dataset',
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
            entityType: 'dataset',
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
            entityType: 'dataset',
            entityId: 3,
          },
        }
      );
      expect(result.current.map((query) => query.data)).toEqual([1, 2, 3]);
    });

    it('sends axios request to fetch dataset sizes given infinite data and returns successful response', async () => {
      (axios.get as jest.Mock).mockImplementation((url, options) =>
        Promise.resolve({
          data: options.params.entityId ?? 0,
        })
      );

      const { result, waitFor } = renderHook(
        () => useDatasetSizes({ pages: [mockData], pageParams: null }),
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
            entityType: 'dataset',
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
            entityType: 'dataset',
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
            entityType: 'dataset',
            entityId: 3,
          },
        }
      );
      expect(result.current.map((query) => query.data)).toEqual([1, 2, 3]);
    });

    it('sends axios request to fetch dataset sizes and calls handleICATError on failure', async () => {
      (axios.get as jest.Mock).mockRejectedValue({
        message: 'Test error',
      });
      const { result, waitFor } = renderHook(() => useDatasetSizes(mockData), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => result.current.every((query) => query.isError));

      expect(handleICATError).toHaveBeenCalledTimes(3);
      expect(handleICATError).toHaveBeenCalledWith(
        { message: 'Test error' },
        false
      );
    });

    it("doesn't send any requests if the array supplied is empty to undefined", () => {
      const { result: emptyResult } = renderHook(() => useDatasetSizes([]), {
        wrapper: createReactQueryWrapper(),
      });

      expect(emptyResult.current.length).toBe(0);
      expect(axios.get).not.toHaveBeenCalled();

      const { result: undefinedResult } = renderHook(
        () => useDatasetSizes(undefined),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      expect(undefinedResult.current.length).toBe(0);
      expect(axios.get).not.toHaveBeenCalled();
    });
  });

  describe('useDatasetsDatafileCount', () => {
    it('sends axios request to fetch dataset dataset counts given paginated data and returns successful response', async () => {
      (axios.get as jest.Mock).mockImplementation((url, options) =>
        Promise.resolve({
          data: JSON.parse(options.params.get('where'))['dataset.id'].eq ?? 0,
        })
      );

      const { result, waitFor } = renderHook(
        () => useDatasetsDatafileCount(mockData),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() => result.current.every((query) => query.isSuccess));

      params.append(
        'where',
        JSON.stringify({
          'dataset.id': { eq: 1 },
        })
      );
      expect(axios.get).toHaveBeenNthCalledWith(
        1,
        'https://example.com/api/datafiles/count',
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
          'dataset.id': { eq: 2 },
        })
      );
      expect(axios.get).toHaveBeenNthCalledWith(
        2,
        'https://example.com/api/datafiles/count',
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
          'dataset.id': { eq: 3 },
        })
      );
      expect(axios.get).toHaveBeenNthCalledWith(
        3,
        'https://example.com/api/datafiles/count',
        expect.objectContaining({
          params,
        })
      );
      expect((axios.get as jest.Mock).mock.calls[2][1].params.toString()).toBe(
        params.toString()
      );

      expect(result.current.map((query) => query.data)).toEqual([1, 2, 3]);
    });

    it('sends axios request to fetch dataset dataset counts given infinite data and returns successful response', async () => {
      (axios.get as jest.Mock).mockImplementation((url, options) =>
        Promise.resolve({
          data: JSON.parse(options.params.get('where'))['dataset.id'].eq ?? 0,
        })
      );

      const { result, waitFor } = renderHook(
        () =>
          useDatasetsDatafileCount({
            pages: [mockData],
            pageParams: null,
          }),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() => result.current.every((query) => query.isSuccess));

      params.append(
        'where',
        JSON.stringify({
          'dataset.id': { eq: 1 },
        })
      );
      expect(axios.get).toHaveBeenNthCalledWith(
        1,
        'https://example.com/api/datafiles/count',
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
          'dataset.id': { eq: 2 },
        })
      );
      expect(axios.get).toHaveBeenNthCalledWith(
        2,
        'https://example.com/api/datafiles/count',
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
          'dataset.id': { eq: 3 },
        })
      );
      expect(axios.get).toHaveBeenNthCalledWith(
        3,
        'https://example.com/api/datafiles/count',
        expect.objectContaining({
          params,
        })
      );
      expect((axios.get as jest.Mock).mock.calls[2][1].params.toString()).toBe(
        params.toString()
      );

      expect(result.current.map((query) => query.data)).toEqual([1, 2, 3]);
    });

    it('sends axios request to fetch dataset dataset counts once refetch function is called and calls handleICATError on failure', async () => {
      (axios.get as jest.Mock).mockRejectedValue({
        message: 'Test error',
      });
      const { result, waitFor } = renderHook(
        () => useDatasetsDatafileCount(mockData),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() => result.current.every((query) => query.isError));

      expect(handleICATError).toHaveBeenCalledTimes(3);
      expect(handleICATError).toHaveBeenCalledWith(
        { message: 'Test error' },
        false
      );
    });

    it("doesn't send any requests if the array supplied is empty to undefined", () => {
      const { result: emptyResult } = renderHook(
        () => useDatasetsDatafileCount([]),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      expect(emptyResult.current.length).toBe(0);
      expect(axios.get).not.toHaveBeenCalled();

      const { result: undefinedResult } = renderHook(
        () => useDatasetsDatafileCount(undefined),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      expect(undefinedResult.current.length).toBe(0);
      expect(axios.get).not.toHaveBeenCalled();
    });
  });

  describe('useDatasetCount', () => {
    it('sends axios request to fetch dataset count and returns successful response', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: mockData.length,
      });

      const { result, waitFor } = renderHook(
        () =>
          useDatasetCount([
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
        'https://example.com/api/datasets/count',
        expect.objectContaining({
          params,
        })
      );
      expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
        params.toString()
      );
      expect(result.current.data).toEqual(mockData.length);
    });

    it('sends axios request to fetch dataset count and returns successful response using the stored filters', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: mockData.length,
      });

      const { result, waitFor } = renderHook(
        () =>
          useDatasetCount(
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
        'https://example.com/api/datasets/count',
        expect.objectContaining({
          params,
        })
      );
      expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
        params.toString()
      );
      expect(result.current.data).toEqual(mockData.length);
    });

    it('sends axios request to fetch dataset count and calls handleICATError on failure', async () => {
      (axios.get as jest.Mock).mockRejectedValue({
        message: 'Test error',
      });
      const { result, waitFor } = renderHook(() => useDatasetCount(), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => result.current.isError);

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/datasets/count',
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

  describe('useDatasetDetails', () => {
    it('sends axios request to fetch dataset details and returns successful response', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: [mockData[0]],
      });

      const { result, waitFor } = renderHook(() => useDatasetDetails(1), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => result.current.isSuccess);

      params.append(
        'where',
        JSON.stringify({
          id: { eq: 1 },
        })
      );
      params.append('include', JSON.stringify('type'));

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/datasets',
        expect.objectContaining({
          params,
        })
      );
      expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
        params.toString()
      );
      expect(result.current.data).toEqual(mockData[0]);
    });

    it('sends axios request to fetch dataset details and calls handleICATError on failure', async () => {
      (axios.get as jest.Mock).mockRejectedValue({
        message: 'Test error',
      });
      const { result, waitFor } = renderHook(() => useDatasetDetails(1), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => result.current.isError);

      expect(handleICATError).toHaveBeenCalledWith({ message: 'Test error' });
    });
  });

  describe('downloadDataset', () => {
    it('clicks on IDS link upon downloadDataset action', async () => {
      jest.spyOn(document, 'createElement');
      jest.spyOn(document.body, 'appendChild');

      downloadDataset('https://www.example.com/ids', 1, 'test');

      expect(document.createElement).toHaveBeenCalledWith('a');
      const link = document.createElement('a');
      link.href = `https://www.example.com/ids/getData?sessionId=${null}&datasetIds=${1}&compress=${false}&zip=${true}&outname=${'test'}`;
      link.target = '_blank';
      link.style.display = 'none';
      expect(document.body.appendChild).toHaveBeenCalledWith(link);
    });
  });
});
