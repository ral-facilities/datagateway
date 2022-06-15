import { AxiosError } from 'axios';
import * as log from 'loglevel';
import {
  NotificationType,
  InvalidateTokenType,
} from './state/actions/actions.types';
import { MicroFrontendId } from './app.types';

const handleICATError = (error: AxiosError, broadcast = true): void => {
  const message = error.response?.data.message ?? error.message;
  log.error(message);
  if (broadcast) {
    if (
      // don't broadcast session invalidation errors directly as they may be fixed
      // by scigateway refreshing the session ID - instead pass the message payload
      // in the token invalidation event
      !(
        error.response?.status === 403 ||
        // TopCAT doesn't set 403 for session ID failure, so detect by looking at the message
        message.toUpperCase().includes('SESSION')
      )
    ) {
      let broadcastMessage = message;
      // no reponse so it's a network error
      if (!error.response)
        broadcastMessage =
          'Network Error, please reload the page or try again later';
      document.dispatchEvent(
        new CustomEvent(MicroFrontendId, {
          detail: {
            type: NotificationType,
            payload: {
              severity: 'error',
              message: broadcastMessage,
            },
          },
        })
      );
    }
  }
  if (
    error.response?.status === 403 ||
    // TopCAT doesn't set 403 for session ID failure, so detect by looking at the message
    message.toUpperCase().includes('SESSION')
  ) {
    document.dispatchEvent(
      new CustomEvent(MicroFrontendId, {
        detail: {
          type: InvalidateTokenType,
          ...(broadcast
            ? {
                payload: {
                  severity: 'error',
                  message:
                    localStorage.getItem('autoLogin') === 'true'
                      ? 'Your session has expired, please reload the page'
                      : 'Your session has expired, please login again',
                },
              }
            : {}),
        },
      })
    );
  }
};

export default handleICATError;
