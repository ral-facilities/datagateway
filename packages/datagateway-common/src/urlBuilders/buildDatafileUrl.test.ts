import axios from 'axios';
import { mockDatafiles, mockFacilityName } from '../testData';
import buildDatafileUrl from './buildDatafileUrl';

const mockDatafile = mockDatafiles[0];

describe('buildDatafileUrl', () => {
  beforeEach(() => {
    axios.get = jest.fn().mockResolvedValue({
      data: [mockDatafiles[0]],
    });
  });

  it('should return a generic URL to the parent dataset of the datafile', async () => {
    const url = buildDatafileUrl({
      facilityName: mockFacilityName,
      datafile: mockDatafile,
    });

    expect(url).toBe('/browse/investigation/58/dataset/856/datafile');
  });

  it('should return an ISIS URL to the parent dataset of the datafile', async () => {
    const url = buildDatafileUrl({
      facilityName: 'ISIS',
      datafile: mockDatafile,
    });

    expect(url).toBe(
      '/browse/instrument/937/facilityCycle/402/investigation/58/dataset/856/datafile'
    );
  });

  it('should return a DLS URL to the parent dataset of the datafile', async () => {
    const url = buildDatafileUrl({
      facilityName: 'DLS',
      datafile: mockDatafile,
    });

    expect(url).toBe(
      '/browse/proposal/investigation news/investigation/58/dataset/856/datafile'
    );
  });

  it('should return null if the parent dataset of the datafile cannot be fetched', async () => {
    const { dataset, ...datafile } = mockDatafile;

    const url = buildDatafileUrl({
      datafile,
      facilityName: 'DLS',
    });

    expect(url).toBeNull();
  });
});
