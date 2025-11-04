import { renderHook, waitFor } from '@testing-library/react';
import axios, { type AxiosError } from 'axios';
import { useEntity } from '.';
import { Dataset } from '../app.types';
import handleICATError from '../handleICATError';
import { createReactQueryWrapper } from '../setupTests';
import { NotificationType } from '../state/actions/actions.types';

vi.mock('../handleICATError');

describe('generic api functions', () => {
  let mockData: Dataset[] = [];
  let params: URLSearchParams;
  beforeEach(() => {
    params = new URLSearchParams();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useEntity', () => {
    describe('sends axios request to fetch single entity and returns successful response', () => {
      beforeEach(() => {
        mockData = [
          {
            id: 1,
            name: 'Test 1',
            createTime: '2025-06-19',
            modTime: '2025-06-20',
          },
        ];
        vi.mocked(axios.get).mockResolvedValue({
          data: mockData,
        });
      });

      it('for investigations', async () => {
        const { result } = renderHook(
          () =>
            useEntity('investigation', 'id', '1', {
              filterType: 'include',
              filterValue: '"parameters"',
            }),
          {
            wrapper: createReactQueryWrapper(),
          }
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        params.append('order', JSON.stringify('id asc'));
        params.append(
          'where',
          JSON.stringify({
            id: { eq: '1' },
          })
        );
        params.append('include', '"parameters"');

        expect(axios.get).toHaveBeenCalledWith(
          'https://example.com/api/investigations',
          expect.objectContaining({
            params,
          })
        );
        expect(vi.mocked(axios.get).mock.calls[0][1]?.params.toString()).toBe(
          params.toString()
        );
        expect(result.current.data).toEqual(mockData[0]);
      });

      it('for datasets', async () => {
        const { result } = renderHook(
          () =>
            useEntity('dataset', 'name', 'test 1', {
              filterType: 'include',
              filterValue: '"parameters"',
            }),
          {
            wrapper: createReactQueryWrapper(),
          }
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        params.append('order', JSON.stringify('id asc'));
        params.append(
          'where',
          JSON.stringify({
            name: { eq: 'test 1' },
          })
        );
        params.append('include', '"parameters"');

        expect(axios.get).toHaveBeenCalledWith(
          'https://example.com/api/datasets',
          expect.objectContaining({
            params,
          })
        );
        expect(vi.mocked(axios.get).mock.calls[0][1]?.params.toString()).toBe(
          params.toString()
        );
        expect(result.current.data).toEqual(mockData[0]);
      });

      it('for datafiles', async () => {
        const { result } = renderHook(
          () =>
            useEntity('datafile', 'location', '/test/1', {
              filterType: 'include',
              filterValue: '"parameters"',
            }),
          {
            wrapper: createReactQueryWrapper(),
          }
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        params.append('order', JSON.stringify('id asc'));
        params.append(
          'where',
          JSON.stringify({
            location: { eq: '/test/1' },
          })
        );
        params.append('include', '"parameters"');

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
    });

    describe('sends axios request to fetch single entity and returns error if more than 1 entity is found', () => {
      beforeEach(() => {
        mockData = [
          {
            id: 1,
            name: 'Test 1',
            createTime: '2025-06-19',
            modTime: '2025-06-20',
          },
          {
            id: 2,
            name: 'Test 2',
            createTime: '2025-06-21',
            modTime: '2025-06-22',
          },
        ];
        vi.mocked(axios.get).mockResolvedValue({
          data: mockData,
        });
      });

      it('for investigations', async () => {
        const { result } = renderHook(
          () => useEntity('investigation', 'id', '1'),
          {
            wrapper: createReactQueryWrapper(),
          }
        );
        const dispatchEventSpy = vi.spyOn(document, 'dispatchEvent');

        await waitFor(() => expect(result.current.isError).toBe(true));

        const eventPayload = {
          detail: {
            type: NotificationType,
            payload: {
              severity: 'error',
              message:
                'Unable to identify single investigation with id matching 1',
            },
          },
        };
        expect(dispatchEventSpy).toHaveBeenCalledWith(
          expect.objectContaining(eventPayload)
        );

        params.append('order', JSON.stringify('id asc'));
        params.append(
          'where',
          JSON.stringify({
            id: { eq: '1' },
          })
        );

        expect(axios.get).toHaveBeenCalledWith(
          'https://example.com/api/investigations',
          expect.objectContaining({
            params,
          })
        );
        expect(vi.mocked(axios.get).mock.calls[0][1]?.params.toString()).toBe(
          params.toString()
        );
      });

      it('for datasets', async () => {
        const { result } = renderHook(
          () => useEntity('dataset', 'name', 'test 1'),
          {
            wrapper: createReactQueryWrapper(),
          }
        );

        const dispatchEventSpy = vi.spyOn(document, 'dispatchEvent');

        await waitFor(() => expect(result.current.isError).toBe(true));

        const eventPayload = {
          detail: {
            type: NotificationType,
            payload: {
              severity: 'error',
              message:
                'Unable to identify single dataset with name matching test 1',
            },
          },
        };
        expect(dispatchEventSpy).toHaveBeenCalledWith(
          expect.objectContaining(eventPayload)
        );

        params.append('order', JSON.stringify('id asc'));
        params.append(
          'where',
          JSON.stringify({
            name: { eq: 'test 1' },
          })
        );

        expect(axios.get).toHaveBeenCalledWith(
          'https://example.com/api/datasets',
          expect.objectContaining({
            params,
          })
        );
        expect(vi.mocked(axios.get).mock.calls[0][1]?.params.toString()).toBe(
          params.toString()
        );
      });

      it('for datafiles', async () => {
        const { result } = renderHook(
          () => useEntity('datafile', 'location', '/test/1'),
          {
            wrapper: createReactQueryWrapper(),
          }
        );

        const dispatchEventSpy = vi.spyOn(document, 'dispatchEvent');

        await waitFor(() => expect(result.current.isError).toBe(true));

        const eventPayload = {
          detail: {
            type: NotificationType,
            payload: {
              severity: 'error',
              message:
                'Unable to identify single datafile with location matching /test/1',
            },
          },
        };
        expect(dispatchEventSpy).toHaveBeenCalledWith(
          expect.objectContaining(eventPayload)
        );

        params.append('order', JSON.stringify('id asc'));
        params.append(
          'where',
          JSON.stringify({
            location: { eq: '/test/1' },
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
      });
    });

    describe('sends axios request to fetch single entity and calls handleICATError on request failure', () => {
      let error: AxiosError;

      beforeEach(() => {
        error = axios.AxiosError.from(new Error('Test error'));
        vi.mocked(axios.get).mockRejectedValue(error);
      });

      it('for investigations', async () => {
        const { result } = renderHook(
          () => useEntity('investigation', 'id', '1'),
          {
            wrapper: createReactQueryWrapper(),
          }
        );

        await waitFor(() => expect(result.current.isError).toBe(true));

        expect(handleICATError).toHaveBeenCalledWith(error);
      });

      it('for datasets', async () => {
        const { result } = renderHook(
          () => useEntity('dataset', 'name', 'test 1'),
          {
            wrapper: createReactQueryWrapper(),
          }
        );

        await waitFor(() => expect(result.current.isError).toBe(true));

        expect(handleICATError).toHaveBeenCalledWith(error);
      });

      it('for datafiles', async () => {
        const { result } = renderHook(
          () => useEntity('datafile', 'location', '/test/1'),
          {
            wrapper: createReactQueryWrapper(),
          }
        );
        await waitFor(() => expect(result.current.isError).toBe(true));

        expect(handleICATError).toHaveBeenCalledWith(error);
      });
    });
  });

  it('throws an error if an unsupported entity type is given', async () => {
    // @ts-expect-error this is what the test is testing
    const { result } = renderHook(() => useEntity('invalid', 'id', '1'), {
      wrapper: createReactQueryWrapper(),
    });
    const dispatchEventSpy = vi.spyOn(document, 'dispatchEvent');

    await waitFor(() => expect(result.current.isError).toBe(true));

    const eventPayload = {
      detail: {
        type: NotificationType,
        payload: {
          severity: 'error',
          message: 'Entity type not one of investigation, dataset or datafile',
        },
      },
    };
    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining(eventPayload)
    );
  });
});
