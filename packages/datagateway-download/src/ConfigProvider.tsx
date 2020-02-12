import React from 'react';
import axios from 'axios';

import * as log from 'loglevel';

// Configure the datagateway download settings.
// const configureApp = async (): Promise<React.Context<DownloadSettings>> => {
//     const downloadSettings = await axios
//       .get<DownloadSettings>('/datagateway-download-settings.json')
//       .then(res => {
//         const settings = res.data;
//         console.log('Download settings: ', settings);

//         // TODO: Check for an invalid settings.json, check specific settings exist
//         //       (facilityName, idsUrl, apiUrl, downloadApiUrl).
//         return React.createContext(settings);
//       })
//       .catch(error => {
//         log.error(
//           `Error loading datagateway-download-settings.json: ${error.message}`
//         );
//         return React.createContext({});
//       });

//     return downloadSettings;
//   };

interface ConfigProviderProps {
  children: React.ReactNode;
}

export interface DownloadSettings {
  facilityName: string;
  apiUrl: string;
  downloadApiUrl: string;
  idsUrl: string;
}

export const DownloadSettingsContext = React.createContext<DownloadSettings>({
  facilityName: '',
  apiUrl: '',
  downloadApiUrl: '',
  idsUrl: '',
});

class ConfigProvider extends React.Component<
  ConfigProviderProps,
  DownloadSettings
> {
  public constructor(props: ConfigProviderProps) {
    super(props);

    this.state = {
      facilityName: '',
      apiUrl: '',
      idsUrl: '',
      downloadApiUrl: '',
    };
  }

  public componentDidMount(): void {
    this.updateConfigurationState();
  }

  private updateConfigurationState = async () => {
    const settings = await axios
      .get<DownloadSettings>('/datagateway-download-settings.json')
      .then(res => {
        const settings = res.data;
        console.log('Download settings: ', settings);

        // TODO: Check for an invalid settings.json, check specific settings exist
        //       (facilityName, idsUrl, apiUrl, downloadApiUrl).
        return settings;
      })
      .catch(error => {
        log.error(
          `Error loading datagateway-download-settings.json: ${error.message}`
        );

        return this.state;
      });

    this.setState(settings);
  };

  public render(): React.ReactElement {
    return (
      <DownloadSettingsContext.Provider value={this.state}>
        {this.props.children}
      </DownloadSettingsContext.Provider>
    );
  }
}

export const ConfigConsumer = DownloadSettingsContext.Consumer;
export default ConfigProvider;
