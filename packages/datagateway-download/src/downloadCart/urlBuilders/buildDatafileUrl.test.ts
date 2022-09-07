import axios from 'axios';
import {
  mockDatafiles,
  mockedSettings,
  mockFacilityCycles,
} from '../../testData';
import buildDatafileUrl from './buildDatafileUrl';

describe('buildDatafileUrl', () => {
  beforeEach(() => {
    axios.get = jest.fn().mockResolvedValue({
      data: [mockDatafiles[0]],
    });
  });

  it('should return a generic URL to the parent dataset of the datafile', async () => {
    const url = await buildDatafileUrl({
      apiUrl: mockedSettings.apiUrl,
      facilityName: mockedSettings.facilityName,
      datafileId: 70,
      facilityCycles: mockFacilityCycles,
    });

    expect(url).toBe('/browse/investigation/58/dataset/856/datafile');
  });

  it('should return an ISIS URL to the parent dataset of the datafile', async () => {
    const url = await buildDatafileUrl({
      apiUrl: mockedSettings.apiUrl,
      facilityName: 'ISIS',
      datafileId: 70,
      facilityCycles: mockFacilityCycles,
    });

    expect(url).toBe(
      '/browse/instrument/937/facilityCycle/402/investigation/58/dataset/856/datafile'
    );
  });

  it('should return a DLS URL to the parent dataset of the datafile', async () => {
    const url = await buildDatafileUrl({
      apiUrl: mockedSettings.apiUrl,
      facilityName: 'DLS',
      datafileId: 70,
      facilityCycles: mockFacilityCycles,
    });

    expect(url).toBe(
      '/browse/proposal/investigation news/investigation/58/dataset/856/datafile'
    );
  });

  it('should return null if the parent dataset of the datafile cannot be fetched', async () => {
    axios.get = jest.fn().mockResolvedValue({
      data: [],
    });

    const url = await buildDatafileUrl({
      apiUrl: mockedSettings.apiUrl,
      facilityName: 'DLS',
      datafileId: 70,
      facilityCycles: mockFacilityCycles,
    });

    expect(url).toBeNull();
  });
});
