import {
  configureApp,
  loadMaxNumResults,
  loadSearchableEntitites,
  loadSelectAllSetting,
  settingsLoaded,
} from '.';
import {
  ConfigureMaxNumResultsType,
  ConfigureSearchableEntitiesType,
  ConfigureSelectAllSettingType,
  SettingsLoadedType,
} from './actions.types';
import { actions, resetActions, dispatch, getState } from '../../setupTests';
import { loadUrls, loadFacilityName } from 'datagateway-common';

const mockSettingsGetter = jest.fn();
jest.mock('../../settings', () => ({
  get settings() {
    return mockSettingsGetter();
  },
}));

describe('Actions', () => {
  afterEach(() => {
    mockSettingsGetter.mockReset();
    resetActions();
  });

  it('settingsLoaded returns an action with SettingsLoadedType', () => {
    const action = settingsLoaded();
    expect(action.type).toEqual(SettingsLoadedType);
  });

  it('given JSON loadSelectAllSetting returns a ConfigureSelectAllSettingType with ConfigureSelectAllSettingPayload', () => {
    const action = loadSelectAllSetting(false);
    expect(action.type).toEqual(ConfigureSelectAllSettingType);
    expect(action.payload).toEqual({
      settings: false,
    });
  });

  it('given JSON loadSearchableEntitites returns a ConfigureSearchableEntitiesType with ConfigureSearchableEntitiesPayload', () => {
    const action = loadSearchableEntitites(['investigation', 'dataset']);
    expect(action.type).toEqual(ConfigureSearchableEntitiesType);
    expect(action.payload).toEqual({
      entities: ['investigation', 'dataset'],
    });
  });

  it('settings are loaded and facilityName, loadUrls, loadSelectAllSetting, loadSearchableEntitites, loadMaxNumResults and settingsLoaded actions are sent', async () => {
    mockSettingsGetter.mockReturnValue({
      facilityName: 'Generic',
      idsUrl: 'ids',
      apiUrl: 'api',
      downloadApiUrl: 'download-api',
      icatUrl: 'icat',
      selectAllSetting: false,
      searchableEntities: ['investigation', 'dataset', 'datafile'],
      maxNumResults: 150,
    });
    const asyncAction = configureApp();
    await asyncAction(dispatch, getState);

    expect(actions.length).toEqual(6);
    expect(actions).toContainEqual(loadFacilityName('Generic'));
    expect(actions).toContainEqual(
      loadUrls({
        idsUrl: 'ids',
        apiUrl: 'api',
        downloadApiUrl: 'download-api',
        icatUrl: 'icat',
      })
    );
    expect(actions).toContainEqual(loadSelectAllSetting(false));
    expect(actions).toContainEqual(
      loadSearchableEntitites(['investigation', 'dataset', 'datafile'])
    );
    expect(actions).toContainEqual(loadMaxNumResults(150));

    expect(actions).toContainEqual(settingsLoaded());
  });

  it("doesn't send loadSelectAllSetting, loadSearchableEntitites and loadMaxNumResults actions when they're not defined", async () => {
    mockSettingsGetter.mockReturnValue({
      facilityName: 'Generic',
      idsUrl: 'ids',
      apiUrl: 'api',
      downloadApiUrl: 'download-api',
      icatUrl: 'icat',
    });
    const asyncAction = configureApp();
    await asyncAction(dispatch, getState);

    expect(actions.length).toEqual(3);
    expect(
      actions.every(({ type }) => type !== ConfigureSelectAllSettingType)
    ).toBe(true);
    expect(
      actions.every(({ type }) => type !== ConfigureSearchableEntitiesType)
    ).toBe(true);
    expect(
      actions.every(({ type }) => type !== ConfigureMaxNumResultsType)
    ).toBe(true);

    expect(actions).toContainEqual(settingsLoaded());
  });

  it("doesn't send any actions when settings are undefined", async () => {
    mockSettingsGetter.mockReturnValue(undefined);
    const asyncAction = configureApp();
    await asyncAction(dispatch, getState);

    expect(actions.length).toEqual(0);
  });
});
