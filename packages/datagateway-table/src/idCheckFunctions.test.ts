import {
  checkInvestigationId,
  checkProposalName,
  checkInstrumentAndFacilityCycleId,
} from './idCheckFunctions';
import axios from 'axios';
import { handleICATError } from 'datagateway-common';

jest.mock('datagateway-common', () => {
  const originalModule = jest.requireActual('datagateway-common');

  return {
    __esModule: true,
    ...originalModule,
    handleICATError: jest.fn(),
  };
});

describe('ID check functions', () => {
  afterEach(() => {
    (axios.get as jest.Mock).mockClear();
    (handleICATError as jest.Mock).mockClear();
  });

  describe('checkInvestigationId', () => {
    it('returns true on valid investigation + dataset pair', async () => {
      expect.assertions(2);
      (axios.get as jest.Mock).mockImplementation(() =>
        Promise.resolve({
          data: { ID: 2, NAME: 'Test dataset', INVESTIGATION_ID: 1 },
        })
      );

      const result = await checkInvestigationId(1, 2);
      expect(result).toBe(true);
      expect(axios.get).toHaveBeenCalledWith('/datasets/2', {
        headers: { Authorization: 'Bearer null' },
      });
    });
    it('returns false on invalid investigation + dataset pair', async () => {
      expect.assertions(1);
      (axios.get as jest.Mock).mockImplementation(() =>
        Promise.resolve({
          data: { ID: 2, NAME: 'Test dataset', INVESTIGATION_ID: 3 },
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
          data: { ID: 1, NAME: 'Proposal 1' },
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
          data: { ID: 1, NAME: 'Proposal 2' },
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
          data: [{ ID: 3, NAME: 'Test investigation' }],
        })
      );

      const result = await checkInstrumentAndFacilityCycleId(1, 2, 3);
      expect(result).toBe(true);
      expect(axios.get).toHaveBeenCalledWith(
        '/instruments/1/facilitycycles/2/investigations/',
        {
          params: { where: { ID: { eq: 3 } } },
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
});
