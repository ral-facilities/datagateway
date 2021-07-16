// TODO: move __mocks__ folder back to package root once facebook/create-react-app#7539 is fixed

import axios from 'axios';
import fs from 'fs';

var settings = JSON.parse(fs.readFileSync('server/e2e-settings.json', 'utf-8'));

const requests = {
  get: jest.fn((path) => {
    if (path.includes('/topcat/user/cart/')) {
      return Promise.resolve({ data: { cartItems: [] } });
    } else if (path === '/datagateway-download-settings.json') {
      return Promise.resolve({
        data: {
          facilityName: 'LILS',
          apiUrl: settings.apiUrl,
          downloadApiUrl: settings.downloadApiUrl,
          idsUrl: settings.idsUrl,
          fileCountMax: 5000,
          totalSizeMax: 1000000000000,
          accessMethods: {
            https: {
              idsUrl: settings.accessMethods.https.idsUrl,
              displayName: 'HTTPS',
              description: 'Example description for HTTPS access method.',
            },
            globus: {
              idsUrl: settings.accessMethods.globus.idsUrl,
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
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  CancelToken: axios.CancelToken,
};

export default requests;
