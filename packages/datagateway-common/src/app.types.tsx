// Parent app name and token in localstorage.
export const MicroFrontendId = 'scigateway';
export const MicroFrontendToken = `${MicroFrontendId}:token`;

// TODO: type entities properly; DownloadCartItem does not
//       include string indexing due to DownloadCartTableItem
export interface Investigation {
  id: number;
  title: string;
  name: string;
  visitId: string;
  RB_NUMBER?: string;
  doi?: string;
  startDate?: string;
  endDate?: string;
  summary?: string;
  investigationInstruments?: InvestigationInstrument[];
  size?: number;
  datasetCount?: number;
  investigationUsers?: InvestigationUser[];
  samples?: Sample[];
  publications?: Publication[];
  studyInvestigations?: StudyInvestigation[];
  facility?: Facility;
}

export interface Dataset {
  id: number;
  name: string;
  modTime: string;
  createTime: string;
  INVESTIGATION_ID: number;
  description?: string;
  startDate?: string;
  endDate?: string;
  size?: number;
  datafileCount?: number;
  DATASETTYPE?: DatasetType;
}

export interface Datafile {
  id: number;
  name: string;
  modTime: string;
  createTime: string;
  dataset: number;
  fileSize?: number;
  location?: string;
  description?: string;
  // TODO - this will change in API ICAT backend
  datafileParameters?: DatafileParameter[];
}

export interface InvestigationInstrument {
  id: number;
  INSTRUMENT_ID: number;
  INVESTIGATION_ID: number;
  // TODO - Got to here
  instrument?: Instrument;
  investigation?: Investigation;
}

export interface Instrument {
  id: number;
  name: string;
  fullName?: string;
  description?: string;
  type?: string;
  url?: string;
  instrumentScientists?: InstrumentScientist[];
  // TODO - these will have the same variable name now
  FACILITY_ID: number;
  facility?: Facility;
}

export interface InvestigationUser {
  id: number;
  USER_ID: number;
  INVESTIGATION_ID: number;
  role: string;
  user?: User;
  investigation?: Investigation;
}

export interface User {
  id: number;
  name: string;
  fullName?: string;
}

export interface Sample {
  id: number;
  name: string;
  INVESTIGATION_ID: number;
}

export interface Publication {
  id: number;
  fullReference: string;
}

export interface FacilityCycle {
  id: number;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  FACILITY_ID: number;
  facility?: Facility;
}

export interface DatasetType {
  id: number;
  name: string;
  description?: string;
}

export interface StudyInvestigation {
  id: number;
  STUDY_ID: number;
  INVESTIGATION_ID: number;
  study: Study;
  // TODO - I left some of the search results 'unreplaced'
  investigation?: Investigation;
}

interface Study {
  id: number;
  PID: string;
  name: string;
  modTime: string;
  createTime: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

interface InstrumentScientist {
  id: number;
  INSTRUMENT_ID: number;
  USER_ID: number;
  instrument?: Instrument;
  user?: User;
}

interface DatafileParameter {
  id: number;
  stringValue?: string;
  numericValue?: number;
  dateTimeValue?: string;
  rangeBottom?: number;
  rangeTop?: number;
  DATAFILE_ID: number;
  PARAMETER_TYPE_ID: number;
  datafile?: Datafile;
  PARAMETERTYPE: ParameterType;
}

interface ParameterType {
  id: number;
  name: string;
  units: string;
  valueType: string;
}

interface Facility {
  id: number;
  name: string;
  fullName?: string;
  url?: string;
  description?: string;
  daysUntilRelease?: number;
  facilityCycles?: FacilityCycle[];
}

export interface DownloadCartItem {
  entityId: number;
  entityType: 'investigation' | 'dataset' | 'datafile';
  id: number;
  name: string;
  parentEntities: DownloadCartItem[];
}

export interface DownloadItem {
  entityId: number;
  entityType: 'investigation' | 'dataset' | 'datafile';
  id: number;
}

export interface DownloadCart {
  cartItems: DownloadCartItem[];
  createdAt: string;
  facilityName: string;
  id: number;
  updatedAt: string;
  userName: string;
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
  | FacilityCycle
  | StudyInvestigation;

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
  'study',
];

// TODO: type these properly
export interface DateFilter {
  startDate?: string;
  endDate?: string;
}
export type Filter = string | string[] | number | DateFilter;

export type Order = 'asc' | 'desc';

export interface FiltersType {
  [column: string]: Filter;
}

export interface SortType {
  [column: string]: Order;
}
