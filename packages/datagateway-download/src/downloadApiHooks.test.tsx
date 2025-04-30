import {
  act,
  renderHook,
  WrapperComponent,
} from '@testing-library/react-hooks';
import axios, { AxiosError } from 'axios';
import { Download, handleDOIAPIError } from 'datagateway-common';
import { handleICATError, NotificationType } from 'datagateway-common';
import { createMemoryHistory } from 'history';
import * as React from 'react';
import { QueryClient, QueryClientProvider, setLogger } from 'react-query';
import { Router } from 'react-router-dom';
import { DownloadSettingsContext } from './ConfigProvider';
import {
  useAdminDownloadDeleted,
  useAdminDownloads,
  useAdminUpdateDownloadStatus,
  useCart,
  useCartUsers,
  useDownloadOrRestoreDownload,
  useDownloadPercentageComplete,
  useDownloads,
  useDownloadTypeStatuses,
  useFileSizesAndCounts,
  useIsTwoLevel,
  useMintCart,
  useRemoveAllFromCart,
  useRemoveEntityFromCart,
  useSubmitCart,
} from './downloadApiHooks';
import { mockCartItems, mockDownloadItems, mockedSettings } from './testData';
import { ContributorType } from 'datagateway-common';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    handleICATError: jest.fn(),
    retryICATErrors: jest.fn().mockReturnValue(false),
    handleDOIAPIError: jest.fn(),
  };
});

// silence react-query errors
setLogger({
  log: console.log,
  warn: console.warn,
  error: jest.fn(),
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
  });

