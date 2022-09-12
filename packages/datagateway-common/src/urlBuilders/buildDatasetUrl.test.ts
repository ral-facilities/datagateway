import { mockDatasets, mockFacilityName } from '../testData';
import buildDatasetUrl from './buildDatasetUrl';

describe('buildDatasetUrl', () => {
  describe('given a dataset object', () => {
    const dataset = mockDatasets[0];

    it('should return the generic URL to it', async () => {
      const url = buildDatasetUrl({
        dataset,
        facilityName: mockFacilityName,
        showLanding: false,
      });

      expect(url).toBe('/browse/investigation/58/dataset/856/datafile');
    });

    it('should return the ISIS URL to it', async () => {
      const url = buildDatasetUrl({
        dataset,
        facilityName: 'ISIS',
        showLanding: false,
      });

      expect(url).toBe(
        '/browse/instrument/937/facilityCycle/402/investigation/58/dataset/856/datafile'
      );
    });

    it('should return the DLS URL to it', async () => {
      const url = buildDatasetUrl({
        dataset,
        facilityName: 'DLS',
        showLanding: false,
      });

      expect(url).toBe(
        '/browse/proposal/investigation news/investigation/58/dataset/856/datafile'
      );
    });

    it('should return the URL to the landing page of it if required', () => {
      const url = buildDatasetUrl({
        dataset,
        facilityName: 'ISIS',
        showLanding: true,
      });

      expect(url).toBe(
        '/browse/instrument/937/facilityCycle/402/investigation/58/dataset/856'
      );
    });
  });

  it('should return null if the parent investigation of the dataset is not fetched', async () => {
    const { investigation, ...dataset } = mockDatasets[0];

    const url = buildDatasetUrl({
      dataset,
      facilityName: mockFacilityName,
      showLanding: false,
    });

    expect(url).toBeNull();
  });

  it('should return null if the parent investigation URL cannot be constructed', async () => {
    const dataset = { ...mockDatasets[0] };
    delete dataset.investigation?.investigationInstruments;

    const url = buildDatasetUrl({
      dataset,
      facilityName: 'ISIS',
      showLanding: false,
    });

    expect(url).toBeNull();
  });
});
