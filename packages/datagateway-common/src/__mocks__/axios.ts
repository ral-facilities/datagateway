// TODO: move __mocks__ folder back to package root once facebook/create-react-app#7539 is fixed

import axios from 'axios';

const requests = {
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
  CancelToken: axios.CancelToken,
};

export default requests;
