import { mockDatasets, mockedSettings } from '../../testData';
import axios from 'axios';
import type { Dataset } from 'datagateway-common';
import buildDatasetUrl from './buildDatasetUrl';

describe('buildDatasetUrl', () => {
  describe('given a dataset ID', () => {
    let dataset: Dataset;

    beforeEach(() => {
      dataset = mockDatasets[0];
      axios.get = vi.fn().mockResolvedValue({
        data: [dataset],
      });
    });

    it('should return the generic URL to it', async () => {
      const url = await buildDatasetUrl({
        facilityName: mockedSettings.facilityName,
        datasetId: 856,
      });

      expect(url).toBe('/redirect/LILS/dataset/id/856');
    });

    it('should return the ISIS URL to it', async () => {
      const url = await buildDatasetUrl({
        facilityName: 'ISIS',
        datasetId: 856,
      });

      expect(url).toBe(
        '/redirect/ISIS/dataset/id/856'
      );
    });

    it('should return the DLS URL to it', async () => {
      const url = await buildDatasetUrl({
        facilityName: 'DLS',
        datasetId: 856,
      });

      expect(url).toBe(
        '/redirect/DLS/dataset/id/856'
      );
    });
  });

  describe('given a dataset object', () => {
    const dataset = mockDatasets[1];

    it('should return the generic URL to it', async () => {
      const url = await buildDatasetUrl({
        dataset,
        facilityName: mockedSettings.facilityName,
      });

      expect(url).toBe('/redirect/LILS/dataset/id/535');
    });

    it('should return the ISIS URL to it', async () => {
      const url = await buildDatasetUrl({
        dataset,
        facilityName: 'ISIS',
      });

      expect(url).toBe(
        '/redirect/ISIS/dataset/id/535'
      );
    });

    it('should return the DLS URL to it', async () => {
      const url = await buildDatasetUrl({
        dataset,
        facilityName: 'DLS',
      });

      expect(url).toBe(
        '/redirect/DLS/dataset/id/535'
      );
    });
  });

  it('should return null if neither a dataset object nor a dataset id is provided', async () => {
    const url = await buildDatasetUrl({
      facilityName: mockedSettings.facilityName,
    });

    expect(url).toBeNull();
  });
});
