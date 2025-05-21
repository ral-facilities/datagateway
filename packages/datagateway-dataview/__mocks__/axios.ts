import axios from 'axios';

const requests = {
  get: vi.fn((path) => {
    if (path === '/datagateway-dataview-settings.json') {
      return Promise.resolve({
        data: {
          facilityName: 'Generic',
          idsUrl: 'ids',
          apiUrl: 'api',
          downloadApiUrl: 'download',
          'ui-strings': '/res/default.json',
        },
      });
    } else {
      return Promise.resolve({
        data: {},
      });
    }
  }),
  post: vi.fn(() => Promise.resolve({ data: {} })),
  delete: vi.fn(() => Promise.resolve({ data: {} })),
  CancelToken: axios.CancelToken,
  isAxiosError: axios.isAxiosError,
};

export default requests;
