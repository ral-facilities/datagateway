// Parent app name and token in localstorage.
export const MicroFrontendId = 'scigateway';
export const MicroFrontendToken = `${MicroFrontendId}:token`;

export const FACILITY_NAME = {
  isis: 'isis',
  dls: 'dls',

  /**
   * Used for test ICATs.
   */
  lils: 'LILS',
} as const;

export type FacilityName = typeof FACILITY_NAME[keyof typeof FACILITY_NAME];

// TODO: type entities properly; DownloadCartItem does not
//       include string indexing due to DownloadCartTableItem
export interface Investigation {
  id: number;
  title: string;
  name: string;
  visitId: string;
  fileSize?: number;
  fileCount?: number;
  doi?: string;
  startDate?: string;
  endDate?: string;
  releaseDate?: string;
  summary?: string;
  investigationInstruments?: InvestigationInstrument[];
  dataCollectionInvestigations?: DataCollectionInvestigation[];
  investigationFacilityCycles?: InvestigationFacilityCycle[];
  investigationUsers?: InvestigationUser[];
  samples?: Sample[];
  parameters?: DatafileParameter[];
  publications?: Publication[];
  facility?: Facility;
  datasets?: Dataset[];
  type?: InvestigationType;
}

export interface Dataset {
  id: number;
  name: string;
  modTime: string;
  createTime: string;
  fileSize?: number;
  fileCount?: number;
  description?: string;
  startDate?: string;
  endDate?: string;
  doi?: string;
  complete?: boolean;
  location?: string;
  investigation?: Investigation;
  type?: DatasetType;
}

export interface Datafile {
  id: number;
  name: string;
  modTime: string;
  createTime: string;
  datafileModTime?: string;
  datafileCreateTime?: string;
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
  email?: string;
  affiliation?: string;
}

export interface Sample {
  id: number;
  name: string;
  type?: SampleType;
}

interface SampleType {
  name: string;
}

export interface Publication {
  id: number;
  fullReference: string;
}

export interface InvestigationFacilityCycle {
  id: number;
  investigation?: Investigation;
  facilityCycle?: FacilityCycle;
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

export interface DataCollectionDatafile {
  id: number;
  datafile: Datafile;
}

export interface DataCollectionDataset {
  id: number;
  dataset: Dataset;
}

export interface DataCollectionInvestigation {
  id: number;
  dataCollection?: DataCollection;
  investigation?: Investigation;
}

export interface DataCollection {
  id: number;
  dataCollectionInvestigations?: DataCollectionInvestigation[];
  dataCollectionDatasets?: DataCollectionDataset[];
  dataCollectionDatafiles?: DataCollectionDatafile[];
  dataPublications?: DataPublication[];
}

export interface DataPublicationUser {
  id: number;
  contributorType: string;
  fullName: string;
}

export interface DataPublicationType {
  id: number;
  name: string;
}

export interface DataPublication {
  id: number;
  pid: string;
  title: string;
  facility?: Facility;
  description?: string;
  publicationDate?: string;
  users?: DataPublicationUser[];
  content?: DataCollection;
  type?: DataPublicationType;
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
  valueType: 'NUMERIC' | 'STRING' | 'DATE_AND_TIME';
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

export type DownloadStatus =
  | 'PREPARING'
  | 'RESTORING'
  | 'PAUSED'
  | 'COMPLETE'
  | 'EXPIRED'
  | 'QUEUED';

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
  preparedId?: string;
  sessionId: string;
  size: number;
  status: DownloadStatus;
  transport: string;
  userName: string;
  email?: string;
}

export interface FormattedDownload extends Download {
  /**
   * User-facing label of {@link Download.isDeleted}
   */
  formattedIsDeleted: string;

  /**
   * User-facing label of {@link Download.status}
   */
  formattedStatus: string;

  [key: string]: string | number | boolean | DownloadItem[] | undefined;
}

export interface SubmitCart {
  cartItems: DownloadCartItem[];
  facilityName: string;
  downloadId?: number;
  userName: string;
}

export type DownloadCartTableItem = DownloadCartItem & {
  size: number;
  fileCount: number;
  [key: string]: string | number | DownloadCartItem[];
};

export interface SearchInstrumentSource {
  'instrument.id': number;
  'instrument.name': string;
  'instrument.fullName'?: string;
}

export interface SearchFacilityCycleSource {
  'facilityCycle.id': number;
}

export interface SearchResultSource {
  id: number;
  name: string;
  title?: string;
  visitId?: string;
  doi?: string;
  startDate?: number;
  endDate?: number;
  date?: number;
  summary?: string;
  location?: string;
  investigationinstrument?: SearchInstrumentSource[];
  investigationfacilitycycle?: SearchFacilityCycleSource[];
  fileSize?: number;
  fileCount?: number;
  'dataset.id'?: number;
  'dataset.name'?: string;
  'investigation.id'?: number;
  'investigation.name'?: string;
  'investigation.title'?: string;
  'investigation.startDate'?: number;
  'facility.name'?: string;
  'facility.id'?: number;
}

export type ICATEntity =
  | Investigation
  | Dataset
  | Datafile
  | Instrument
  | FacilityCycle
  | DataPublication;

export type Entity = (
  | ICATEntity
  | DownloadCartTableItem
  | Download
  | FormattedDownload
  | SearchResultSource
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
  'dataPublication',
];

// TODO: type these properly
export interface DateFilter {
  startDate?: string;
  endDate?: string;
}

export interface TextFilter {
  value?: string | number;
  type: 'include' | 'exclude' | 'exact';
}

export interface RangeFilter {
  field: string;
  from?: number;
  to?: number;
  key?: string;
  units?: string;
}

export interface TermFilter {
  field: string;
  value: string;
}

export interface NestedFilter {
  key: string;
  label: string;
  filter: SearchFilter[];
}

export type SearchFilter = NestedFilter | RangeFilter | TermFilter | string;

export type Filter = SearchFilter[] | TextFilter | DateFilter;

export type Order = 'asc' | 'desc';

export type UpdateMethod = 'push' | 'replace';

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
  dataset: boolean;
  datafile: boolean;
  investigation: boolean;
  startDate: Date | null;
  endDate: Date | null;
  currentTab: string;
  restrict: boolean;
}

/**
 * Describes the status of a download type.
 */
export interface DownloadTypeStatus {
  type: string;
  disabled: boolean;
  message: string;
}

export interface DownloadSettingsAccessMethod {
  [type: string]: {
    idsUrl: string;
    displayName?: string;
    description?: string;
  };
}
