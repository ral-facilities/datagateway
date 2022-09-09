import buildInvestigationUrl from './buildInvestigationUrl';
import { mockInvestigations } from '../testData';
import axios from 'axios';
import type { Investigation } from '../app.types';

describe('buildInvestigationUrl', () => {
  describe('given an investigation object', () => {
    let investigation: Investigation;

    beforeEach(() => {
      investigation = mockInvestigations[0];
      axios.get = jest.fn().mockResolvedValue({
        data: [investigation],
      });
    });

    it('should return a generic URL to it', () => {
      const url = buildInvestigationUrl({
        investigation,
        facilityName: 'SVELTE',
        showLanding: false,
      });

      expect(url).toBe('/browse/investigation/58/dataset');
    });

    it('should return an ISIS URL to it', () => {
      const url = buildInvestigationUrl({
        investigation,
        facilityName: 'ISIS',
        showLanding: false,
      });

      expect(url).toBe(
        '/browse/instrument/937/facilityCycle/402/investigation/58/dataset'
      );
    });

    it('should return a DLS URL to it', () => {
      const url = buildInvestigationUrl({
        investigation,
        facilityName: 'DLS',
        showLanding: false,
      });

      expect(url).toBe(
        '/browse/proposal/investigation news/investigation/58/dataset'
      );
    });
  });

  it('should return the URL to the landing page of the given investigation', () => {
    const url = buildInvestigationUrl({
      investigation: mockInvestigations[0],
      facilityName: 'ISIS',
      showLanding: true,
    });

    expect(url).toBe(
      '/browse/instrument/937/facilityCycle/402/investigation/58'
    );
  });

  it('should return null if the associated instruments for the investigation cannot be fetched', async () => {
    const { investigationInstruments, ...investigation } =
      mockInvestigations[0];

    axios.get = jest.fn().mockResolvedValue({
      data: [investigation],
    });

    const url = buildInvestigationUrl({
      investigation,
      facilityName: 'ISIS',
      showLanding: false,
    });

    expect(url).toBeNull();
  });

  it('should return null if the investigation object does not belong to any facility cycle', async () => {
    const investigation = mockInvestigations[1];
    axios.get = jest.fn().mockResolvedValue({
      data: [investigation],
    });

    const url = buildInvestigationUrl({
      investigation,
      facilityName: 'ISIS',
      showLanding: false,
    });

    expect(url).toBeNull();
  });
});
