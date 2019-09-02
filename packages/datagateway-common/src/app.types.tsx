// TODO: type entities properly
export interface Investigation {
  ID: number;
  TITLE: string;
  NAME: string;
  VISIT_ID: string;
  RB_NUMBER?: string;
  DOI?: string;
  STARTDATE?: string;
  ENDDATE?: string;
  SUMMARY?: string;
  INVESTIGATIONINSTRUMENT?: InvestigationInstrument[];
  SIZE?: number;
  DATASET_COUNT?: number;
  INVESTIGATIONUSER?: InvestigationUser[];
  SAMPLE?: Sample[];
  PUBLICATION?: Publication[];
}

export interface Dataset {
  ID: number;
  NAME: string;
  MOD_TIME: string;
  CREATE_TIME: string;
  INVESTIGATION_ID: number;
  DESCRIPTION?: string;
  STARTDATE?: string;
  ENDDATE?: string;
  SIZE?: number;
  DATAFILE_COUNT?: number;
  DATASETTYPE?: DatasetType;
}

export interface Datafile {
  ID: number;
  NAME: string;
  MOD_TIME: string;
  CREATE_TIME: string;
  DATASET_ID: number;
  FILESIZE?: number;
  LOCATION?: string;
  DESCRIPTION?: string;
}

export interface InvestigationInstrument {
  ID: number;
  INSTRUMENT_ID: number;
  INVESTIGATION_ID: number;
  INSTRUMENT?: Instrument;
  INVESTIGATION?: Investigation;
}

export interface Instrument {
  ID: number;
  NAME: string;
}

export interface InvestigationUser {
  ID: number;
  USER_ID: number;
  INVESTIGATION_ID: number;
  ROLE: string;
  USER_?: User;
  INVESTIGATION?: Investigation;
}

export interface User {
  ID: number;
  NAME: string;
  FULL_NAME?: string;
}

export interface Sample {
  ID: number;
  NAME: string;
  INVESTIGATION_ID: number;
}

export interface Publication {
  ID: number;
  FULL_REFERENCE: string;
}

export interface FacilityCycle {
  ID: number;
  NAME: string;
  DESCRIPTION?: string;
  STARTDATE?: string;
  ENDDATE?: string;
}

export interface DatasetType {
  ID: number;
  NAME: string;
  DESCRIPTION?: string;
}

export type Entity =
  | Investigation
  | Dataset
  | Datafile
  | Instrument
  | FacilityCycle;

// TODO: type this properly
export type Filter = string | number;

export type Order = 'asc' | 'desc';
