import { AxiosError } from 'axios';
import { useQueryClient } from 'react-query';

const createRetryICATErrors = (
  retries: number
): ((failureCount: number, error: AxiosError) => boolean) => {
  return (failureCount: number, error: AxiosError) =>
    baseRetryICATErrors(failureCount, error, retries);
};

const baseRetryICATErrors = (
  failureCount: number,
  error: AxiosError,
  retries: number
): boolean => {
  const message =
    (error as AxiosError<{ message?: string }>).response?.data?.message ??
    error.message;
  if (
    error.response?.status === 403 ||
    // TopCAT doesn't set 403 for session ID failure, so detect by looking at the message
    message.toUpperCase().includes('SESSION') ||
    failureCount >= retries
  )
    return false;
  return true;
};

export const useRetryICATErrors = (): ((
  failureCount: number,
  error: AxiosError
) => boolean) => {
  const queryClient = useQueryClient();
  const opts = queryClient.getDefaultOptions();

  const retries =
    typeof opts.queries?.retry === 'number'
      ? opts.queries.retry
      : // explicitly handle boolean case as we set this in tests
      opts.queries?.retry === false
      ? 0
      : 3;

  return createRetryICATErrors(retries);
};
