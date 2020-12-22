import { readSciGatewayToken } from './parseTokens';

describe('readSciGatewayToken', () => {
  const localStorageGetItemMock = jest.spyOn(
    window.localStorage.__proto__,
    'getItem'
  );

  it('should read token from localstorage and parse the JWT', () => {
    localStorageGetItemMock.mockImplementationOnce(
      () =>
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uSWQiOiJ0ZXN0IiwidXNlcm5hbWUiOiLFgcO0w7zDrXPDqCJ9.nvE928aMiDdQk-G20Md7p2K6dEQ7JY2m2o6EMdz3wnw'
    );
    const result = readSciGatewayToken();
    expect(result).toEqual({ sessionId: 'test', username: 'Łôüísè' });
  });

  it("should return nulls if token doesn't contain session id or username fields", () => {
    localStorageGetItemMock.mockImplementationOnce(
      () =>
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZXN0IjoidGVzdCJ9.YMHLrDnDXLh13W2VajRFRY8bUwHjr8dzHzVeA-Cek8Y'
    );
    const result = readSciGatewayToken();
    expect(result).toEqual({ sessionId: null, username: 1 });
  });

  it("should return nulls if token doesn't exist", () => {
    localStorageGetItemMock.mockImplementationOnce(() => null);
    const result = readSciGatewayToken();
    expect(result).toEqual({ sessionId: null, username: null });
  });
});
