import { act, renderHook, waitFor } from '@testing-library/react';
import axios from 'axios';
import { History, createMemoryHistory } from 'history';
import { Datafile } from '../app.types';
import handleICATError from '../handleICATError';
import { createReactQueryWrapper } from '../setupTests';
import {
  downloadDatafile,
  useDatafileContent,
  useDatafileCount,
  useDatafileDetails,
  useDatafilesInfinite,
  useDatafilesPaginated,
} from './datafiles';

vi.mock('../handleICATError');

describe('datafile api functions', () => {
  let mockData: Datafile[] = [];
  let history: History;
  let params: URLSearchParams;
  beforeEach(() => {
    mockData = [
      {
        id: 1,
        name: 'Test 1',
        location: '/test1',
        fileSize: 1,
        modTime: '2019-06-10',
        createTime: '2019-06-10',
      },
      {
        id: 2,
        name: 'Test 2',
        location: '/test2',
        fileSize: 2,
        modTime: '2019-06-10',
        createTime: '2019-06-10',
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
    vi.mocked(handleICATError).mockClear();
    vi.mocked(axios.get).mockClear();
    vi.restoreAllMocks();
  });

  describe('useDatafilesPaginated', () => {
    it('sends axios request to fetch paginated datafiles and returns successful response', async () => {
      vi.mocked(axios.get).mockResolvedValue({
        data: mockData,
      });

      const { result } = renderHook(
        () =>
          useDatafilesPaginated([
            {
              filterType: 'include',
              filterValue: JSON.stringify({
                datafileInstruments: 'instrument',
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
          datafileInstruments: 'instrument',
        })
      );

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/datafiles',
        expect.objectContaining({
          params,
        })
      );
      expect(vi.mocked(axios.get).mock.calls[0][1]?.params.toString()).toBe(
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

      expect(vi.mocked(axios.get)).toHaveBeenCalledTimes(2);
    });

    it('sends axios request to fetch paginated datafiles and calls handleICATError on failure', async () => {
      vi.mocked(axios.get).mockRejectedValue({
        message: 'Test error',
      });
      const { result } = renderHook(() => useDatafilesPaginated(), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      params.append('order', JSON.stringify('id asc'));
      params.append('skip', JSON.stringify(0));
      params.append('limit', JSON.stringify(10));

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/datafiles',
        expect.objectContaining({
          params,
        })
      );
      expect(vi.mocked(axios.get).mock.calls[0][1]?.params.toString()).toBe(
        params.toString()
      );
      expect(handleICATError).toHaveBeenCalledWith({ message: 'Test error' });
    });
  });

  describe('useDatafilesInfinite', () => {
    it('sends axios request to fetch infinite datafiles and returns successful response', async () => {
      vi.mocked(axios.get).mockImplementation((url, options) =>
        options?.params.get('skip') === '0'
          ? Promise.resolve({ data: mockData[0] })
          : Promise.resolve({ data: mockData[1] })
      );

      const { result } = renderHook(
        () =>
          useDatafilesInfinite([
            {
              filterType: 'include',
              filterValue: JSON.stringify({
                datafileInstruments: 'instrument',
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
          datafileInstruments: 'instrument',
        })
      );

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/datafiles',
        expect.objectContaining({
          params,
        })
      );
      expect(vi.mocked(axios.get).mock.calls[0][1]?.params.toString()).toBe(
        params.toString()
      );
      expect(result.current.data?.pages).toStrictEqual([mockData[0]]);

      await result.current.fetchNextPage({
        pageParam: { startIndex: 50, stopIndex: 74 },
      });

      await waitFor(() => expect(result.current.isFetching).toBe(false));

      expect(axios.get).toHaveBeenNthCalledWith(
        2,
        'https://example.com/api/datafiles',
        expect.objectContaining({
          params,
        })
      );
      params.set('skip', JSON.stringify(50));
      params.set('limit', JSON.stringify(25));
      expect(vi.mocked(axios.get).mock.calls[1][1]?.params.toString()).toBe(
        params.toString()
      );

      expect(result.current.data?.pages).toStrictEqual([
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

      expect(vi.mocked(axios.get)).toHaveBeenCalledTimes(3);
    });

    it('sends axios request to fetch infinite datafiles and calls handleICATError on failure', async () => {
      vi.mocked(axios.get).mockRejectedValue({
        message: 'Test error',
      });
      const { result } = renderHook(() => useDatafilesInfinite(), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      params.append('order', JSON.stringify('id asc'));
      params.append('skip', JSON.stringify(0));
      params.append('limit', JSON.stringify(50));

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/datafiles',
        expect.objectContaining({
          params,
        })
      );
      expect(vi.mocked(axios.get).mock.calls[0][1]?.params.toString()).toBe(
        params.toString()
      );
      expect(handleICATError).toHaveBeenCalledWith({ message: 'Test error' });
    });
  });

  describe('useDatafileCount', () => {
    it('sends axios request to fetch datafile count and returns successful response', async () => {
      vi.mocked(axios.get).mockResolvedValue({
        data: mockData.length,
      });

      const { result } = renderHook(
        () =>
          useDatafileCount([
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
        'https://example.com/api/datafiles/count',
        expect.objectContaining({
          params,
        })
      );
      expect(vi.mocked(axios.get).mock.calls[0][1]?.params.toString()).toBe(
        params.toString()
      );
      expect(result.current.data).toEqual(mockData.length);
    });

    it('sends axios request to fetch datafile count and calls handleICATError on failure', async () => {
      vi.mocked(axios.get).mockRejectedValue({
        message: 'Test error',
      });
      const { result } = renderHook(() => useDatafileCount(), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/datafiles/count',
        expect.objectContaining({
          params,
        })
      );
      expect(vi.mocked(axios.get).mock.calls[0][1]?.params.toString()).toBe(
        params.toString()
      );
      expect(handleICATError).toHaveBeenCalledWith({ message: 'Test error' });
    });
  });

  describe('useDatafileDetails', () => {
    it('sends axios request to fetch datafile details and returns successful response', async () => {
      vi.mocked(axios.get).mockResolvedValue({
        data: [mockData[0]],
      });

      const { result } = renderHook(() => useDatafileDetails(1), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      params.append('order', JSON.stringify('id asc'));
      params.append(
        'where',
        JSON.stringify({
          id: { eq: '1' },
        })
      );

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/datafiles',
        expect.objectContaining({
          params,
        })
      );
      expect(vi.mocked(axios.get).mock.calls[0][1]?.params.toString()).toBe(
        params.toString()
      );
      expect(result.current.data).toEqual(mockData[0]);
    });

    it('sends axios request to fetch datafile details and calls handleICATError on failure', async () => {
      const error = axios.AxiosError.from(new Error('Test error'));
      vi.mocked(axios.get).mockRejectedValue(error);
      const { result } = renderHook(() => useDatafileDetails(1), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(handleICATError).toHaveBeenCalledWith(error);
    });
  });

  describe('useDatafileContent', () => {
    it('should send a request to download datafile to a blob', async () => {
      vi.mocked(axios.get).mockResolvedValueOnce({
        data: 'datafile content',
      });
      const downloadProgressCb = vi.fn();
      vi.spyOn(global, 'Blob').mockImplementationOnce(
        (data) =>
          ({
            text: () => Promise.resolve(data?.[0] as string),
          } as unknown as Blob)
      );

      const { result } = renderHook(
        () =>
          useDatafileContent({
            datafileId: 1,
            onDownloadProgress: downloadProgressCb,
          }),
        { wrapper: createReactQueryWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(axios.get).toHaveBeenCalledWith(
        `https://example.com/ids/getData`,
        {
          onDownloadProgress: downloadProgressCb,
          params: {
            datafileIds: '1',
            sessionId: null,
            compress: false,
          },
        }
      );
      expect(await result.current.data?.text()).toEqual('datafile content');
    });

    it('should call the download progress callback when progress is made for the download', async () => {
      const mockProgressEvent = new ProgressEvent('progress', {
        loaded: 2,
        total: 10,
      });
      vi.mocked(axios.get).mockImplementation((_, config) => {
        config?.onDownloadProgress?.(mockProgressEvent);
        return new Promise((_) => {
          // never resolve the promise
          // pretend the download is still going
        });
      });
      const downloadProgressCb = vi.fn();

      renderHook(
        () =>
          useDatafileContent({
            datafileId: 1,
            onDownloadProgress: downloadProgressCb,
          }),
        { wrapper: createReactQueryWrapper() }
      );

      await waitFor(() => {
        expect(downloadProgressCb).toHaveBeenCalledWith(mockProgressEvent);
      });
    });

    it('should call handleICATError when the query for datafile content fails', async () => {
      vi.mocked(axios.get).mockRejectedValue({
        message: 'Test error',
      });

      const { result } = renderHook(
        () =>
          useDatafileContent({
            datafileId: 1,
            onDownloadProgress: vi.fn(),
          }),
        { wrapper: createReactQueryWrapper() }
      );

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(handleICATError).toHaveBeenCalledWith({ message: 'Test error' });
    });
  });

  describe('downloadDatafile', () => {
    it('should create a download for the datafile with a server URL', async () => {
      vi.spyOn(document, 'createElement');
      vi.spyOn(document.body, 'appendChild');

      downloadDatafile('https://www.example.com/ids', 1, 'test');

      expect(document.createElement).toHaveBeenCalledWith('a');
      const link = document.createElement('a');
      link.href = `https://www.example.com/ids/getData?sessionId=${null}&datafileIds=${1}&compress=${false}&outname=${'test'}`;
      link.target = '_blank';
      link.style.display = 'none';
      expect(document.body.appendChild).toHaveBeenCalledWith(link);
    });

    it('should create a download for the datafile with the given Blob content', async () => {
      vi.spyOn(document, 'createElement');
      vi.spyOn(document.body, 'appendChild');

      downloadDatafile(
        'https://www.example.com/ids',
        1,
        'test',
        new Blob(['text'])
      );

      expect(document.createElement).toHaveBeenCalledWith('a');
      const link = document.createElement('a');
      link.href = 'testObjectUrl';
      link.download = 'test';
      link.target = '_blank';
      link.style.display = 'none';
      expect(document.body.appendChild).toHaveBeenCalledWith(link);
    });
  });
});
