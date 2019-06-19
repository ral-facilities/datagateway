export interface InvestigationData {
  ID: string;
  TITLE: string;
  VISIT_ID: number;
  RB_NUMBER: string;
  DOI: string;
  SIZE: number;
  INSTRUMENT: { NAME: string };
  STARTDATE: Date;
  ENDDATE: Date;
  [key: string]: string | number | Date | { NAME: string };
}

export interface DatasetData {
  ID: string;
  NAME: string;
  SIZE: number;
  CREATE_TIME: Date;
  MOD_TIME: Date;
  [key: string]: string | number | Date;
}

export interface DatafileData {
  ID: string;
  NAME: string;
  LOCATION: string;
  SIZE: number;
  MOD_TIME: Date;
  [key: string]: string | number | Date;
}

export interface FoodData {
  id: number;
  dessert: string;
  calories: number;
  fat: number;
  carbs: number;
  protein: number;
  [key: string]: string | number;
}

export type EntityType =
  | InvestigationData
  | DatasetData
  | DatafileData
  | FoodData;
