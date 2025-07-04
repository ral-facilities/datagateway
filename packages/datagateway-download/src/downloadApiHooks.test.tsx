import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import axios, { AxiosError } from 'axios';
import {
  Download,
  InvalidateTokenType,
  handleICATError,
} from 'datagateway-common';
import { createMemoryHistory } from 'history';
import log from 'loglevel';
import * as React from 'react';
import { Router } from 'react-router-dom';
import { DownloadSettingsContext } from './ConfigProvider';
import { ContributorType } from './downloadApi';
import {
  useAdminDownloadDeleted,
  useAdminDownloads,
  useAdminUpdateDownloadStatus,
  useCart,
  useCartUsers,
  useCheckUser,
  useDownloadOrRestoreDownload,
  useDownloadPercentageComplete,
  useDownloads,
  useFileSizesAndCounts,
  useIsCartMintable,
  useIsTwoLevel,
  useMintCart,
  useRemoveAllFromCart,
  useRemoveEntityFromCart,
} from './downloadApiHooks';
import { mockCartItems, mockDownloadItems, mockedSettings } from './testData';

vi.mock('datagateway-common', async () => {
  const originalModule = await vi.importActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    handleICATError: vi.fn(),
    retryICATErrors: vi.fn().mockReturnValue(false),
  };
});

const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        // set retryDelay = 0 to make retries quick for custom retry functions
        retryDelay: 0,
      },
    },
    // silence react-query errors
    logger: {
      log: console.log,
      warn: console.warn,
      error: vi.fn(),
    },
  });

const createReactQueryWrapper = (
  settings = mockedSettings
): React.JSXElementConstructor<{
  children: React.ReactElement;
}> => {
  const testQueryClient = createTestQueryClient();
  const history = createMemoryHistory();

  const wrapper: React.JSXElementConstructor<{
    children: React.ReactElement;
  }> = ({ children }) => (
    <DownloadSettingsContext.Provider value={settings}>
      <Router history={history}>
        <QueryClientProvider client={testQueryClient}>
          {children}
        </QueryClientProvider>
      </Router>
    </DownloadSettingsContext.Provider>
  );
  return wrapper;
};

