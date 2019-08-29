// TODO: type entities properly
export interface Investigation {
  ID: number;
  TITLE: string;
  NAME: string;
  VISIT_ID: string;
  RB_NUMBER: string;
  DOI: string;
  SIZE: number;
  INVESTIGATIONINSTRUMENT: InvestigationInstrument[];
  STARTDATE: string;
  ENDDATE: string;
  DESCRIPTION: string;
  DATASET_COUNT?: number;
  INVESTIGATIONUSER?: InvestigationUser[];
  INVESTIGATIONSAMPLE?: InvestigationSample[];
  PUBLICATION?: Publication[];
}

export interface Dataset {
  ID: number;
  NAME: string;
  MOD_TIME: string;
  CREATE_TIME: string;
  INVESTIGATION_ID: number;
  DATAFILE_COUNT?: number;
}

export interface Datafile {
  ID: number;
  NAME: string;
  LOCATION: string;
  SIZE: number;
  MOD_TIME: string;
  DATASET_ID: number;
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
  FULL_NAME: string;
}

export interface InvestigationSample {
  ID: number;
  SAMPLE_ID: number;
  INVESTIGATION_ID: number;
  SAMPLE?: Sample;
  INVESTIGATION?: Investigation;
}

export interface Sample {
  ID: number;
  NAME: string;
}

export interface Publication {
  ID: number;
  FULL_REFERENCE: string;
}

export interface FacilityCycle {
  ID: number;
  NAME: string;
  DESCRIPTION: string;
  STARTDATE: string;
  ENDDATE: string;
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
