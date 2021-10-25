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
  doi?: string;
  startDate?: string;
  endDate?: string;
  releaseDate?: string;
  summary?: string;
  investigationInstruments?: InvestigationInstrument[];
  size?: number;
  datasetCount?: number;
  investigationUsers?: InvestigationUser[];
  samples?: Sample[];
  publications?: Publication[];
  studyInvestigations?: StudyInvestigation[];
  facility?: Facility;
  datasets?: Dataset[];
  type?: InvestigationType;
}

export interface Dataset {
  id: number;
  name: string;
  modTime: string;
  createTime: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  doi?: string;
  complete?: boolean;
  location?: string;
  size?: number;
  datafileCount?: number;
  investigation?: Investigation;
  type?: DatasetType;
}

export interface Datafile {
  id: number;
  name: string;
  modTime: string;
  createTime: string;
  fileSize?: number;
  location?: string;
  description?: string;
  parameters?: DatafileParameter[];
  dataset?: Dataset;
}

export interface InvestigationInstrument {
  id: number;
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
  facility?: Facility;
}

export interface InvestigationUser {
  id: number;
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
  facility?: Facility;
}

export interface DatasetType {
  id: number;
  name: string;
  description?: string;
}

export interface InvestigationType {
  id: number;
  name: string;
  description?: string;
}

export interface StudyInvestigation {
  id: number;
  study: Study;
  investigation: Investigation;
}

export interface Study {
  id: number;
  pid: string;
  name: string;
  modTime: string;
  createTime: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  studyInvestigations?: StudyInvestigation[];
}

interface InstrumentScientist {
  id: number;
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
  datafile?: Datafile;
  type: ParameterType;
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

export interface FormattedDownload
  extends Omit<Download, 'status' | 'isDeleted'> {
  isDeleted: string;
  status: string;
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
  | StudyInvestigation
  | Study;

export type Entity = (
  | ICATEntity
  | DownloadCartTableItem
  | Download
  | FormattedDownload
) & {
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

export interface TextFilter {
  value?: string | number;
  type: string;
}

export type Filter = string[] | TextFilter | DateFilter;

export type Order = 'asc' | 'desc';

export interface FiltersType {
  [column: string]: Filter;
}

export type AdditionalFilters = {
  filterType: string;
  filterValue: string;
}[];

export interface SortType {
  [column: string]: Order;
}

export type ViewsType = 'table' | 'card' | null;

export interface QueryParams {
  sort: SortType;
  filters: FiltersType;
  view: ViewsType;
  search: string | null;
  page: number | null;
  results: number | null;
  searchText: string | null;
  dataset: boolean | null;
  datafile: boolean | null;
  investigation: boolean | null;
  startDate: Date | null;
  endDate: Date | null;
}