describe('Download API react-query hooks test', () => {
  const localStorageGetItemMock = vi.spyOn(
    window.localStorage.__proto__,
    'getItem'
  );
  let events: CustomEvent<{
    detail: { type: string; payload?: unknown };
  }>[] = [];

  beforeEach(() => {
    events = [];

    document.dispatchEvent = (e: Event) => {
      events.push(
        e as CustomEvent<{ detail: { type: string; payload?: unknown } }>
      );
      return true;
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    localStorageGetItemMock.mockReset();
  });

  describe('useCart', () => {
    it('sends axios request to fetch cart and returns successful response', async () => {
      const downloadCartMockData = {
        cartItems: [
          {
            entityId: 1,
            entityType: 'investigation',
            id: 1,
            name: 'INVESTIGATION 1',
            parentEntities: [],
          },
          {
            entityId: 2,
            entityType: 'dataset',
            id: 2,
            name: 'DATASET 2',
            parentEntities: [],
          },
        ],
        createdAt: '2019-11-01T15:18:00Z',
        facilityName: mockedSettings.facilityName,
        id: 1,
        updatedAt: '2019-11-01T15:18:00Z',
        userName: 'test user',
      };

      axios.get = vi.fn().mockResolvedValue({
        data: downloadCartMockData,
      });

      const { result } = renderHook(() => useCart(), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/downloadApi/user/cart/LILS',
        {
          params: {
            sessionId: null,
          },
        }
      );
      expect(result.current.data).toEqual(downloadCartMockData.cartItems);
    });

    it('sends axios request to fetch cart and calls handleICATError on failure', async () => {
      axios.get = vi.fn().mockRejectedValue({
        message: 'Test error message',
      });

      const { result } = renderHook(() => useCart(), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });

  describe('useRemoveAllFromCart', () => {
    it('returns nothing upon successful response', async () => {
      axios.delete = vi.fn().mockImplementation(() =>
        Promise.resolve({
          data: {
            cartItems: [],
            facilityName: mockedSettings.facilityName,
            userName: 'test user',
          },
        })
      );

      const { result } = renderHook(() => useRemoveAllFromCart(), {
        wrapper: createReactQueryWrapper(),
      });

      expect(axios.delete).not.toHaveBeenCalled();
      expect(result.current.isIdle).toBe(true);

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toBeUndefined();
      expect(axios.delete).toHaveBeenCalled();
      expect(axios.delete).toHaveBeenCalledWith(
        `${mockedSettings.downloadApiUrl}/user/cart/${mockedSettings.facilityName}/cartItems`,
        { params: { sessionId: null, items: '*' } }
      );
    });

    it('logs error upon unsuccessful response, with a retry on code 431', async () => {
      axios.delete = vi
        .fn()
        .mockImplementationOnce(() =>
          Promise.reject({
            response: {
              status: 431,
            },
            message: 'Test 431 error message',
          } as AxiosError)
        )
        .mockImplementation(() =>
          Promise.reject({
            message: 'Test error message',
          })
        );

      const { result } = renderHook(() => useRemoveAllFromCart(), {
        wrapper: createReactQueryWrapper(),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isError).toBe(true), {
        timeout: 2000,
      });

      expect(axios.delete).toHaveBeenCalledWith(
        `${mockedSettings.downloadApiUrl}/user/cart/${mockedSettings.facilityName}/cartItems`,
        { params: { sessionId: null, items: '*' } }
      );
      expect(result.current.failureCount).toBe(2);
      expect(handleICATError).toHaveBeenCalledTimes(1);
      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });

  describe('useRemoveEntityFromCart', () => {
    it('returns empty array upon successful response', async () => {
      axios.delete = vi.fn().mockImplementation(() =>
        Promise.resolve({
          data: {
            cartItems: [],
            facilityName: mockedSettings.facilityName,
            userName: 'test user',
          },
        })
      );

      const { result } = renderHook(() => useRemoveEntityFromCart(), {
        wrapper: createReactQueryWrapper(),
      });

      expect(axios.delete).not.toHaveBeenCalled();
      expect(result.current.isIdle).toBe(true);

      result.current.mutate({ entityId: 1, entityType: 'datafile' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([]);
      expect(axios.delete).toHaveBeenCalled();
      expect(axios.delete).toHaveBeenCalledWith(
        `${mockedSettings.downloadApiUrl}/user/cart/${mockedSettings.facilityName}/cartItems`,
        { params: { sessionId: null, items: 'datafile 1' } }
      );
    });

    it('logs error upon unsuccessful response', async () => {
      axios.delete = vi
        .fn()
        .mockImplementationOnce(() =>
          Promise.reject({
            response: {
              status: 431,
            },
            message: 'Test 431 error message',
          } as AxiosError)
        )
        .mockImplementation(() =>
          Promise.reject({
            message: 'Test error message',
          })
        );

      const { result } = renderHook(() => useRemoveEntityFromCart(), {
        wrapper: createReactQueryWrapper(),
      });

      result.current.mutate({ entityId: 1, entityType: 'investigation' });

      await waitFor(() => expect(result.current.isError).toBe(true), {
        timeout: 2000,
      });

      expect(axios.delete).toHaveBeenCalledWith(
        `${mockedSettings.downloadApiUrl}/user/cart/${mockedSettings.facilityName}/cartItems`,
        { params: { sessionId: null, items: 'investigation 1' } }
      );
      expect(result.current.failureCount).toBe(2);
      expect(handleICATError).toHaveBeenCalledTimes(1);
      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });

  describe('useIsTwoLevel', () => {
    it('returns true if IDS is two-level', async () => {
      axios.get = vi.fn().mockImplementation(() =>
        Promise.resolve({
          data: true,
        })
      );

      const { result } = renderHook(() => useIsTwoLevel(), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(axios.get).toHaveBeenCalledWith(
        `${mockedSettings.idsUrl}/isTwoLevel`
      );
      expect(result.current.data).toEqual(true);
    });

    it('returns false in the event of an error and logs error upon unsuccessful response', async () => {
      axios.get = vi.fn().mockImplementation(() =>
        Promise.reject({
          message: 'Test error message',
        })
      );

      const { result } = renderHook(() => useIsTwoLevel(), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(axios.get).toHaveBeenCalledWith(
        `${mockedSettings.idsUrl}/isTwoLevel`
      );
      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });

  describe('useFileCountsAndSizes', () => {
    it('returns the sizes and counts of all the items in a cart', async () => {
      axios.get = vi
        .fn()
        .mockImplementation(() =>
          Promise.resolve({
            data: { fileCount: 7, fileSize: 21 },
          })
        )
        .mockImplementationOnce(() =>
          Promise.reject({
            message: 'simulating a failed response',
          })
        );

      const { result } = renderHook(
        () => useFileSizesAndCounts(mockCartItems),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() =>
        expect(
          result.current.every((query) => query.isSuccess || query.isError)
        ).toBe(true)
      );

      expect(result.current.map((query) => query.data)).toEqual([
        undefined,
        { fileSize: 21, fileCount: 7 },
        { fileSize: 21, fileCount: 7 },
        { fileSize: 21, fileCount: 1 },
      ]);
      expect(axios.get).toHaveBeenCalledTimes(4);
      expect(axios.get).toHaveBeenCalledWith(
        `${mockedSettings.apiUrl}/investigations/1`,
        {
          headers: {
            Authorization: 'Bearer null',
          },
        }
      );
      expect(axios.get).toHaveBeenCalledWith(
        `${mockedSettings.apiUrl}/investigations/2`,
        {
          headers: {
            Authorization: 'Bearer null',
          },
        }
      );
      expect(axios.get).toHaveBeenCalledWith(
        `${mockedSettings.apiUrl}/datasets/3`,
        {
          headers: {
            Authorization: 'Bearer null',
          },
        }
      );
      expect(axios.get).toHaveBeenCalledWith(
        `${mockedSettings.apiUrl}/datafiles/4`,
        {
          headers: {
            Authorization: 'Bearer null',
          },
        }
      );
      expect(handleICATError).toHaveBeenCalledWith(
        {
          message: 'simulating a failed response',
        },
        false
      );
    });
  });

  describe('useDownloads', () => {
    it('should retrieve user downloads', async () => {
      axios.get = vi.fn().mockResolvedValue({ data: mockDownloadItems });

      const { result } = renderHook(() => useDownloads(), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(axios.get).toHaveBeenCalledWith(
        `${mockedSettings.downloadApiUrl}/user/downloads`,
        {
          params: {
            sessionId: null,
            facilityName: mockedSettings.facilityName,
            queryOffset: 'where download.isDeleted = false',
          },
        }
      );
      expect(result.current.data).toEqual(mockDownloadItems);
    });

    it('should call handleICATError on failure', async () => {
      axios.get = vi.fn().mockRejectedValue({
        message: 'Test error message',
      });

      const { result } = renderHook(() => useDownloads(), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(axios.get).toHaveBeenCalledWith(
        `${mockedSettings.downloadApiUrl}/user/downloads`,
        {
          params: {
            sessionId: null,
            facilityName: mockedSettings.facilityName,
            queryOffset: 'where download.isDeleted = false',
          },
        }
      );
      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });

  describe('useDownloadOrRestoreDownload', () => {
    it('should delete download with given id and update the download list upon success', async () => {
      axios.get = vi.fn().mockResolvedValue({ data: mockDownloadItems });
      axios.put = vi.fn().mockImplementation(() => Promise.resolve());

      const { result } = renderHook(
        () => ({
          useDownloads: useDownloads(),
          useDownloadOrRestoreDownload: useDownloadOrRestoreDownload(),
        }),
        { wrapper: createReactQueryWrapper() }
      );

      // wait for useDownloads to finish loading mock download items
      await waitFor(() =>
        expect(result.current.useDownloads.isSuccess).toBe(true)
      );
      // delete the mock item
      result.current.useDownloadOrRestoreDownload.mutate({
        downloadId: 1,
        deleted: true,
      });
      // wait for mutation to complete
      await waitFor(() =>
        expect(result.current.useDownloadOrRestoreDownload.isSuccess).toBe(true)
      );

      expect(result.current.useDownloads.data).toHaveLength(
        mockDownloadItems.length - 1
      );
      expect(
        result.current.useDownloads.data?.find(({ id }) => id === 123)
      ).toBeUndefined();
    });

    it('should restore download with given id and update download list upon success', async () => {
      const mockRestoredDownload: Download = {
        createdAt: 'created-at',
        downloadItems: [],
        facilityName: mockedSettings.facilityName,
        fileName: 'file-name',
        fullName: 'fullName',
        id: 124,
        isDeleted: false,
        isEmailSent: false,
        isTwoLevel: false,
        preparedId: 'prepare-id',
        sessionId: 'session-id',
        size: 21,
        status: 'PREPARING',
        transport: 'http',
        userName: 'username',
        email: 'a@b.c',
      };

      axios.get = vi.fn().mockImplementation((url, { params }) => {
        // api call from fetchDownloads
        if (
          url === `${mockedSettings.downloadApiUrl}/user/downloads` &&
          params.queryOffset === 'where download.isDeleted = false'
        )
          return Promise.resolve({ data: mockDownloadItems });

        // api call from getDownload
        if (
          url === `${mockedSettings.downloadApiUrl}/user/downloads` &&
          params.queryOffset === 'where download.id = 124'
        )
          return Promise.resolve({ data: [mockRestoredDownload] });

        return Promise.reject();
      });

      axios.put = vi.fn().mockImplementation(() => Promise.resolve());

      const { result } = renderHook(
        () => ({
          useDownloads: useDownloads(),
          useDownloadOrRestoreDownload: useDownloadOrRestoreDownload(),
        }),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() =>
        expect(result.current.useDownloads.isSuccess).toBe(true)
      );
      result.current.useDownloadOrRestoreDownload.mutate({
        downloadId: 124,
        deleted: false,
      });
      await waitFor(() =>
        expect(result.current.useDownloadOrRestoreDownload.isSuccess).toBe(true)
      );

      const newList = result.current.useDownloads.data;

      expect(newList).toHaveLength(mockDownloadItems.length + 1);
      expect(newList?.find(({ id }) => id === 124)).toEqual(
        mockRestoredDownload
      );
    });

    it('should call handleICATError if an error is encountered', async () => {
      axios.put = vi.fn().mockRejectedValue({
        message: 'Test error message',
      });

      const { result } = renderHook(() => useDownloadOrRestoreDownload(), {
        wrapper: createReactQueryWrapper(),
      });

      result.current.mutate({
        downloadId: 123,
        deleted: true,
      });
      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });

  describe('useAdminDownloads', () => {
    it('should fetch admin downloads with pagination', async () => {
      axios.get = vi.fn().mockResolvedValue({ data: mockDownloadItems });

      // first, test fetching initial data

      const { result } = renderHook(
        () => useAdminDownloads({ initialQueryOffset: 'LIMIT 0, 50' }),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(axios.get).toHaveBeenNthCalledWith(
        1,
        `${mockedSettings.downloadApiUrl}/admin/downloads`,
        {
          params: {
            sessionId: null,
            facilityName: mockedSettings.facilityName,
            queryOffset: 'LIMIT 0, 50',
          },
        }
      );
      expect(result.current.data?.pages).toEqual([mockDownloadItems]);

      // then test fetching next page

      await result.current.fetchNextPage({
        pageParam: 'LIMIT 50, 100',
      });
      await waitFor(() =>
        expect(
          !result.current.isFetchingNextPage && result.current.isSuccess
        ).toBe(true)
      );

      expect(axios.get).toHaveBeenNthCalledWith(
        2,
        `${mockedSettings.downloadApiUrl}/admin/downloads`,
        {
          params: {
            sessionId: null,
            facilityName: mockedSettings.facilityName,
            queryOffset: 'LIMIT 50, 100',
          },
        }
      );
      expect(result.current.data?.pages).toEqual([
        mockDownloadItems,
        mockDownloadItems,
      ]);
    });

    it('should call handleICATError when an error is encountered', async () => {
      axios.get = vi.fn().mockRejectedValue({
        message: 'Test error message',
      });

      const { result } = renderHook(
        () => useAdminDownloads({ initialQueryOffset: 'LIMIT 0, 50' }),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(axios.get).toHaveBeenCalledWith(
        `${mockedSettings.downloadApiUrl}/admin/downloads`,
        {
          params: {
            sessionId: null,
            facilityName: mockedSettings.facilityName,
            queryOffset: 'LIMIT 0, 50',
          },
        }
      );
      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });

  describe('useAdminDownloadDeleted', () => {
    it('should delete download with the given id', async () => {
      // the way the mocked mutation is handled is through this isMutated flag.
      // initially, isMutated is false, and the mocked implementation
      // of axios.get will return the unmodified download item list.
      // after isMutated is set to true
      // (which is done when manually calling the mutation function)
      // axios.get will return the updated download item list instead,
      // to simulate server updating the list.
      //
      // this is needed because after mutation is successful,
      // onSettled is called which will call invalidateQueries, causing
      // axios.get to be called again. without the flag,
      // it will just always return the old list.

      let isMutated = false;
      const deletedDownload = {
        ...mockDownloadItems.find(({ id }) => id === 1),
        isDeleted: true,
      };

      axios.get = vi.fn().mockImplementation((url, { params }) => {
        // fetchAdminDownloads from useAdminDownloads
        if (
          url === `${mockedSettings.downloadApiUrl}/admin/downloads` &&
          params.queryOffset === 'LIMIT 0, 50'
        )
          return Promise.resolve({
            data: isMutated
              ? mockDownloadItems.map((download) =>
                  download.id === deletedDownload.id
                    ? deletedDownload
                    : download
                )
              : mockDownloadItems,
          });

        // fetchAdminDownloads from onSuccess of useAdminDownloadDeleted
        if (
          url === `${mockedSettings.downloadApiUrl}/admin/downloads` &&
          params.queryOffset === 'WHERE download.id = 1'
        )
          return Promise.resolve({
            data: [deletedDownload],
          });

        return Promise.reject();
      });

      axios.put = vi.fn().mockImplementation(() => Promise.resolve());

      const { result } = renderHook(
        () => ({
          useAdminDownloads: useAdminDownloads({
            initialQueryOffset: 'LIMIT 0, 50',
          }),
          useAdminDownloadDeleted: useAdminDownloadDeleted(),
        }),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      // wait for admin downloads to finish loading
      await waitFor(() =>
        expect(result.current.useAdminDownloads.isSuccess).toBe(true)
      );
      isMutated = true;
      result.current.useAdminDownloadDeleted.mutate({
        downloadId: 1,
        deleted: true,
      });
      // wait for mutation to complete
      await waitFor(() =>
        expect(result.current.useAdminDownloadDeleted.isSuccess).toBe(true)
      );

      const updated = result.current.useAdminDownloads.data?.pages?.[0]?.find(
        ({ id }) => id === 1
      );

      expect(updated?.isDeleted).toBe(true);
    });

    it('should restore download with the given id', async () => {
      // the way the mocked mutation is handled is through this isMutated flag.
      // initially, isMutated is false, and the mocked implementation
      // of axios.get will return the unmodified download item list.
      // after isMutated is set to true
      // (which is done when manually calling the mutation function)
      // axios.get will return the updated download item list instead,
      // to simulate server updating the list.
      //
      // this is needed because after mutation is successful,
      // onSettled is called which will call invalidateQueries, causing
      // axios.get to be called again. without the flag,
      // it will just always return the old list.

      let isMutated = false;
      const restoredDownload: Download = {
        createdAt: '2020-02-25T15:05:29Z',
        downloadItems: [{ entityId: 1, entityType: 'investigation', id: 1 }],
        email: 'test1@email.com',
        facilityName: 'LILS',
        fileName: 'test-file-1',
        fullName: 'Person 1',
        id: 6,
        isDeleted: false,
        isEmailSent: true,
        isTwoLevel: false,
        preparedId: 'test-prepared-id',
        sessionId: 'test-session-id',
        size: 1000,
        status: 'COMPLETE',
        transport: 'https',
        userName: 'test user',
      };
      // mockDownloadItems all have isDeleted set to false
      // I made a new Download object with isDeleted set to true
      // to simulate the action of restoring a download
      // it will be appended to mockDownloadItems
      const deletedDownload = {
        ...restoredDownload,
        isDeleted: true,
      };

      axios.get = vi.fn().mockImplementation((url, { params }) => {
        // fetchAdminDownloads from useAdminDownloads
        if (
          url === `${mockedSettings.downloadApiUrl}/admin/downloads` &&
          params.queryOffset === 'LIMIT 0, 50'
        )
          return Promise.resolve({
            data: isMutated
              ? [...mockDownloadItems, deletedDownload].map((download) =>
                  download.id === restoredDownload.id
                    ? restoredDownload
                    : download
                )
              : [...mockDownloadItems, deletedDownload],
          });

        // fetchAdminDownloads from onSuccess of useAdminDownloadDeleted
        if (
          url === `${mockedSettings.downloadApiUrl}/admin/downloads` &&
          params.queryOffset === `WHERE download.id = ${restoredDownload.id}`
        )
          return Promise.resolve({
            data: [restoredDownload],
          });

        return Promise.reject();
      });

      axios.put = vi.fn().mockImplementation(() => Promise.resolve());

      const { result } = renderHook(
        () => ({
          useAdminDownloads: useAdminDownloads({
            initialQueryOffset: 'LIMIT 0, 50',
          }),
          useAdminDownloadDeleted: useAdminDownloadDeleted(),
        }),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      // wait for admin downloads to finish loading
      await waitFor(() =>
        expect(result.current.useAdminDownloads.isSuccess).toBe(true)
      );
      isMutated = true;
      result.current.useAdminDownloadDeleted.mutate({
        downloadId: 6,
        deleted: false,
      });
      // wait for mutation to complete
      await waitFor(() =>
        expect(result.current.useAdminDownloadDeleted.isSuccess).toBe(true)
      );

      const updated = result.current.useAdminDownloads.data?.pages?.[0]?.find(
        ({ id }) => id === restoredDownload.id
      );

      expect(updated?.isDeleted).toBe(false);
    });

    it('should call handleICATError when an error is encountered', async () => {
      axios.put = vi.fn().mockRejectedValue({
        message: 'Test error message',
      });

      const { result } = renderHook(() => useAdminDownloadDeleted(), {
        wrapper: createReactQueryWrapper(),
      });

      result.current.mutate({
        downloadId: 1,
        deleted: true,
      });
      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });

  describe('useAdminUpdateDownloadStatus', () => {
    it('should update status of download with the given id', async () => {
      // the way the mocked mutation is handled is through this isMutated flag.
      // initially, isMutated is false, and the mocked implementation
      // of axios.get will return the unmodified download item list.
      // after isMutated is set to true
      // (which is done when manually calling the mutation function)
      // axios.get will return the updated download item list instead,
      // to simulate server updating the list.
      //
      // this is needed because after mutation is successful,
      // onSettled is called which will call invalidateQueries, causing
      // axios.get to be called again. without the flag,
      // it will just always return the old list.

      let isMutated = false;

      const updatedDownload: Download = {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ...mockDownloadItems.find(({ id }) => id === 1)!,
        status: 'PREPARING',
      };

      axios.get = vi.fn().mockImplementation(() =>
        Promise.resolve({
          data: isMutated
            ? mockDownloadItems.map((download) =>
                download.id === updatedDownload.id ? updatedDownload : download
              )
            : mockDownloadItems,
        })
      );
      axios.put = vi.fn().mockImplementation(() => Promise.resolve());

      const { result } = renderHook(
        () => ({
          useAdminDownloads: useAdminDownloads({
            initialQueryOffset: 'LIMIT 0, 50 ',
          }),
          useAdminUpdateDownloadStatus: useAdminUpdateDownloadStatus(),
        }),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() =>
        expect(result.current.useAdminDownloads.isSuccess).toBe(true)
      );
      isMutated = true;
      result.current.useAdminUpdateDownloadStatus.mutate({
        downloadId: 1,
        status: 'PREPARING',
      });
      await waitFor(() =>
        expect(result.current.useAdminUpdateDownloadStatus.isSuccess).toBe(true)
      );

      expect(
        result.current.useAdminDownloads.data?.pages?.[0]?.find(
          ({ id }) => id === 1
        )
      ).toEqual(updatedDownload);
    });

    it('should call handleICATError and rollback optimistic changes if an error is encountered', async () => {
      axios.put = vi.fn().mockRejectedValue({
        message: 'Test error message',
      });
      axios.get = vi.fn().mockResolvedValue({ data: mockDownloadItems });

      const { result } = renderHook(
        () => ({
          useAdminDownloads: useAdminDownloads({
            initialQueryOffset: 'LIMIT 0, 50',
          }),
          useAdminUpdateDownloadStatus: useAdminUpdateDownloadStatus(),
        }),
        { wrapper: createReactQueryWrapper() }
      );

      await waitFor(() =>
        expect(result.current.useAdminDownloads.isSuccess).toBe(true)
      );
      result.current.useAdminUpdateDownloadStatus.mutate({
        downloadId: 1,
        status: 'PREPARING',
      });
      await waitFor(() =>
        expect(result.current.useAdminUpdateDownloadStatus.isError).toBe(true)
      );

      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
      expect(result.current.useAdminDownloads.data?.pages).toEqual([
        mockDownloadItems,
      ]);
    });
  });

  describe('useDownloadPercentageComplete', () => {
    it('should query progress of a download restore', async () => {
      axios.get = vi.fn().mockResolvedValue({
        data: '30',
      });

      const { result } = renderHook(
        () =>
          useDownloadPercentageComplete({
            download: mockDownloadItems[0],
          }),
        {
          wrapper: createReactQueryWrapper(),
        }
      );
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(30);
    });

    it('should query status of a download restore', async () => {
      axios.get = vi.fn().mockResolvedValue({
        data: 'UNKNOWN',
      });

      const { result } = renderHook(
        () =>
          useDownloadPercentageComplete({
            download: mockDownloadItems[0],
          }),
        {
          wrapper: createReactQueryWrapper(),
        }
      );
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual('UNKNOWN');
    });

    it('should call handleICATError when an error is encountered', async () => {
      axios.get = vi.fn().mockRejectedValue({
        message: 'Test error message',
      });

      const { result } = renderHook(
        () =>
          useDownloadPercentageComplete({
            download: mockDownloadItems[0],
          }),
        {
          wrapper: createReactQueryWrapper(),
        }
      );
      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(handleICATError).toHaveBeenCalledWith(
        {
          message: 'Test error message',
        },
        false
      );
    });
  });

  describe('useIsCartMintable', () => {
    it('should check whether a cart is mintable', async () => {
      axios.post = vi.fn().mockResolvedValue({ data: undefined, status: 200 });

      const { result } = renderHook(() => useIsCartMintable(mockCartItems), {
        wrapper: createReactQueryWrapper(),
      });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(true);
      expect(axios.post).toHaveBeenCalledWith(
        `${mockedSettings.doiMinterUrl}/ismintable`,
        {
          investigation_ids: [1, 2],
          dataset_ids: [3],
          datafile_ids: [4],
        },
        { headers: { Authorization: 'Bearer null' } }
      );
    });

    it('should be disabled if doiMinterUrl is not defined', async () => {
      const { result } = renderHook(() => useIsCartMintable(mockCartItems), {
        wrapper: createReactQueryWrapper({
          ...mockedSettings,
          doiMinterUrl: undefined,
        }),
      });

      expect(result.current.status).toBe('loading');
      expect(result.current.fetchStatus).toBe('idle');

      expect(axios.post).not.toHaveBeenCalled();
    });

    it('should return false if cart is undefined', async () => {
      const { result } = renderHook(() => useIsCartMintable(undefined), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(false);
      expect(axios.post).not.toHaveBeenCalled();
    });

    it('should return false if cart is empty', async () => {
      const { result } = renderHook(() => useIsCartMintable([]), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(false);
      expect(axios.post).not.toHaveBeenCalled();
    });

    it('should handle 401 by broadcasting an invalidate token message with autologin being true', async () => {
      localStorageGetItemMock.mockImplementation((name) => {
        return name === 'autoLogin' ? 'true' : null;
      });

      const error = {
        message: 'Test error message',
        response: {
          status: 401,
        },
      };
      axios.post = vi.fn().mockRejectedValue(error);

      const { result } = renderHook(
        () => useIsCartMintable([mockCartItems[0]]),
        {
          wrapper: createReactQueryWrapper(),
        }
      );
      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(log.error).toHaveBeenCalledWith(error);
      expect(axios.post).toHaveBeenCalledTimes(4);
      expect(axios.post).toHaveBeenCalledWith(
        `${mockedSettings.doiMinterUrl}/ismintable`,
        {
          investigation_ids: [1],
        },
        { headers: { Authorization: 'Bearer null' } }
      );
      expect(events.length).toBe(1);
      expect(events[0].detail).toEqual({
        type: InvalidateTokenType,
        payload: {
          severity: 'error',
          message: 'Your session has expired, please reload the page',
        },
      });
    });

    it('should handle 401 by broadcasting an invalidate token message with autologin being false', async () => {
      localStorageGetItemMock.mockImplementation((name) => {
        return name === 'autoLogin' ? 'false' : null;
      });

      const error = {
        message: 'Test error message',
        response: {
          status: 401,
        },
      };
      axios.post = vi.fn().mockRejectedValue(error);

      const { result } = renderHook(
        () => useIsCartMintable([mockCartItems[3]]),
        {
          wrapper: createReactQueryWrapper(),
        }
      );
      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(log.error).toHaveBeenCalledWith(error);
      expect(axios.post).toHaveBeenCalledTimes(4);
      expect(axios.post).toHaveBeenCalledWith(
        `${mockedSettings.doiMinterUrl}/ismintable`,
        {
          datafile_ids: [4],
        },
        { headers: { Authorization: 'Bearer null' } }
      );
      expect(events.length).toBe(1);
      expect(events[0].detail).toEqual({
        type: InvalidateTokenType,
        payload: {
          severity: 'error',
          message: 'Your session has expired, please login again',
        },
      });
    });

    it('should not log 403 errors or retry them', async () => {
      const error = {
        message: 'Test error message',
        response: {
          status: 403,
        },
      };
      axios.post = vi.fn().mockRejectedValue(error);

      const { result } = renderHook(() => useIsCartMintable(mockCartItems), {
        wrapper: createReactQueryWrapper(),
      });
      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(log.error).not.toHaveBeenCalled();
      expect(axios.post).toHaveBeenCalledTimes(1);
    });
  });

  describe('useMintCart', () => {
    const doiMetadata = {
      title: 'Test title',
      description: 'Test description',
      creators: [{ username: '1', contributor_type: ContributorType.Creator }],
      related_items: [],
    };
    it('should send a request to mint a cart', async () => {
      axios.post = vi.fn().mockResolvedValue({
        data: {
          concept: { doi: 'test doi', data_publication: '1' },
          version: { doi: 'test doi v1', data_publication: '11' },
        },
        status: 200,
      });

      const { result } = renderHook(() => useMintCart(), {
        wrapper: createReactQueryWrapper(),
      });

      let data;
      await act(async () => {
        data = await result.current.mutateAsync({
          cart: mockCartItems,
          doiMetadata,
        });
      });

      expect(data).toEqual({
        concept: { doi: 'test doi', data_publication: '1' },
        version: { doi: 'test doi v1', data_publication: '11' },
      });
      expect(axios.post).toHaveBeenCalledWith(
        `${mockedSettings.doiMinterUrl}/mint`,
        {
          metadata: {
            ...doiMetadata,
            resource_type: 'Collection',
          },
          investigation_ids: [1, 2],
          dataset_ids: [3],
          datafile_ids: [4],
        },
        { headers: { Authorization: 'Bearer null' } }
      );
    });

    it('should handle 401 by broadcasting an invalidate token message with autologin being true', async () => {
      localStorageGetItemMock.mockImplementation((name) => {
        return name === 'autoLogin' ? 'true' : null;
      });

      const error = {
        message: 'Test error message',
        response: {
          status: 401,
        },
      };
      axios.post = vi.fn().mockRejectedValue(error);

      const { result } = renderHook(() => useMintCart(), {
        wrapper: createReactQueryWrapper(),
      });

      act(() => {
        result.current.mutate({ cart: [mockCartItems[0]], doiMetadata });
      });
      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(log.error).toHaveBeenCalledWith(error);
      expect(axios.post).toHaveBeenCalledWith(
        `${mockedSettings.doiMinterUrl}/mint`,
        {
          metadata: {
            ...doiMetadata,
            resource_type: 'Collection',
          },
          investigation_ids: [1],
        },
        { headers: { Authorization: 'Bearer null' } }
      );
      expect(events.length).toBe(1);
      expect(events[0].detail).toEqual({
        type: InvalidateTokenType,
        payload: {
          severity: 'error',
          message: 'Your session has expired, please reload the page',
        },
      });
    });

    it('should handle 401 by broadcasting an invalidate token message with autologin being false', async () => {
      localStorageGetItemMock.mockImplementation((name) => {
        return name === 'autoLogin' ? 'false' : null;
      });

      const error = {
        message: 'Test error message',
        response: {
          status: 401,
        },
      };
      axios.post = vi.fn().mockRejectedValue(error);

      const { result } = renderHook(() => useMintCart(), {
        wrapper: createReactQueryWrapper(),
      });

      act(() => {
        result.current.mutate({ cart: [mockCartItems[3]], doiMetadata });
      });
      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(log.error).toHaveBeenCalledWith(error);
      expect(axios.post).toHaveBeenCalledWith(
        `${mockedSettings.doiMinterUrl}/mint`,
        {
          metadata: {
            ...doiMetadata,
            resource_type: 'Dataset',
          },
          datafile_ids: [4],
        },
        { headers: { Authorization: 'Bearer null' } }
      );
      expect(events.length).toBe(1);
      expect(events[0].detail).toEqual({
        type: InvalidateTokenType,
        payload: {
          severity: 'error',
          message: 'Your session has expired, please login again',
        },
      });
    });
  });

  describe('useCartUsers', () => {
    it('should get a list of users associated with each cart item', async () => {
      axios.get = vi.fn().mockImplementation((url) => {
        if (url.includes('investigations')) {
          return Promise.resolve({
            data: [
              {
                investigationUsers: [
                  { user: { id: 1, name: 'user 1' } },
                  { user: { id: 2, name: 'user 2' } },
                ],
              },
            ],
          });
        }
        if (url.includes('datasets')) {
          return Promise.resolve({
            data: [
              {
                investigation: {
                  investigationUsers: [
                    { user: { id: 2, name: 'user 2' } },
                    { user: { id: 3, name: 'user 3' } },
                  ],
                },
              },
            ],
          });
        }
        if (url.includes('datafiles')) {
          return Promise.resolve({
            data: [
              {
                dataset: {
                  investigation: {
                    investigationUsers: [
                      { user: { id: 3, name: 'user 3' } },
                      { user: { id: 4, name: 'user 4' } },
                    ],
                  },
                },
              },
            ],
          });
        } else {
          return Promise.resolve({ data: [] });
        }
      });

      const { result } = renderHook(() => useCartUsers(mockCartItems), {
        wrapper: createReactQueryWrapper(),
      });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // data should be deduped
      expect(result.current.data).toEqual([
        { id: 1, name: 'user 1' },
        { id: 2, name: 'user 2' },
        { id: 3, name: 'user 3' },
        { id: 4, name: 'user 4' },
      ]);
      // needs to get called once for each item in the cart
      expect(axios.get).toHaveBeenCalledTimes(mockCartItems.length);

      const inv1Params = new URLSearchParams();
      inv1Params.append(
        'where',
        JSON.stringify({
          id: { eq: 1 },
        })
      );
      inv1Params.append(
        'include',
        JSON.stringify({
          investigationUsers: 'user',
        })
      );

      expect(axios.get).toHaveBeenCalledWith(
        `${mockedSettings.apiUrl}/investigations`,
        expect.objectContaining({
          params: inv1Params,
        })
      );

      const inv2Params = new URLSearchParams();
      inv2Params.append(
        'where',
        JSON.stringify({
          id: { eq: 2 },
        })
      );
      inv2Params.append(
        'include',
        JSON.stringify({
          investigationUsers: 'user',
        })
      );

      expect(axios.get).toHaveBeenCalledWith(
        `${mockedSettings.apiUrl}/investigations`,
        expect.objectContaining({
          params: inv2Params,
        })
      );

      const dsParams = new URLSearchParams();
      dsParams.append(
        'where',
        JSON.stringify({
          id: { eq: 3 },
        })
      );
      dsParams.append(
        'include',
        JSON.stringify({
          investigation: { investigationUsers: 'user' },
        })
      );

      expect(axios.get).toHaveBeenCalledWith(
        `${mockedSettings.apiUrl}/datasets`,
        expect.objectContaining({
          params: dsParams,
        })
      );

      const dfParams = new URLSearchParams();
      dfParams.append(
        'where',
        JSON.stringify({
          id: { eq: 4 },
        })
      );
      dfParams.append(
        'include',
        JSON.stringify({
          datasets: { investigation: { investigationUsers: 'user' } },
        })
      );

      expect(axios.get).toHaveBeenCalledWith(
        `${mockedSettings.apiUrl}/datafiles`,
        expect.objectContaining({
          params: dfParams,
        })
      );
    });

    it('should not query for users if cart is undefined', async () => {
      const { result } = renderHook(() => useCartUsers(undefined), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([]);
      expect(axios.get).not.toHaveBeenCalled();
    });
  });

  describe('useCheckUser', () => {
    it('should check whether a user exists in ICAT', async () => {
      axios.get = vi
        .fn()
        .mockResolvedValue({ data: { id: 1, name: 'user 1' } });

      const { result } = renderHook(() => useCheckUser('user 1'), {
        wrapper: createReactQueryWrapper(),
      });
      expect(result.current.status).toBe('loading');
      expect(result.current.fetchStatus).toBe('idle');
      act(() => {
        result.current.refetch();
      });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual({ id: 1, name: 'user 1' });
      expect(axios.get).toHaveBeenCalledWith(
        `${mockedSettings.doiMinterUrl}/user/${'user 1'}`,
        { headers: { Authorization: 'Bearer null' } }
      );
    });

    it('should handle 401 by broadcasting an invalidate token message with autologin being true', async () => {
      localStorageGetItemMock.mockImplementation((name) => {
        return name === 'autoLogin' ? 'true' : null;
      });

      const error = {
        message: 'Test error message',
        response: {
          status: 401,
        },
      };
      axios.get = vi.fn().mockRejectedValue(error);

      const { result } = renderHook(() => useCheckUser('user 1'), {
        wrapper: createReactQueryWrapper(),
      });
      expect(result.current.status).toBe('loading');
      expect(result.current.fetchStatus).toBe('idle');
      act(() => {
        result.current.refetch();
      });
      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(log.error).toHaveBeenCalledWith(error);
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(events.length).toBe(1);
      expect(events[0].detail).toEqual({
        type: InvalidateTokenType,
        payload: {
          severity: 'error',
          message: 'Your session has expired, please reload the page',
        },
      });
    });

    it('should handle 401 by broadcasting an invalidate token message with autologin being false', async () => {
      localStorageGetItemMock.mockImplementation((name) => {
        return name === 'autoLogin' ? 'false' : null;
      });

      const error = {
        message: 'Test error message',
        response: {
          status: 401,
        },
      };
      axios.get = vi.fn().mockRejectedValue(error);

      const { result } = renderHook(() => useCheckUser('user 1'), {
        wrapper: createReactQueryWrapper(),
      });
      expect(result.current.status).toBe('loading');
      expect(result.current.fetchStatus).toBe('idle');
      act(() => {
        result.current.refetch();
      });
      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(log.error).toHaveBeenCalledWith(error);
      expect(axios.get).toHaveBeenCalledTimes(1);
      expect(events.length).toBe(1);
      expect(events[0].detail).toEqual({
        type: InvalidateTokenType,
        payload: {
          severity: 'error',
          message: 'Your session has expired, please login again',
        },
      });
    });

    it('should not retry 404 errors', async () => {
      const error = {
        message: 'Test error message',
        response: {
          status: 404,
        },
      };
      axios.get = vi.fn().mockRejectedValue(error);

      const { result } = renderHook(() => useCheckUser('user 1'), {
        wrapper: createReactQueryWrapper(),
      });
      expect(result.current.status).toBe('loading');
      expect(result.current.fetchStatus).toBe('idle');
      act(() => {
        result.current.refetch();
      });
      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(log.error).toHaveBeenCalledWith(error);
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    it('should not retry 422 errors', async () => {
      const error = {
        message: 'Test error message',
        response: {
          status: 422,
        },
      };
      axios.get = vi.fn().mockRejectedValue(error);

      const { result } = renderHook(() => useCheckUser('user 1'), {
        wrapper: createReactQueryWrapper(),
      });
      expect(result.current.status).toBe('loading');
      expect(result.current.fetchStatus).toBe('idle');
      act(() => {
        result.current.refetch();
      });
      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(log.error).toHaveBeenCalledWith(error);
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    it('should retry other errors', async () => {
      const error = {
        message: 'Test error message',
        response: {
          status: 400,
        },
      };
      axios.get = vi.fn().mockRejectedValue(error);

      const { result } = renderHook(() => useCheckUser('user 1'), {
        wrapper: createReactQueryWrapper(),
      });
      expect(result.current.status).toBe('loading');
      expect(result.current.fetchStatus).toBe('idle');
      act(() => {
        result.current.refetch();
      });
      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(log.error).toHaveBeenCalledWith(error);
      expect(axios.get).toHaveBeenCalledTimes(4);
    });
  });
});
