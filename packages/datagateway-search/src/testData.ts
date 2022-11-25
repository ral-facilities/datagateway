// Defines test data used for testing

import type { Dataset, Investigation } from 'datagateway-common';
import { SearchResponse } from 'datagateway-common';

const mockInvestigation: Investigation = {
  id: 1,
  name: 'Test investigation name',
  title: 'Test investigation title',
  visitId: '1',
};

const mockDataset: Dataset = {
  createTime: '',
  id: 1,
  modTime: '',
  name: 'Test dataset name',
};

const mockSearchResponses: SearchResponse[] = [
  {
    results: [
      {
        score: 1,
        id: 1,
        source: {
          id: 1,
          name: 'Datafile test name',
          location: '/datafiletest',
          fileSize: 1,
          date: 1563836400000,
          'dataset.id': 2,
          'dataset.name': 'Dataset test name',
          'investigation.id': 3,
          'investigation.title': 'Investigation test title',
          'investigation.name': 'Investigation test name',
          'investigation.startDate': 1560121200000, // 2019-06-09T23:00:00.000Z
          investigationinstrument: [
            {
              'instrument.id': 5,
              'instrument.name': 'LARMOR',
            },
          ],
        },
      },
      {
        id: 596,
        score: 269,
        source: {
          id: 749,
          name: 'source 1',
        },
      },
    ],
  },
  {
    results: [
      {
        id: 916,
        score: 160,
        source: {
          id: 143,
          name: 'source 3',
        },
      },
    ],
  },
  {},
];

export { mockDataset, mockInvestigation, mockSearchResponses };
