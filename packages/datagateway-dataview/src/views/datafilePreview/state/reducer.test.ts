import { DGDataViewState } from '../../../state/app.types';
import {
  decDatafilePreviewerZoomLevel,
  incDatafilePreviewerZoomLevel,
  resetDatafilePreviewerZoomLevel,
  toggleDatafilePreviewerDetailsPane,
} from './reducer';

describe('Datafile previewer reducers', () => {
  let state: DGDataViewState;

  beforeEach(() => {
    state = {
      breadcrumbSettings: undefined,
      facilityImageURL: '',
      features: undefined,
      pluginHost: '',
      selectAllSetting: false,
      settingsLoaded: false,
      datafilePreviewer: {
        zoomLevel: 100,
        isDetailsPaneShown: false,
      },
    };
  });

  describe('toggleDatafilePreviewerDetailsPane', () => {
    describe('given the payload says the details pane should be open', () => {
      it('should produce a new state with details pane set to open', () => {
        const newState = toggleDatafilePreviewerDetailsPane(state, {
          shouldShow: true,
        });

        expect(newState).toEqual<DGDataViewState>({
          breadcrumbSettings: undefined,
          facilityImageURL: '',
          features: undefined,
          pluginHost: '',
          selectAllSetting: false,
          settingsLoaded: false,
          datafilePreviewer: {
            zoomLevel: 100,
            isDetailsPaneShown: true,
          },
        });
      });
    });
  });

  describe('incDatafilePreviewerZoomLevel', () => {
    it('should produce a new state with the zoom level of the datafile previewer equal to previous zoom level + predefined increment step', () => {
      const newState = incDatafilePreviewerZoomLevel(state);
      expect(newState).toEqual<DGDataViewState>({
        breadcrumbSettings: undefined,
        facilityImageURL: '',
        features: undefined,
        pluginHost: '',
        selectAllSetting: false,
        settingsLoaded: false,
        datafilePreviewer: {
          zoomLevel: 110,
          isDetailsPaneShown: false,
        },
      });
    });
  });

  describe('decDatafilePreviewerZoomLevel', () => {
    it('should produce a new state with the zoom level of the datafile previewer equal to previous zoom level - predefined increment step', () => {
      const newState = decDatafilePreviewerZoomLevel(state);
      expect(newState).toEqual<DGDataViewState>({
        breadcrumbSettings: undefined,
        facilityImageURL: '',
        features: undefined,
        pluginHost: '',
        selectAllSetting: false,
        settingsLoaded: false,
        datafilePreviewer: {
          zoomLevel: 90,
          isDetailsPaneShown: false,
        },
      });
    });
  });

  describe('resetDatafilePreviewerZoomLevel', () => {
    it('should produce a new state with the zoom level of the datafile previewer set to the default value', () => {
      state = {
        breadcrumbSettings: undefined,
        facilityImageURL: '',
        features: undefined,
        pluginHost: '',
        selectAllSetting: false,
        settingsLoaded: false,
        datafilePreviewer: {
          zoomLevel: 80,
          isDetailsPaneShown: false,
        },
      };
      const newState = resetDatafilePreviewerZoomLevel(state);
      expect(newState).toEqual<DGDataViewState>({
        breadcrumbSettings: undefined,
        facilityImageURL: '',
        features: undefined,
        pluginHost: '',
        selectAllSetting: false,
        settingsLoaded: false,
        datafilePreviewer: {
          zoomLevel: 100,
          isDetailsPaneShown: false,
        },
      });
    });
  });
});
