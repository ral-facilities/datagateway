import {
  checkInvestigationId,
  checkProposalName,
  checkInstrumentAndFacilityCycleId,
  saveApiUrlMiddleware,
  checkInstrumentId,
  checkStudyDataPublicationId,
  checkDatasetId,
} from './idCheckFunctions';
import axios from 'axios';
import { handleICATError, ConfigureURLsType } from 'datagateway-common';
import configureStore from 'redux-mock-store';

jest.mock('datagateway-common', () => {
  const originalModule = vi.importActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    handleICATError: jest.fn(),
  };
});

jest.mock('lodash.memoize', () => (fn: (args: unknown) => unknown) => fn);

describe('ID check functions', () => {
  afterEach(() => {
    (axios.get as jest.Mock).mockClear();
    (handleICATError as jest.Mock).mockClear();
  });

  it('saveApiUrlMiddleware sets apiUrl on ConfigureUrls action', async () => {
    (axios.get as jest.Mock).mockImplementation(() => Promise.resolve());

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
    (axios.get as jest.Mock).mockClear();

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

  describe('checkInvestigationId', () => {
    it('returns true on valid investigation + dataset pair', async () => {
      expect.assertions(2);
      (axios.get as jest.Mock).mockImplementation(() =>
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
      (axios.get as jest.Mock).mockImplementation(() =>
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
      (axios.get as jest.Mock).mockImplementation(() =>
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
      (axios.get as jest.Mock).mockImplementation(() =>
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
      (axios.get as jest.Mock).mockImplementation(() =>
        Promise.resolve({
          data: { id: 1, name: 'Proposal 2' },
        })
      );

      const result = await checkProposalName('Proposal 1', 1);
      expect(result).toBe(false);
    });
    it('returns false on HTTP error', async () => {
      expect.assertions(2);
      (axios.get as jest.Mock).mockImplementation(() =>
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
      (axios.get as jest.Mock).mockImplementation(() =>
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
      (axios.get as jest.Mock).mockImplementation(() =>
        Promise.resolve({
          data: [],
        })
      );

      const result = await checkInstrumentAndFacilityCycleId(1, 2, 3);
      expect(result).toBe(false);
    });
    it('returns false on HTTP error', async () => {
      expect.assertions(2);
      (axios.get as jest.Mock).mockImplementation(() =>
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
      (axios.get as jest.Mock).mockImplementation(() =>
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
      expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
        params.toString()
      );
    });
    it('returns false on invalid instrument + study pair', async () => {
      expect.assertions(1);
      (axios.get as jest.Mock).mockImplementation(() =>
        Promise.resolve({
          data: [],
        })
      );

      const result = await checkInstrumentId(1, 2);
      expect(result).toBe(false);
    });
    it('returns false on HTTP error', async () => {
      expect.assertions(2);
      (axios.get as jest.Mock).mockImplementation(() =>
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
      (axios.get as jest.Mock).mockImplementation(() =>
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
      expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
        params.toString()
      );
    });
    it('returns false on invalid study datapublication + investigation data publication pair', async () => {
      expect.assertions(1);
      (axios.get as jest.Mock).mockImplementation(() =>
        Promise.resolve({
          data: [],
        })
      );

      const result = await checkStudyDataPublicationId(2, 3);
      expect(result).toBe(false);
    });
    it('returns false on HTTP error', async () => {
      expect.assertions(2);
      (axios.get as jest.Mock).mockImplementation(() =>
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
      (axios.get as jest.Mock).mockImplementation(() =>
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
      (axios.get as jest.Mock).mockImplementation(() =>
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
      (axios.get as jest.Mock).mockImplementation(() =>
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
