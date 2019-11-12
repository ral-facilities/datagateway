import axios from 'axios';

export default {
  get: jest.fn(path => {
    if (path === '/datagateway-table-settings.json') {
      return Promise.resolve({
        data: {
          'ui-strings': '/res/default.json',
        },
      });
    } else {
      return Promise.resolve({
        data: {},
      });
    }
  }),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  CancelToken: axios.CancelToken,
};
