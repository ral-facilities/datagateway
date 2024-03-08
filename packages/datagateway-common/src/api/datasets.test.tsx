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
  useDatasetsInfinite,
  useDatasetsPaginated,
  createDataset,
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

      const { result, waitFor, rerender } = renderHook(
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

      // test that order of sort object triggers new query
      history.push(
        '/?sort={"title":"desc", "name":"asc"}&filters={"name":{"value":"test","type":"include"}}&page=2&results=20'
      );
      rerender();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(axios.get as jest.Mock).toHaveBeenCalledTimes(2);
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

      const { result, waitFor, rerender } = renderHook(
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

      // test that order of sort object triggers new query
      history.push(
        '/?sort={"title":"desc", "name":"asc"}&filters={"name":{"value":"test","type":"include"}}'
      );
      rerender();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(axios.get as jest.Mock).toHaveBeenCalledTimes(3);
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

  describe('createDataset', () => {
    it('sends axios request to create a dataset and returns the dataset ID', async () => {
      const uploadUrl = 'https://example.com/api';
      const name = 'Test Dataset';
      const description = 'Test Description';
      const investigationId = 1;
      const datasetId = 123;

      const axiosPostMock = jest.spyOn(axios, 'post');
      axiosPostMock.mockResolvedValue({
        data: {
          datasetId: datasetId.toString(),
        },
      });

      const result = await createDataset(
        uploadUrl,
        name,
        description,
        investigationId
      );

      expect(axiosPostMock).toHaveBeenCalledWith(
        'https://example.com/api/dataset',
        {
          investigationId: investigationId,
          datasetName: name,
          datasetDescription: description,
        },
        {
          headers: {
            Authorization: 'Bearer null',
          },
        }
      );
      expect(result).toBe(datasetId);
    });

    it('handles axios request error and throws an error', async () => {
      const name = 'Test Dataset';
      const description = 'Test Description';
      const investigationId = 1;

      const axiosPostMock = jest.spyOn(axios, 'post');
      axiosPostMock.mockRejectedValue(new Error('Test error'));

      await expect(
        createDataset(name, description, investigationId)
      ).rejects.toThrow('Test error');
    });
  });
});
