import type {
  Datafile,
  Dataset,
  FacilityCycle,
  Investigation,
} from './app.types';

export const mockApiUrl = 'https://example.com/api';
export const mockFacilityName = 'LILS';
export const mockFacilityCycles: FacilityCycle[] = [
  {
    id: 12938,
    name: 'studio toughness',
    description: 'He decided water-skiing on a frozen lake wasn’t a good idea.',
    startDate: '2006-01-20T16:30:17Z',
    endDate: '2007-01-20T16:30:17Z',
  },
  {
    id: 402,
    name: 'within cell interlinked',
    description: 'He waited for the stop sign to turn to a go sign.',
    startDate: '2017-03-17T14:03:11Z',
    endDate: '2020-11-29T05:41:54Z',
  },
];

export const mockInvestigations: Investigation[] = [
  {
    id: 58,
    title: 'Happiness can be found in the depths of chocolate pudding.',
    name: 'investigation news',
    visitId: 'CqJN',
    startDate: '2018-03-09T08:19:55Z',
    endDate: '2018-03-29T08:19:55Z',
    investigationInstruments: [
      {
        id: 446,
        instrument: {
          id: 937,
          name: 'instrument fame',
        },
      },
    ],
  },
  {
    id: 993,
    title: 'I ate a sock because people on the Internet told me to.',
    name: 'investigation inn',
    visitId: 'z0bLi1f3',
    startDate: '2019-08-08T22:27:07Z',
    endDate: '2019-09-08T22:27:07Z',
    investigationInstruments: [
      {
        id: 262,
        instrument: {
          id: 927,
          name: 'instrument case',
        },
      },
    ],
  },
];

export const mockDatasets: Dataset[] = [
  {
    id: 856,
    name: 'dataset modern',
    investigation: mockInvestigations[0],
    createTime: '2018-03-10T08:19:55Z',
    modTime: '2018-03-10T09:19:55Z',
  },
  {
    id: 535,
    name: 'dataset lazy',
    investigation: mockInvestigations[1],
    createTime: '2019-09-01T22:27:07Z',
    modTime: '2019-09-02T22:27:07Z',
  },
];

export const mockDatafiles: Datafile[] = [
  {
    id: 70,
    name: 'datafile weekend',
    modTime: '2018-03-10T08:19:55Z',
    createTime: '2018-03-10T08:19:55Z',
    dataset: mockDatasets[0],
  },
];
