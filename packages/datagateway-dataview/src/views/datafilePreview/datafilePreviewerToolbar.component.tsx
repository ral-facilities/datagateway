import { CopyAll, Download, ZoomIn, ZoomOut } from '@mui/icons-material';
import {
  Button,
  ButtonGroup,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
} from '@mui/material';
import { downloadDatafile } from 'datagateway-common';
import type { Datafile } from 'datagateway-common';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import type { StateType } from '../../state/app.types';
import {
  ToggleDatafilePreviewerDetailsPanePayload,
  ToggleDatafilePreviewerDetailsPaneType,
} from './state/actions';

interface DatafilePreviewerToolbarProps {
  datafile: Datafile;
  datafileContent?: Blob;
}

/**
 * A toolbar for {@link DatafilePreviewerToolbar} that
 * provides actions to control the previewer or to perform actions on the datafile.
 * @constructor
 */
function DatafilePreviewerToolbar({
  datafile,
  datafileContent,
}: DatafilePreviewerToolbarProps): JSX.Element {
  const isDetailsPanelShown = useSelector<StateType, boolean>(
    (state) => state.dgdataview.isisDatafilePreviewer.isDetailsPaneShown
  );
  const idsUrl = useSelector<StateType, string>(
    (state) => state.dgcommon.urls.idsUrl
  );
  const dispatch = useDispatch();
  const [t] = useTranslation();

  function toggleDetailsPane(shouldShow: boolean): void {
    dispatch({
      type: ToggleDatafilePreviewerDetailsPaneType,
      payload: {
        shouldShow,
      } as ToggleDatafilePreviewerDetailsPanePayload,
    });
  }

  /**
   * Download the datafile to the user computer,
   * depending on whether the content is already downloaded or not.
   */
  function download(): void {
    if (datafileContent) {
      const link = document.createElement('a');
      const url = window.URL.createObjectURL(datafileContent);
      link.href = url;
      link.style.display = 'none';
      if (datafile.location) {
        link.download = datafile.location;
      }

      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        link.remove();
      }, 0);
    } else if (datafile.location) {
      downloadDatafile(idsUrl, datafile.id, datafile.location);
    }
  }

  return (
    <Paper sx={{ padding: 1 }}>
      <Stack direction="row" justifyContent="space-between">
        <Stack direction="row" spacing={1}>
          <Button
            variant="text"
            startIcon={<Download />}
            onClick={() => download()}
          >
            {t('buttons.download')}
          </Button>
          <Button variant="text" startIcon={<CopyAll />}>
            {t('datafiles.preview.toolbar.copy_link')}
          </Button>
          <ButtonGroup
            variant="text"
            aria-label={t('datafiles.preview.toolbar.zoom_control')}
          >
            <Button startIcon={<ZoomIn />}>
              {t('datafiles.preview.toolbar.zoom_in')}
            </Button>
            <Button startIcon={<ZoomOut />}>
              {t('datafiles.preview.toolbar.zoom_out')}
            </Button>
          </ButtonGroup>
        </Stack>

        <FormControlLabel
          control={
            <Switch
              checked={isDetailsPanelShown}
              onChange={(_, checked) => toggleDetailsPane(checked)}
            />
          }
          label={t('datafiles.preview.toolbar.show_details')}
        />
      </Stack>
    </Paper>
  );
}

export default DatafilePreviewerToolbar;
