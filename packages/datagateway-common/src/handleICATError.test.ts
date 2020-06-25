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

  it('sends an invalidate token message to SciGateway on 403 response', () => {
    if (error.response) error.response.status = 403;
    handleICATError(error);

    expect(log.error).toHaveBeenCalledWith(
      'Test error message (response data)'
    );
    expect(events.length).toBe(2);
    expect(events[1].detail).toEqual({
      type: InvalidateTokenType,
    });
  });

  it('sends an invalidate token message to SciGateway on TopCAT authentication error', () => {
    if (error.response)
      error.response.data = {
        message: 'Unable to find user by sessionid: null',
      };
    handleICATError(error);

    expect(log.error).toHaveBeenCalledWith(
      'Unable to find user by sessionid: null'
    );
    expect(events.length).toBe(2);
    expect(events[1].detail).toEqual({
      type: InvalidateTokenType,
    });

    (log.error as jest.Mock).mockClear();
    events = [];

    if (error.response)
      error.response.data = {
        message: 'Session id:null has expired',
      };
    handleICATError(error);

    expect(log.error).toHaveBeenCalledWith('Session id:null has expired');
    expect(events.length).toBe(2);
    expect(events[1].detail).toEqual({
      type: InvalidateTokenType,
    });
  });
});
