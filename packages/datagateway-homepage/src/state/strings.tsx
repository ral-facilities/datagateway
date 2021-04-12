import { AppStrings, StateType } from './app.types';

export function getAppStrings(
  state: StateType,
  section: string
): AppStrings | undefined {
  return state.dghomepage.res ? state.dghomepage.res[section] : undefined;
}

export const getString = (res: AppStrings | undefined, key: string): string =>
  (res && res[key]) || key;
