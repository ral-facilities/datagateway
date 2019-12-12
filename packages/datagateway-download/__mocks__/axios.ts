export default {
  get: jest.fn(path => {
    if (path.includes('/topcat/user/cart/')) {
      return Promise.resolve({ data: { cartItems: [] } });
    } else {
      return Promise.resolve({ data: {} });
    }
  }),
};
