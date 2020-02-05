import DaaasMiddleware, { listenToMessages } from './dgcommon.middleware';
import { AnyAction } from 'redux';
import configureStore, {
  MockStoreEnhanced,
  MockStoreCreator,
} from 'redux-mock-store';
import log from 'loglevel';
import {
  RequestPluginRerenderType,
  RegisterRouteType,
} from '../actions/actions.types';

describe('DGCommon middleware', () => {
  let events: CustomEvent<AnyAction>[] = [];
  let handler: (event: Event) => void;
  let store: MockStoreEnhanced;

  const action = {
    type: 'datagateway_common:api:test-action',
    payload: {
      broadcast: true,
    },
  };

  beforeEach(() => {
    events = [];
    handler = () => {};

    document.dispatchEvent = (e: Event) => {
      events.push(e as CustomEvent<AnyAction>);
      return true;
    };

    document.addEventListener = jest.fn(
      (id: string, inputHandler: (event: Event) => void) => {
        handler = inputHandler;
      }
    );

    const mockStore: MockStoreCreator = configureStore();
    store = mockStore({});
  });

  it('should broadcast messages with broadcast flag', () => {
    DaaasMiddleware(store)(store.dispatch)(action);

    expect(events.length).toEqual(1);
    expect(events[0].detail).toEqual(action);
  });

  it('should not broadcast messages without broadcast flag', () => {
    DaaasMiddleware(store)(store.dispatch)({ type: 'test', payload: {} });
    expect(events.length).toEqual(0);
  });

  it('should not broadcast messages without payload', () => {
    DaaasMiddleware(store)(store.dispatch)({ type: 'test' });
    expect(events.length).toEqual(0);
  });

  it('should handle plugin_rerender action and ignore it (it is handled in index.tsx)', () => {
    listenToMessages(store.dispatch);

    handler(
      new CustomEvent('test', { detail: { type: RequestPluginRerenderType } })
    );

    expect(document.addEventListener).toHaveBeenCalled();
    expect(store.getActions().length).toEqual(0);
  });

  it('should handle register_route action and ignore it', () => {
    listenToMessages(store.dispatch);

    handler(new CustomEvent('test', { detail: { type: RegisterRouteType } }));

    expect(document.addEventListener).toHaveBeenCalled();
    expect(store.getActions().length).toEqual(0);
  });

  it('should listen for events and not fire unrecognised action', () => {
    log.warn = jest.fn();
    listenToMessages(store.dispatch);

    handler(new CustomEvent('test', { detail: action }));

    expect(document.addEventListener).toHaveBeenCalled();
    expect(store.getActions().length).toEqual(0);

    expect(log.warn).toHaveBeenCalled();
    const mockLog = (log.warn as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toContain(
      'Unexpected message received, not dispatched'
    );
  });

  it('should not fire actions for events without detail', () => {
    log.error = jest.fn();

    listenToMessages(store.dispatch);

    handler(new CustomEvent('test', { detail: undefined }));

    expect(document.addEventListener).toHaveBeenCalled();
    expect(store.getActions().length).toEqual(0);

    expect(log.error).toHaveBeenCalled();
    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Invalid message received:\nevent.detail = null'
    );
  });

  it('should not fire actions for events without type on detail', () => {
    log.error = jest.fn();

    listenToMessages(store.dispatch);

    handler(new CustomEvent('test', { detail: { actionWithoutType: true } }));

    expect(document.addEventListener).toHaveBeenCalled();
    expect(store.getActions().length).toEqual(0);

    expect(log.error).toHaveBeenCalled();
    const mockLog = (log.error as jest.Mock).mock;
    expect(mockLog.calls[0][0]).toEqual(
      'Invalid message received:\nevent.detail = {"actionWithoutType":true}'
    );
  });
});
