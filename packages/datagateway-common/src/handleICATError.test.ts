import { AxiosError } from 'axios';
import * as log from 'loglevel';
import handleICATError from './handleICATError';
import { AnyAction } from 'redux';
import {
  NotificationType,
  InvalidateTokenType,
} from './state/actions/actions.types';

jest.mock('loglevel');

describe('handleICATError', () => {
  let error: AxiosError;
  let events: CustomEvent<AnyAction>[] = [];

  beforeEach(() => {
    events = [];

    document.dispatchEvent = (e: Event) => {
      events.push(e as CustomEvent<AnyAction>);
      return true;
    };

    error = {
      isAxiosError: true,
      config: {},
      response: {
        data: { message: 'Test error message (response data)' },
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        config: {},
      },
      name: 'Test error name',
      message: 'Test error message',
      toJSON: jest.fn(),
    };
  });

  it('logs an error and sends a notification to SciGateway', () => {
    handleICATError(error);

    expect(log.error).toHaveBeenCalledWith(
      'Test error message (response data)'
    );
    expect(events.length).toBe(1);
    expect(events[0].detail).toEqual({
      type: NotificationType,
      payload: {
        severity: 'error',
        message: 'Test error message (response data)',
      },
    });
  });

  it('logs fallback error.message if there is no response message', () => {
    error = {
      isAxiosError: true,
      config: {},
      response: {
        data: {},
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        config: {},
      },
      name: 'Test error name',
      message: 'Test error message',
      toJSON: jest.fn(),
    };

    handleICATError(error);

    expect(log.error).toHaveBeenCalledWith('Test error message');
    expect(events.length).toBe(1);
    expect(events[0].detail).toEqual({
      type: NotificationType,
      payload: {
        severity: 'error',
        message: 'Test error message',
      },
    });
  });

  it('just logs an error if broadcast is false', () => {
    handleICATError(error, false);

    expect(log.error).toHaveBeenCalledWith(
      'Test error message (response data)'
    );
    expect(events.length).toBe(0);
  });

  describe('sends messages to SciGateway on TopCAT authentication error', () => {
    const localStorageGetItemMock = jest.spyOn(
      window.localStorage.__proto__,
      'getItem'
    );

    afterAll(() => {
      jest.clearAllMocks();
    });

    describe('sends invalidate token message and notifies user to reload the page if autoLogin true', () => {
      beforeEach(() => {
        localStorageGetItemMock.mockImplementation(() => 'true');
      });

      afterEach(() => {
        jest.clearAllMocks();
      });

      it('if error code is 403', () => {
        error.response.status = 403;
        handleICATError(error);

        expect(log.error).toHaveBeenCalledWith(
          'Test error message (response data)'
        );
        expect(localStorage.getItem).toBeCalledWith('autoLogin');
        expect(events.length).toBe(2);
        expect(events[0].detail).toEqual({
          type: NotificationType,
          payload: {
            severity: 'error',
            message: 'Your session has expired, please reload the page',
          },
        });
        expect(events[1].detail).toEqual({
          type: InvalidateTokenType,
        });
      });

      it('if SESSION appears in error response', () => {
        error.response.data = {
          message: 'Unable to find user by sessionid: null',
        };
        handleICATError(error);

        expect(log.error).toHaveBeenCalledWith(
          'Unable to find user by sessionid: null'
        );
        expect(localStorage.getItem).toBeCalledWith('autoLogin');
        expect(events.length).toBe(2);
        expect(events[0].detail).toEqual({
          type: NotificationType,
          payload: {
            severity: 'error',
            message: 'Your session has expired, please reload the page',
          },
        });
        expect(events[1].detail).toEqual({
          type: InvalidateTokenType,
        });
      });
    });

    describe('sends invalidate token message and notifies user to login again if autoLogin false', () => {
      beforeEach(() => {
        localStorageGetItemMock.mockImplementation(() => 'false');
      });

      afterEach(() => {
        jest.clearAllMocks();
      });

      it('if error code is 403', () => {
        error.response.status = 403;
        handleICATError(error);

        expect(log.error).toHaveBeenCalledWith(
          'Test error message (response data)'
        );
        expect(localStorage.getItem).toBeCalledWith('autoLogin');
        expect(events.length).toBe(2);
        expect(events[0].detail).toEqual({
          type: NotificationType,
          payload: {
            severity: 'error',
            message: 'Your session has expired, please login again',
          },
        });
        expect(events[1].detail).toEqual({
          type: InvalidateTokenType,
        });
      });

      it('if SESSION appears in error response', () => {
        error.response.data = {
          message: 'Unable to find user by sessionid: null',
        };
        handleICATError(error);

        expect(log.error).toHaveBeenCalledWith(
          'Unable to find user by sessionid: null'
        );
        expect(localStorage.getItem).toBeCalledWith('autoLogin');
        expect(events.length).toBe(2);
        expect(events[0].detail).toEqual({
          type: NotificationType,
          payload: {
            severity: 'error',
            message: 'Your session has expired, please login again',
          },
        });
        expect(events[1].detail).toEqual({
          type: InvalidateTokenType,
        });
      });
    });
  });
});
