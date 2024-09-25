import { AxiosError } from 'axios';
import { useQueryClient } from 'react-query';

export const createRetryICATErrors = (
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

const useRetryICATErrors = (): ((
  failureCount: number,
  error: AxiosError
) => boolean) => {
  const queryClient = useQueryClient();
  const opts = queryClient.getDefaultOptions();
  // TODO: do we want to be more elegant in handling other types of retry...
  const retries =
    typeof opts.queries?.retry === 'number' ? opts.queries.retry : 3;

  return createRetryICATErrors(retries);
};

export { useRetryICATErrors };
