import {
  loadAnonUserName,
  loadFacilityName,
  loadFeatureSwitches,
  loadUrls,
} from '.';
import { resetActions } from '../../setupTests';
import {
  ConfigureAnonUserNameType,
  ConfigureFacilityNameType,
  ConfigureFeatureSwitchesType,
  ConfigureURLsType,
} from './actions.types';

describe('Actions', () => {
  afterEach(() => {
    resetActions();
  });

  it('given JSON loadUrls returns a ConfigureUrlsType with ConfigureUrlsPayload', () => {
    const action = loadUrls({
      idsUrl: 'ids',
      apiUrl: 'api',
      downloadApiUrl: 'download-api',
      icatUrl: 'icat',
    });
    expect(action.type).toEqual(ConfigureURLsType);
    expect(action.payload).toEqual({
      urls: {
        idsUrl: 'ids',
        apiUrl: 'api',
        downloadApiUrl: 'download-api',
        icatUrl: 'icat',
      },
    });
  });

  it('given JSON loadFacilityName returns a ConfigureFacilityNameType with ConfigureFacilityNamePayload', () => {
    const action = loadFacilityName('Generic');
    expect(action.type).toEqual(ConfigureFacilityNameType);
    expect(action.payload).toEqual({
      facilityName: 'Generic',
    });
  });

  it('given JSON loadFeatureSwitches returns a ConfigureFeatureSwitchesType with ConfigureFeatureSwitchesPayload', () => {
    const action = loadFeatureSwitches({ disableAnonDownload: true });
    expect(action.type).toEqual(ConfigureFeatureSwitchesType);
    expect(action.payload).toEqual({
      switches: { disableAnonDownload: true },
    });
  });

  it('given JSON loadAnonUserName returns a ConfigureAnonUserNameType with ConfigureAnonUserNamePayload', () => {
    const action = loadAnonUserName('anon');
    expect(action.type).toEqual(ConfigureAnonUserNameType);
    expect(action.payload).toEqual({
      anonUserName: 'anon',
    });
  });
});
