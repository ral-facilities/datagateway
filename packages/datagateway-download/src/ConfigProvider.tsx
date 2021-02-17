import axios from 'axios';
import {
  MicroFrontendId,
  PluginRoute,
  Preloader,
  RegisterRouteType,
} from 'datagateway-common';
import LogoLight from 'datagateway-common/src/images/datagateway-logo.svg';
import LogoDark from 'datagateway-common/src/images/datgateway-white-text-blue-mark-logo.svg';
import * as log from 'loglevel';
import React from 'react';

export interface DownloadSettingsAccessMethod {
  [type: string]: {
    idsUrl: string;
    displayName?: string;
    description?: string;
  };
}

export interface DownloadSettings {
  facilityName: string;
  apiUrl: string;
  downloadApiUrl: string;
  idsUrl: string;

  fileCountMax: number;
  totalSizeMax: number;

  accessMethods: DownloadSettingsAccessMethod;
  routes: PluginRoute[];
  helpSteps: { target: string; content: string }[];
  pluginHost?: string;
}

const initialConfiguration = {
  facilityName: '',
  apiUrl: '',
  downloadApiUrl: '',
  idsUrl: '',
  fileCountMax: -1,
  totalSizeMax: -1,
  accessMethods: {},
  routes: [],
  helpSteps: [],
};

export const DownloadSettingsContext = React.createContext<DownloadSettings>(
  initialConfiguration
);

class ConfigProvider extends React.Component<
  { children: React.ReactNode },
  { loading: boolean; settings: DownloadSettings }
> {
  public constructor(props: { children: React.ReactNode }) {
    super(props);

    this.state = {
      loading: true,
      settings: initialConfiguration,
    };
  }

  public componentDidMount(): void {
    this.updateConfigurationState();
  }

  private updateConfigurationState = async (): Promise<void> => {
    const settings = await axios
      .get<DownloadSettings>('/datagateway-download-settings.json')
      .then((res) => {
        const settings = res.data;

        if (typeof settings !== 'object') {
          throw Error('Invalid format');
        }

        // Ensure the facility name exists.
        if (!('facilityName' in settings)) {
          throw new Error('facilityName is undefined in settings');
        }

        // Ensure all API related URLs are present.
        if (
          !(
            'idsUrl' in settings &&
            'apiUrl' in settings &&
            'downloadApiUrl' in settings
          )
        ) {
          throw new Error(
            'One of the URL options (idsUrl, apiUrl, downloadApiUrl) is undefined in settings'
          );
        }

        // Ensure all fileCountMax and totalSizeMax are present.
        if (!('fileCountMax' in settings && 'totalSizeMax' in settings)) {
          throw new Error(
            'fileCountMax or totalSizeMax is undefined in settings'
          );
        }

        // Ensure access methods are present in the configuration.
        if (!('accessMethods' in settings)) {
          throw new Error('accessMethods is undefined in settings');
        } else {
          // Check to ensure at least one access method has been defined.
          if (Object.entries(settings['accessMethods']).length < 1) {
            throw new Error(
              'At least one access method should be defined under accessMethods in settings'
            );
          } else {
            // Check all defined access methods to ensure idsUrl has been stated.
            for (const method in settings['accessMethods']) {
              if (!settings['accessMethods'][method].idsUrl)
                throw new Error(
                  `Access method ${method}, defined in settings, does not contain a idsUrl`
                );
            }
          }
        }

        if (!(Array.isArray(settings['routes']) && settings['routes'].length)) {
          throw new Error('No routes provided in the settings');
        } else {
          settings['routes'].forEach((route: PluginRoute) => {
            if (
              !('section' in route && 'link' in route && 'displayName' in route)
            ) {
              throw new Error(
                'Route provided does not have all the required entries (section, link, displayName)'
              );
            }
          });
        }

        return settings;
      })
      .catch((error) => {
        log.error(
          `Error loading datagateway-download-settings.json: ${error.message}`
        );
        return null;
      });

    if (settings !== null) {
      this.setState({
        loading: false,
        settings: settings,
      });
      settings['routes'].forEach((route: PluginRoute, index: number) => {
        const registerRouteAction = {
          type: RegisterRouteType,
          payload: {
            section: route['section'],
            link: route['link'],
            plugin: 'datagateway-download',
            displayName: '\xa0' + route['displayName'],
            order: route['order'] ? route['order'] : 0,
            helpSteps:
              index === 0 && 'helpSteps' in settings
                ? settings['helpSteps']
                : [],
            logoLightMode: settings['pluginHost']
              ? settings['pluginHost'] + LogoLight
              : undefined,
            logoDarkMode: settings['pluginHost']
              ? settings['pluginHost'] + LogoDark
              : undefined,
            logoAltText: 'DataGateway',
          },
        };
        document.dispatchEvent(
          new CustomEvent(MicroFrontendId, { detail: registerRouteAction })
        );
      });
    }
  };

  public render(): React.ReactElement {
    return (
      // We pass the download settings that has been loaded
      // for all child components to consume, if required.
      <Preloader loading={this.state.loading}>
        <DownloadSettingsContext.Provider value={this.state.settings}>
          {this.props.children}
        </DownloadSettingsContext.Provider>
      </Preloader>
    );
  }
}

export const ConfigConsumer = DownloadSettingsContext.Consumer;
export default ConfigProvider;
