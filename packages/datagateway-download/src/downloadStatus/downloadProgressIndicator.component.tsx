import { Box, LinearProgress, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Download } from 'datagateway-common';
import { useDownloadPercentageComplete } from '../downloadApiHooks';

interface DownloadProgressIndicatorProps {
  download: Download;
}

/**
 * A component for showing the download progress of the given download item.
 *
 * @param download The download item that this component should show the progress of.
 * @constructor
 */
function DownloadProgressIndicator({
  download,
}: DownloadProgressIndicatorProps): JSX.Element {
  const [t] = useTranslation();
  const {
    data: progress,
    isLoading: isLoadingProgress,
  } = useDownloadPercentageComplete({
    preparedId: download?.preparedId ?? '',
    enabled: Boolean(download?.preparedId) && download?.status === 'RESTORING',
  });

  if (isLoadingProgress) {
    return <>{t('downloadStatus.calculating_progress')}</>;
  }

  // only show progress if download is being restored
  if (!progress || download.status !== 'RESTORING')
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
