import {
  checkInvestigationId,
  checkProposalName,
  checkInstrumentAndFacilityCycleId,
  saveApiUrlMiddleware,
  checkInstrumentId,
  checkStudyId,
  checkDatafileId,
} from './idCheckFunctions';
import axios from 'axios';
import { handleICATError, ConfigureURLsType } from 'datagateway-common';
import configureStore from 'redux-mock-store';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

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
    expect(axios.get).toHaveBeenCalledWith('/datasets/findone', {
      params: {
        where: { id: { eq: 2 } },
        include: '"investigation"',
      },
      headers: { Authorization: 'Bearer null' },
    });
    (axios.get as jest.Mock).mockClear();

    saveApiUrlMiddleware(store)(store.dispatch)({
      type: ConfigureURLsType,
      payload: { urls: { apiUrl: '/test' } },
    });

    await checkInvestigationId(1, 2);
    expect(axios.get).toHaveBeenCalledWith('/test/datasets/findone', {
      params: {
        where: { id: { eq: 2 } },
        include: '"investigation"',
      },
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
          data: { id: 2, name: 'Test dataset', investigation: { id: 1 } },
        })
      );

      const result = await checkInvestigationId(1, 2);
      expect(result).toBe(true);
      expect(axios.get).toHaveBeenCalledWith('/datasets/findone', {
        params: {
          where: { id: { eq: 2 } },
          include: '"investigation"',
        },
        headers: { Authorization: 'Bearer null' },
      });
    });
    it('returns false on invalid investigation + dataset pair', async () => {
      expect.assertions(1);
      (axios.get as jest.Mock).mockImplementation(() =>
        Promise.resolve({
          data: { id: 2, name: 'Test dataset', investigation: { id: 3 } },
        })
      );

      const result = await checkInvestigationId(1, 2);
      expect(result).toBe(false);
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
      expect(axios.get).toHaveBeenCalledWith(
        '/instruments/1/facilitycycles/2/investigations/',
        {
          params: { where: { id: { eq: 3 } } },
          headers: { Authorization: 'Bearer null' },
        }
      );
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
    it('returns true on valid instrument + study pair', async () => {
      expect.assertions(3);
      (axios.get as jest.Mock).mockImplementation(() =>
        Promise.resolve({
          data: [{ id: 2, name: 'Test study' }],
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
          'studyInvestigations.investigation.investigationInstruments.instrument.id':
            {
              eq: 1,
            },
        })
      );
      expect(axios.get).toHaveBeenCalledWith(
        '/studies/',
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

  describe('checkStudyId', () => {
    it('returns true on valid study + investigation pair', async () => {
      expect.assertions(3);
      (axios.get as jest.Mock).mockImplementation(() =>
        Promise.resolve({
          data: [{ id: 3, name: 'Test investigation' }],
        })
      );

      const result = await checkStudyId(2, 3);
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
          'studyInvestigations.study.id': {
            eq: 2,
          },
        })
      );
      expect(axios.get).toHaveBeenCalledWith(
        '/investigations/',
        expect.objectContaining({
          params,
        })
      );
      expect((axios.get as jest.Mock).mock.calls[0][1].params.toString()).toBe(
        params.toString()
      );
    });
    it('returns false on invalid study + investigation pair', async () => {
      expect.assertions(1);
      (axios.get as jest.Mock).mockImplementation(() =>
        Promise.resolve({
          data: [],
        })
      );

      const result = await checkStudyId(2, 3);
      expect(result).toBe(false);
    });
    it('returns false on HTTP error', async () => {
      expect.assertions(2);
      (axios.get as jest.Mock).mockImplementation(() =>
        Promise.reject({
          message: 'Test error message',
        })
      );

      const result = await checkStudyId(2, 3);
      expect(result).toBe(false);
      expect(handleICATError).toHaveBeenCalledWith({
        message: 'Test error message',
      });
    });
  });
});

describe('checkDatafileId', () => {
  it('should return true when the given investigation + dataset + datafile id matches', async () => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: [
        {
          id: 123,
          dataset: {
            id: 234,
            investigation: {
              id: 456,
            },
          },
        },
      ],
    });

    expect(await checkDatafileId(456, 234, 123)).toBe(true);
  });

  it('should return false when the given investigation + dataset + datafile id does not match', async () => {
    // datafile id and dataset id matches but not investigation
    (axios.get as jest.Mock).mockResolvedValue({
      data: [
        {
          id: 123,
          dataset: {
            id: 234,
            investigation: {
              id: 456,
            },
          },
        },
      ],
    });

    // dataset & datafile matches but not investigation
    expect(await checkDatafileId(100, 234, 123)).toBe(false);
    // investigation & datafile matches but not dataset
    expect(await checkDatafileId(456, 199, 123)).toBe(false);
    // only datafile matches
    expect(await checkDatafileId(199, 200, 123)).toBe(false);
    // no match at all
    expect(await checkDatafileId(1, 2, 0)).toBe(false);
  });

  it('should return false when an http error is encountered', async () => {
    (axios.get as jest.Mock).mockImplementation(() =>
      Promise.reject({
        message: 'Test error message',
      })
    );

    expect(await checkDatafileId(456, 234, 123)).toBe(false);
    expect(handleICATError).toHaveBeenCalledWith({
      message: 'Test error message',
    });
  });
});
