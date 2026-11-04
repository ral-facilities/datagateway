import axios from 'axios';
import { mockDatafiles, mockedSettings } from '../../testData';
import buildDatafileUrl from './buildDatafileUrl';

describe('buildDatafileUrl', () => {
  beforeEach(() => {
    axios.get = vi.fn().mockResolvedValue({
      data: [mockDatafiles[0]],
    });
  });

  it('should return a generic URL to the parent dataset of the datafile', async () => {
    const url = await buildDatafileUrl({
      facilityName: mockedSettings.facilityName,
      datafileId: 70,
    });

    expect(url).toBe('/redirect/LILS/datafile/id/70');
  });

  it('should return an ISIS URL to the parent dataset of the datafile', async () => {
    const url = await buildDatafileUrl({
      facilityName: 'ISIS',
      datafileId: 70,
    });

    expect(url).toBe(
      '/redirect/ISIS/datafile/id/70'
    );
  });

  it('should return a DLS URL to the parent dataset of the datafile', async () => {
    const url = await buildDatafileUrl({
      facilityName: 'DLS',
      datafileId: 70,
    });

    expect(url).toBe(
      '/redirect/DLS/datafile/id/70'
    );
  });
});
