// This file contains mock data for testing datafile preview functionality.

import type { Datafile } from 'datagateway-common';

const mockDatafile: Datafile = {
  createTime: '2020-01-01',
  dataset: undefined,
  description: 'test description',
  fileSize: 100,
  id: 123,
  location: 'test location',
  modTime: '2020-01-02',
  name: 'Datafile.txt',
  parameters: [],
};

const mockTxtFileContent = `First line
Second line
Third line
`;

export { mockDatafile, mockTxtFileContent };
