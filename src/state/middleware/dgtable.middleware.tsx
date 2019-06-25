import { AnyAction, Dispatch, Middleware } from 'redux';
import log from 'loglevel';
import { render } from '../../index';

const microFrontendMessageId = 'daaas-frontend';

const broadcastMessage = (action: AnyAction): void => {
  document.dispatchEvent(
    new CustomEvent(microFrontendMessageId, { detail: action })
  );
};

type microFrontendMessageType = CustomEvent<AnyAction>;

export const listenToMessages = (dispatch: Dispatch): void => {
  document.addEventListener(microFrontendMessageId, event => {
    const pluginMessage = event as microFrontendMessageType;

    if (
      pluginMessage.detail &&
      pluginMessage.detail.type &&
      (pluginMessage.detail.type.startsWith('daaas:api:') ||
        pluginMessage.detail.type.startsWith('datagateway_table:api:'))
    ) {
      // this is a valid message, so process it
      switch (pluginMessage.detail.type) {
        case 'daaas:api:plugin_rerender':
          render();
          break;

        default:
          // log and ignore
          log.warn(
            `Unexpected message received from, not dispatched:\nevent.detail = ${JSON.stringify(
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

const DGTableMiddleware: Middleware = (() => (next: Dispatch<AnyAction>) => (
  action: AnyAction
): AnyAction => {
  if (action.payload && action.payload.broadcast) {
    broadcastMessage(action);
  }

  return next(action);
}) as Middleware;

export default DGTableMiddleware;
