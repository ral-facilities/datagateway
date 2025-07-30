import { loadUrls, loadFacilityName, loadAccessMethods } from '.';
import {
  ConfigureURLsType,
  ConfigureFacilityNameType,
  ConfigureAccessMethodsType,
} from './actions.types';
import { resetActions } from '../../setupTests';

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

  it('given JSON loadAccessMethods returns a ConfigureAccessMethodsType with ConfigureAccessMethodsPayload', () => {
    const action = loadAccessMethods({});
    expect(action.type).toEqual(ConfigureAccessMethodsType);
    expect(action.payload).toEqual({
      accessMethods: {},
    });
  });
});
