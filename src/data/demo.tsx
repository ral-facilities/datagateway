import { InvestigationData, DatasetData, DatafileData } from './types';

export const investigationDemoData: InvestigationData[] = [
  {
    ID: '1',
    TITLE: 'Test 1',
    VISIT_ID: 1,
    RB_NUMBER: '1',
    DOI: 'doi 1',
    SIZE: 1,
    INSTRUMENT: {
      NAME: 'LARMOR',
    },
    STARTDATE: new Date('2019-06-10'),
    ENDDATE: new Date('2019-06-11'),
  },
  {
    ID: '2',
    TITLE: 'Test 2',
    VISIT_ID: 2,
    RB_NUMBER: '2',
    DOI: 'doi 2',
    SIZE: 10000,
    INSTRUMENT: {
      NAME: 'LARMOR',
    },
    STARTDATE: new Date('2019-06-10'),
    ENDDATE: new Date('2019-06-12'),
  },
];

export const datasetDemoData: DatasetData[] = [
  {
    ID: '1',
    NAME: 'Test 2-1',
    SIZE: 1,
    CREATE_TIME: new Date('2019-06-10 00:00:00'),
    MOD_TIME: new Date('2019-06-10 00:00:00'),
  },
  {
    ID: '2',
    NAME: 'Test 2-2',
    SIZE: 9999,
    CREATE_TIME: new Date('2019-06-10 00:00:00'),
    MOD_TIME: new Date('2019-06-10 12:00:00'),
  },
];

export const datafileDemoData: DatafileData[] = [
  {
    ID: '1',
    NAME: 'Test 2-2-1',
    LOCATION: '/test1',
    SIZE: 500,
    MOD_TIME: new Date('2019-06-10 00:00:00'),
  },
  {
    ID: '2',
    LOCATION: '/test2',
    NAME: 'Test 2-2-2',
    SIZE: 9499,
    MOD_TIME: new Date('2019-06-10 12:00:00'),
  },
];

export const investigationDemoDataGenerator = (): InvestigationData[] => {
  return Array(1000)
    .fill(undefined)
    .map(() => ({
      ID: '1',
      TITLE: 'Test 1',
      VISIT_ID: 1,
      RB_NUMBER: '1',
      DOI: 'doi 1',
      SIZE: 1,
      INSTRUMENT: {
        NAME: 'LARMOR',
      },
      STARTDATE: new Date('2019-06-10'),
      ENDDATE: new Date('2019-06-11'),
    }));
};
