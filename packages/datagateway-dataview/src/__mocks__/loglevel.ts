// TODO: move __mocks__ folder back to package root once facebook/create-react-app#7539 is fixed

const logMock = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  trace: jest.fn(),
  debug: jest.fn(),
};

export default logMock;
