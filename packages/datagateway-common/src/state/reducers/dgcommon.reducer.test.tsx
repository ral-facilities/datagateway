import DGCommonReducer, { initialState } from './dgcommon.reducer';
import { DGCommonState } from '../app.types';
import { loadFacilityName, loadUrls } from '../actions';

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
});
