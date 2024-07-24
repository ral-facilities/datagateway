import { DataPublication } from '../app.types';
import { renderHook } from '@testing-library/react-hooks';
import { createMemoryHistory, History } from 'history';
import axios from 'axios';
import handleICATError from '../handleICATError';
import { createReactQueryWrapper } from '../setupTests';
import {
  useDataPublicationCount,
  useDataPublicationsInfinite,
  useDataPublicationsPaginated,
  useDataPublication,
  useDataPublications,
} from './dataPublications';

jest.mock('../handleICATError');

describe('data publications api functions', () => {
  let mockData: DataPublication[] = [];
  let history: History;
  let params: URLSearchParams;
  beforeEach(() => {
    mockData = [
      {
        id: 1,
        pid: 'doi 1',
        title: 'Test 1',
        modTime: '2000-01-01',
        createTime: '2000-01-01',
      },
      {
        id: 2,
        pid: 'doi 2',
        title: 'Test 2',
        modTime: '2000-01-02',
        createTime: '2000-01-02',
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

  describe('useDataPublicationsPaginated', () => {
    it('sends axios request to fetch paginated data publications and returns successful response', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: mockData,
      });

      const { result, waitFor, rerender } = renderHook(
        () =>
          useDataPublicationsPaginated([
            {
              filterType: 'where',
              filterValue: JSON.stringify({
                'content.dataCollectionInvestigations.investigation.investigationInstruments.instrument.id':
                  {
                    eq: 1,
                  },
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
        'where',
        JSON.stringify({
          'content.dataCollectionInvestigations.investigation.investigationInstruments.instrument.id':
            {
              eq: 1,
            },
        })
      );

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/datapublications',
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

    it('sends axios request to fetch paginated data publications and calls handleICATError on failure', async () => {
      (axios.get as jest.Mock).mockRejectedValue({
        message: 'Test error',
      });
      const { result, waitFor } = renderHook(
        () => useDataPublicationsPaginated(),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() => result.current.isError);

      params.append('order', JSON.stringify('id asc'));
      params.append('skip', JSON.stringify(0));
      params.append('limit', JSON.stringify(10));

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/datapublications',
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

  describe('useDataPublicationsInfinite', () => {
    it('sends axios request to fetch infinite data publications and returns successful response', async () => {
      (axios.get as jest.Mock).mockImplementation((url, options) =>
        options.params.get('skip') === '0'
          ? Promise.resolve({ data: mockData[0] })
          : Promise.resolve({ data: mockData[1] })
      );

      const { result, waitFor, rerender } = renderHook(
        () =>
          useDataPublicationsInfinite([
            {
              filterType: 'where',
              filterValue: JSON.stringify({
                'content.dataCollectionInvestigations.investigation.investigationInstruments.instrument.id':
                  {
                    eq: 1,
                  },
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
        'where',
        JSON.stringify({
          'content.dataCollectionInvestigations.investigation.investigationInstruments.instrument.id':
            {
              eq: 1,
            },
        })
      );

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/datapublications',
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
        'https://example.com/api/datapublications',
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

    it('sends axios request to fetch infinite data publications and calls handleICATError on failure', async () => {
      (axios.get as jest.Mock).mockRejectedValue({
        message: 'Test error',
      });
      const { result, waitFor } = renderHook(
        () => useDataPublicationsInfinite(),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() => result.current.isError);

      params.append('order', JSON.stringify('id asc'));
      params.append('skip', JSON.stringify(0));
      params.append('limit', JSON.stringify(50));

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/datapublications',
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

  describe('useDataPublication', () => {
    it('sends axios request to fetch a single data publication and returns successful response', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: mockData,
      });

      const { result, waitFor } = renderHook(() => useDataPublication(1), {
        wrapper: createReactQueryWrapper(history),
      });

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
        JSON.stringify([
          {
            content: {
              dataCollectionInvestigations: {
                investigation: [
                  'datasets',
                  {
                    datasets: 'type',
                    investigationInstruments: 'instrument',
                  },
                ],
              },
            },
          },
          'users',
          'facility',
          'dates',
        ])
      );

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/datapublications',
        expect.objectContaining({
          params,
        })
      );
      expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
        params.toString()
      );
      expect(result.current.data).toEqual(mockData[0]);
    });

    it('sends axios request to fetch a single data publication and calls handleICATError on failure', async () => {
      (axios.get as jest.Mock).mockRejectedValue({
        message: 'Test error',
      });
      const { result, waitFor } = renderHook(() => useDataPublication(1), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => result.current.isError);

      params.append('order', JSON.stringify('id asc'));
      params.append(
        'where',
        JSON.stringify({
          id: { eq: 1 },
        })
      );
      params.append(
        'include',
        JSON.stringify([
          {
            content: {
              dataCollectionInvestigations: {
                investigation: [
                  'datasets',
                  {
                    datasets: 'type',
                    investigationInstruments: 'instrument',
                  },
                ],
              },
            },
          },
          'users',
          'facility',
          'dates',
        ])
      );

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/datapublications',
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

  describe('useDataPublications', () => {
    it('sends axios request to fetch a data publications with specified filters and returns successful response', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: mockData,
      });

      params.append('order', JSON.stringify('id asc'));
      params.append(
        'where',
        JSON.stringify({
          name: { eq: 'test' },
        })
      );

      const { result, waitFor } = renderHook(
        () =>
          useDataPublications([
            {
              filterType: 'where',
              filterValue: JSON.stringify({ name: { eq: 'test' } }),
            },
          ]),
        {
          wrapper: createReactQueryWrapper(history),
        }
      );

      await waitFor(() => result.current.isSuccess);

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/datapublications',
        expect.objectContaining({
          params,
        })
      );
      expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
        params.toString()
      );
      expect(result.current.data).toEqual(mockData);
    });

    it('sends axios request to fetch a single data publication and calls handleICATError on failure', async () => {
      (axios.get as jest.Mock).mockRejectedValue({
        message: 'Test error',
      });

      params.append('order', JSON.stringify('id asc'));
      params.append('include', '"type"');

      const { result, waitFor } = renderHook(
        () =>
          useDataPublications([
            {
              filterType: 'include',
              filterValue: '"type"',
            },
          ]),
        {
          wrapper: createReactQueryWrapper(history),
        }
      );

      await waitFor(() => result.current.isError);

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/datapublications',
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

  describe('useDataPublicationCount', () => {
    it('sends axios request to fetch data publication count and returns successful response', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: mockData.length,
      });

      const { result, waitFor } = renderHook(
        () =>
          useDataPublicationCount([
            {
              filterType: 'where',
              filterValue: JSON.stringify({
                'content.dataCollectionInvestigations.investigation.investigationInstruments.instrument.id':
                  {
                    eq: 1,
                  },
              }),
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
      params.append(
        'where',
        JSON.stringify({
          'content.dataCollectionInvestigations.investigation.investigationInstruments.instrument.id':
            {
              eq: 1,
            },
        })
      );

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/datapublications/count',
        expect.objectContaining({
          params,
        })
      );
      expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
        params.toString()
      );
      expect(result.current.data).toEqual(mockData.length);
    });

    it('sends axios request to fetch data publication count and calls handleICATError on failure', async () => {
      (axios.get as jest.Mock).mockRejectedValue({
        message: 'Test error',
      });
      const { result, waitFor } = renderHook(() => useDataPublicationCount(), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => result.current.isError);

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/datapublications/count',
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
