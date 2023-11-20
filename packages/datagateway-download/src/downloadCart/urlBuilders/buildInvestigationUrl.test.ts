import buildInvestigationUrl from './buildInvestigationUrl';
import { mockedSettings, mockInvestigations } from '../../testData';
import axios from 'axios';
import type { Investigation } from 'datagateway-common';

describe('buildInvestigationUrl', () => {
  describe('given an investigation object', () => {
    let investigation: Investigation;

    beforeEach(() => {
      investigation = mockInvestigations[0];
      axios.get = jest.fn().mockResolvedValue({
        data: [investigation],
      });
    });

    it('should return a generic URL to it', async () => {
      const url = await buildInvestigationUrl({
        investigation,
        apiUrl: mockedSettings.apiUrl,
        facilityName: 'SVELTE',
      });

      expect(url).toBe('/browse/investigation/58/dataset');
    });

    it('should return an ISIS URL to it', async () => {
      const url = await buildInvestigationUrl({
        investigation,
        apiUrl: mockedSettings.apiUrl,
        facilityName: 'ISIS',
      });

      expect(url).toBe(
        '/browse/instrument/937/facilityCycle/402/investigation/58/dataset'
      );
    });

    it('should return a DLS URL to it', async () => {
      const url = await buildInvestigationUrl({
        investigation,
        apiUrl: mockedSettings.apiUrl,
        facilityName: 'DLS',
      });

      expect(url).toBe(
        '/browse/proposal/investigation news/investigation/58/dataset'
      );
    });
  });

  describe('given an investigation id', () => {
    let investigation: Investigation;

    beforeEach(() => {
      investigation = mockInvestigations[1];
      axios.get = jest.fn().mockResolvedValue({
        data: [investigation],
      });
    });

    it('should return a generic URL to it', async () => {
      const url = await buildInvestigationUrl({
        investigationId: 993,
        apiUrl: mockedSettings.apiUrl,
        facilityName: 'SVELTE',
      });

      expect(url).toBe('/browse/investigation/993/dataset');
    });

    it('should return an ISIS URL to it', async () => {
      const url = await buildInvestigationUrl({
        investigationId: 993,
        apiUrl: mockedSettings.apiUrl,
        facilityName: 'ISIS',
      });

      expect(url).toBe(
        '/browse/instrument/927/facilityCycle/402/investigation/993/dataset'
      );
    });

    it('should return a DLS URL to it', async () => {
      const url = await buildInvestigationUrl({
        investigationId: 993,
        apiUrl: mockedSettings.apiUrl,
        facilityName: 'DLS',
      });

      expect(url).toBe(
        '/browse/proposal/investigation inn/investigation/993/dataset'
      );
    });
  });

  it('should return null if neither an investigation object or an investigation id is provided', async () => {
    const url = await buildInvestigationUrl({
      apiUrl: mockedSettings.apiUrl,
      facilityName: mockedSettings.facilityName,
    });

    expect(url).toBeNull();
  });

  it('should return null if the associated instruments for the investigation cannot be fetched', async () => {
    const { investigationInstruments, ...investigation } =
      mockInvestigations[0];

    axios.get = jest.fn().mockResolvedValue({
      data: [investigation],
    });

    const url = await buildInvestigationUrl({
      investigationId: 993,
      apiUrl: mockedSettings.apiUrl,
      facilityName: 'ISIS',
    });

    expect(url).toBeNull();
  });

  it('should return null if the investigation object does not belong to any facility cycle', async () => {
    axios.get = jest.fn().mockResolvedValue({
      data: [
        {
          ...mockInvestigations[0],
          startDate: '1999-03-09T08:19:55Z',
          endDate: '1999-03-19T08:19:55Z',
          investigationFacilityCycles: null,
        },
      ],
    });

    const url = await buildInvestigationUrl({
      investigationId: 993,
      apiUrl: mockedSettings.apiUrl,
      facilityName: 'ISIS',
    });

    expect(url).toBeNull();
  });

  it('should return null if the investigation object cannot be fetched', async () => {
    axios.get = jest.fn().mockResolvedValue({
      data: [],
    });

    const url = await buildInvestigationUrl({
      investigationId: 993,
      apiUrl: mockedSettings.apiUrl,
      facilityName: 'DLS',
    });

    expect(url).toBeNull();
  });
});
