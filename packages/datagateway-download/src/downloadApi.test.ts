import axios from 'axios';
import { handleICATError } from 'datagateway-common';
import {
  adminDownloadDeleted,
  adminDownloadStatus,
  downloadDeleted,
  downloadPreparedCart,
  fetchAdminDownloads,
  fetchDownloads,
  getDataUrl,
  getPercentageComplete,
} from './downloadApi';
import { mockedSettings } from './testData';

vi.mock('datagateway-common', async () => {
  const originalModule = await vi.importActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    handleICATError: vi.fn(),
  };
});

describe('Download Cart API functions test', () => {
  afterEach(() => {
    vi.mocked(handleICATError).mockClear();
  });

  describe('downloadPreparedCart', () => {
    it('opens a link to download "test-file" upon successful response for a download request', async () => {
      vi.spyOn(document, 'createElement');
      vi.spyOn(document.body, 'appendChild');

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
      axios.get = vi.fn().mockImplementation(() =>
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

      axios.get = vi.fn().mockImplementation(() =>
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
  });

  describe('downloadDeleted', () => {
    it('successfully sets a download as deleted', async () => {
      axios.put = vi.fn().mockImplementation(() => Promise.resolve());

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
      axios.get = vi.fn().mockImplementation(() =>
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

      axios.get = vi.fn().mockImplementation(() =>
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
  });

  describe('adminDownloadDeleted', () => {
    it('successfully sets a download as deleted', async () => {
      axios.put = vi.fn().mockImplementation(() => Promise.resolve());

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
  });

  describe('adminDownloadStatus', () => {
    it('successfully sets the status of a download', async () => {
      axios.put = vi.fn().mockImplementation(() => Promise.resolve());

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
  });

  describe('getPercentageComplete', () => {
    it('should return the percentage of a download restore from 0 to 100', async () => {
      axios.get = vi.fn().mockResolvedValue({
        data: '2',
      });

      const response = await getPercentageComplete({
        preparedId: '1',
        settings: {
          idsUrl: mockedSettings.idsUrl,
        },
      });

      expect(response).toEqual(2);
    });

    it('should return the status of a download restore', async () => {
      axios.get = vi.fn().mockResolvedValue({
        data: 'INVALID',
      });

      const response = await getPercentageComplete({
        preparedId: '1',
        settings: {
          idsUrl: mockedSettings.idsUrl,
        },
      });

      expect(response).toEqual('INVALID');
    });
  });
});
