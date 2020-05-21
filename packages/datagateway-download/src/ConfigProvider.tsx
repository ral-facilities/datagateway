import axios from 'axios';
import { Preloader } from 'datagateway-common';
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

  accessMethods: DownloadSettingsAccessMethod;
}

const initialConfiguration = {
  facilityName: '',
  apiUrl: '',
  downloadApiUrl: '',
  idsUrl: '',
  accessMethods: {},
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
      .then(res => {
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

        return settings;
      })
      .catch(error => {
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
