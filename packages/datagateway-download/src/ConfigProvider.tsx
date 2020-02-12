import React from 'react';
import axios from 'axios';

import * as log from 'loglevel';
import { Preloader } from 'datagateway-common';

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
  { children: React.ReactNode },
  { loading: boolean; settings: DownloadSettings }
> {
  public constructor(props: { children: React.ReactNode }) {
    super(props);

    this.state = {
      loading: true,
      settings: {
        facilityName: '',
        apiUrl: '',
        idsUrl: '',
        downloadApiUrl: '',
      },
    };
  }

  public componentDidMount(): void {
    this.updateConfigurationState();
  }

  private updateConfigurationState = async () => {
    let updatedState = this.state;
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
        return null;
      });

    if (settings !== null) {
      updatedState = {
        loading: false,
        settings: settings,
      };
      this.setState(updatedState);
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
