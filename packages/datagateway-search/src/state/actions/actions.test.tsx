import {
  configureApp,
  loadMaxNumResults,
  loadMinNumResults,
  loadSearchableEntitites,
  loadSelectAllSetting,
  settingsLoaded,
} from '.';
import {
  ConfigureMaxNumResultsType,
  ConfigureMinNumResultsType,
  ConfigureSearchableEntitiesType,
  ConfigureSelectAllSettingType,
  SettingsLoadedType,
} from './actions.types';
import { actions, resetActions, dispatch, getState } from '../../setupTests';
import {
  loadUrls,
  loadFacilityName,
  loadQueryRetries,
  ConfigureQueryRetriesType,
  loadAccessMethods,
  ConfigureAccessMethodsType,
} from 'datagateway-common';

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

  it('settings are loaded and facilityName, loadUrls, loadQueryRetries, loadAccessMethods, loadSelectAllSetting, loadSearchableEntitites, loadMaxNumResults and settingsLoaded actions are sent', async () => {
    mockSettingsGetter.mockReturnValue({
      facilityName: 'Generic',
      idsUrl: 'ids',
      apiUrl: 'api',
      downloadApiUrl: 'download-api',
      icatUrl: 'icat',
      queryRetries: 0,
      accessMethods: {
        globus: {
          idsUrl: 'ids',
        },
      },
      selectAllSetting: false,
      searchableEntities: ['investigation', 'dataset', 'datafile'],
      maxNumResults: 150,
    });
    const asyncAction = configureApp();
    await asyncAction(dispatch, getState, null);

    expect(actions.length).toEqual(8);
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
    expect(actions).toContainEqual(loadQueryRetries(0));
    expect(actions).toContainEqual(
      loadAccessMethods({
        globus: {
          idsUrl: 'ids',
        },
      })
    );

    expect(actions).toContainEqual(settingsLoaded());
  });

  it("doesn't send loadQueryRetries, loadAccessMethods, loadSelectAllSetting, loadSearchableEntitites and loadMaxNumResults actions when they're not defined", async () => {
    mockSettingsGetter.mockReturnValue({
      facilityName: 'Generic',
      idsUrl: 'ids',
      apiUrl: 'api',
      downloadApiUrl: 'download-api',
      icatUrl: 'icat',
    });
    const asyncAction = configureApp();
    await asyncAction(dispatch, getState, null);

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
    expect(
      actions.every(({ type }) => type !== ConfigureQueryRetriesType)
    ).toBe(true);
    expect(
      actions.every(({ type }) => type !== ConfigureAccessMethodsType)
    ).toBe(true);

    expect(actions).toContainEqual(settingsLoaded());
  });

  it("doesn't send any actions when settings are undefined", async () => {
    mockSettingsGetter.mockReturnValue(undefined);
    const asyncAction = configureApp();
    await asyncAction(dispatch, getState, null);

    expect(actions.length).toEqual(0);
  });

  describe('loadMinNumResults', () => {
    it('returns an action with type ConfigureMinResultsType and a payload with the given min num results', () => {
      const action = loadMinNumResults(20);
      expect(action.type).toEqual(ConfigureMinNumResultsType);
      expect(action.payload).toEqual({
        minNumResults: 20,
      });
    });
  });
});
