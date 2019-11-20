export interface Config {
  [matchEntity: string]: {
    replaceEntity: string;
    replaceEntityField: string;
  };
}
