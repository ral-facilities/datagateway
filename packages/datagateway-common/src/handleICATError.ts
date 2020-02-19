import { AxiosError } from 'axios';
import * as log from 'loglevel';

const handleICATError = (
  error: AxiosError,
  broadcast: boolean = true
): void => {
  log.error(error.message);
  if (broadcast) {
    document.dispatchEvent(
      new CustomEvent('scigateway', {
        detail: {
          type: 'scigateway:api:notification',
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
      new CustomEvent('scigateway', {
        detail: {
          type: 'scigateway:api:invalidate_token',
        },
      })
    );
  }
};

export default handleICATError;