const createReactQueryWrapper = (
  settings = mockedSettings
): WrapperComponent<unknown> => {
  const testQueryClient = createTestQueryClient();
  const history = createMemoryHistory();

  const wrapper: WrapperComponent<unknown> = ({ children }) => (
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
  afterEach(() => {
    jest.clearAllMocks();
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

      axios.get = jest.fn().mockResolvedValue({
        data: downloadCartMockData,
      });

      const { result, waitFor } = renderHook(() => useCart(), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => result.current.isSuccess);

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
      axios.get = jest.fn().mockRejectedValue({
        message: 'Test error message',
      });

      const { result, waitFor } = renderHook(() => useCart(), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => result.current.isError);

      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });

  describe('useRemoveAllFromCart', () => {
    it('returns nothing upon successful response', async () => {
      axios.delete = jest.fn().mockImplementation(() =>
        Promise.resolve({
          data: {
            cartItems: [],
            facilityName: mockedSettings.facilityName,
            userName: 'test user',
          },
        })
      );

      const { result, waitFor } = renderHook(() => useRemoveAllFromCart(), {
        wrapper: createReactQueryWrapper(),
      });

      expect(axios.delete).not.toHaveBeenCalled();
      expect(result.current.isIdle).toBe(true);

      result.current.mutate();

      await waitFor(() => result.current.isSuccess);

      expect(result.current.data).toBeUndefined();
      expect(axios.delete).toHaveBeenCalled();
      expect(axios.delete).toHaveBeenCalledWith(
        `${mockedSettings.downloadApiUrl}/user/cart/${mockedSettings.facilityName}/cartItems`,
        { params: { sessionId: null, items: '*' } }
      );
    });

    it('logs error upon unsuccessful response, with a retry on code 431', async () => {
      axios.delete = jest
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

      const { result, waitFor } = renderHook(() => useRemoveAllFromCart(), {
        wrapper: createReactQueryWrapper(),
      });

      result.current.mutate();

      await waitFor(() => result.current.isError, { timeout: 2000 });

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
      axios.delete = jest.fn().mockImplementation(() =>
        Promise.resolve({
          data: {
            cartItems: [],
            facilityName: mockedSettings.facilityName,
            userName: 'test user',
          },
        })
      );

      const { result, waitFor } = renderHook(() => useRemoveEntityFromCart(), {
        wrapper: createReactQueryWrapper(),
      });

      expect(axios.delete).not.toHaveBeenCalled();
      expect(result.current.isIdle).toBe(true);

      result.current.mutate({ entityId: 1, entityType: 'datafile' });

      await waitFor(() => result.current.isSuccess);

      expect(result.current.data).toEqual([]);
      expect(axios.delete).toHaveBeenCalled();
      expect(axios.delete).toHaveBeenCalledWith(
        `${mockedSettings.downloadApiUrl}/user/cart/${mockedSettings.facilityName}/cartItems`,
        { params: { sessionId: null, items: 'datafile 1' } }
      );
    });

    it('logs error upon unsuccessful response', async () => {
      axios.delete = jest
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

      const { result, waitFor } = renderHook(() => useRemoveEntityFromCart(), {
        wrapper: createReactQueryWrapper(),
      });

      result.current.mutate({ entityId: 1, entityType: 'investigation' });

      await waitFor(() => result.current.isError, { timeout: 2000 });

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
      axios.get = jest.fn().mockImplementation(() =>
        Promise.resolve({
          data: true,
        })
      );

      const { result, waitFor } = renderHook(() => useIsTwoLevel(), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => result.current.isSuccess);

      expect(axios.get).toHaveBeenCalledWith(
        `${mockedSettings.idsUrl}/isTwoLevel`
      );
      expect(result.current.data).toEqual(true);
    });

    it('returns false in the event of an error and logs error upon unsuccessful response', async () => {
      axios.get = jest.fn().mockImplementation(() =>
        Promise.reject({
          message: 'Test error message',
        })
      );

      const { result, waitFor } = renderHook(() => useIsTwoLevel(), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => result.current.isError);

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
      axios.get = jest
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

      const { result, waitFor } = renderHook(
        () => useFileSizesAndCounts(mockCartItems),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() =>
        result.current.every((query) => query.isSuccess || query.isError)
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
      axios.get = jest.fn().mockResolvedValue({ data: mockDownloadItems });

      const { result, waitFor } = renderHook(() => useDownloads(), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => result.current.isSuccess);

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
      axios.get = jest.fn().mockRejectedValue({
        message: 'Test error message',
      });

      const { result, waitFor } = renderHook(() => useDownloads(), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => result.current.isError);

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
      axios.get = jest.fn().mockResolvedValue({ data: mockDownloadItems });
      axios.put = jest.fn().mockImplementation(() => Promise.resolve());

      const { result, waitFor } = renderHook(
        () => ({
          useDownloads: useDownloads(),
          useDownloadOrRestoreDownload: useDownloadOrRestoreDownload(),
        }),
        { wrapper: createReactQueryWrapper() }
      );

      // wait for useDownloads to finish loading mock download items
      await waitFor(() => result.current.useDownloads.isSuccess);
      // delete the mock item
      result.current.useDownloadOrRestoreDownload.mutate({
        downloadId: 1,
        deleted: true,
      });
      // wait for mutation to complete
      await waitFor(
        () => result.current.useDownloadOrRestoreDownload.isSuccess
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

      axios.get = jest.fn().mockImplementation((url, { params }) => {
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

      axios.put = jest.fn().mockImplementation(() => Promise.resolve());

      const { result, waitFor } = renderHook(
        () => ({
          useDownloads: useDownloads(),
          useDownloadOrRestoreDownload: useDownloadOrRestoreDownload(),
        }),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() => result.current.useDownloads.isSuccess);
      result.current.useDownloadOrRestoreDownload.mutate({
        downloadId: 124,
        deleted: false,
      });
      await waitFor(
        () => result.current.useDownloadOrRestoreDownload.isSuccess
      );

      const newList = result.current.useDownloads.data;

      expect(newList).toHaveLength(mockDownloadItems.length + 1);
      expect(newList?.find(({ id }) => id === 124)).toEqual(
        mockRestoredDownload
      );
    });

    it('should call handleICATError if an error is encountered', async () => {
      axios.put = jest.fn().mockRejectedValue({
        message: 'Test error message',
      });

      const { result, waitFor } = renderHook(
        () => useDownloadOrRestoreDownload(),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      result.current.mutate({
        downloadId: 123,
        deleted: true,
      });
      await waitFor(() => result.current.isError);

      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });

  describe('useAdminDownloads', () => {
    it('should fetch admin downloads with pagination', async () => {
      axios.get = jest.fn().mockResolvedValue({ data: mockDownloadItems });

      // first, test fetching initial data

      const { result, waitFor } = renderHook(
        () => useAdminDownloads({ initialQueryOffset: 'LIMIT 0, 50' }),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() => result.current.isSuccess);

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

      result.current.fetchNextPage({
        pageParam: 'LIMIT 50, 100',
      });
      await waitFor(() => result.current.isFetchingNextPage);
      await waitFor(
        () => !result.current.isFetchingNextPage && result.current.isSuccess
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
      axios.get = jest.fn().mockRejectedValue({
        message: 'Test error message',
      });

      const { result, waitFor } = renderHook(
        () => useAdminDownloads({ initialQueryOffset: 'LIMIT 0, 50' }),
        {
          wrapper: createReactQueryWrapper(),
        }
      );

      await waitFor(() => result.current.isError);

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

      axios.get = jest.fn().mockImplementation((url, { params }) => {
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

      axios.put = jest.fn().mockImplementation(() => Promise.resolve());

      const { result, waitFor } = renderHook(
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
      await waitFor(() => result.current.useAdminDownloads.isSuccess);
      isMutated = true;
      result.current.useAdminDownloadDeleted.mutate({
        downloadId: 1,
        deleted: true,
      });
      // wait for mutation to complete
      await waitFor(() => result.current.useAdminDownloadDeleted.isSuccess);

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

      axios.get = jest.fn().mockImplementation((url, { params }) => {
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

      axios.put = jest.fn().mockImplementation(() => Promise.resolve());

      const { result, waitFor } = renderHook(
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
      await waitFor(() => result.current.useAdminDownloads.isSuccess);
      isMutated = true;
      result.current.useAdminDownloadDeleted.mutate({
        downloadId: 6,
        deleted: false,
      });
      // wait for mutation to complete
      await waitFor(() => result.current.useAdminDownloadDeleted.isSuccess);

      const updated = result.current.useAdminDownloads.data?.pages?.[0]?.find(
        ({ id }) => id === restoredDownload.id
      );

      expect(updated?.isDeleted).toBe(false);
    });

    it('should call handleICATError when an error is encountered', async () => {
      axios.put = jest.fn().mockRejectedValue({
        message: 'Test error message',
      });

      const { result, waitFor } = renderHook(() => useAdminDownloadDeleted(), {
        wrapper: createReactQueryWrapper(),
      });

      result.current.mutate({
        downloadId: 1,
        deleted: true,
      });
      await waitFor(() => result.current.isError);

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

      axios.get = jest.fn().mockImplementation(() =>
        Promise.resolve({
          data: isMutated
            ? mockDownloadItems.map((download) =>
                download.id === updatedDownload.id ? updatedDownload : download
              )
            : mockDownloadItems,
        })
      );
      axios.put = jest.fn().mockImplementation(() => Promise.resolve());

      const { result, waitFor } = renderHook(
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

      await waitFor(() => result.current.useAdminDownloads.isSuccess);
      isMutated = true;
      result.current.useAdminUpdateDownloadStatus.mutate({
        downloadId: 1,
        status: 'PREPARING',
      });
      await waitFor(
        () => result.current.useAdminUpdateDownloadStatus.isSuccess
      );

      expect(
        result.current.useAdminDownloads.data?.pages?.[0]?.find(
          ({ id }) => id === 1
        )
      ).toEqual(updatedDownload);
    });

    it('should call handleICATError and rollback optimistic changes if an error is encountered', async () => {
      axios.put = jest.fn().mockRejectedValue({
        message: 'Test error message',
      });
      axios.get = jest.fn().mockResolvedValue({ data: mockDownloadItems });

      const { result, waitFor } = renderHook(
        () => ({
          useAdminDownloads: useAdminDownloads({
            initialQueryOffset: 'LIMIT 0, 50',
          }),
          useAdminUpdateDownloadStatus: useAdminUpdateDownloadStatus(),
        }),
        { wrapper: createReactQueryWrapper() }
      );

      await waitFor(() => result.current.useAdminDownloads.isSuccess);
      result.current.useAdminUpdateDownloadStatus.mutate({
        downloadId: 1,
        status: 'PREPARING',
      });
      await waitFor(() => result.current.useAdminUpdateDownloadStatus.isError);

      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
      expect(result.current.useAdminDownloads.data?.pages).toEqual([
        mockDownloadItems,
      ]);
    });
  });

  describe('useSubmitCart', () => {
    it('should submit cart and clear cart on success', async () => {
      axios.post = jest.fn().mockResolvedValue({ data: 123 });
      axios.get = jest
        .fn()
        .mockResolvedValueOnce({
          data: {
            cartItems: mockCartItems,
          },
        })
        .mockResolvedValueOnce({ data: { cartItems: [] } });

      const { result, waitFor } = renderHook(
        () => ({
          useSubmitCart: useSubmitCart(),
          useCart: useCart(),
        }),
        { wrapper: createReactQueryWrapper() }
      );

      // wait for the cart to finish loading
      await waitFor(() => result.current.useCart.isSuccess);
      // submit the cart
      result.current.useSubmitCart.mutate({
        emailAddress: 'cat@dog.com',
        fileName: 'test-file',
        transport: 'https',
      });
      // wait for cart submission to finish
      await waitFor(() => result.current.useSubmitCart.isSuccess);

      expect(result.current.useCart.data).toEqual([]);
    });

    it('should call handleICATError when an error is encountered', async () => {
      axios.post = jest.fn().mockRejectedValue({
        message: 'test error message',
      });
      axios.get = jest.fn().mockResolvedValueOnce({
        data: {
          cartItems: mockCartItems,
        },
      });

      const { result, waitFor } = renderHook(
        () => ({
          useSubmitCart: useSubmitCart(),
          useCart: useCart(),
        }),
        { wrapper: createReactQueryWrapper() }
      );

      await waitFor(() => result.current.useCart.isSuccess);
      result.current.useSubmitCart.mutate({
        emailAddress: 'a@b.c',
        fileName: 'test-file',
        transport: 'https',
      });
      await waitFor(() => result.current.useSubmitCart.isError);

      expect(handleICATError).toHaveBeenCalledWith({
        message: 'test error message',
      });
    });
  });

  describe('useDownloadTypeStatuses', () => {
    const downloadTypes = ['https', 'globus'];

    let queryClient: QueryClient;

    beforeAll(() => {
      queryClient = new QueryClient();
    });

    afterEach(() => {
      queryClient.clear();
    });

    it('should query statuses of download types', async () => {
      axios.get = jest.fn().mockResolvedValue({
        data: {
          disabled: false,
          message: '',
        },
      });

      const { result, waitFor } = renderHook(
        () => useDownloadTypeStatuses({ downloadTypes }),
        { wrapper: createReactQueryWrapper() }
      );

      await waitFor(() => result.current.every((query) => query.isSuccess));

      const data = result.current.map(({ data }) => data);
      expect(data).toEqual([
        {
          type: 'https',
          disabled: false,
          message: '',
        },
        {
          type: 'globus',
          disabled: false,
          message: '',
        },
      ]);
    });

    it('should dispatch event with the error messages of download type queries with errors', async () => {
      axios.get = jest
        .fn()
        .mockResolvedValueOnce({
          data: {
            disabled: false,
            message: '',
          },
        })
        .mockImplementationOnce(() =>
          Promise.reject({
            message: 'Test error message',
          })
        );

      const dispatchEventSpy = jest.spyOn(document, 'dispatchEvent');

      const { result, waitFor } = renderHook(
        () => useDownloadTypeStatuses({ downloadTypes }),
        { wrapper: createReactQueryWrapper() }
      );

      await waitFor(() =>
        result.current.every((query) => query.isSuccess || query.isError)
      );

      expect((dispatchEventSpy.mock.calls[0][0] as CustomEvent).detail).toEqual(
        {
          type: NotificationType,
          payload: {
            severity: 'error',
            message:
              'downloadConfirmDialog.access_method_error {method:GLOBUS}',
          },
        }
      );
    });

    it('should refetch data on every hook call', async () => {
      axios.get = jest.fn().mockResolvedValue({
        data: {
          disabled: false,
          message: '',
        },
      });

      const wrapper = createReactQueryWrapper();

      const { result, waitFor } = renderHook(
        () =>
          useDownloadTypeStatuses({
            downloadTypes: ['https'],
          }),
        { wrapper }
      );

      await waitFor(() => result.current.every((query) => query.isSuccess));

      expect(result.current[0].isStale).toBe(true);
      expect(axios.get).toHaveBeenCalledTimes(1);

      await act(async () => {
        const { result: newResult } = renderHook(
          () =>
            useDownloadTypeStatuses({
              downloadTypes: ['https'],
            }),
          { wrapper }
        );

        await waitFor(() =>
          newResult.current.every((query) => query.isSuccess)
        );

        expect(newResult.current[0].isStale).toBe(true);
        expect(axios.get).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('useDownloadPercentageComplete', () => {
    it('should query progress of a download restore', async () => {
      axios.get = jest.fn().mockResolvedValue({
        data: '30',
      });

      const { result, waitFor } = renderHook(
        () =>
          useDownloadPercentageComplete({
            download: mockDownloadItems[0],
          }),
        {
          wrapper: createReactQueryWrapper(),
        }
      );
      await waitFor(() => result.current.isSuccess);

      expect(result.current.data).toEqual(30);
    });

    it('should query status of a download restore', async () => {
      axios.get = jest.fn().mockResolvedValue({
        data: 'UNKNOWN',
      });

      const { result, waitFor } = renderHook(
        () =>
          useDownloadPercentageComplete({
            download: mockDownloadItems[0],
          }),
        {
          wrapper: createReactQueryWrapper(),
        }
      );
      await waitFor(() => result.current.isSuccess);

      expect(result.current.data).toEqual('UNKNOWN');
    });

    it('should call handleICATError when an error is encountered', async () => {
      axios.get = jest.fn().mockRejectedValue({
        message: 'Test error message',
      });

      const { result, waitFor } = renderHook(
        () =>
          useDownloadPercentageComplete({
            download: mockDownloadItems[0],
          }),
        {
          wrapper: createReactQueryWrapper(),
        }
      );
      await waitFor(() => result.current.isError);

      expect(handleICATError).toHaveBeenCalledWith(
        {
          message: 'Test error message',
        },
        false
      );
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
      axios.post = jest.fn().mockResolvedValue({
        data: {
          concept: { doi: 'test doi', data_publication: '1' },
          version: { doi: 'test doi v1', data_publication: '11' },
        },
        status: 200,
      });

      const { result } = renderHook(() => useMintCart(), {
        wrapper: createReactQueryWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({ cart: mockCartItems, doiMetadata });
      });

      expect(result.current.data).toEqual({
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

    it('should handle errors correctly', async () => {
      const error = {
        message: 'Test error message',
        response: {
          status: 401,
        },
      };
      axios.post = jest.fn().mockRejectedValue(error);

      const { result, waitFor } = renderHook(() => useMintCart(), {
        wrapper: createReactQueryWrapper(),
      });

      act(() => {
        result.current.mutate({ cart: [mockCartItems[0]], doiMetadata });
      });
      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(handleDOIAPIError).toHaveBeenCalledWith(
        error,
        expect.anything(),
        undefined
      );
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
    });
  });

  describe('useCartUsers', () => {
    it('should get a list of users associated with each cart item', async () => {
      axios.get = jest.fn().mockImplementation((url) => {
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

      const { result, waitFor } = renderHook(
        () => useCartUsers(mockCartItems),
        {
          wrapper: createReactQueryWrapper(),
        }
      );
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
      const { result, waitFor } = renderHook(() => useCartUsers(undefined), {
        wrapper: createReactQueryWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([]);
      expect(axios.get).not.toHaveBeenCalled();
    });
  });
});
