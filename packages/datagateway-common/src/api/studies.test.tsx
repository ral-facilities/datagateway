import { Study } from '../app.types';
import { renderHook } from '@testing-library/react-hooks';
import { createMemoryHistory, History } from 'history';
import axios from 'axios';
import handleICATError from '../handleICATError';
import { createReactQueryWrapper } from '../setupTests';
import {
  useStudyCount,
  useStudiesInfinite,
  useStudiesPaginated,
  useStudy,
} from './studies';

jest.mock('../handleICATError');

describe('study api functions', () => {
  let mockData: Study[] = [];
  let history: History;
  let params: URLSearchParams;
  beforeEach(() => {
    mockData = [
      {
        id: 1,
        pid: 'doi 1',
        name: 'Test 1',
        modTime: '2000-01-01',
        createTime: '2000-01-01',
      },
      {
        id: 2,
        pid: 'doi 2',
        name: 'Test 2',
        modTime: '2000-01-02',
        createTime: '2000-01-02',
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

  describe('useStudiesPaginated', () => {
    it('sends axios request to fetch paginated studies and returns successful response', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: mockData,
      });

      const { result, waitFor } = renderHook(
        () =>
          useStudiesPaginated([
            {
              filterType: 'where',
              filterValue: JSON.stringify({
                'studyInvestigations.investigation.investigationInstruments.instrument.id':
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
          'studyInvestigations.investigation.investigationInstruments.instrument.id':
            {
              eq: 1,
            },
        })
      );

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/studies',
        expect.objectContaining({
          params,
        })
      );
      expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
        params.toString()
      );
      expect(result.current.data).toEqual(mockData);
    });

    it('sends axios request to fetch paginated studies and calls handleICATError on failure', async () => {
      (axios.get as jest.Mock).mockRejectedValue({
        message: 'Test error',
      });
      const { result, waitFor } = renderHook(() => useStudiesPaginated(), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => result.current.isError);

      params.append('order', JSON.stringify('id asc'));
      params.append('skip', JSON.stringify(0));
      params.append('limit', JSON.stringify(10));

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/studies',
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

  describe('useStudiesInfinite', () => {
    it('sends axios request to fetch infinite studies and returns successful response', async () => {
      (axios.get as jest.Mock).mockImplementation((url, options) =>
        options.params.get('skip') === '0'
          ? Promise.resolve({ data: mockData[0] })
          : Promise.resolve({ data: mockData[1] })
      );

      const { result, waitFor } = renderHook(
        () =>
          useStudiesInfinite([
            {
              filterType: 'where',
              filterValue: JSON.stringify({
                'studyInvestigations.investigation.investigationInstruments.instrument.id':
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
          'studyInvestigations.investigation.investigationInstruments.instrument.id':
            {
              eq: 1,
            },
        })
      );

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/studies',
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
        'https://example.com/api/studies',
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

    it('sends axios request to fetch infinite studies and calls handleICATError on failure', async () => {
      (axios.get as jest.Mock).mockRejectedValue({
        message: 'Test error',
      });
      const { result, waitFor } = renderHook(() => useStudiesInfinite(), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => result.current.isError);

      params.append('order', JSON.stringify('id asc'));
      params.append('skip', JSON.stringify(0));
      params.append('limit', JSON.stringify(50));

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/studies',
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

  describe('useStudy', () => {
    it('sends axios request to fetch a single study and returns successful response', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: mockData[0],
      });

      const { result, waitFor } = renderHook(() => useStudy(1), {
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
            studyInvestigations: {
              investigation: [
                { investigationUsers: 'user' },
                { investigationInstruments: 'instrument' },
              ],
            },
          },
        ])
      );

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/studies',
        expect.objectContaining({
          params,
        })
      );
      expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
        params.toString()
      );
      expect(result.current.data).toEqual(mockData[0]);
    });

    it('sends axios request to fetch a single study and calls handleICATError on failure', async () => {
      (axios.get as jest.Mock).mockRejectedValue({
        message: 'Test error',
      });
      const { result, waitFor } = renderHook(() => useStudy(1), {
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
            studyInvestigations: {
              investigation: [
                { investigationUsers: 'user' },
                { investigationInstruments: 'instrument' },
              ],
            },
          },
        ])
      );

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/studies',
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

  describe('useStudyCount', () => {
    it('sends axios request to fetch study count and returns successful response', async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: mockData.length,
      });

      const { result, waitFor } = renderHook(
        () =>
          useStudyCount([
            {
              filterType: 'where',
              filterValue: JSON.stringify({
                'studyInvestigations.investigation.investigationInstruments.instrument.id':
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
          'studyInvestigations.investigation.investigationInstruments.instrument.id':
            {
              eq: 1,
            },
        })
      );

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/studies/count',
        expect.objectContaining({
          params,
        })
      );
      expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
        params.toString()
      );
      expect(result.current.data).toEqual(mockData.length);
    });

    it('sends axios request to fetch study count and calls handleICATError on failure', async () => {
      (axios.get as jest.Mock).mockRejectedValue({
        message: 'Test error',
      });
      const { result, waitFor } = renderHook(() => useStudyCount(), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => result.current.isError);

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/api/studies/count',
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
