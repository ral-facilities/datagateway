import axios from 'axios';

const requests = {
  get: vi.fn(() => Promise.resolve({ data: {} })),
  post: vi.fn(() => Promise.resolve({ data: {} })),
  delete: vi.fn(() => Promise.resolve({ data: {} })),
  CancelToken: axios.CancelToken,
  AxiosError: axios.AxiosError,
  isAxiosError: axios.isAxiosError,
};

export default requests;
