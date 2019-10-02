import { getAppStrings, getString } from './strings';
import { DGTableState, StateType, AppStrings } from './app.types';
import { RouterState } from 'connected-react-router';
import { initialState } from './reducers/dgtable.reducer';

describe('strings', () => {
  describe('getString', () => {
    const res: AppStrings = {
      'expected-key': 'expectedValue',
      'other-key': 'unexpected Value',
    };

    it('returns key element from res object if exists', () => {
      expect(getString(res, 'expected-key')).toEqual(res['expected-key']);
    });

    it('returns key from res object if key does exist', () => {
      expect(getString(res, 'unexpected-key')).toEqual('unexpected-key');
    });

    it('returns key if res is undefined', () => {
      expect(getString(undefined, 'unexpected-key')).toEqual('unexpected-key');
    });
  });

  describe('getAppStrings', () => {
    const testRes: AppStrings = {
      'expected-key': 'expectedValue',
      'other-key': 'unexpected Value',
    };
    const otherSection: AppStrings = {
      unexpected: 'unexpected string',
    };

    const routerState: RouterState = {
      action: 'POP',
      location: {
        hash: '',
        key: '',
        pathname: '/',
        search: '',
        state: {},
      },
    };

    const dgtableState: DGTableState = {
      ...initialState,
      res: {
        'section-name': testRes,
        'unused-section': otherSection,
      },
    };

    const state: StateType = {
      router: routerState,
      dgtable: dgtableState,
    };

    it('returns key element from state object if section exists', () => {
      expect(getAppStrings(state, 'section-name')).toEqual(testRes);
    });

    it('returns undefined if section name does not exist', () => {
      expect(getAppStrings(state, 'unexpected-key')).toBeUndefined();
    });

    it('returns undefined if res is undefined', () => {
      expect(
        getAppStrings(
          { ...state, dgtable: { ...state.dgtable, res: undefined } },
          'section-name'
        )
      ).toBeUndefined();
    });
  });
});
