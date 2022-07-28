import { Box, LinearProgress, Typography } from '@mui/material';
import React from 'react';
import {
  useDownload,
  useDownloadPercentageComplete,
} from '../downloadApiHooks';
import { useTranslation } from 'react-i18next';

interface DownloadProgressIndicatorProps {
  downloadId?: number;
}

/**
 * A component for showing the download progress of the given download item.
 * @param download The download item that this component should show the progress of.
 * @constructor
 */
function DownloadProgressIndicator({
  downloadId,
}: DownloadProgressIndicatorProps): JSX.Element {
  const [t] = useTranslation();
  const { data: download, isLoading: isLoadingDownload } = useDownload({
    id: downloadId ?? -1,
    enabled: Boolean(downloadId),
  });
  const {
    data: progress,
    isLoading: isLoadingProgress,
  } = useDownloadPercentageComplete({
    preparedId: download?.preparedId ?? '',
    enabled: Boolean(download?.preparedId) && download?.status === 'RESTORING',
  });

  console.log(
    'load progress',
    Boolean(download?.preparedId) && download?.status === 'RESTORING'
  );
  console.log('status', download?.status);

  if (isLoadingDownload || isLoadingProgress) {
    console.log('show loading');
    return <>{t('downloadStatus.calculating_progress')}</>;
  }

  // only show progress if download is being restored
  if (!download || !progress || download.status !== 'RESTORING')
    return <>{t('downloadStatus.progress_unavailable')}</>;

  if (typeof progress === 'number')
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress variant="determinate" value={progress} />
        </Box>
        <Box sx={{ minWidth: 36 }}>
          <Typography role="" variant="body2" color="text.secondary">
            {progress}%
          </Typography>
        </Box>
      </Box>
    );

  return <>{progress}</>;
}

export default DownloadProgressIndicator;
