import { AnyAction, Dispatch, Middleware } from 'redux';
import log from 'loglevel';
import {
  RegisterRouteType,
  RequestPluginRerenderType,
  CustomFrontendMessageType,
  SendThemeOptionsType,
  BroadcastSignOutType,
} from '../actions/actions.types';
import axios from 'axios';
import { MicroFrontendId } from '../../app.types';

const CancelToken = axios.CancelToken;
export let source = CancelToken.source();

const broadcastMessage = (action: AnyAction): void => {
  document.dispatchEvent(new CustomEvent(MicroFrontendId, { detail: action }));
};

type microFrontendMessageType = CustomEvent<AnyAction>;

export const listenToMessages = (dispatch: Dispatch): void => {
  document.addEventListener(MicroFrontendId, (event) => {
    const pluginMessage = event as microFrontendMessageType;

    if (
      pluginMessage.detail &&
      pluginMessage.detail.type &&
      (pluginMessage.detail.type.startsWith(CustomFrontendMessageType) ||
        pluginMessage.detail.type.startsWith('datagateway_common:api:'))
    ) {
      // this is a valid message, so process it
      switch (pluginMessage.detail.type) {
        // ignore messages not meant for this plugin
        case RequestPluginRerenderType:
        case RegisterRouteType:
        case SendThemeOptionsType:
        case BroadcastSignOutType:
          break;
        default:
          // log and ignore
          log.warn(
            `Unexpected message received, not dispatched:\nevent.detail = ${JSON.stringify(
              pluginMessage.detail
            )}`
          );
      }
    } else {
      log.error(
        `Invalid message received:\nevent.detail = ${JSON.stringify(
          pluginMessage.detail
        )}`
      );
    }
  });
};

const DGCommonMiddleware: Middleware = (() =>
  (next: Dispatch<AnyAction>) =>
  (action: AnyAction): AnyAction => {
    if (action.payload && action.payload.broadcast) {
      broadcastMessage(action);
    }
    if (action.type === '@@router/LOCATION_CHANGE') {
      source.cancel('Operation cancelled by user navigation');
      source = CancelToken.source();
    }

    return next(action);
  }) as Middleware;

export default DGCommonMiddleware;
