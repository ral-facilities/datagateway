import { Search } from '@mui/icons-material';
import { Chip, FormControlLabel, Stack, Switch, Tooltip } from '@mui/material';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { StateType } from '../../../state/app.types';
import {
  DecrementDatafilePreviewerZoomLevelType,
  IncrementDatafilePreviewerZoomLevelType,
  ToggleDatafilePreviewerDetailsPanePayload,
  ToggleDatafilePreviewerDetailsPaneType,
} from '../state/actions';

/**
 * Displays controls that are aligned to the right in {@link DatafilePreviewerToolbar}
 * I can't come up with a better name for this...
 *
 * Contains the following controls:
 *   - chip displaying the current zoom level
 *   - details pane toggle switch
 *
 * @constructor
 */
function RightAlignedControls(): JSX.Element {
  const isDetailsPanelShown = useSelector<StateType, boolean>(
    (state) => state.dgdataview.isisDatafilePreviewer.isDetailsPaneShown
  );
  // the current zoom level in %
  const zoomLevel = useSelector<StateType, number>(
    (state) => state.dgdataview.isisDatafilePreviewer.zoomLevel
  );
  const zoomLevelChipRef = useRef<HTMLDivElement | null>(null);
  const dispatch = useDispatch();
  const [t] = useTranslation();

  // called when users scroll on the zoom level chip
  const handleScrollingOnChip = React.useCallback(
    (event: WheelEvent) => {
      if (event.deltaY > 0) {
        // scrolling down, zoom in content
        dispatch({ type: IncrementDatafilePreviewerZoomLevelType });
      } else if (event.deltaY < 0) {
        // scrolling up, zoom out content
        dispatch({ type: DecrementDatafilePreviewerZoomLevelType });
      }
    },
    [dispatch]
  );

  React.useEffect(() => {
    const elem = zoomLevelChipRef.current;
    // detect scrolling on the zoom level chip
    // let users adjust zoom by scrolling on the chip
    elem?.addEventListener('wheel', handleScrollingOnChip);
    return () => {
      elem?.removeEventListener('wheel', handleScrollingOnChip);
    };
  }, [dispatch, handleScrollingOnChip, zoomLevelChipRef]);

  function toggleDetailsPane(shouldShow: boolean): void {
    dispatch({
      type: ToggleDatafilePreviewerDetailsPaneType,
      payload: {
        shouldShow,
      } as ToggleDatafilePreviewerDetailsPanePayload,
    });
  }

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={2}
      sx={{ paddingRight: 1 }} // additional padding to achieve symmetry (buttons on the left have extra padding)
    >
      <Tooltip title={t('datafiles.preview.toolbar.scroll_to_zoom')}>
        <Chip
          ref={zoomLevelChipRef}
          label={`${zoomLevel}%`}
          avatar={<Search />}
        />
      </Tooltip>
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
  );
}

export default RightAlignedControls;
