import axios from 'axios';
import {
  BroadcastSignOutType,
  ConfigureURLsType,
  MicroFrontendId,
  handleICATError,
} from 'datagateway-common';
import configureStore from 'redux-mock-store';
import {
  checkDatasetId,
  checkInstrumentAndFacilityCycleId,
  checkInstrumentId,
  checkInvestigationId,
  checkProposalName,
  checkStudyDataPublicationId,
  saveApiUrlMiddleware,
} from './idCheckFunctions';

vi.mock('datagateway-common', async () => {
  const originalModule = await vi.importActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    handleICATError: vi.fn(),
  };
});

describe('ID check functions', () => {
  afterEach(() => {
    vi.mocked(axios.get).mockClear();
    vi.mocked(handleICATError).mockClear();

    checkDatasetId.cache.clear?.();
    checkProposalName.cache.clear?.();
    checkInstrumentId.cache.clear?.();
    checkStudyDataPublicationId.cache.clear?.();
    checkInstrumentAndFacilityCycleId.cache.clear?.();
    checkInvestigationId.cache.clear?.();
  });

  it('saveApiUrlMiddleware sets apiUrl on ConfigureUrls action', async () => {
    vi.mocked(axios.get).mockImplementation(() => Promise.resolve());

    const store = configureStore()({});

    await checkInvestigationId(1, 2);
    const params = new URLSearchParams();
    params.append(
      'where',
      JSON.stringify({
        id: {
          eq: 2,
        },
      })
    );
    params.append('where', JSON.stringify({ 'investigation.id': { eq: 1 } }));
    expect(axios.get).toHaveBeenCalledWith('/datasets/findone', {
      params,
      headers: { Authorization: 'Bearer null' },
    });
    vi.mocked(axios.get).mockClear();
    checkInvestigationId.cache.clear?.();

    saveApiUrlMiddleware(store)(store.dispatch)({
      type: ConfigureURLsType,
      payload: { urls: { apiUrl: '/test' } },
    });

    await checkInvestigationId(1, 2);
    expect(axios.get).toHaveBeenCalledWith('/test/datasets/findone', {
      params,
      headers: { Authorization: 'Bearer null' },
    });

    // reset apiUrl for other tests
    saveApiUrlMiddleware(store)(store.dispatch)({
      type: ConfigureURLsType,
      payload: { urls: { apiUrl: '' } },
    });
  });

  it('clears caches on BroadcastSignOutType message', async () => {
    const datasetCacheClearSpy = vi.spyOn(checkDatasetId.cache, 'clear');
    const proposalCacheClearSpy = vi.spyOn(checkProposalName.cache, 'clear');
    const instrumentCacheClearSpy = vi.spyOn(checkInstrumentId.cache, 'clear');
    const dataPublicationCacheClearSpy = vi.spyOn(
      checkStudyDataPublicationId.cache,
      'clear'
    );
    const facilityCycleCacheClearSpy = vi.spyOn(
      checkInstrumentAndFacilityCycleId.cache,
      'clear'
    );
    const investigationCacheClearSpy = vi.spyOn(
      checkInvestigationId.cache,
      'clear'
    );

    document.dispatchEvent(
      new CustomEvent(MicroFrontendId, {
        detail: {
          type: BroadcastSignOutType,
        },
      })
    );

    expect(datasetCacheClearSpy).toHaveBeenCalled();
    expect(proposalCacheClearSpy).toHaveBeenCalled();
    expect(instrumentCacheClearSpy).toHaveBeenCalled();
    expect(dataPublicationCacheClearSpy).toHaveBeenCalled();
    expect(facilityCycleCacheClearSpy).toHaveBeenCalled();
    expect(investigationCacheClearSpy).toHaveBeenCalled();
  });

  describe('checkInvestigationId', () => {
    it('returns true on valid investigation + dataset pair', async () => {
      expect.assertions(2);
      vi.mocked(axios.get).mockImplementation(() =>
        Promise.resolve({
          data: { id: 2, name: 'Test dataset' },
        })
      );

      const result = await checkInvestigationId(1, 2);
      expect(result).toBe(true);
      const params = new URLSearchParams();
      params.append(
        'where',
        JSON.stringify({
          id: {
            eq: 2,
          },
        })
      );
      params.append('where', JSON.stringify({ 'investigation.id': { eq: 1 } }));
      expect(axios.get).toHaveBeenCalledWith('/datasets/findone', {
        params,
        headers: { Authorization: 'Bearer null' },
      });
    });
    it('returns false on invalid investigation + dataset pair', async () => {
      expect.assertions(2);
      vi.mocked(axios.get).mockImplementation(() =>
        Promise.reject({
          response: { status: 404 },
          isAxiosError: true,
        })
      );

      const result = await checkInvestigationId(1, 2);
      expect(result).toBe(false);
      expect(handleICATError).not.toHaveBeenCalled();
    });
    it('returns false on HTTP error', async () => {
      expect.assertions(2);
      vi.mocked(axios.get).mockImplementation(() =>
        Promise.reject({
          message: 'Test error message',
        })
      );

      const result = await checkInvestigationId(1, 2);
      expect(result).toBe(false);
      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });

  describe('checkProposalName', () => {
    it('returns true on valid proposal + investigation pair', async () => {
      expect.assertions(2);
      vi.mocked(axios.get).mockImplementation(() =>
        Promise.resolve({
          data: { id: 1, name: 'Proposal 1' },
        })
      );

      const result = await checkProposalName('Proposal 1', 1);
      expect(result).toBe(true);
      expect(axios.get).toHaveBeenCalledWith('/investigations/1', {
        headers: { Authorization: 'Bearer null' },
      });
    });
    it('returns false on invalid proposal + investigation pair', async () => {
      expect.assertions(1);
      vi.mocked(axios.get).mockImplementation(() =>
        Promise.resolve({
          data: { id: 1, name: 'Proposal 2' },
        })
      );

      const result = await checkProposalName('Proposal 1', 1);
      expect(result).toBe(false);
    });
    it('returns false on HTTP error', async () => {
      expect.assertions(2);
      vi.mocked(axios.get).mockImplementation(() =>
        Promise.reject({
          message: 'Test error message',
        })
      );

      const result = await checkProposalName('Proposal 1', 1);
      expect(result).toBe(false);
      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });

  describe('checkInstrumentAndFacilityCycleId', () => {
    it('returns true on valid instrument, facility cycle + investigation triple', async () => {
      expect.assertions(2);
      vi.mocked(axios.get).mockImplementation(() =>
        Promise.resolve({
          data: [{ id: 3, name: 'Test investigation' }],
        })
      );

      const result = await checkInstrumentAndFacilityCycleId(1, 2, 3);
      expect(result).toBe(true);
      expect(axios.get).toHaveBeenCalledWith('/investigations', {
        params: {
          where: JSON.stringify({
            id: { eq: 3 },
            investigationInstrument: { instrument: { id: { eq: 1 } } },
            investigationFacilityCycle: {
              facilityCycle: { id: { eq: 2 } },
            },
          }),
        },
        headers: { Authorization: 'Bearer null' },
      });
    });
    it('returns false on invalid instrument, facility cycle + investigation triple', async () => {
      expect.assertions(1);
      vi.mocked(axios.get).mockImplementation(() =>
        Promise.resolve({
          data: [],
        })
      );

      const result = await checkInstrumentAndFacilityCycleId(1, 2, 3);
      expect(result).toBe(false);
    });
    it('returns false on HTTP error', async () => {
      expect.assertions(2);
      vi.mocked(axios.get).mockImplementation(() =>
        Promise.reject({
          message: 'Test error message',
        })
      );

      const result = await checkInstrumentAndFacilityCycleId(1, 2, 3);
      expect(result).toBe(false);
      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });

  describe('checkInstrumentId', () => {
    it('returns true on valid instrument + data publication pair', async () => {
      expect.assertions(3);
      vi.mocked(axios.get).mockImplementation(() =>
        Promise.resolve({
          data: [{ id: 2, name: 'Test Data Publication' }],
        })
      );

      const result = await checkInstrumentId(1, 2);
      expect(result).toBe(true);
      const params = new URLSearchParams();
      params.append(
        'where',
        JSON.stringify({
          id: { eq: 2 },
        })
      );
      params.append(
        'where',
        JSON.stringify({
          'content.dataCollectionInvestigations.investigation.investigationInstruments.instrument.id':
            {
              eq: 1,
            },
        })
      );
      expect(axios.get).toHaveBeenCalledWith(
        '/datapublications/',
        expect.objectContaining({
          params,
        })
      );
      expect(vi.mocked(axios.get).mock.calls[0][1]?.params.toString()).toBe(
        params.toString()
      );
    });
    it('returns false on invalid instrument + study pair', async () => {
      expect.assertions(1);
      vi.mocked(axios.get).mockImplementation(() =>
        Promise.resolve({
          data: [],
        })
      );

      const result = await checkInstrumentId(1, 2);
      expect(result).toBe(false);
    });
    it('returns false on HTTP error', async () => {
      expect.assertions(2);
      vi.mocked(axios.get).mockImplementation(() =>
        Promise.reject({
          message: 'Test error message',
        })
      );

      const result = await checkInstrumentId(1, 2);
      expect(result).toBe(false);
      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });

  describe('checkStudyDataPublicationId', () => {
    it('returns true on valid study datapublication + investigation data publication pair', async () => {
      expect.assertions(3);
      vi.mocked(axios.get).mockImplementation(() =>
        Promise.resolve({
          data: [{ id: 3, title: 'Test DataPublication' }],
        })
      );

      const result = await checkStudyDataPublicationId(2, 3);
      expect(result).toBe(true);
      const params = new URLSearchParams();
      params.append(
        'where',
        JSON.stringify({
          id: { eq: 3 },
        })
      );
      params.append(
        'where',
        JSON.stringify({
          'content.dataCollectionInvestigations.investigation.dataCollectionInvestigations.dataCollection.dataPublications.id':
            {
              eq: 2,
            },
        })
      );
      expect(axios.get).toHaveBeenCalledWith(
        '/datapublications',
        expect.objectContaining({
          params,
        })
      );
      expect(vi.mocked(axios.get).mock.calls[0][1]?.params.toString()).toBe(
        params.toString()
      );
    });
    it('returns false on invalid study datapublication + investigation data publication pair', async () => {
      expect.assertions(1);
      vi.mocked(axios.get).mockImplementation(() =>
        Promise.resolve({
          data: [],
        })
      );

      const result = await checkStudyDataPublicationId(2, 3);
      expect(result).toBe(false);
    });
    it('returns false on HTTP error', async () => {
      expect.assertions(2);
      vi.mocked(axios.get).mockImplementation(() =>
        Promise.reject({
          message: 'Test error message',
        })
      );

      const result = await checkStudyDataPublicationId(2, 3);
      expect(result).toBe(false);
      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });

  describe('checkDatasetId', () => {
    it('returns true on valid dataset + datafile pair', async () => {
      expect.assertions(2);
      vi.mocked(axios.get).mockImplementation(() =>
        Promise.resolve({
          data: { id: 2, name: 'Test datafile' },
        })
      );

      const result = await checkDatasetId(1, 2);
      expect(result).toBe(true);
      const params = new URLSearchParams();
      params.append(
        'where',
        JSON.stringify({
          id: {
            eq: 2,
          },
        })
      );
      params.append('where', JSON.stringify({ 'dataset.id': { eq: 1 } }));
      expect(axios.get).toHaveBeenCalledWith('/datafiles/findone', {
        params,
        headers: { Authorization: 'Bearer null' },
      });
    });
    it('returns false on invalid dataset + datafile pair', async () => {
      expect.assertions(2);
      vi.mocked(axios.get).mockImplementation(() =>
        Promise.reject({
          response: { status: 404 },
          isAxiosError: true,
        })
      );

      const result = await checkDatasetId(1, 2);
      expect(result).toBe(false);
      expect(handleICATError).not.toHaveBeenCalled();
    });
    it('returns false on HTTP error', async () => {
      expect.assertions(2);
      vi.mocked(axios.get).mockImplementation(() =>
        Promise.reject({
          message: 'Test error message',
        })
      );

      const result = await checkDatasetId(1, 2);
      expect(result).toBe(false);
      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });
});
