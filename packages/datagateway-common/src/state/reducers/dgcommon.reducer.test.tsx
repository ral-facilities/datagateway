import DGCommonReducer, { initialState } from './dgcommon.reducer';
import { DGCommonState } from '../app.types';
import {
  loadAccessMethods,
  loadFacilityName,
  loadQueryRetries,
  loadUrls,
} from '../actions';

describe('DGCommon reducer', () => {
  let state: DGCommonState;

  beforeEach(() => {
    state = { ...initialState };
  });

  it('should return state for actions it does not care about', () => {
    const updatedState = DGCommonReducer(state, { type: 'irrelevant action' });

    expect(updatedState).toBe(state);
  });

  it('should set facility name property when configure facility name action is sent', () => {
    expect(state.facilityName).toEqual('');

    const updatedState = DGCommonReducer(state, loadFacilityName('Generic'));

    expect(updatedState.facilityName).toEqual('Generic');
  });

  it('should set urls property when configure urls action is sent', () => {
    expect(state.urls.apiUrl).toEqual('');

    const updatedState = DGCommonReducer(
      state,
      loadUrls({
        ...state.urls,
        apiUrl: 'test',
      })
    );

    expect(updatedState.urls.apiUrl).toEqual('test');
  });

  it('should set query retry property when configure query retry action is sent', () => {
    expect(state.queryRetries).toEqual(undefined);

    const updatedState = DGCommonReducer(state, loadQueryRetries(1));

    expect(updatedState.queryRetries).toEqual(1);
  });

  it('should set access methods property when configure access methods action is sent', () => {
    expect(state.accessMethods).toEqual(undefined);

    const updatedState = DGCommonReducer(state, loadAccessMethods({}));

    expect(updatedState.accessMethods).toEqual({});
  });
});
