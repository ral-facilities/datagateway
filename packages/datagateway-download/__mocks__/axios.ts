import axios from 'axios';

export default {
  get: jest.fn(path => {
    if (path.includes('/topcat/user/cart/')) {
      return Promise.resolve({ data: { cartItems: [] } });
    } else {
      return Promise.resolve({ data: {} });
    }
  }),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  CancelToken: axios.CancelToken,
};
