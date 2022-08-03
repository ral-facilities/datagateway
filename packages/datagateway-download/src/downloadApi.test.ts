import axios from 'axios';
import { handleICATError } from 'datagateway-common';
import {
  downloadDeleted,
  downloadPreparedCart,
  fetchDownloads,
  getDownload,
  submitCart,
  getDataUrl,
  fetchAdminDownloads,
  adminDownloadDeleted,
  adminDownloadStatus,
} from './downloadApi';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    handleICATError: jest.fn(),
  };
});

// Create our mocked datagateway-download mockedSettings file.
const mockedSettings = {
  facilityName: 'LILS',
  apiUrl: 'https://example.com/api',
  downloadApiUrl: 'https://example.com/downloadApi',
  idsUrl: 'https://example.com/ids',
  fileCountMax: 5000,
  totalSizeMax: 1000000000000,
  accessMethods: {
    https: {
      idsUrl: 'https://example.com/ids',
      displayName: 'HTTPS',
      description: 'Example description for HTTPS access method.',
    },
    globus: {
      idsUrl: 'https://example.com/ids',
      displayName: 'Globus',
      description: 'Example description for Globus access method.',
    },
  },
};

describe('Download Cart API functions test', () => {
  afterEach(() => {
    (handleICATError as jest.Mock).mockClear();
  });

  describe('submitCart', () => {
    it('returns the downloadId after the submitting cart', async () => {
      axios.post = jest.fn().mockImplementation(() => {
        return Promise.resolve({
          data: {
            facilityName: mockedSettings.facilityName,
            userName: 'test user',
            cartItems: [],
            downloadId: 1,
          },
        });
      });

      // Wait for our mocked response with a download id.
      const downloadId = await submitCart(
        'https',
        'test@email.com',
        'test-file',
        {
          facilityName: mockedSettings.facilityName,
          downloadApiUrl: mockedSettings.downloadApiUrl,
        }
      );
      const params = new URLSearchParams();
      params.append('sessionId', '');
      params.append('transport', 'https');
      params.append('email', 'test@email.com');
      params.append('fileName', 'test-file');
      params.append('zipType', 'ZIP');

      expect(downloadId).toBe(1);
      expect(axios.post).toHaveBeenCalled();
      expect(axios.post).toHaveBeenCalledWith(
        `${mockedSettings.downloadApiUrl}/user/cart/${mockedSettings.facilityName}/submit`,
        params
      );
    });

    it('returns -1 if an errors occurs and logs the error upon unsuccessful response', async () => {
      axios.post = jest.fn().mockImplementation(() => {
        return Promise.reject({
          message: 'Test error message',
        });
      });

      // Wait for our mocked response with a download id.
      const downloadId = await submitCart(
        'globus',
        'test@email.com',
        'test-file',
        {
          facilityName: mockedSettings.facilityName,
          downloadApiUrl: mockedSettings.downloadApiUrl,
        }
      );
      const params = new URLSearchParams();
      params.append('sessionId', '');
      params.append('transport', 'globus');
      params.append('email', 'test@email.com');
      params.append('fileName', 'test-file');
      params.append('zipType', 'ZIP');

      expect(downloadId).toBe(-1);
      expect(axios.post).toHaveBeenCalled();
      expect(axios.post).toHaveBeenCalledWith(
        `${mockedSettings.downloadApiUrl}/user/cart/${mockedSettings.facilityName}/submit`,
        params
      );
      expect(handleICATError).toHaveBeenCalled();
      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });

  describe('getDownload', () => {
    it('returns the download information upon successful response for download ID', async () => {
      axios.get = jest.fn().mockImplementation(() =>
        Promise.resolve({
          data: [
            {
              createdAt: '2020-01-01T01:01:01Z',
              downloadItems: [
                {
                  entityId: 1,
                  entityType: 'investigation',
                  id: 1,
                },
              ],
              facilityName: mockedSettings.facilityName,
              fileName: 'test-file',
              fullName: 'simple/root',
              id: 1,
              isDeleted: false,
              isEmailSent: false,
              isTwoLevel: false,
              preparedId: 'test-prepared-id',
              sessionId: '',
              size: 0,
              status: 'COMPLETE',
              transport: 'https',
              userName: 'simple/root',
            },
          ],
        })
      );

      const download = await getDownload(1, {
        facilityName: mockedSettings.facilityName,
        downloadApiUrl: mockedSettings.downloadApiUrl,
      });

      expect(download).not.toBe(null);
      expect(axios.get).toHaveBeenCalled();
      expect(axios.get).toHaveBeenCalledWith(
        `${mockedSettings.downloadApiUrl}/user/downloads`,
        {
          params: {
            sessionId: null,
            facilityName: mockedSettings.facilityName,
            queryOffset: `where download.id = 1`,
          },
        }
      );
    });

    it('returns null if error occurs and logs the error message upon unsuccessful response', async () => {
      axios.get = jest.fn().mockImplementation(() =>
        Promise.reject({
          message: 'Test error message',
        })
      );

      const download = await getDownload(1, {
        facilityName: mockedSettings.facilityName,
        downloadApiUrl: mockedSettings.downloadApiUrl,
      });

      expect(download).toBe(null);
      expect(axios.get).toHaveBeenCalled();
      expect(axios.get).toHaveBeenCalledWith(
        `${mockedSettings.downloadApiUrl}/user/downloads`,
        {
          params: {
            sessionId: null,
            facilityName: mockedSettings.facilityName,
            queryOffset: `where download.id = 1`,
          },
        }
      );
      expect(handleICATError).toHaveBeenCalled();
      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });

  describe('downloadPreparedCart', () => {
    it('opens a link to download "test-file" upon successful response for a download request', async () => {
      jest.spyOn(document, 'createElement');
      jest.spyOn(document.body, 'appendChild');

      await downloadPreparedCart('test-id', 'test-file.zip', {
        idsUrl: mockedSettings.idsUrl,
      });

      expect(document.createElement).toHaveBeenCalledWith('a');

      // Create our prepared cart download link.
      const link = document.createElement('a');
      link.href = `${
        mockedSettings.idsUrl
      }/getData?sessionId=${null}&preparedId=${'test-id'}&outname=${'test-file.zip'}`;
      link.style.display = 'none';
      link.target = '_blank';

      expect(document.body.appendChild).toHaveBeenCalledWith(link);
    });
  });
});

describe('Download Status API functions test', () => {
  describe('fetchDownloads', () => {
    const downloadsMockData = [
      {
        createdAt: '2020-01-01T01:01:01Z',
        downloadItems: [{ entityId: 1, entityType: 'investigation', id: 1 }],
        email: 'test@email.com',
        facilityName: mockedSettings.facilityName,
        fileName: 'test-file-1',
        fullName: 'Person 1',
        id: 1,
        isDeleted: false,
        isEmailSent: true,
        isTwoLevel: false,
        preparedId: 'e44acee7-2211-4aae-bffb-f6c0e417f43d',
        sessionId: '6bf8e6e4-58a9-11ea-b823-005056893dd9',
        size: 0,
        status: 'COMPLETE',
        transport: 'https',
        userName: 'test user',
      },
    ];

    it('returns downloads upon successful response', async () => {
      axios.get = jest.fn().mockImplementation(() =>
        Promise.resolve({
          data: downloadsMockData,
        })
      );

      const returnData = await fetchDownloads({
        facilityName: mockedSettings.facilityName,
        downloadApiUrl: mockedSettings.downloadApiUrl,
      });

      expect(returnData).toBe(downloadsMockData);
      expect(axios.get).toHaveBeenCalled();
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
    });

    it('returns downloads with a custom queryOffset upon successful response', async () => {
      const downloadsData = {
        ...downloadsMockData[0],
        isDeleted: true,
      };

      axios.get = jest.fn().mockImplementation(() =>
        Promise.resolve({
          data: downloadsData,
        })
      );

      const returnData = await fetchDownloads(
        {
          facilityName: mockedSettings.facilityName,
          downloadApiUrl: mockedSettings.downloadApiUrl,
        },
        'where download.isDeleted = true'
      );

      expect(returnData).toBe(downloadsData);
      expect(axios.get).toHaveBeenCalled();
      expect(axios.get).toHaveBeenCalledWith(
        `${mockedSettings.downloadApiUrl}/user/downloads`,
        {
          params: {
            sessionId: null,
            facilityName: mockedSettings.facilityName,
            queryOffset: 'where download.isDeleted = true',
          },
        }
      );
    });

    it('returns empty array and logs error upon unsuccessful response', async () => {
      axios.get = jest.fn().mockImplementation(() =>
        Promise.reject({
          message: 'Test error message',
        })
      );

      const returnData = await fetchDownloads({
        facilityName: mockedSettings.facilityName,
        downloadApiUrl: mockedSettings.downloadApiUrl,
      });

      expect(returnData).toEqual([]);
      expect(axios.get).toHaveBeenCalled();
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
      expect(handleICATError).toHaveBeenCalled();
      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });

  describe('downloadDeleted', () => {
    it('successfully sets a download as deleted', async () => {
      axios.put = jest.fn().mockImplementation(() => Promise.resolve());

      await downloadDeleted(1, true, {
        facilityName: mockedSettings.facilityName,
        downloadApiUrl: mockedSettings.downloadApiUrl,
      });

      const params = new URLSearchParams();
      params.append('facilityName', mockedSettings.facilityName);
      params.append('sessionId', '');
      params.append('value', 'true');

      expect(axios.put).toHaveBeenCalled();
      expect(axios.put).toHaveBeenCalledWith(
        `${mockedSettings.downloadApiUrl}/user/download/1/isDeleted`,
        params
      );
    });

    it('logs an error upon unsuccessful response', async () => {
      axios.put = jest.fn().mockImplementation(() =>
        Promise.reject({
          message: 'Test error message',
        })
      );

      await downloadDeleted(1, true, {
        facilityName: mockedSettings.facilityName,
        downloadApiUrl: mockedSettings.downloadApiUrl,
      });

      const params = new URLSearchParams();
      params.append('facilityName', mockedSettings.facilityName);
      params.append('sessionId', '');
      params.append('value', 'true');

      expect(axios.put).toHaveBeenCalled();
      expect(axios.put).toHaveBeenCalledWith(
        `${mockedSettings.downloadApiUrl}/user/download/1/isDeleted`,
        params
      );
      expect(handleICATError).toHaveBeenCalled();
      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });

  describe('getDataUrl', () => {
    it('successfully constructs a download link with given parameters', () => {
      const preparedId = 'test-prepared-id';
      const fileName = 'test-filename';
      const idsUrl = 'test-ids-url';

      const result = getDataUrl(preparedId, fileName, idsUrl);
      [preparedId, fileName, idsUrl].forEach((entry) => {
        expect(result).toContain(entry);
      });
    });
  });
});

describe('Admin Download Status API functions test', () => {
  describe('fetchAdminDownloads', () => {
    const downloadsMockData = [
      {
        createdAt: '2020-01-01T01:01:01Z',
        downloadItems: [{ entityId: 1, entityType: 'investigation', id: 1 }],
        email: 'test@email.com',
        facilityName: mockedSettings.facilityName,
        fileName: 'test-file-1',
        fullName: 'Person 1',
        id: 1,
        isDeleted: false,
        isEmailSent: true,
        isTwoLevel: false,
        preparedId: 'e44acee7-2211-4aae-bffb-f6c0e417f43d',
        sessionId: '6bf8e6e4-58a9-11ea-b823-005056893dd9',
        size: 0,
        status: 'COMPLETE',
        transport: 'https',
        userName: 'test user',
      },
    ];

    it('returns downloads upon successful response', async () => {
      axios.get = jest.fn().mockImplementation(() =>
        Promise.resolve({
          data: downloadsMockData,
        })
      );

      const returnData = await fetchAdminDownloads({
        facilityName: mockedSettings.facilityName,
        downloadApiUrl: mockedSettings.downloadApiUrl,
      });

      expect(returnData).toBe(downloadsMockData);
      expect(axios.get).toHaveBeenCalled();
      expect(axios.get).toHaveBeenCalledWith(
        `${mockedSettings.downloadApiUrl}/admin/downloads`,
        {
          params: {
            sessionId: null,
            facilityName: mockedSettings.facilityName,
            queryOffset: 'where download.isDeleted = false',
          },
        }
      );
    });

    it('returns downloads with a custom queryOffset upon successful response', async () => {
      const downloadsData = {
        ...downloadsMockData[0],
        isDeleted: true,
      };

      axios.get = jest.fn().mockImplementation(() =>
        Promise.resolve({
          data: downloadsData,
        })
      );

      const returnData = await fetchAdminDownloads(
        {
          facilityName: mockedSettings.facilityName,
          downloadApiUrl: mockedSettings.downloadApiUrl,
        },
        'where download.isDeleted = true'
      );

      expect(returnData).toBe(downloadsData);
      expect(axios.get).toHaveBeenCalled();
      expect(axios.get).toHaveBeenCalledWith(
        `${mockedSettings.downloadApiUrl}/admin/downloads`,
        {
          params: {
            sessionId: null,
            facilityName: mockedSettings.facilityName,
            queryOffset: 'where download.isDeleted = true',
          },
        }
      );
    });

    it('returns empty array and logs error upon unsuccessful response', async () => {
      axios.get = jest.fn().mockImplementation(() =>
        Promise.reject({
          message: 'Test error message',
        })
      );

      const returnData = await fetchAdminDownloads({
        facilityName: mockedSettings.facilityName,
        downloadApiUrl: mockedSettings.downloadApiUrl,
      });

      expect(returnData).toEqual([]);
      expect(axios.get).toHaveBeenCalled();
      expect(axios.get).toHaveBeenCalledWith(
        `${mockedSettings.downloadApiUrl}/admin/downloads`,
        {
          params: {
            sessionId: null,
            facilityName: mockedSettings.facilityName,
            queryOffset: 'where download.isDeleted = false',
          },
        }
      );
      expect(handleICATError).toHaveBeenCalled();
      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });

  describe('adminDownloadDeleted', () => {
    it('successfully sets a download as deleted', async () => {
      axios.put = jest.fn().mockImplementation(() => Promise.resolve());

      await adminDownloadDeleted(1, true, {
        facilityName: mockedSettings.facilityName,
        downloadApiUrl: mockedSettings.downloadApiUrl,
      });

      const params = new URLSearchParams();
      params.append('facilityName', mockedSettings.facilityName);
      params.append('sessionId', '');
      params.append('value', 'true');

      expect(axios.put).toHaveBeenCalled();
      expect(axios.put).toHaveBeenCalledWith(
        `${mockedSettings.downloadApiUrl}/admin/download/1/isDeleted`,
        params
      );
    });

    it('logs an error upon unsuccessful response', async () => {
      axios.put = jest.fn().mockImplementation(() =>
        Promise.reject({
          message: 'Test error message',
        })
      );

      await adminDownloadDeleted(1, true, {
        facilityName: mockedSettings.facilityName,
        downloadApiUrl: mockedSettings.downloadApiUrl,
      });

      const params = new URLSearchParams();
      params.append('facilityName', mockedSettings.facilityName);
      params.append('sessionId', '');
      params.append('value', 'true');

      expect(axios.put).toHaveBeenCalled();
      expect(axios.put).toHaveBeenCalledWith(
        `${mockedSettings.downloadApiUrl}/admin/download/1/isDeleted`,
        params
      );
      expect(handleICATError).toHaveBeenCalled();
      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });

  describe('adminDownloadStatus', () => {
    it('successfully sets the status of a download', async () => {
      axios.put = jest.fn().mockImplementation(() => Promise.resolve());

      await adminDownloadStatus(1, 'RESTORING', {
        facilityName: mockedSettings.facilityName,
        downloadApiUrl: mockedSettings.downloadApiUrl,
      });

      const params = new URLSearchParams();
      params.append('facilityName', mockedSettings.facilityName);
      params.append('sessionId', '');
      params.append('value', 'RESTORING');

      expect(axios.put).toHaveBeenCalled();
      expect(axios.put).toHaveBeenCalledWith(
        `${mockedSettings.downloadApiUrl}/admin/download/1/status`,
        params
      );
    });

    it('logs an error upon unsuccessful response', async () => {
      axios.put = jest.fn().mockImplementation(() =>
        Promise.reject({
          message: 'Test error message',
        })
      );

      await adminDownloadStatus(1, 'RESTORING', {
        facilityName: mockedSettings.facilityName,
        downloadApiUrl: mockedSettings.downloadApiUrl,
      });

      const params = new URLSearchParams();
      params.append('facilityName', mockedSettings.facilityName);
      params.append('sessionId', '');
      params.append('value', 'RESTORING');

      expect(axios.put).toHaveBeenCalled();
      expect(axios.put).toHaveBeenCalledWith(
        `${mockedSettings.downloadApiUrl}/admin/download/1/status`,
        params
      );
      expect(handleICATError).toHaveBeenCalled();
      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });
});
