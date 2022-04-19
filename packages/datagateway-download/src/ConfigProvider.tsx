import { PluginRoute, Preloader } from 'datagateway-common';
import React from 'react';
import { settings } from './settings';

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
    const settingsResult = await settings;
    if (settingsResult) {
      this.setState({
        loading: false,
        settings: settingsResult,
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
