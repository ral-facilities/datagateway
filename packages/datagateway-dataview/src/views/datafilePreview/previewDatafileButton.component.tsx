import VisibilityIcon from '@mui/icons-material/Visibility';
import { Box, IconButton, Tooltip } from '@mui/material';
import {
  StateType,
  readSciGatewayToken,
  type Datafile,
} from 'datagateway-common';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
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

  const disableAnonDownload = useSelector(
    (state: StateType) => state.dgcommon.features?.disableAnonDownload
  );
  const anonUserName = useSelector(
    (state: StateType) => state.dgcommon.anonUserName
  );

  const username = readSciGatewayToken().username;
  const loggedInAnonymously =
    username === null || username === (anonUserName ?? 'anon/anon');

  const disableIfAnon = disableAnonDownload && loggedInAnonymously;

  return (
    <Tooltip
      title={
        disableIfAnon
          ? t('buttons.disallow_anon_tooltip')
          : (t(
              isSupported
                ? 'datafiles.preview.preview_datafile'
                : 'datafiles.preview.preview_unsupported'
            ) as string)
      }
    >
      {/* Wrap the IconButton with a Box so that the tooltip can be triggered
          even when the button is disabled */}
      <Box>
        <IconButton
          component={Link}
          to={`datafile/${datafile.id}`}
          disabled={disableIfAnon || !isSupported}
          aria-label={t('datafiles.preview.preview_datafile')}
        >
          <VisibilityIcon />
        </IconButton>
      </Box>
    </Tooltip>
  );
}

export default PreviewDatafileButton;
