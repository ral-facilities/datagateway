import VisibilityIcon from '@mui/icons-material/Visibility';
import { Box, IconButton, Tooltip } from '@mui/material';
import type { Datafile } from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { isDatafilePreviewable } from './datafileExtension';

export interface PreviewDatafileButtonProps {
  datafile: Datafile;
}

/**
 * A button that shows the preview of the given {@link Datafile} when clicked.
 */
function PreviewDatafileButton({
  datafile,
}: PreviewDatafileButtonProps): JSX.Element {
  const [t] = useTranslation();

  const isSupported = isDatafilePreviewable(datafile);

  return (
    <Link
      to={`datafile/${datafile.id}`}
      component={(props) => (
        <Tooltip
          title={t(
            isSupported
              ? 'datafiles.preview.preview_datafile'
              : 'datafiles.preview.preview_unsupported'
          )}
        >
          <Box>
            <IconButton
              {...props}
              disabled={!isSupported}
              aria-label={t('datafiles.preview.preview_datafile')}
            >
              <VisibilityIcon />
            </IconButton>
          </Box>
        </Tooltip>
      )}
      aria-label={t('buttons.preview')}
    />
  );
}

export default PreviewDatafileButton;
