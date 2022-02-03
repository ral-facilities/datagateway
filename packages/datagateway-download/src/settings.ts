import { DownloadSettings } from './ConfigProvider';

export let settings: Promise<DownloadSettings | void>;
export const setSettings = (
  newSettings: Promise<DownloadSettings | void>
): void => {
  settings = newSettings;
};
