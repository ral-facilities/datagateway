import VisibilityIcon from '@mui/icons-material/Visibility';
import { Box, IconButton, Tooltip } from '@mui/material';
import { type Datafile } from 'datagateway-common';
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
    <Tooltip
      title={t(
        isSupported
          ? 'datafiles.preview.preview_datafile'
          : 'datafiles.preview.preview_unsupported'
      )}
    >
      {/* Wrap the IconButton with a Box so that the tooltip can be triggered
          even when the button is disabled */}
      <Box>
        <IconButton
          component={Link}
          to={`datafile/${datafile.id}`}
          disabled={!isSupported}
          aria-label={t('datafiles.preview.preview_datafile')}
        >
          <VisibilityIcon />
        </IconButton>
      </Box>
    </Tooltip>
  );
}

export default PreviewDatafileButton;
