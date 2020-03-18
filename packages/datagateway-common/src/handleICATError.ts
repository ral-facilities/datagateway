import { AxiosError } from 'axios';
import * as log from 'loglevel';
import {
  NotificationType,
  InvalidateTokenType,
} from './state/actions/actions.types';
import { MicroFrontendId } from './app.types';

const handleICATError = (
  error: AxiosError,
  broadcast: boolean = true
): void => {
  log.error(error.message);
  if (broadcast) {
    document.dispatchEvent(
      new CustomEvent(MicroFrontendId, {
        detail: {
          type: NotificationType,
          payload: {
            severity: 'error',
            message: error.message,
          },
        },
      })
    );
  }
  if (
    error.response &&
    error.response.status &&
    (error.response.status === 403 ||
      // TopCAT doesn't set 403 for session ID failure, so detect by looking at the message
      (error.response.data.message &&
        error.response.data.message.toUpperCase().includes('SESSION')))
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
