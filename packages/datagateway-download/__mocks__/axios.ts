import axios from 'axios';

export default {
  get: jest.fn(path => {
    if (path.includes('/topcat/user/cart/')) {
      return Promise.resolve({ data: { cartItems: [] } });
    } else if (path === '/datagateway-download-settings.json') {
      return Promise.resolve({
        data: {
          facilityName: 'LILS',
          apiUrl: 'http://scigateway-preprod.esc.rl.ac.uk:5000',
          downloadApiUrl: 'https://scigateway-preprod.esc.rl.ac.uk:8181/topcat',
          idsUrl: 'https://scigateway-preprod.esc.rl.ac.uk:8181/ids',
          accessMethods: {
            https: {
              idsUrl: 'https://scigateway-preprod.esc.rl.ac.uk:8181/ids',
              displayName: 'HTTPS',
              description: 'Example description for HTTPS access method.',
            },
            globus: {
              idsUrl: 'https://scigateway-preprod.esc.rl.ac.uk:8181/ids',
              displayName: 'Globus',
              description: 'Example description for Globus access method.',
            },
          },
        },
      });
    } else {
      return Promise.resolve({ data: {} });
    }
  }),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  CancelToken: axios.CancelToken,
};
