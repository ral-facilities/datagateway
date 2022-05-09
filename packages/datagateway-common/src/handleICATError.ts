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
    let broadcastMessage = message;
    if (
      error.response?.status &&
      (error.response.status === 403 ||
        // TopCAT doesn't set 403 for session ID failure, so detect by looking at the message
        message.toUpperCase().includes('SESSION'))
    ) {
      broadcastMessage = 'Your session has expired, please reload the page';
    }
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
  if (
    error.response?.status &&
    (error.response.status === 403 ||
      // TopCAT doesn't set 403 for session ID failure, so detect by looking at the message
      message.toUpperCase().includes('SESSION'))
  ) {
    document.dispatchEvent(
      new CustomEvent(MicroFrontendId, {
        detail: {
          type: InvalidateTokenType,
        },
      })
    );
  }
};

export default handleICATError;
