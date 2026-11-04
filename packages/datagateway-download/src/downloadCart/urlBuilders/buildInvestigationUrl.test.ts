import buildInvestigationUrl from './buildInvestigationUrl';
import { mockedSettings, mockInvestigations } from '../../testData';
import axios from 'axios';
import type { Investigation } from 'datagateway-common';

describe('buildInvestigationUrl', () => {
  describe('given an investigation object', () => {
    let investigation: Investigation;

    beforeEach(() => {
      investigation = mockInvestigations[0];
      axios.get = vi.fn().mockResolvedValue({
        data: [investigation],
      });
    });

    it('should return a generic URL to it', async () => {
      const url = await buildInvestigationUrl({
        investigation,
        facilityName: 'SVELTE',
      });

      expect(url).toBe('/redirect/SVELTE/investigation/id/58');
    });

    it('should return an ISIS URL to it', async () => {
      const url = await buildInvestigationUrl({
        investigation,
        facilityName: 'ISIS',
      });

      expect(url).toBe(
        '/redirect/ISIS/investigation/id/58'
      );
      
    });

    it('should return a DLS URL to it', async () => {
      const url = await buildInvestigationUrl({
        investigation,
        facilityName: 'DLS',
      });

      expect(url).toBe(
        '/redirect/DLS/investigation/id/58'
      );
    });
  });

  describe('given an investigation id', () => {
    let investigation: Investigation;

    beforeEach(() => {
      investigation = mockInvestigations[1];
      axios.get = vi.fn().mockResolvedValue({
        data: [investigation],
      });
    });

    it('should return a generic URL to it', async () => {
      const url = await buildInvestigationUrl({
        investigationId: 993,
        facilityName: 'SVELTE',
      });

      expect(url).toBe('/redirect/SVELTE/investigation/id/993');
    });

    it('should return an ISIS URL to it', async () => {
      const url = await buildInvestigationUrl({
        investigationId: 993,
        facilityName: 'ISIS',
      });

      expect(url).toBe(
        '/redirect/ISIS/investigation/id/993'
      );
    });

    it('should return a DLS URL to it', async () => {
      const url = await buildInvestigationUrl({
        investigationId: 993,
        facilityName: 'DLS',
      });

      expect(url).toBe(
        '/redirect/DLS/investigation/id/993'
      );
    });
  });

  it('should return null if neither an investigation object or an investigation id is provided', async () => {
    const url = await buildInvestigationUrl({
      facilityName: mockedSettings.facilityName,
    });

    expect(url).toBeNull();
  });
});
