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
  STUDYINVESTIGATION?: StudyInvestigation[];
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
  DATAFILEPARAMETER?: DatafileParameter[];
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
  FULLNAME?: string;
  DESCRIPTION?: string;
  TYPE?: string;
  URL?: string;
  INSTRUMENTSCIENTIST?: InstrumentScientist[];
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
  FULLREFERENCE: string;
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

interface StudyInvestigation {
  ID: number;
  STUDY_ID: number;
  INVESTIGATION_ID: number;
  STUDY?: Study;
  INVESTIGATION?: Investigation;
}

interface Study {
  ID: number;
  PID: string;
}

interface InstrumentScientist {
  ID: number;
  INSTRUMENT_ID: number;
  USER_ID: number;
  INSTRUMENT?: Instrument;
  USER_?: User;
}

interface DatafileParameter {
  ID: number;
  STRING_VALUE?: string;
  NUMERIC_VALUE?: number;
  DATETIME_VALUE?: string;
  RANGEBOTTOM?: number;
  RANGETOP?: number;
  DATAFILE_ID: number;
  PARAMETER_TYPE_ID: number;
  DATAFILE?: Datafile;
  PARAMETERTYPE: ParameterType;
}

interface ParameterType {
  ID: number;
  NAME: string;
  UNITS: string;
  VALUETYPE: string;
}

export interface DownloadCartItem {
  entityId: number;
  entityType: 'investigation' | 'dataset' | 'datafile';
  id: number;
  name: string;
  parentEntities: DownloadCartItem[];
}

export interface DownloadCart {
  cartItems: DownloadCartItem[];
  createdAt: string;
  facilityName: string;
  id: number;
  updatedAt: string;
  userName: string;
}

export type DownloadCartTableItem = DownloadCartItem & {
  size: number;
  [key: string]: string | number | DownloadCartItem[];
};

export type Entity =
  | Investigation
  | Dataset
  | Datafile
  | Instrument
  | FacilityCycle
  | DownloadCartTableItem;

// TODO: type this properly
export type Filter = string | number | { startDate?: string; endDate?: string };

export type Order = 'asc' | 'desc';

export interface DownloadCartItem {
  entityId: number;
  entityType: 'investigation' | 'dataset' | 'datafile';
  id: number;
  name: string;
  parentEntities: DownloadCartItem[];
}

export interface DownloadCart {
  cartItems: DownloadCartItem[];
  createdAt: string;
  facilityName: string;
  id: number;
  updatedAt: string;
  userName: string;
}
