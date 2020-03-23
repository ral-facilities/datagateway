import { AppStrings, StateType } from './app.types';

export function getAppStrings(
  state: StateType,
  section: string
): AppStrings | undefined {
  return state.dgdataview.res ? state.dgdataview.res[section] : undefined;
}

export const getString = (res: AppStrings | undefined, key: string): string =>
  (res && res[key]) || key;
