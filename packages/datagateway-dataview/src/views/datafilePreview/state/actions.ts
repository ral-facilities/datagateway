/**
 * Dispatch this action to toggle the appearace of details pane in ISIS Datafile previewer.
 * Payload is {@link ToggleDatafilePreviewerDetailsPanePayload}
 */

const ToggleDatafilePreviewerDetailsPaneType =
  'datagateway_dataview:toggle_datafile_previewer_details_pane';

/**
 * Dispatch this action to increment the zoom level of the datafile previewer by
 * the value defined by {@link DATAFILE_PREVIEWER_DEFAULT.zoomLevelStep}.
 * No payload required.
 */
const IncrementDatafilePreviewerZoomLevelType =
  'datagateway_dataview:inc_datafile_previewer_zoom_level';

/**
 * Dispatch this action to decrement the zoom level of the datafile previewer by
 * the value defined by {@link DATAFILE_PREVIEWER_DEFAULT.zoomLevelStep}.
 * No payload required.
 */
const DecrementDatafilePreviewerZoomLevelType =
  'datagateway_dataview:dec_datafile_previewer_zoom_level';

/**
 * Dispatch this action to reset the zoom level of the datafile previewer to
 * the default zoom level as defined by {@link DATAFILE_PREVIEWER_DEFAULT.zoomLevel}
 * No payload required.
 */
const ResetDatafilePreviewerZoomLevelType =
  'datagateway_dataview:reset_datafile_previewer_zoom_level';

/**
 * @see ToggleDatafilePreviewerDetailsPaneType
 */
interface ToggleDatafilePreviewerDetailsPanePayload {
  /**
   * Whether the details pane should be shown or now.
   */
  shouldShow: boolean;
}

export {
  ToggleDatafilePreviewerDetailsPaneType,
  IncrementDatafilePreviewerZoomLevelType,
  DecrementDatafilePreviewerZoomLevelType,
  ResetDatafilePreviewerZoomLevelType,
};
export type { ToggleDatafilePreviewerDetailsPanePayload };
