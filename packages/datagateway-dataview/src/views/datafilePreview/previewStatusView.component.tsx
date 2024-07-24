import {
  Box,
  CircularProgress,
  Paper,
  styled,
  Typography,
} from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import PreviewErrorMessage from './previewErrorMessage.component';
import type { PreviewerStatus } from './previewerStatus';

/**
 * A container that centers status messages and progress indicator in {@link PreviewPane}
 */
const StatusContainer = styled('div')({
  display: 'flex',
  position: 'relative',
  justifySelf: 'center',
  alignSelf: 'center',
  margin: '0 auto',
});

/**
 * @see PreviewStatusView
 */
interface PreviewStatusViewProps {
  status: PreviewerStatus;
}

/**
 * Displays a user-friendly UI/message given the status of datafile previewer.

 * @param status The current status of datafile previewer.
 */
function PreviewStatusView({ status }: PreviewStatusViewProps): JSX.Element {
  const [t] = useTranslation();
  const content = React.useMemo(() => {
    switch (status.code) {
      case 'LOADING_CONTENT':
        return <ContentDownloadProgressIndicator progress={status.progress} />;

      case 'METADATA_UNAVAILABLE':
        return (
          <StatusContainer>
            <PreviewErrorMessage
              title={t('datafiles.preview.cannot_load_metadata')}
              description={status.errorMessage}
            />
          </StatusContainer>
        );

      case 'UNKNOWN_EXTENSION':
        // Datafile doesn't have an extension, cannot render datafile.
        return (
          <StatusContainer>
            <PreviewErrorMessage
              title={t('datafiles.preview.cannot_preview')}
              description={t('datafiles.preview.unknown_type')}
            />
          </StatusContainer>
        );

      case 'CONTENT_UNAVAILABLE':
        return (
          <StatusContainer>
            <PreviewErrorMessage
              title={t('datafiles.preview.cannot_load_content')}
              description={status.errorMessage}
            />
          </StatusContainer>
        );

      case 'UNSUPPORTED_EXTENSION':
        return (
          <StatusContainer>
            <PreviewErrorMessage
              title={t('datafiles.preview.cannot_preview')}
              description={t('datafiles.preview.unsupported', {
                ext: status.extension,
              })}
            />
          </StatusContainer>
        );
    }
  }, [status, t]);

  return (
    <Paper
      variant="outlined"
      sx={{
        height: 'calc(100vh - 64px - 36px - 48px - 48px)',
        padding: 2,
        overflowY: 'auto',
        display: 'flex',
      }}
    >
      {content}
    </Paper>
  );
}

/**
 * A component for displaying progress of downloading datafile content.
 *
 * @param progress The current progress of downloading datafile content.
 * @constructor
 */
function ContentDownloadProgressIndicator({
  progress,
}: {
  progress: number;
}): JSX.Element {
  return (
    <StatusContainer>
      <CircularProgress variant="determinate" value={progress} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="caption">{Math.round(progress)}%</Typography>
      </Box>
    </StatusContainer>
  );
}

export default PreviewStatusView;
