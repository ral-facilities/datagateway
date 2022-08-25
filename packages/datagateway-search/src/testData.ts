// Defines test data used for testing

import type { Dataset, Investigation } from 'datagateway-common';

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

export { mockDataset, mockInvestigation };
