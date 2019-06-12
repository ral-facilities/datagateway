export interface InvestigationData {
  title: string;
  visitId: number;
  rBNumber: string;
  doi: string;
  size: number;
  instrument: string;
  startDate: Date;
  endDate: Date;
}

export interface DatasetData {
  name: string;
  size: number;
  createTime: Date;
  modTime: Date;
}

export interface DatafileData {
  name: string;
  location: string;
  size: number;
  modTime: Date;
}

export type EntityType = InvestigationData | DatasetData | DatafileData;
