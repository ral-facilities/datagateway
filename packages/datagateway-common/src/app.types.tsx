// TODO: type entities properly; DownloadCartItem does not
//       include string indexing due to DownloadCartTableItem
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
  FACILITY?: Facility;

  // [key: string]:
  //   | string
  //   | number
  //   | InvestigationInstrument[]
  //   | InvestigationUser[]
  //   | Sample[]
  //   | Publication[]
  //   | StudyInvestigation[]
  //   | Facility
  //   | undefined;
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

  // [key: string]: number | string | DatasetType | undefined;
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

  // [key: string]: number | string | DatafileParameter[] | undefined;
}

export interface InvestigationInstrument {
  ID: number;
  INSTRUMENT_ID: number;
  INVESTIGATION_ID: number;
  INSTRUMENT?: Instrument;
  INVESTIGATION?: Investigation;

  // [key: string]: number | Instrument | Investigation | undefined;
}

export interface Instrument {
  ID: number;
  NAME: string;
  FULLNAME?: string;
  DESCRIPTION?: string;
  TYPE?: string;
  URL?: string;
  INSTRUMENTSCIENTIST?: InstrumentScientist[];
  FACILITY_ID: number;
  FACILITY?: Facility;

  // [key: string]: number | string | InstrumentScientist[] | Facility | undefined;
}

export interface InvestigationUser {
  ID: number;
  USER_ID: number;
  INVESTIGATION_ID: number;
  ROLE: string;
  USER_?: User;
  INVESTIGATION?: Investigation;

  // [key: string]: number | string | User | Investigation | undefined;
}

export interface User {
  ID: number;
  NAME: string;
  FULL_NAME?: string;

  // [key: string]: number | string | undefined;
}

export interface Sample {
  ID: number;
  NAME: string;
  INVESTIGATION_ID: number;

  // [key: string]: number | string;
}

export interface Publication {
  ID: number;
  FULLREFERENCE: string;

  // [key: string]: number | string;
}

export interface FacilityCycle {
  ID: number;
  NAME: string;
  DESCRIPTION?: string;
  STARTDATE?: string;
  ENDDATE?: string;
  FACILITY_ID: number;
  FACILITY?: Facility;

  // [key: string]: number | string | Facility | undefined;
}

export interface DatasetType {
  ID: number;
  NAME: string;
  DESCRIPTION?: string;

  // [key: string]: number | string | undefined;
}

interface StudyInvestigation {
  ID: number;
  STUDY_ID: number;
  INVESTIGATION_ID: number;
  STUDY?: Study;
  INVESTIGATION?: Investigation;

  // [key: string]: number | string | Study | Investigation | undefined;
}

interface Study {
  ID: number;
  PID: string;

  // [key: string]: number | string;
}

interface InstrumentScientist {
  ID: number;
  INSTRUMENT_ID: number;
  USER_ID: number;
  INSTRUMENT?: Instrument;
  USER_?: User;

  // [key: string]: number | string | Instrument | User | undefined;
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

  // [key: string]: number | string | Datafile | ParameterType | undefined;
}

interface ParameterType {
  ID: number;
  NAME: string;
  UNITS: string;
  VALUETYPE: string;

  // [key: string]: number | string;
}

interface Facility {
  ID: number;
  NAME: string;
  FULLNAME?: string;
  URL?: string;
  DESCRIPTION?: string;
  DAYSUNTILRELEASE?: number;
  FACILITYCYCLE?: FacilityCycle[];

  // [key: string]: number | string | FacilityCycle[] | undefined;
}

export interface DownloadCartItem {
  entityId: number;
  entityType: 'investigation' | 'dataset' | 'datafile';
  id: number;
  name: string;
  parentEntities: DownloadCartItem[];

  // [key: string]: number | string | DownloadCartItem[];
}

export interface DownloadItem {
  entityId: number;
  entityType: 'investigation' | 'dataset' | 'datafile';
  id: number;

  // [key: string]: number | string;
}

export interface DownloadCart {
  cartItems: DownloadCartItem[];
  createdAt: string;
  facilityName: string;
  id: number;
  updatedAt: string;
  userName: string;

  [key: string]: number | string | DownloadCartItem[];
}

export interface Download {
  createdAt: string;
  downloadItems: DownloadItem[];
  facilityName: string;
  fileName: string;
  fullName: string;
  id: number;
  isDeleted: boolean;
  isEmailSent: boolean;
  isTwoLevel: boolean;
  preparedId: string;
  sessionId: string;
  size: number;
  status: 'PREPARING' | 'RESTORING' | 'PAUSED' | 'COMPLETE' | 'EXPIRED';
  transport: string;
  userName: string;
  email?: string;

  [key: string]: string | number | boolean | DownloadItem[] | undefined;
}

export interface SubmitCart {
  cartItems: DownloadCartItem[];
  facilityName: string;
  downloadId: number;
  userName: string;

  // [key: string]: number | string | DownloadCartItem[];
}

export type DownloadCartTableItem = DownloadCartItem & {
  size: number;
  [key: string]: string | number | DownloadCartItem[];
};

export type ICATEntity =
  | Investigation
  | Dataset
  | Datafile
  | Instrument
  | FacilityCycle;

export type Entity = (ICATEntity | DownloadCartTableItem | Download) & {
  // We will have to ignore the any typing here to access
  // Entity attributes with string indexing.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export const EntityTypes: string[] = [
  'investigation',
  'dataset',
  'datafile',
  'facilityCycle',
  'instrument',
  'facility',
];

// TODO: type this properly
export type Filter = string | number | { startDate?: string; endDate?: string };

export type Order = 'asc' | 'desc';
