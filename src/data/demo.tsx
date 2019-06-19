import {
  InvestigationData,
  FoodData,
  DatafileData,
  DatasetData,
} from './types';

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
    ID: '1',
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
    NAME: 'Test 2-2-2',
    LOCATION: '/test2',
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

const foodData: [string, number, number, number, number][] = [
  ['Frozen yoghurt', 159, 6.0, 24, 4.0],
  ['Ice cream sandwich', 237, 9.0, 37, 4.3],
  ['Eclair', 262, 16.0, 24, 6.0],
  ['Cupcake', 305, 3.7, 67, 4.3],
  ['Gingerbread', 356, 16.0, 49, 3.9],
];

function createData(
  id: number,
  dessert: string,
  calories: number,
  fat: number,
  carbs: number,
  protein: number
): FoodData {
  return { id, dessert, calories, fat, carbs, protein };
}

export const foodDataDemoGenerator = (): FoodData[] => {
  let id = 0;

  const rows: FoodData[] = [];

  for (let i = 0; i < 200; i += 1) {
    const randomSelection =
      foodData[Math.floor(Math.random() * foodData.length)];
    rows.push(createData(id, ...randomSelection));
    id += 1;
  }

  return rows;
};
