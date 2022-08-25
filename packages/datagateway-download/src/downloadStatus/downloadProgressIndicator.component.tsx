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
    download,
    enabled: download.status === 'RESTORING' || download.status === 'PAUSED',
  });

  if (isLoadingProgress) {
    return <>{t('downloadStatus.calculating_progress')}</>;
  }

  // if the download is already completed/restored
  // should show text such as N/A, completed, or empty string.
  // depending on the translation configuration.
  if (download.status === 'COMPLETE' || download.status === 'EXPIRED')
    return <>{t('downloadStatus.progress_complete')}</>;

  // if the download is being prepared, show 0%
  if (download.status === 'PREPARING') return <ProgressBar progress={0} />;

  // display a label indicating progress unavailable when
  // progress is not returned or the download status doesn't match.
  if (typeof progress === 'undefined')
    return <>{t('downloadStatus.progress_unavailable')}</>;

  if (typeof progress === 'number') {
    if (progress === 100) {
      // confusing to show the user 100% when the status doesn't show complete
      // progress is shown at 99% to indicate there is work still being done
      // to avoid confusion
      return <ProgressBar progress={99} />;
    }

    return <ProgressBar progress={progress} />;
  }

  // server returned a status string, show it to the user.
  return <>{progress}</>;
}

function ProgressBar({ progress }: { progress: number }): JSX.Element {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" value={progress} />
      </Box>
      <Box sx={{ minWidth: 36 }}>
        <Typography variant="body2" color="text.secondary">
          {progress}%
        </Typography>
      </Box>
    </Box>
  );
}

export default DownloadProgressIndicator;
