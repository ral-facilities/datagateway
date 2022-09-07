import {
  mockDatasets,
  mockedSettings,
  mockFacilityCycles,
} from '../../testData';
import axios from 'axios';
import { Dataset } from 'datagateway-common';
import buildDatasetUrl from './buildDatasetUrl';

describe('buildDatasetUrl', () => {
  describe('given a dataset ID', () => {
    let dataset: Dataset;

    beforeEach(() => {
      dataset = mockDatasets[0];
      axios.get = jest.fn().mockResolvedValue({
        data: [dataset],
      });
    });

    it('should return the generic URL to it', async () => {
      const url = await buildDatasetUrl({
        apiUrl: mockedSettings.apiUrl,
        facilityName: mockedSettings.facilityName,
        datasetId: 856,
        facilityCycles: mockFacilityCycles,
      });

      expect(url).toBe('/browse/investigation/58/dataset/856/datafile');
    });

    it('should return the ISIS URL to it', async () => {
      const url = await buildDatasetUrl({
        apiUrl: mockedSettings.apiUrl,
        facilityName: 'ISIS',
        datasetId: 856,
        facilityCycles: mockFacilityCycles,
      });

      expect(url).toBe(
        '/browse/instrument/937/facilityCycle/402/investigation/58/dataset/856/datafile'
      );
    });

    it('should return the DLS URL to it', async () => {
      const url = await buildDatasetUrl({
        apiUrl: mockedSettings.apiUrl,
        facilityName: 'DLS',
        datasetId: 856,
        facilityCycles: mockFacilityCycles,
      });

      expect(url).toBe(
        '/browse/proposal/investigation news/investigation/58/dataset/856/datafile'
      );
    });
  });

  describe('given a dataset object', () => {
    const dataset = mockDatasets[1];

    it('should return the generic URL to it', async () => {
      const url = await buildDatasetUrl({
        dataset,
        apiUrl: mockedSettings.apiUrl,
        facilityName: mockedSettings.facilityName,
        facilityCycles: mockFacilityCycles,
      });

      expect(url).toBe('/browse/investigation/993/dataset/535/datafile');
    });

    it('should return the ISIS URL to it', async () => {
      const url = await buildDatasetUrl({
        dataset,
        apiUrl: mockedSettings.apiUrl,
        facilityName: 'ISIS',
        facilityCycles: mockFacilityCycles,
      });

      expect(url).toBe(
        '/browse/instrument/927/facilityCycle/402/investigation/993/dataset/535/datafile'
      );
    });

    it('should return the DLS URL to it', async () => {
      const url = await buildDatasetUrl({
        dataset,
        apiUrl: mockedSettings.apiUrl,
        facilityName: 'DLS',
        facilityCycles: mockFacilityCycles,
      });

      expect(url).toBe(
        '/browse/proposal/investigation inn/investigation/993/dataset/535/datafile'
      );
    });
  });

  it('should return null if neither a dataset object nor a dataset id is provided', async () => {
    const url = await buildDatasetUrl({
      apiUrl: mockedSettings.apiUrl,
      facilityName: mockedSettings.facilityName,
      facilityCycles: mockFacilityCycles,
    });

    expect(url).toBeNull();
  });

  it('should return null if the dataset object cannot be fetched', async () => {
    axios.get = jest.fn().mockResolvedValue({
      data: [],
    });

    const url = await buildDatasetUrl({
      apiUrl: mockedSettings.apiUrl,
      facilityName: mockedSettings.facilityName,
      datasetId: 856,
      facilityCycles: mockFacilityCycles,
    });

    expect(url).toBeNull();
  });

  it('should return null if the parent investigation of the dataset is not fetched', async () => {
    const { investigation, ...dataset } = mockDatasets[0];

    axios.get = jest.fn().mockResolvedValue({
      data: [dataset],
    });

    const url = await buildDatasetUrl({
      apiUrl: mockedSettings.apiUrl,
      facilityName: mockedSettings.facilityName,
      datasetId: 856,
      facilityCycles: mockFacilityCycles,
    });

    expect(url).toBeNull();
  });

  it('should return null if the parent investigation URL cannot be constructed', async () => {
    const dataset = { ...mockDatasets[0] };
    delete dataset.investigation?.investigationInstruments;

    const url = await buildDatasetUrl({
      dataset,
      apiUrl: mockedSettings.apiUrl,
      facilityName: 'ISIS',
      facilityCycles: mockFacilityCycles,
    });

    expect(url).toBeNull();
  });
});
