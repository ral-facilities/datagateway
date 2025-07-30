import axios from 'axios';

const requests = {
  get: vi.fn((path) => {
    if (path.includes('/topcat/user/cart/')) {
      return Promise.resolve({ data: { cartItems: [] } });
    } else if (path === '/datagateway-download-settings.json') {
      return Promise.resolve({
        data: {
          facilityName: 'LILS',
          apiUrl: 'https://example.com/api',
          downloadApiUrl: 'https://example.com/downloadApi',
          idsUrl: 'https://example.com/ids',
          fileCountMax: 5000,
          totalSizeMax: 1000000000000,
          accessMethods: {
            https: {
              idsUrl: 'https://example.com/ids',
              displayName: 'HTTPS',
              description: 'Example description for HTTPS access method.',
            },
            globus: {
              idsUrl: 'https://example.com/ids',
              displayName: 'Globus',
              description: 'Example description for Globus access method.',
            },
          },
          routes: [
            {
              section: 'Test',
              link: '/download',
              displayName: 'Download',
              order: 0,
            },
          ],
        },
      });
    } else if (path.includes('/topcat/user/downloads')) {
      return Promise.resolve({ data: [] });
    } else {
      return Promise.resolve({ data: {} });
    }
  }),
  post: vi.fn(() => Promise.resolve({ data: {} })),
  put: vi.fn(() => Promise.resolve({ data: {} })),
  CancelToken: axios.CancelToken,
};

export default requests;
