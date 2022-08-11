import VisibilityIcon from '@mui/icons-material/Visibility';
import { IconButton } from '@mui/material';
import { ArrowTooltip, Datafile } from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export interface PreviewDatafileButtonProps {
  datafile: Datafile;
}

/**
 * A button that shows the preview of the given {@link Datafile} when clicked.
 * @constructor
 */
function PreviewDatafileButton({
  datafile,
}: PreviewDatafileButtonProps): JSX.Element {
  const [t] = useTranslation();

  return (
    <ArrowTooltip title={t('buttons.preview_tooltip')}>
      <Link
        to={`datafile/${datafile.id}`}
        component={IconButton}
        aria-label={t('buttons.preview')}
      >
        <VisibilityIcon />
      </Link>
    </ArrowTooltip>
  );
}

export default PreviewDatafileButton;
