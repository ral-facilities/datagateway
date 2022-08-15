import { Datafile } from 'datagateway-common';

const mockDatafile: Datafile = {
  createTime: '',
  dataset: undefined,
  description: 'test description',
  fileSize: 100,
  id: 0,
  location: 'test location',
  modTime: '',
  name: 'Datafile.txt',
  parameters: [],
};

const mockTxtFileContent = `First line
Second line
Third line
`;

export { mockDatafile, mockTxtFileContent };
