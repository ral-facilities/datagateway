import { AxiosError } from 'axios';

const retryICATErrors = (failureCount: number, error: AxiosError): boolean => {
  const message = error.response?.data.message ?? error.message;
  if (
    error.response?.status === 403 ||
    // TopCAT doesn't set 403 for session ID failure, so detect by looking at the message
    message.toUpperCase().includes('SESSION') ||
    failureCount >= 3
  )
    return false;
  return true;
};

export default retryICATErrors;
